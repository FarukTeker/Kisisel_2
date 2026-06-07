import SwiftUI

// MARK: - Personal newspaper dashboard
//
// The iOS counterpart of `frontend/src/app/page.tsx`. Realises:
//   UC-03 Create/open personal newspaper · UC-04 Add widget · UC-05 Move/resize
//   UC-06 Configure widget content · UC-08 Switch reading mode · UC-12 Save layout

struct NewspaperView: View {
    @EnvironmentObject private var store: AppStore
    @State private var showAddWidget = false
    @State private var showWidgetSettings = false
    @State private var showShareSheet = false
    @State private var configuringWidget: FeedWidget?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    readingModeStrip

                    if store.myNewspaper.widgets.isEmpty {
                        emptyState
                    } else {
                        ForEach(store.myNewspaper.widgets.sorted(by: { $0.order < $1.order })) { widget in
                            WidgetCardView(
                                widget: widget,
                                isEditable: true,
                                isSelected: store.selectedWidgetId == widget.id,
                                onSelect: { store.selectedWidgetId = widget.id },
                                onSettings: { configuringWidget = widget; showWidgetSettings = true },
                                onDelete: { withAnimation { store.removeWidget(widget) } }
                            )
                            .contextMenu { reorderMenu(for: widget) }
                        }
                    }

                    if store.editMode {
                        addWidgetButton
                    }
                }
                .padding(16)
                .padding(.bottom, 36)
            }
            .background(Color.paper.ignoresSafeArea())
            .navigationTitle(store.myNewspaper.name)
            .navigationBarTitleDisplayMode(.large)
            .toolbar { toolbarContent }
            .onChange(of: store.myNewspaper) { _, _ in store.persistLayout() }
            .onChange(of: store.readingMode) { _, _ in store.persistLayout() }
            .onAppear { store.restoreLayout() }
            .sheet(isPresented: $showAddWidget) { AddWidgetSheet() }
            .sheet(item: $configuringWidget) { widget in
                WidgetSettingsSheet(widget: widget)
            }
            .sheet(isPresented: $showShareSheet) { ShareNewspaperSheet() }
        }
    }

    // MARK: Reading mode strip (UC-08)

    private var readingModeStrip: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Reading mode").font(.kisiselLabel).foregroundStyle(Color.textMuted)
            HStack(spacing: 8) {
                ForEach(ReadingMode.allCases, id: \.self) { mode in
                    Button { withAnimation { store.setReadingMode(mode) } } label: {
                        HStack(spacing: 6) {
                            Image(systemName: mode.systemImage)
                            Text(mode.label)
                        }
                        .font(.kisiselLabel)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 9)
                        .background(store.readingMode == mode ? Color.ink : Color.surface)
                        .foregroundStyle(store.readingMode == mode ? Color.surface : Color.ink)
                        .clipShape(Capsule())
                        .overlay(Capsule().stroke(Color.ink.opacity(store.readingMode == mode ? 0 : 0.25), lineWidth: 1.2))
                    }
                    .buttonStyle(.plain)
                }
            }
            Text(store.readingMode.detail)
                .font(.kisiselCaption)
                .foregroundStyle(Color.textSoft)
        }
    }

    // MARK: Empty state (UC-03 alternative flow)

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "square.stack.3d.up.slash")
                .font(.system(size: 34))
                .foregroundStyle(Color.textSoft)
            Text("Your newspaper is empty")
                .font(.kisiselH2)
                .foregroundStyle(Color.ink)
            Text("Turn on editing and add your first widget — a news source, an editorial note, or a discovery feed.")
                .font(.kisiselBody)
                .foregroundStyle(Color.textMuted)
                .multilineTextAlignment(.center)
            KBtn(title: "Start editing", systemImage: "pencil", kind: .primary) {
                withAnimation { store.editMode = true }
            }
            .frame(maxWidth: 220)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 50)
    }

    private var addWidgetButton: some View {
        Button { showAddWidget = true } label: {
            HStack(spacing: 8) {
                Image(systemName: "plus.circle.fill")
                Text("Add widget")
            }
            .font(.kisiselButton)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .foregroundStyle(Color.accent)
            .background(Color.accent.opacity(0.08))
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).strokeBorder(Color.accent.opacity(0.4), style: StrokeStyle(lineWidth: 1.4, dash: [6, 5])))
        }
        .buttonStyle(.plain)
    }

    // MARK: Reorder menu (UC-05 — move within layout)

    @ViewBuilder
    private func reorderMenu(for widget: FeedWidget) -> some View {
        if store.editMode {
            let widgets = store.myNewspaper.widgets.sorted(by: { $0.order < $1.order })
            if let idx = widgets.firstIndex(where: { $0.id == widget.id }) {
                if idx > 0 {
                    Button { moveWidget(widget, to: idx - 1) } label: { Label("Move up", systemImage: "arrow.up") }
                }
                if idx < widgets.count - 1 {
                    Button { moveWidget(widget, to: idx + 1) } label: { Label("Move down", systemImage: "arrow.down") }
                }
                Menu("Resize") {
                    ForEach(WidgetSize.allCases, id: \.self) { size in
                        Button(size.label) { withAnimation { store.resizeWidget(widget, to: size) } }
                    }
                }
                Button(role: .destructive) { withAnimation { store.removeWidget(widget) } } label: {
                    Label("Remove widget", systemImage: "trash")
                }
            }
        }
    }

    private func moveWidget(_ widget: FeedWidget, to destination: Int) {
        let widgets = store.myNewspaper.widgets.sorted(by: { $0.order < $1.order })
        guard let from = widgets.firstIndex(where: { $0.id == widget.id }) else { return }
        var ids = widgets.map(\.id)
        ids.move(fromOffsets: IndexSet(integer: from), toOffset: destination > from ? destination + 1 : destination)
        for (newOrder, id) in ids.enumerated() {
            if let idx = store.myNewspaper.widgets.firstIndex(where: { $0.id == id }) {
                store.myNewspaper.widgets[idx].order = newOrder
            }
        }
    }

    // MARK: Toolbar

    @ToolbarContentBuilder
    private var toolbarContent: some ToolbarContent {
        ToolbarItem(placement: .topBarLeading) {
            Button { showShareSheet = true } label: {
                Image(systemName: "square.and.arrow.up")
            }
        }
        ToolbarItem(placement: .topBarTrailing) {
            Button {
                withAnimation {
                    store.editMode.toggle()
                    if !store.editMode { store.selectedWidgetId = nil }
                }
            } label: {
                Text(store.editMode ? "Done" : "Edit")
                    .font(.kisiselButton)
                    .foregroundStyle(store.editMode ? Color.accent : Color.ink)
            }
        }
    }
}
