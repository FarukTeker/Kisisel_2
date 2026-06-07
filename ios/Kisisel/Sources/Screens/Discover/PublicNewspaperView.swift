import SwiftUI

// MARK: - Public newspaper reader
//
// The iOS counterpart of `frontend/src/app/newspaper/[slug]/page.tsx`. Realises:
//   UC-15 Follow curator · UC-16 Fork newspaper · UC-17 Read a published newspaper

struct PublicNewspaperView: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss
    let newspaper: Newspaper

    @State private var forked = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    header
                    actionRow

                    ForEach(newspaper.widgets.sorted(by: { $0.order < $1.order })) { widget in
                        // `isEditable: false` keeps this read-only — no edit badges or
                        // selection styling leak in from your own `store.editMode` —
                        // while articles, AI summaries, and source links stay live.
                        WidgetCardView(widget: widget, isEditable: false)
                    }
                }
                .padding(16)
                .padding(.bottom, 36)
            }
            .background(Color.paper.ignoresSafeArea())
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Close") { dismiss() } }
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            KEyebrow(text: "Curated by \(newspaper.curator)", color: .accent)
            Text(newspaper.name)
                .font(.kisiselDisplay)
                .foregroundStyle(Color.ink)
            Text(newspaper.description)
                .font(.kisiselBody)
                .foregroundStyle(Color.textMuted)
            HStack(spacing: 10) {
                Label("\(newspaper.widgets.count) widgets", systemImage: "square.grid.2x2")
                Label(newspaper.readingMode.label, systemImage: newspaper.readingMode.systemImage)
            }
            .font(.kisiselCaption)
            .foregroundStyle(Color.textSoft)
        }
    }

    // MARK: Follow / fork (UC-15 / UC-16)

    private var actionRow: some View {
        HStack(spacing: 10) {
            KBtn(title: store.isFollowing(newspaper) ? "Following" : "Follow",
                 systemImage: store.isFollowing(newspaper) ? "checkmark" : "plus",
                 kind: store.isFollowing(newspaper) ? .secondary : .primary) {
                withAnimation { _ = store.toggleFollow(newspaper) }
            }
            KBtn(title: forked ? "Forked into yours" : "Fork layout",
                 systemImage: forked ? "checkmark" : "arrow.triangle.branch",
                 kind: .outline) {
                if store.forkNewspaper(newspaper) {
                    withAnimation { forked = true }
                }
            }
        }
    }
}
