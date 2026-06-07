import SwiftUI

// MARK: - Discover
//
// The iOS counterpart of `frontend/src/app/discover/page.tsx`. Realises:
//   UC-14 Browse shared newspapers · UC-15 Follow curator · UC-17 Open public newspaper

struct DiscoverView: View {
    @EnvironmentObject private var store: AppStore
    @State private var query = ""
    @State private var showFollowingOnly = false
    @State private var openNewspaper: Newspaper?

    private var filtered: [Newspaper] {
        var pool = showFollowingOnly ? store.followedNewspapers : store.sharedNewspapers
        let q = query.trimmingCharacters(in: .whitespaces).lowercased()
        guard !q.isEmpty else { return pool }
        pool = pool.filter {
            $0.name.lowercased().contains(q) ||
            $0.curator.lowercased().contains(q) ||
            $0.description.lowercased().contains(q)
        }
        return pool
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    header
                    searchField
                    filterStrip

                    if filtered.isEmpty {
                        emptyState
                    } else {
                        ForEach(filtered) { newspaper in
                            Button { openNewspaper = newspaper } label: {
                                DiscoverCard(newspaper: newspaper)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
                .padding(16)
                .padding(.bottom, 36)
            }
            .background(Color.paper.ignoresSafeArea())
            .navigationTitle("Discover")
            .navigationBarTitleDisplayMode(.large)
            .sheet(item: $openNewspaper) { newspaper in
                PublicNewspaperView(newspaper: newspaper)
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            KEyebrow(text: "\(store.sharedNewspapers.count) published newspapers", color: .accent)
            Text("Newspapers worth a look")
                .font(.kisiselH1)
                .foregroundStyle(Color.ink)
            Text("Curated front pages from people you may not already follow — open one, follow its author, or fork its layout as your own starting point.")
                .font(.kisiselBody)
                .foregroundStyle(Color.textMuted)
        }
    }

    private var searchField: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass").foregroundStyle(Color.textSoft)
            TextField("Search by name, curator, or topic", text: $query)
                .font(.kisiselBody)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .background(Color.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).stroke(Color.hairline, lineWidth: 1.2))
    }

    /// Mirrors the "All / Following / Popular / Suggested" tab strip in
    /// `frontend/src/app/feed/page.tsx`; "Following" is wired to UC-15.
    private var filterStrip: some View {
        HStack(spacing: 8) {
            filterPill("All", isOn: !showFollowingOnly) { showFollowingOnly = false }
            filterPill("Following (\(store.followedNewspapers.count))", isOn: showFollowingOnly) { showFollowingOnly = true }
        }
    }

    private func filterPill(_ title: String, isOn: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.kisiselLabel)
                .padding(.horizontal, 13)
                .padding(.vertical, 8)
                .background(isOn ? Color.ink : Color.surface)
                .foregroundStyle(isOn ? Color.surface : Color.ink)
                .clipShape(Capsule())
                .overlay(Capsule().stroke(Color.ink.opacity(isOn ? 0 : 0.25), lineWidth: 1.2))
        }
        .buttonStyle(.plain)
    }

    private var emptyTitle: String {
        if !query.trimmingCharacters(in: .whitespaces).isEmpty { return "Nothing matches \"\(query)\"" }
        return showFollowingOnly ? "You're not following anyone yet" : "No newspapers published yet"
    }
    private var emptySubtitle: String {
        if !query.trimmingCharacters(in: .whitespaces).isEmpty { return "Try another name, curator, or topic." }
        return showFollowingOnly ? "Open a newspaper below and tap Follow to add it here." : "Check back soon — curators are still composing their front pages."
    }

    private var emptyState: some View {
        VStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 30))
                .foregroundStyle(Color.textSoft)
            Text(emptyTitle)
                .font(.kisiselH3)
                .foregroundStyle(Color.ink)
            Text(emptySubtitle)
                .font(.kisiselCaption)
                .foregroundStyle(Color.textMuted)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 44)
    }
}

private struct DiscoverCard: View {
    @EnvironmentObject private var store: AppStore
    let newspaper: Newspaper

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top, spacing: 10) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(newspaper.name).font(.kisiselH2).foregroundStyle(Color.ink)
                    Text("Curated by \(newspaper.curator)").font(.kisiselCaption).foregroundStyle(Color.textMuted)
                }
                Spacer()
                if store.isFollowing(newspaper) {
                    Text("Following")
                        .font(.kisiselPill)
                        .padding(.horizontal, 9).padding(.vertical, 5)
                        .background(Color.accent.opacity(0.12))
                        .foregroundStyle(Color.accent)
                        .clipShape(Capsule())
                }
            }
            Text(newspaper.description)
                .font(.kisiselBody)
                .foregroundStyle(Color.textMuted)
                .lineLimit(2)
            HStack(spacing: 10) {
                Label("\(newspaper.widgets.count) widgets", systemImage: "square.grid.2x2")
                Label(newspaper.readingMode.label, systemImage: newspaper.readingMode.systemImage)
            }
            .font(.kisiselCaption)
            .foregroundStyle(Color.textSoft)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .kCard(selected: false, editing: false)
    }
}
