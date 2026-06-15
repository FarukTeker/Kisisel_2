import SwiftUI
import Combine

/// Central store — auth, sources, articles, and newspapers are all backed by the
/// NestJS API at localhost:3000. Layout and widget state persists locally via
/// UserDefaults (same as before).
@MainActor
final class AppStore: ObservableObject {

    // MARK: - Session gates (UC-01, UC-02, UC-03)
    @Published var hasCompletedOnboarding: Bool = false
    @Published var isAuthenticated: Bool = false
    @Published var currentUser: KisiselUser?
    @Published var authError: String?
    @Published var isLoading: Bool = false
    /// Non-nil while waiting for email verification after register.
    @Published var pendingVerificationEmail: String?

    // MARK: - Personal newspaper (UC-03, UC-04, UC-05, UC-06, UC-12)
    @Published var myNewspaper: Newspaper
    @Published var editMode: Bool = false
    @Published var selectedWidgetId: UUID?

    // MARK: - Global reading mode (UC-08)
    @Published var readingMode: ReadingMode = .skim {
        didSet { myNewspaper.readingMode = readingMode }
    }

    // MARK: - Sources (UC-07)
    @Published var sources: [NewsSource] = []
    @Published var sourceAddError: String?

    // MARK: - Article corpus (UC-09, UC-10, UC-18)
    @Published private(set) var articlesBySource: [String: [Article]] = [:]
    @Published private(set) var loadingSourceIds: Set<String> = []
    @Published private(set) var popularArticles: [Article] = []
    @Published private(set) var randomArticles: [Article] = []
    @Published private(set) var lastRefreshedAt: Date?
    @Published var isRefreshingCorpus: Bool = false

    // MARK: - AI summaries (UC-09) — populated server-side; stored here for override
    @Published private(set) var liveSummaries: [String: String] = [:]
    @Published private(set) var summarizingIds: Set<String> = []

    // MARK: - Discover / Follow / Fork (UC-13, UC-14, UC-15, UC-16, UC-17)
    @Published private(set) var sharedNewspapers: [Newspaper] = []
    @Published private(set) var followedSlugs: Set<String> = []
    @Published var publishedSlug: String?

    init() {
        self.myNewspaper = Newspaper(
            id: "my-newspaper",
            name: "My Newspaper",
            curator: "You",
            description: "A personal front page composed of the sources and rhythms you care about.",
            readingMode: .skim,
            widgets: [],
            isOwned: true
        )
        restoreLayout()
        // Try to silently resume a saved session
        Task { await restoreSession() }
    }

    // MARK: - Session restore

    private func restoreSession() async {
        guard APIClient.shared.token != nil else { return }
        do {
            let dto = try await APIClient.shared.me()
            currentUser = KisiselUser(
                id: UUID(uuidString: dto.id) ?? UUID(),
                name: dto.name,
                email: dto.email,
                passwordHash: ""
            )
            isAuthenticated = true
            await loadInitialData()
        } catch {
            APIClient.shared.token = nil
        }
    }

    // Called after every successful login / session restore
    private func loadInitialData() async {
        await bootstrapSources()
        if myNewspaper.widgets.isEmpty {
            buildDefaultLayout()
        }
        await refreshCorpus()
        await loadSharedNewspapers()
    }

    // MARK: - UC-01 Register

    @discardableResult
    func register(name: String, email: String, password: String) -> Bool {
        authError = nil
        guard !name.trimmingCharacters(in: .whitespaces).isEmpty else {
            authError = "Please enter your name."; return false
        }
        guard email.contains("@"), email.contains(".") else {
            authError = "Enter a valid email address."; return false
        }
        guard password.count >= 6 else {
            authError = "Password must be at least 6 characters."; return false
        }
        isLoading = true
        Task {
            do {
                let res = try await APIClient.shared.register(name: name, email: email, password: password)
                pendingVerificationEmail = res.email
            } catch let err as APIError {
                authError = err.errorDescription
            } catch {
                authError = error.localizedDescription
            }
            isLoading = false
        }
        return true
    }

    // MARK: - UC-01 Verify email

    func verifyEmail(code: String) {
        guard let email = pendingVerificationEmail else { return }
        authError = nil
        isLoading = true
        Task {
            do {
                let res = try await APIClient.shared.verifyEmail(email: email, code: code)
                APIClient.shared.token = res.token
                currentUser = KisiselUser(
                    id: UUID(uuidString: res.user.id) ?? UUID(),
                    name: res.user.name,
                    email: res.user.email,
                    passwordHash: ""
                )
                pendingVerificationEmail = nil
                isAuthenticated = true
                await loadInitialData()
            } catch let err as APIError {
                authError = err.errorDescription
            } catch {
                authError = error.localizedDescription
            }
            isLoading = false
        }
    }

    // MARK: - UC-02 Log in

    @discardableResult
    func login(email: String, password: String) -> Bool {
        authError = nil
        isLoading = true
        Task {
            do {
                let res = try await APIClient.shared.login(email: email, password: password)
                APIClient.shared.token = res.token
                currentUser = KisiselUser(
                    id: UUID(uuidString: res.user.id) ?? UUID(),
                    name: res.user.name,
                    email: res.user.email,
                    passwordHash: ""
                )
                isAuthenticated = true
                await loadInitialData()
            } catch let err as APIError {
                authError = err.errorDescription
            } catch {
                authError = error.localizedDescription
            }
            isLoading = false
        }
        return true
    }

    func logout() {
        APIClient.shared.token = nil
        isAuthenticated = false
        currentUser = nil
        editMode = false
        selectedWidgetId = nil
        articlesBySource = [:]
        popularArticles = []
        randomArticles = []
    }

    func completeOnboarding() {
        hasCompletedOnboarding = true
    }

    // MARK: - UC-04 Add widget

    func addWidget(kind: WidgetKind, sourceId: String? = nil, title: String? = nil) {
        let resolvedTitle = title ?? defaultTitle(for: kind, sourceId: sourceId)
        let widget = FeedWidget(
            title: resolvedTitle,
            kind: kind,
            sourceId: kind == .news ? sourceId : nil,
            size: .regular,
            editorialBody: kind == .editorial ? "" : nil,
            order: myNewspaper.widgets.count
        )
        myNewspaper.widgets.append(widget)
        selectedWidgetId = widget.id
        if let sourceId, articlesBySource[sourceId] == nil {
            Task { await loadArticles(for: sourceId) }
        }
    }

    private func defaultTitle(for kind: WidgetKind, sourceId: String?) -> String {
        switch kind {
        case .news:      return sources.first(where: { $0.id == sourceId })?.name ?? "News feed"
        case .editorial: return "Editorial note"
        case .popular:   return "Popular picks"
        case .random:    return "Random discovery"
        }
    }

    // MARK: - UC-05 Move / resize / reorder widget

    func moveWidget(from offsets: IndexSet, to destination: Int) {
        myNewspaper.widgets.move(fromOffsets: offsets, toOffset: destination)
        reindexWidgetOrder()
    }

    func resizeWidget(_ widget: FeedWidget, to size: WidgetSize) {
        guard let idx = myNewspaper.widgets.firstIndex(where: { $0.id == widget.id }) else { return }
        myNewspaper.widgets[idx].size = size
    }

    func moveWidget(_ widget: FeedWidget, direction: Int) {
        let widgets = myNewspaper.widgets.sorted(by: { $0.order < $1.order })
        guard let from = widgets.firstIndex(where: { $0.id == widget.id }) else { return }
        let destination = from + direction
        guard widgets.indices.contains(destination) else { return }
        var ids = widgets.map(\.id)
        ids.swapAt(from, destination)
        for (newOrder, id) in ids.enumerated() {
            if let idx = myNewspaper.widgets.firstIndex(where: { $0.id == id }) {
                myNewspaper.widgets[idx].order = newOrder
            }
        }
    }

    private func reindexWidgetOrder() {
        for i in myNewspaper.widgets.indices { myNewspaper.widgets[i].order = i }
    }

    func removeWidget(_ widget: FeedWidget) {
        myNewspaper.widgets.removeAll { $0.id == widget.id }
        if selectedWidgetId == widget.id { selectedWidgetId = nil }
        reindexWidgetOrder()
    }

    // MARK: - UC-06 Configure widget

    func updateWidget(_ widget: FeedWidget, mutate: (inout FeedWidget) -> Void) {
        guard let idx = myNewspaper.widgets.firstIndex(where: { $0.id == widget.id }) else { return }
        mutate(&myNewspaper.widgets[idx])
    }

    func setCategoryFilter(_ category: String?, for widget: FeedWidget) {
        updateWidget(widget) { $0.categoryFilter = category }
    }

    func setEditorialBody(_ text: String, for widget: FeedWidget) {
        updateWidget(widget) { $0.editorialBody = text }
    }

    // MARK: - UC-07 Manage sources

    @discardableResult
    func addCustomSource(name: String, feedUrl: String, category: String) -> Bool {
        sourceAddError = nil
        let url = feedUrl.trimmingCharacters(in: .whitespacesAndNewlines)
        guard let parsed = URL(string: url), parsed.scheme?.hasPrefix("http") == true, parsed.host != nil else {
            sourceAddError = "Enter a valid feed URL (https://…)."; return false
        }
        guard !sources.contains(where: { $0.feedUrl.caseInsensitiveCompare(url) == .orderedSame }) else {
            sourceAddError = "This source is already in your library."; return false
        }
        Task {
            do {
                let dto = try await APIClient.shared.createSource(
                    name: name, rssUrl: url,
                    category: category.isEmpty ? "General" : category
                )
                let source = NewsSource(from: dto)
                sources.append(source)
                // Ingest RSS feed for the new source, then load its articles
                await APIClient.shared.ingestArticles()
                await loadArticles(for: source.id)
            } catch let err as APIError {
                sourceAddError = err.errorDescription
            } catch {
                sourceAddError = error.localizedDescription
            }
        }
        return true
    }

    func removeSource(_ source: NewsSource) {
        guard source.isCustom else { return }
        sources.removeAll { $0.id == source.id }
        articlesBySource[source.id] = nil
        for i in myNewspaper.widgets.indices where myNewspaper.widgets[i].sourceId == source.id {
            myNewspaper.widgets[i].sourceId = nil
        }
    }

    // MARK: - UC-08 Reading mode

    func setReadingMode(_ mode: ReadingMode) {
        readingMode = mode
    }

    // MARK: - UC-09 Summaries
    //
    // Summaries are generated server-side during ingest and come with each
    // ArticleDTO. article.summary is already populated, so this is a no-op
    // unless the article has an empty summary (e.g. no rawDescription).

    func summary(for article: Article) -> String {
        liveSummaries[article.id] ?? article.summary
    }

    func isSummarizing(_ article: Article) -> Bool {
        summarizingIds.contains(article.id)
    }

    func hasLiveSummary(_ article: Article) -> Bool {
        liveSummaries[article.id] != nil
    }

    func requestSummary(for article: Article) {
        // Summary already loaded from API — nothing to do
    }

    // MARK: - UC-10 Popular / random

    func articles(for sourceId: String) -> [Article] {
        articlesBySource[sourceId] ?? []
    }

    func isLoadingArticles(for sourceId: String) -> Bool {
        loadingSourceIds.contains(sourceId)
    }

    // MARK: - UC-12 Persist layout

    private static let layoutDefaultsKey = "kisisel.myNewspaper.v1"

    func persistLayout() {
        guard let data = try? JSONEncoder().encode(myNewspaper) else { return }
        UserDefaults.standard.set(data, forKey: Self.layoutDefaultsKey)
    }

    func restoreLayout() {
        guard let data = UserDefaults.standard.data(forKey: Self.layoutDefaultsKey),
              let saved = try? JSONDecoder().decode(Newspaper.self, from: data) else { return }
        myNewspaper = saved
        readingMode = saved.readingMode
    }

    // MARK: - UC-13 Publish newspaper (local for now — API publish requires a layout ID)

    func publishNewspaper() -> String {
        let slug = publishedSlug ?? "share-\(UUID().uuidString.prefix(6).lowercased())"
        publishedSlug = slug
        var published = myNewspaper
        published = Newspaper(id: slug, name: published.name, curator: currentUser?.name ?? "You",
                              description: published.description, readingMode: published.readingMode,
                              widgets: published.widgets, isOwned: true)
        if let idx = sharedNewspapers.firstIndex(where: { $0.id == slug }) {
            sharedNewspapers[idx] = published
        } else {
            sharedNewspapers.insert(published, at: 0)
        }
        return slug
    }

    func shareURL(for slug: String) -> URL {
        URL(string: "https://kisisel.app/newspaper/\(slug)")!
    }

    // MARK: - UC-15 Follow

    func isFollowing(_ newspaper: Newspaper) -> Bool {
        followedSlugs.contains(newspaper.id)
    }

    @discardableResult
    func toggleFollow(_ newspaper: Newspaper) -> Bool {
        guard isAuthenticated else { return false }
        if followedSlugs.contains(newspaper.id) {
            followedSlugs.remove(newspaper.id)
        } else {
            followedSlugs.insert(newspaper.id)
        }
        return true
    }

    var followedNewspapers: [Newspaper] {
        sharedNewspapers.filter { followedSlugs.contains($0.id) }
    }

    // MARK: - UC-16 Fork

    @discardableResult
    func forkNewspaper(_ newspaper: Newspaper) -> Bool {
        guard isAuthenticated else { return false }
        myNewspaper = Newspaper(
            id: myNewspaper.id,
            name: "\(newspaper.name) (mine)",
            curator: currentUser?.name ?? "You",
            description: "Forked from \(newspaper.curator)'s \"\(newspaper.name)\".",
            readingMode: newspaper.readingMode,
            widgets: newspaper.widgets.map { w in var copy = w; copy.id = UUID(); return copy },
            isOwned: true
        )
        readingMode = newspaper.readingMode
        persistLayout()
        return true
    }

    // MARK: - UC-18 Refresh corpus

    func refreshCorpus() async {
        isRefreshingCorpus = true
        defer { isRefreshingCorpus = false }

        // 1. Show existing articles immediately
        await fetchPopularAndRandom()
        for source in sources {
            await loadArticles(for: source.id)
        }

        // 2. Ingest fresh RSS feeds in the background, then refresh again
        Task {
            await APIClient.shared.ingestArticles()
            await fetchPopularAndRandom()
            for source in self.sources {
                await self.loadArticles(for: source.id)
            }
            lastRefreshedAt = Date()
        }

        lastRefreshedAt = Date()
    }

    private func fetchPopularAndRandom() async {
        if let popular = try? await APIClient.shared.getPopularArticles(limit: 8) {
            popularArticles = popular.map { dto in
                var a = Article(from: dto); a.summaryLabel = "Trending"; return a
            }
        }
        if let random = try? await APIClient.shared.getRandomArticles(limit: 6) {
            randomArticles = random.map { dto in
                var a = Article(from: dto); a.summaryLabel = "Serendipity pick"; return a
            }
        }
    }

    private func loadArticles(for sourceId: String) async {
        loadingSourceIds.insert(sourceId)
        let dtos = (try? await APIClient.shared.getArticlesBySource(sourceId, limit: 15)) ?? []
        articlesBySource[sourceId] = dtos.map { Article(from: $0) }
        loadingSourceIds.remove(sourceId)
    }

    // MARK: - Source bootstrap

    private func bootstrapSources() async {
        guard let apiSources = try? await APIClient.shared.getSources() else { return }

        if apiSources.isEmpty {
            // Seed the iOS-preferred sources into the API
            let defaults: [(String, String, String)] = [
                ("BBC Technology", "https://feeds.bbci.co.uk/news/technology/rss.xml", "Technology"),
                ("BBC Science", "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml", "Science"),
                ("The Guardian Tech", "https://www.theguardian.com/uk/technology/rss", "Technology"),
                ("Hacker News", "https://hnrss.org/frontpage", "Technology"),
                ("NASA Breaking News", "https://www.nasa.gov/feed/", "Science"),
            ]
            var created: [NewsSource] = []
            for (name, rssUrl, category) in defaults {
                if let dto = try? await APIClient.shared.createSource(name: name, rssUrl: rssUrl, category: category) {
                    created.append(NewsSource(from: dto))
                }
            }
            sources = created
        } else {
            sources = apiSources.filter { $0.isActive }.map { NewsSource(from: $0) }
        }
    }

    // MARK: - Default layout (uses API source IDs)

    private func buildDefaultLayout() {
        func id(matching fragment: String) -> String? {
            sources.first(where: { $0.name.localizedCaseInsensitiveContains(fragment) })?.id
        }

        var widgets: [FeedWidget] = []
        if let sid = id(matching: "BBC Tech") ?? id(matching: "BBC Technology") {
            widgets.append(FeedWidget(title: "BBC Tech", kind: .news, sourceId: sid, size: .large, order: 0))
        }
        widgets.append(FeedWidget(title: "Popular Picks", kind: .popular, size: .regular, order: widgets.count))
        if let sid = id(matching: "BBC Science") {
            widgets.append(FeedWidget(title: "BBC Science", kind: .news, sourceId: sid, size: .regular, order: widgets.count))
        }
        widgets.append(FeedWidget(
            title: "Why this matters", kind: .editorial, size: .compact,
            editorialBody: "I open with technology because the pace of change there shapes everything else this week.",
            order: widgets.count
        ))
        widgets.append(FeedWidget(title: "Random Discovery", kind: .random, size: .regular, order: widgets.count))
        if let sid = id(matching: "NASA") {
            widgets.append(FeedWidget(title: "NASA Feature", kind: .news, sourceId: sid, size: .large, order: widgets.count))
        }
        if !widgets.isEmpty { myNewspaper.widgets = widgets }
    }

    // MARK: - Shared newspapers

    private func loadSharedNewspapers() async {
        guard let dtos = try? await APIClient.shared.getNewspapers(), !dtos.isEmpty else {
            seedFallbackNewspapers()
            return
        }
        // API list doesn't include widgets — show title/description only, no fork until full fetch
        sharedNewspapers = dtos.map { dto in
            Newspaper(
                id: dto.slug,
                name: dto.title,
                curator: "Kisisel",
                description: dto.description ?? "",
                readingMode: ReadingMode(apiValue: dto.readingMode ?? "summary"),
                widgets: [],
                isOwned: false
            )
        }
    }

    private func seedFallbackNewspapers() {
        guard sharedNewspapers.isEmpty else { return }
        let bbcNewsId     = sources.first(where: { $0.name.localizedCaseInsensitiveContains("BBC News") })?.id
        let bbcBizId      = sources.first(where: { $0.name.localizedCaseInsensitiveContains("BBC Business") })?.id
        let vergeId       = sources.first(where: { $0.name.localizedCaseInsensitiveContains("Verge") })?.id
        let nasaId        = sources.first(where: { $0.name.localizedCaseInsensitiveContains("NASA") })?.id

        sharedNewspapers = [
            Newspaper(id: "share-19d2b8", name: "Morning Signal", curator: "Ece Karaca",
                      description: "A front page mixing high-signal stories, serendipity, and curator commentary.",
                      readingMode: .scan, widgets: [
                        FeedWidget(title: "Top Stories", kind: .news, sourceId: bbcNewsId, size: .large, order: 0),
                        FeedWidget(title: "Popular Picks", kind: .popular, size: .regular, order: 1),
                        FeedWidget(title: "Why this matters today", kind: .editorial, size: .compact,
                                   editorialBody: "These stories should be read together: market optimism, the AI adoption curve, and governance gaps all point to the same tension.", order: 2),
                        FeedWidget(title: "Tech", kind: .news, sourceId: vergeId, size: .regular, order: 3),
                      ], isOwned: false),
            Newspaper(id: "deep-space", name: "Deep Space", curator: "Alara Yıldız",
                      description: "Science-heavy curation for curious minds — space, climate, and the edge of human knowledge.",
                      readingMode: .full, widgets: [
                        FeedWidget(title: "NASA Breaking News", kind: .news, sourceId: nasaId, size: .large, order: 0),
                        FeedWidget(title: "Random Discovery", kind: .random, size: .regular, order: 1),
                        FeedWidget(title: "Why science matters", kind: .editorial, size: .compact,
                                   editorialBody: "Every story here starts with a question we haven't answered yet.", order: 2),
                      ], isOwned: false),
            Newspaper(id: "tech-pulse", name: "Tech Pulse", curator: "Kerem Doğan",
                      description: "Daily briefing on what's shipping, what's hyped, and what actually matters in technology.",
                      readingMode: .skim, widgets: [
                        FeedWidget(title: "The Verge", kind: .news, sourceId: vergeId, size: .regular, order: 0),
                        FeedWidget(title: "BBC Business", kind: .news, sourceId: bbcBizId, size: .regular, order: 1),
                        FeedWidget(title: "Trending Now", kind: .popular, size: .regular, order: 2),
                      ], isOwned: false),
        ]
    }
}
