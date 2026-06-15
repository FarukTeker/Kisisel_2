import SwiftUI

// MARK: - Widget card
//
// The iOS counterpart of `frontend/src/components/Widget.tsx`. Renders one of
// four content kinds (news / editorial / popular / random), and adapts the
// number of visible articles to the reading mode — mirroring `displayArticles`
// + the dynamic, height-aware article counts (UC-08, UC-09, UC-10).

struct WidgetCardView: View {
    @EnvironmentObject private var store: AppStore
    let widget: FeedWidget
    /// Whether this card sits in an editable context (your own newspaper with
    /// edit mode on). Read-only previews — e.g. someone else's published
    /// newspaper in Discover — pass `false` so badges/selection never show and
    /// the articles stay fully readable, regardless of your own `store.editMode`.
    var isEditable: Bool = false
    var isSelected: Bool = false
    var onSelect: (() -> Void)? = nil
    var onSettings: (() -> Void)? = nil
    var onDelete: (() -> Void)? = nil
    @State private var newsStartIndex = 0
    @State private var discoveryStartIndex = 0

    private var editing: Bool { isEditable && store.editMode }
    /// Editorial cards keep their inline note editor live while editing — every
    /// other kind routes taps to card-level selection instead (see `body`).
    private var contentStaysLiveWhileEditing: Bool { widget.kind == .editorial }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            header
            content
                // While editing, the card itself becomes the tap target (selection +
                // edit badges + reorder menu) — without this, taps land on the
                // "Source"/AI-summary controls inside and fire navigation instead
                // of selecting the widget, which is what felt "broken" in edit mode.
                // Editorial notes are the exception: their inline `TextEditor` must
                // stay hit-testable so curators can type the note directly on the card.
                .allowsHitTesting(!editing || contentStaysLiveWhileEditing)
                .opacity(editing && !contentStaysLiveWhileEditing ? 0.55 : 1)
            editControls
        }
        .padding(16)
        .frame(maxWidth: .infinity, minHeight: widget.size.rowSpan, alignment: .topLeading)
        .contentShape(Rectangle())
        .kCard(selected: isSelected, editing: editing)
        .overlay(alignment: .topLeading) { editBadge(systemImage: "slider.horizontal.3", color: .ink, action: onSettings) }
        .overlay(alignment: .topTrailing) { editBadge(systemImage: "xmark", color: .danger, action: onDelete) }
        .onTapGesture { if editing { onSelect?() } }
    }

    // MARK: Inline edit controls (UC-05 — position + size, surfaced directly on the card)

    @ViewBuilder
    private var editControls: some View {
        if editing {
            HStack(spacing: 12) {
                HStack(spacing: 8) {
                    moveButton(systemImage: "arrow.up", direction: -1)
                    moveButton(systemImage: "arrow.down", direction: 1)
                }
                Spacer(minLength: 12)
                Picker("Size", selection: Binding(
                    get: { widget.size },
                    set: { newSize in withAnimation { store.resizeWidget(widget, to: newSize) } }
                )) {
                    ForEach(WidgetSize.allCases, id: \.self) { size in
                        Text(size.label).tag(size)
                    }
                }
                .pickerStyle(.segmented)
                .frame(maxWidth: 230)
            }
            .padding(.top, 2)
        }
    }

    private func moveButton(systemImage: String, direction: Int) -> some View {
        Button {
            withAnimation { store.moveWidget(widget, direction: direction) }
        } label: {
            Image(systemName: systemImage)
                .font(.system(size: 12, weight: .black))
                .foregroundStyle(Color.ink)
                .frame(width: 30, height: 30)
                .background(Color.surface)
                .clipShape(Circle())
                .overlay(Circle().stroke(Color.ink.opacity(0.25), lineWidth: 1.2))
        }
        .buttonStyle(.plain)
    }

    // MARK: Header

    private var header: some View {
        HStack(alignment: .top, spacing: 10) {
            VStack(alignment: .leading, spacing: 4) {
                KEyebrow(text: eyebrowText, color: eyebrowColor)
                Text(widget.title)
                    .font(.kisiselH2)
                    .foregroundStyle(Color.ink)
                    .lineLimit(2)
            }
            Spacer()
            kindBadge
        }
    }

    private var eyebrowText: String {
        switch widget.kind {
        case .news: return store.sources.first(where: { $0.id == widget.sourceId })?.category ?? "Source feed"
        case .editorial: return "Curator note"
        case .popular: return "Beyond your feed"
        case .random: return "Designed serendipity"
        }
    }
    private var eyebrowColor: Color {
        switch widget.kind {
        case .news: return .accent
        case .editorial: return .accent
        case .popular: return Color(hex: "315EFB")
        case .random: return Color(hex: "7C3AED")
        }
    }
    private var kindBadge: some View {
        Text(badgeLabel)
            .font(.kisiselPill)
            .padding(.horizontal, 9)
            .padding(.vertical, 5)
            .background(Color.surfaceHover)
            .foregroundStyle(Color.ink)
            .clipShape(Capsule())
            .overlay(Capsule().stroke(Color.ink.opacity(0.18), lineWidth: 1.2))
    }
    private var badgeLabel: String {
        switch widget.kind {
        case .news: return "Live"
        case .editorial: return "Public"
        case .popular: return "Popular"
        case .random: return "Random"
        }
    }

    // MARK: Content router

    @ViewBuilder
    private var content: some View {
        switch widget.kind {
        case .editorial: editorialContent
        case .popular, .random: discoveryContent
        case .news: newsContent
        }
    }

    // MARK: Editorial (UC-11)

    private var editorialContent: some View {
        VStack(alignment: .leading, spacing: 10) {
            Rectangle().fill(Color.ink.opacity(0.15)).frame(height: 1)
            if editing {
                // Inline input so the curator can write the note directly on the
                // card — mirrors the web's inline `<textarea>` in `Widget.tsx`.
                TextEditor(text: Binding(
                    get: { widget.editorialBody ?? "" },
                    set: { store.setEditorialBody($0, for: widget) }
                ))
                .font(.kisiselBody)
                .foregroundStyle(Color.ink)
                .frame(minHeight: 90)
                .padding(8)
                .background(Color.surface)
                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 8, style: .continuous).strokeBorder(Color.ink.opacity(0.3), style: StrokeStyle(lineWidth: 1.2, dash: [5, 4])))
            } else {
                Text((widget.editorialBody?.isEmpty == false ? widget.editorialBody! :
                        "Add your editorial note to frame why this story matters, what readers should question, or how related stories connect."))
                    .font(.kisiselBody)
                    .foregroundStyle(Color.ink)
                    .lineLimit(store.readingMode == .scan ? 3 : nil)
            }
            HStack {
                Text("Visible in shared newspapers")
                    .font(.kisiselCaption)
                    .foregroundStyle(Color.textMuted)
                Spacer()
                Text("Author's note")
                    .font(.kisiselCaption)
                    .fontWeight(.bold)
                    .foregroundStyle(Color.ink)
            }
        }
    }

    // MARK: Popular / Random discovery (UC-10)

    private var discoveryContent: some View {
        let items = discoveryItems
        let accent: Color = widget.kind == .popular ? Color(hex: "315EFB") : Color(hex: "7C3AED")
        let momentumLabel = widget.kind == .popular ? "↑ Cross-source momentum" : "⟳ Unexpected angle"
        let visibleItems = pagedItems(items, start: discoveryStartIndex, count: visibleDiscoveryCount)
        let compactDiscovery = widget.size == .compact
        let regularDiscovery = widget.size == .regular

        return VStack(alignment: .leading, spacing: 10) {
            if items.isEmpty {
                discoverySkeleton
            } else {
                ForEach(Array(visibleItems.enumerated()), id: \.element.id) { _, article in
                    VStack(alignment: .leading, spacing: compactDiscovery ? 5 : 6) {
                        HStack(alignment: .top, spacing: 8) {
                            Text(article.title)
                                .font(.kisiselH3)
                                .foregroundStyle(Color.ink)
                                .lineLimit(compactDiscovery ? 2 : 3)
                            Spacer()
                            KCategoryPill(category: article.category)
                        }
                        Text("\(momentumLabel) · \(article.publisher) · \(article.date)")
                            .font(.kisiselCaption)
                            .foregroundStyle(Color.textMuted)
                            .lineLimit(compactDiscovery ? 1 : 2)
                        if store.readingMode != .scan && !compactDiscovery {
                            Text(store.summary(for: article))
                                .font(.kisiselBody)
                                .foregroundStyle(Color.textMuted)
                                .lineLimit(regularDiscovery ? 2 : 3)
                        }
                        HStack {
                            statusPill(for: article)
                            Spacer()
                            openSourceButton(article)
                        }
                    }
                    .padding(compactDiscovery ? 10 : 12)
                    .background(Color.surface)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(Color.ink.opacity(0.16), lineWidth: 1.2))
                    .onAppear { store.requestSummary(for: article) }
                }
            }
            HStack {
                Text(discoveryFooterLabel(total: items.count))
                    .font(.kisiselCaption)
                    .foregroundStyle(Color.textSoft)
                Spacer()
                Text("Live").font(.kisiselCaption).fontWeight(.heavy).foregroundStyle(accent)
            }
        }
        .contentShape(Rectangle())
        .highPriorityGesture(articlePagingGesture(total: items.count) { delta in
            moveIndex(&discoveryStartIndex, by: delta, total: items.count)
        })
    }

    private var discoveryItems: [Article] {
        widget.kind == .popular ? store.popularArticles : store.randomArticles
    }
    private var visibleDiscoveryCount: Int {
        switch store.readingMode {
        case .scan:
            switch widget.size {
            case .compact: return 1
            case .regular: return 2
            case .large: return 3
            }
        case .skim:
            switch widget.size {
            case .compact: return 1
            case .regular: return 2
            case .large: return 3
            }
        case .full:
            switch widget.size {
            case .compact: return 1
            case .regular: return 2
            case .large: return 2
            }
        }
    }
    private func discoveryFooterLabel(total: Int) -> String {
        switch widget.size {
        case .compact:
            return widget.kind == .popular ? "\(total) live picks" : "\(total) sampled stories"
        case .regular, .large:
            return widget.kind == .popular ? "\(total) stories scored from live feeds" : "Sampled from all sources"
        }
    }
    private var discoverySkeleton: some View {
        VStack(spacing: 8) {
            ForEach(0..<2, id: \.self) { _ in
                RoundedRectangle(cornerRadius: 12).fill(Color.surfaceHover).frame(height: 64)
            }
        }
    }

    // MARK: News feed (UC-09)

    private var newsContent: some View {
        let pool = filteredArticles
        return Group {
            if pool.isEmpty {
                emptyFeedState
            } else {
                switch store.readingMode {
                case .scan: scanList(pool)
                case .skim: skimList(pool)
                case .full: fullArticle(pool)
                }
            }
        }
    }

    private var filteredArticles: [Article] {
        guard let sourceId = widget.sourceId else { return [] }
        let all = store.articles(for: sourceId)
        guard let category = widget.categoryFilter, !category.isEmpty else { return all }
        let filtered = all.filter { $0.category == category }
        return filtered.isEmpty ? all : filtered
    }

    private var emptyFeedState: some View {
        let isLoading = widget.sourceId.map { store.isLoadingArticles(for: $0) } ?? false
        return VStack(spacing: 6) {
            if isLoading {
                ProgressView().tint(Color.accent)
                Text("Loading live articles…")
                    .font(.kisiselCaption)
                    .foregroundStyle(Color.textMuted)
            } else {
                Image(systemName: widget.sourceId == nil ? "exclamationmark.circle" : "newspaper")
                    .foregroundStyle(Color.textSoft)
                Text(widget.sourceId == nil ? "No source configured" : "No articles available yet")
                    .font(.kisiselCaption)
                    .foregroundStyle(Color.textMuted)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 18)
    }

    /// Scan mode — headline rows only. Count adapts to widget size, mirroring the
    /// dynamic `ResizeObserver`-driven count in the web Widget.
    private func scanList(_ pool: [Article]) -> some View {
        let count: Int
        switch widget.size {
        case .compact: count = 1
        case .regular: count = 2
        case .large: count = 4
        }
        let visibleArticles = pagedItems(pool, start: newsStartIndex, count: count)
        return VStack(spacing: 8) {
            ForEach(Array(visibleArticles), id: \.id) { article in
                HStack(spacing: 10) {
                    VStack(alignment: .leading, spacing: 3) {
                        Text(article.title)
                            .font(.kisiselH3)
                            .foregroundStyle(Color.ink)
                            .lineLimit(2)
                        HStack(spacing: 6) {
                            Text(article.date).font(.kisiselCaption).foregroundStyle(Color.textSoft)
                            KCategoryPill(category: article.category)
                        }
                    }
                    Spacer()
                    openSourceButton(article)
                }
                .padding(.vertical, 8)
                .padding(.horizontal, 10)
                .background(Color.surface)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 10, style: .continuous).stroke(Color(hex: "E5E7EB"), lineWidth: 1))
            }
        }
        .contentShape(Rectangle())
        .highPriorityGesture(articlePagingGesture(total: pool.count) { delta in
            moveIndex(&newsStartIndex, by: delta, total: pool.count)
        })
    }

    /// Skim mode — summary cards with metadata + AI status.
    private func skimList(_ pool: [Article]) -> some View {
        let count: Int
        switch widget.size {
        case .compact: count = 1
        case .regular: count = 2
        case .large: count = 3
        }
        let visibleArticles = pagedItems(pool, start: newsStartIndex, count: count)
        return VStack(spacing: 10) {
            ForEach(Array(visibleArticles), id: \.id) { article in
                VStack(alignment: .leading, spacing: 6) {
                    HStack(alignment: .top) {
                        Text(article.title).font(.kisiselH3).foregroundStyle(Color.ink).lineLimit(2)
                        Spacer()
                        KCategoryPill(category: article.category)
                    }
                    Text("\(article.publisher) · \(article.author) · \(article.date)")
                        .font(.kisiselCaption).foregroundStyle(Color.textSoft)
                    Text(store.summary(for: article))
                        .font(.kisiselBody).foregroundStyle(Color.textMuted).lineLimit(3)
                    HStack {
                        statusPill(for: article)
                        Spacer()
                        openSourceButton(article)
                    }
                }
                .padding(12)
                .background(Color.surface)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(Color(hex: "E5E7EB"), lineWidth: 1))
                .onAppear { store.requestSummary(for: article) }
            }
        }
        .contentShape(Rectangle())
        .highPriorityGesture(articlePagingGesture(total: pool.count) { delta in
            moveIndex(&newsStartIndex, by: delta, total: pool.count)
        })
    }

    /// Full mode — one article, full summary, deep-read framing.
    private func fullArticle(_ pool: [Article]) -> some View {
        let article = pool[wrappedIndex(newsStartIndex, total: pool.count)]
        return VStack(alignment: .leading, spacing: 10) {
            Text(article.title).font(.kisiselH1).foregroundStyle(Color.ink)
            HStack(spacing: 6) {
                Text(article.publisher).font(.kisiselLabel).foregroundStyle(Color.ink)
                Text("·").foregroundStyle(Color.hairline)
                Text(article.author).font(.kisiselCaption).foregroundStyle(Color.textMuted)
                Text("·").foregroundStyle(Color.hairline)
                Text(article.date).font(.kisiselCaption).foregroundStyle(Color.textSoft)
                KCategoryPill(category: article.category)
            }
            Text(store.summary(for: article))
                .font(.kisiselBody)
                .foregroundStyle(Color.ink)
                .lineSpacing(4)
            HStack {
                statusPill(for: article)
                Spacer()
                openSourceButton(article, prominent: true)
            }
        }
        .onAppear { store.requestSummary(for: article) }
        .contentShape(Rectangle())
        .highPriorityGesture(articlePagingGesture(total: pool.count) { delta in
            moveIndex(&newsStartIndex, by: delta, total: pool.count)
        })
    }

    // MARK: Shared sub-views

    private func statusPill(for article: Article) -> some View {
        Group {
            if store.isSummarizing(article) {
                KAiStatusPill(state: .loading)
            } else if store.hasLiveSummary(article) {
                KAiStatusPill(state: .live)
            } else {
                KAiStatusPill(state: .preview(article.summaryLabel ?? "AI preview"))
            }
        }
    }

    private func openSourceButton(_ article: Article, prominent: Bool = false) -> some View {
        Button {
            if let url = URL(string: article.sourceUrl) { UIApplication.shared.open(url) }
        } label: {
            HStack(spacing: 4) {
                Text(prominent ? "Read original source" : "Source")
                Image(systemName: "arrow.up.right.square")
            }
            .font(.kisiselCaption.weight(.bold))
            .padding(.horizontal, prominent ? 14 : 10)
            .padding(.vertical, prominent ? 8 : 6)
            .background(prominent ? Color.ink : Color.surface)
            .foregroundStyle(prominent ? Color.surface : Color.ink)
            .clipShape(Capsule())
            .overlay(Capsule().stroke(Color.ink.opacity(prominent ? 0 : 0.4), lineWidth: 1))
        }
        .buttonStyle(.plain)
    }

    private func articlePagingGesture(total: Int, advance: @escaping (Int) -> Void) -> some Gesture {
        DragGesture(minimumDistance: 22)
            .onEnded { value in
                guard !editing, total > 1 else { return }
                let horizontal = value.translation.width
                let vertical = value.translation.height

                if abs(vertical) >= abs(horizontal), abs(vertical) > 28 {
                    advance(vertical < 0 ? 1 : -1)
                } else if abs(horizontal) > 28 {
                    advance(horizontal < 0 ? 1 : -1)
                }
            }
    }

    private func pagedItems(_ items: [Article], start: Int, count: Int) -> [Article] {
        guard !items.isEmpty else { return [] }
        let cappedCount = min(count, items.count)
        let normalizedStart = wrappedIndex(start, total: items.count)
        return (0..<cappedCount).map { items[(normalizedStart + $0) % items.count] }
    }

    private func moveIndex(_ index: inout Int, by delta: Int, total: Int) {
        guard total > 0 else { return }
        index = wrappedIndex(index + delta, total: total)
    }

    private func wrappedIndex(_ index: Int, total: Int) -> Int {
        guard total > 0 else { return 0 }
        return (index % total + total) % total
    }

    private func editBadge(systemImage: String, color: Color, action: (() -> Void)?) -> some View {
        Group {
            if editing, let action {
                Button(action: action) {
                    Image(systemName: systemImage)
                        .font(.system(size: 11, weight: .black))
                        .foregroundStyle(color)
                        .frame(width: 26, height: 26)
                        .background(Color.surface)
                        .clipShape(Circle())
                        .overlay(Circle().stroke(color, lineWidth: 2))
                }
                .buttonStyle(.plain)
                .offset(x: systemImage == "xmark" ? 10 : -10, y: -10)
            }
        }
    }
}
