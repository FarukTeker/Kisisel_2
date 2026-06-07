import SwiftUI
import Combine

/// Central prototype store — the iOS counterpart of `prototypeState.ts` +
/// `prototypeDashboardState.ts` + `articlesApi.ts` combined. Each method is
/// annotated with the use case(s) it realises so the mapping back to
/// `docs/use-cases-and-requirements.md` stays explicit.
@MainActor
final class AppStore: ObservableObject {

    // MARK: - Navigation / session gates (UC-01, UC-02, UC-03)
    @Published var hasCompletedOnboarding: Bool = false
    @Published var isAuthenticated: Bool = false
    @Published var currentUser: KisiselUser?
    @Published var authError: String?

    /// Mock account directory — stands in for a backend users table.
    private var registeredUsers: [KisiselUser] = []

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
    @Published private(set) var popularArticles: [Article] = []
    @Published private(set) var randomArticles: [Article] = []
    @Published private(set) var lastRefreshedAt: Date?
    @Published var isRefreshingCorpus: Bool = false

    // MARK: - AI summaries (UC-09)
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
        seedDemoData()
        buildDefaultLayoutIfNeeded()
    }

    // MARK: - UC-01 Register account

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
        guard !registeredUsers.contains(where: { $0.email.lowercased() == email.lowercased() }) else {
            authError = "An account with this email already exists."; return false
        }
        let user = KisiselUser(name: name, email: email, passwordHash: password)
        registeredUsers.append(user)
        currentUser = user
        isAuthenticated = true
        return true
    }

    // MARK: - UC-02 Log in

    @discardableResult
    func login(email: String, password: String) -> Bool {
        authError = nil
        guard let user = registeredUsers.first(where: { $0.email.lowercased() == email.lowercased() }) else {
            authError = "No account found for this email. Try registering first."
            return false
        }
        guard user.passwordHash == password else {
            authError = "Incorrect password."
            return false
        }
        currentUser = user
        isAuthenticated = true
        return true
    }

    func logout() {
        isAuthenticated = false
        currentUser = nil
        editMode = false
        selectedWidgetId = nil
    }

    func completeOnboarding() {
        hasCompletedOnboarding = true
    }

    // MARK: - UC-04 Add widget to layout

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
        case .news:
            return sources.first(where: { $0.id == sourceId })?.name ?? "News feed"
        case .editorial: return "Editorial note"
        case .popular: return "Popular picks"
        case .random: return "Random discovery"
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

    /// Shifts a widget one slot up (`direction: -1`) or down (`direction: 1`) in
    /// reading order — the inline up/down controls on the card surface this
    /// directly, instead of requiring the long-press reorder menu.
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

    /// Removes a widget from the layout — surfaced as the red "×" button in edit mode.
    func removeWidget(_ widget: FeedWidget) {
        myNewspaper.widgets.removeAll { $0.id == widget.id }
        if selectedWidgetId == widget.id { selectedWidgetId = nil }
        reindexWidgetOrder()
    }

    // MARK: - UC-06 Configure widget content

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

    func addCustomSource(name: String, feedUrl: String, category: String) -> Bool {
        sourceAddError = nil
        let trimmedURL = feedUrl.trimmingCharacters(in: .whitespacesAndNewlines)
        guard let url = URL(string: trimmedURL), let scheme = url.scheme,
              scheme.hasPrefix("http"), url.host != nil else {
            sourceAddError = "Enter a valid feed URL (https://…)."
            return false
        }
        guard !sources.contains(where: { $0.feedUrl.caseInsensitiveCompare(trimmedURL) == .orderedSame }) else {
            sourceAddError = "This source is already in your library."
            return false
        }
        let source = NewsSource(id: "custom-\(UUID().uuidString.prefix(8))", name: name, category: category, feedUrl: trimmedURL, isCustom: true)
        sources.append(source)
        seedSampleArticles(for: source)
        return true
    }

    func removeSource(_ source: NewsSource) {
        guard source.isCustom else { return }
        sources.removeAll { $0.id == source.id }
        articlesBySource[source.id] = nil
        // Detach widgets that pointed at the removed source.
        for i in myNewspaper.widgets.indices where myNewspaper.widgets[i].sourceId == source.id {
            myNewspaper.widgets[i].sourceId = nil
        }
    }

    // MARK: - UC-08 Switch reading mode

    func setReadingMode(_ mode: ReadingMode) {
        readingMode = mode
    }

    // MARK: - UC-09 Article summaries (lazy AI generation, mirrors `fetchSummaryPreview`)

    func summary(for article: Article) -> String {
        liveSummaries[article.id] ?? article.summary
    }

    func isSummarizing(_ article: Article) -> Bool {
        summarizingIds.contains(article.id)
    }

    func hasLiveSummary(_ article: Article) -> Bool {
        liveSummaries[article.id] != nil
    }

    /// Lazily "generates" an AI summary for an article the first time it becomes visible.
    /// In the web app this calls the Ollama-backed `/summaries/preview` endpoint; here we
    /// simulate the latency + result so the UX (loading pill → live pill) matches exactly.
    func requestSummary(for article: Article) {
        guard liveSummaries[article.id] == nil, !summarizingIds.contains(article.id) else { return }
        summarizingIds.insert(article.id)
        Task {
            try? await Task.sleep(nanoseconds: UInt64.random(in: 500_000_000...1_100_000_000))
            let generated = Self.synthesizeSummary(from: article)
            await MainActor.run {
                self.liveSummaries[article.id] = generated
                self.summarizingIds.remove(article.id)
            }
        }
    }

    private static func synthesizeSummary(from article: Article) -> String {
        let firstSentence = article.fullContent
            .components(separatedBy: ". ")
            .first ?? article.fullContent
        return "\(firstSentence). — distilled from \(article.publisher) for a \(article.category.lowercased()) reader."
    }

    // MARK: - UC-10 Discover serendipitous content (popular / random)

    func articles(for sourceId: String) -> [Article] {
        articlesBySource[sourceId] ?? []
    }

    /// Cross-source "trending" scoring — mirrors `getPopularArticles` in `rssService.ts`:
    /// recency bonus + title-overlap bonus across distinct sources.
    private func recomputePopular() {
        let all = articlesBySource.values.flatMap { $0 }
        guard !all.isEmpty else { popularArticles = []; return }

        func significantWords(_ title: String) -> Set<String> {
            Set(title.lowercased()
                .components(separatedBy: CharacterSet.alphanumerics.inverted)
                .filter { $0.count > 4 })
        }

        var scored: [(Article, Int)] = []
        for (i, article) in all.enumerated() {
            var score = max(0, 12 - i % 12) // recency proxy: earlier in feed = newer
            let words = significantWords(article.title)
            for (j, other) in all.enumerated() where j != i && other.publisher != article.publisher {
                if words.intersection(significantWords(other.title)).count >= 2 { score += 3 }
            }
            scored.append((article, score))
        }
        popularArticles = scored.sorted { $0.1 > $1.1 }.prefix(8).map { article -> Article in
            var a = article.0
            a.summaryLabel = "Trending"
            return a
        }
    }

    private func recomputeRandom() {
        let all = articlesBySource.values.flatMap { $0 }
        randomArticles = all.shuffled().prefix(6).map { article -> Article in
            var a = article
            a.summaryLabel = "Serendipity pick"
            return a
        }
    }

    // MARK: - UC-12 Save layout & preferences
    //
    // The prototype persists to UserDefaults the same way the web app persists to
    // localStorage (`prototypeDashboardState.ts`). Called automatically whenever the
    // layout, widgets, or reading mode change (see `persistIfNeeded`).

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

    // MARK: - UC-13 Publish newspaper

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

    // MARK: - UC-15 Follow curator / newspaper

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

    // MARK: - UC-16 Fork / reuse layout

    @discardableResult
    func forkNewspaper(_ newspaper: Newspaper) -> Bool {
        guard isAuthenticated else { return false }
        myNewspaper = Newspaper(
            id: myNewspaper.id,
            name: "\(newspaper.name) (mine)",
            curator: currentUser?.name ?? "You",
            description: "Forked from \(newspaper.curator)'s \"\(newspaper.name)\".",
            readingMode: newspaper.readingMode,
            widgets: newspaper.widgets.map { w in
                var copy = w
                copy.id = UUID()
                return copy
            },
            isOwned: true
        )
        readingMode = newspaper.readingMode
        persistLayout()
        return true
    }

    // MARK: - UC-18 Refresh news corpus & summaries

    func refreshCorpus() async {
        isRefreshingCorpus = true
        defer { isRefreshingCorpus = false }
        for source in sources {
            await loadArticles(for: source.id)
        }
        lastRefreshedAt = Date()
    }

    private func loadArticles(for sourceId: String) async {
        // Prototype "ingestion": deterministic seeded sample articles per source,
        // standing in for the live RSS pipeline (`GET /articles?sourceId=`).
        guard let source = sources.first(where: { $0.id == sourceId }) else { return }
        try? await Task.sleep(nanoseconds: 250_000_000)
        let batch = Self.sampleArticles(for: source)
        await MainActor.run {
            self.articlesBySource[sourceId] = batch
            self.recomputePopular()
            self.recomputeRandom()
        }
    }

    private func seedSampleArticles(for source: NewsSource) {
        articlesBySource[source.id] = Self.sampleArticles(for: source)
        recomputePopular()
        recomputeRandom()
    }

    // MARK: - Default layout for first-time users (UC-03 alternative flow)

    private func buildDefaultLayoutIfNeeded() {
        guard myNewspaper.widgets.isEmpty else { return }
        myNewspaper.widgets = [
            FeedWidget(title: "BBC Tech", kind: .news, sourceId: "bbc-tech", size: .large, order: 0),
            FeedWidget(title: "Popular Picks", kind: .popular, size: .regular, order: 1),
            FeedWidget(title: "BBC Science", kind: .news, sourceId: "bbc-science", size: .regular, order: 2),
            FeedWidget(title: "Why this matters", kind: .editorial, size: .compact,
                       editorialBody: "I open with technology because the pace of change there shapes everything else this week.", order: 3),
            FeedWidget(title: "Random Discovery", kind: .random, size: .regular, order: 4),
            FeedWidget(title: "NASA Feature", kind: .news, sourceId: "nasa", size: .large, order: 5),
        ]
    }

    // MARK: - Demo seed data
    //
    // Mirrors the 5 live RSS sources wired in `rssService.ts` plus the
    // `SHARED_NEWSPAPERS` catalogue in `prototypeNewspapers.ts`.

    private func seedDemoData() {
        sources = [
            NewsSource(id: "bbc-tech", name: "BBC Technology", category: "Technology", feedUrl: "https://feeds.bbci.co.uk/news/technology/rss.xml"),
            NewsSource(id: "bbc-science", name: "BBC Science", category: "Science", feedUrl: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml"),
            NewsSource(id: "the-guardian-tech", name: "The Guardian Tech", category: "Technology", feedUrl: "https://www.theguardian.com/uk/technology/rss"),
            NewsSource(id: "hacker-news", name: "Hacker News", category: "Technology", feedUrl: "https://hnrss.org/frontpage"),
            NewsSource(id: "nasa", name: "NASA Breaking News", category: "Science", feedUrl: "https://www.nasa.gov/feed/"),
        ]
        for source in sources {
            articlesBySource[source.id] = Self.sampleArticles(for: source)
        }
        recomputePopular()
        recomputeRandom()
        lastRefreshedAt = Date()

        sharedNewspapers = [
            Newspaper(id: "share-19d2b8", name: "Morning Signal", curator: "Ece Karaca",
                      description: "A shareable front page mixing high-signal stories, serendipity, and curator commentary.",
                      readingMode: .scan, widgets: [
                        FeedWidget(title: "Tech Lead", kind: .news, sourceId: "bbc-tech", size: .large, order: 0),
                        FeedWidget(title: "Popular Picks", kind: .popular, size: .regular, order: 1),
                        FeedWidget(title: "Why this matters today", kind: .editorial, size: .compact,
                                   editorialBody: "These stories should be read together: market optimism, the AI adoption curve, and governance gaps all point to the same speed-vs-accountability tension.", order: 2),
                        FeedWidget(title: "Science Column", kind: .news, sourceId: "bbc-science", size: .regular, order: 3),
                      ]),
            Newspaper(id: "deep-space", name: "Deep Space", curator: "Alara Yıldız",
                      description: "Science-heavy curation for curious minds — space, climate, and the edge of human knowledge.",
                      readingMode: .full, widgets: [
                        FeedWidget(title: "NASA Feature", kind: .news, sourceId: "nasa", size: .large, order: 0),
                        FeedWidget(title: "Science Brief", kind: .news, sourceId: "bbc-science", size: .regular, order: 1),
                        FeedWidget(title: "Why science matters", kind: .editorial, size: .compact,
                                   editorialBody: "Every story here starts with a question we haven't answered yet.", order: 2),
                        FeedWidget(title: "Serendipity", kind: .random, size: .regular, order: 3),
                      ]),
            Newspaper(id: "tech-pulse", name: "Tech Pulse", curator: "Kerem Doğan",
                      description: "Daily briefing on what's shipping, what's hyped, and what actually matters in technology.",
                      readingMode: .skim, widgets: [
                        FeedWidget(title: "BBC Tech", kind: .news, sourceId: "bbc-tech", size: .regular, order: 0),
                        FeedWidget(title: "Guardian Tech", kind: .news, sourceId: "the-guardian-tech", size: .regular, order: 1),
                        FeedWidget(title: "Hacker News", kind: .news, sourceId: "hacker-news", size: .regular, order: 2),
                        FeedWidget(title: "Trending Now", kind: .popular, size: .regular, order: 3),
                      ]),
            Newspaper(id: "headline-scan", name: "Headline Scan", curator: "Berk Arslan",
                      description: "Minimal, fast. All five sources, headline-only mode. Get in, get out, be informed.",
                      readingMode: .scan, widgets: [
                        FeedWidget(title: "BBC Tech", kind: .news, sourceId: "bbc-tech", size: .compact, order: 0),
                        FeedWidget(title: "BBC Science", kind: .news, sourceId: "bbc-science", size: .compact, order: 1),
                        FeedWidget(title: "Guardian", kind: .news, sourceId: "the-guardian-tech", size: .compact, order: 2),
                        FeedWidget(title: "Popular", kind: .popular, size: .compact, order: 3),
                      ]),
        ]
    }

    /// Deterministic seeded sample corpus per source — stands in for live RSS ingestion
    /// in this offline-friendly prototype (`getArticlesBySource` in `rssService.ts`).
    private static func sampleArticles(for source: NewsSource) -> [Article] {
        let templates: [(String, String)] = [
            ("Researchers unveil a faster approach to \(source.category.lowercased()) breakthroughs",
             "A team announced results that could reshape how the field approaches \(source.category.lowercased()) work over the next decade, citing reproducible gains across multiple independent trials and a notably lower resource footprint than prior methods."),
            ("What this week's \(source.name) headlines mean for everyday readers",
             "Beyond the press-release framing, the underlying shift changes how people interact with \(source.category.lowercased()) tools day to day, and early adopters report friction in onboarding despite the long-term upside."),
            ("Explainer: the debate shaping \(source.category.lowercased()) policy right now",
             "Policymakers and practitioners disagree on pace versus caution, and this piece walks through the strongest arguments on each side along with what a likely compromise could look like in practice."),
            ("Inside the lab: a long read on \(source.name)'s latest project",
             "Our reporter spent a week embedded with the team behind the project, observing the daily friction between ambition and constraint that rarely makes it into the final announcement."),
            ("Five things to watch in \(source.category.lowercased()) over the coming month",
             "From funding announcements to quiet regulatory shifts, here are the signals worth tracking — and why each one could compound into a much larger story by year's end."),
            ("Opinion: why \(source.category.lowercased()) coverage keeps missing the real story",
             "Most coverage focuses on the headline number, but the more interesting thread is how the second-order effects ripple through adjacent industries that rarely get named in the same breath."),
        ]
        let calendar = Calendar.current
        return templates.enumerated().map { index, pair in
            let (title, body) = pair
            let date = calendar.date(byAdding: .hour, value: -(index * 7 + 2), to: Date()) ?? Date()
            let formatter = DateFormatter()
            formatter.dateFormat = "MMM d, HH:mm"
            return Article(
                id: "\(source.id)-\(index)",
                title: title,
                summary: String(body.prefix(140)) + "…",
                fullContent: body,
                publisher: source.name,
                author: ["A. Demir", "S. Kaya", "M. Öz", "L. Novak", "R. Singh"][index % 5],
                date: formatter.string(from: date),
                category: source.category,
                sourceUrl: sourcePageURL(for: source),
                imageUrl: nil,
                summaryLabel: nil
            )
        }
    }

    private static func sourcePageURL(for source: NewsSource) -> String {
        switch source.id {
        case "bbc-tech":
            return "https://www.bbc.com/news/technology"
        case "bbc-science":
            return "https://www.bbc.com/news/science-environment"
        case "the-guardian-tech":
            return "https://www.theguardian.com/technology"
        case "hacker-news":
            return "https://news.ycombinator.com/news"
        case "nasa":
            return "https://www.nasa.gov/news/all-news/"
        default:
            if let url = URL(string: source.feedUrl), let host = url.host {
                return "https://\(host)"
            }
            return source.feedUrl
        }
    }
}
