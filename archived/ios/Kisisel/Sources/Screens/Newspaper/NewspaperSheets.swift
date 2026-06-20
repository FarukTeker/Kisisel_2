import SwiftUI

// MARK: - Add widget sheet (UC-04 Add widget to layout)
//
// Mirrors the "Widgets" tab of the page-settings modal in `frontend/src/app/page.tsx`:
// pick a widget kind, then (for source feeds) pick a publisher.

struct AddWidgetSheet: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss

    @State private var selectedKind: WidgetKind = .news
    @State private var selectedSourceId: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Widget type") {
                    ForEach(WidgetKind.allCases, id: \.self) { kind in
                        Button {
                            selectedKind = kind
                            if kind != .news { selectedSourceId = nil }
                            else if selectedSourceId == nil { selectedSourceId = store.sources.first?.id }
                        } label: {
                            HStack {
                                Image(systemName: kind.systemImage)
                                    .frame(width: 26)
                                    .foregroundStyle(selectedKind == kind ? Color.accent : Color.textMuted)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(kind.label).font(.kisiselH3).foregroundStyle(Color.ink)
                                    Text(kindDescription(kind)).font(.kisiselCaption).foregroundStyle(Color.textMuted)
                                }
                                Spacer()
                                if selectedKind == kind {
                                    Image(systemName: "checkmark.circle.fill").foregroundStyle(Color.accent)
                                }
                            }
                        }
                        .buttonStyle(.plain)
                    }
                }

                if selectedKind == .news {
                    Section("Source") {
                        ForEach(store.sources) { source in
                            Button {
                                selectedSourceId = source.id
                            } label: {
                                HStack {
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(source.name).font(.kisiselH3).foregroundStyle(Color.ink)
                                        Text(source.category).font(.kisiselCaption).foregroundStyle(Color.textMuted)
                                    }
                                    Spacer()
                                    if selectedSourceId == source.id {
                                        Image(systemName: "checkmark.circle.fill").foregroundStyle(Color.accent)
                                    }
                                }
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
            .navigationTitle("Add widget")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        store.addWidget(kind: selectedKind, sourceId: selectedKind == .news ? selectedSourceId : nil)
                        dismiss()
                    }
                    .disabled(selectedKind == .news && selectedSourceId == nil)
                    .fontWeight(.bold)
                }
            }
        }
    }

    private func kindDescription(_ kind: WidgetKind) -> String {
        switch kind {
        case .news: return "Pulls live articles from a chosen publisher."
        case .editorial: return "Your own commentary, attributed to you."
        case .popular: return "Cross-source trending picks, scored automatically."
        case .random: return "A shuffled sample to break the filter bubble."
        }
    }
}

// MARK: - Widget settings sheet (UC-06 Configure widget content)
//
// Mirrors the per-widget settings panel: category filter for news widgets,
// editorial body editor for editorial widgets, plus size control (UC-05).

struct WidgetSettingsSheet: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss
    let widget: FeedWidget

    @State private var editorialDraft: String = ""
    @State private var categoryDraft: String?

    private static let categories = ["Technology", "Science", "Finance", "Food", "Culture"]

    var body: some View {
        NavigationStack {
            Form {
                Section("Layout") {
                    Picker("Size", selection: Binding(
                        get: { currentWidget?.size ?? .regular },
                        set: { store.resizeWidget(widget, to: $0) }
                    )) {
                        ForEach(WidgetSize.allCases, id: \.self) { size in
                            Text(size.label).tag(size)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                if widget.kind == .news {
                    Section("Category filter") {
                        Picker("Category", selection: $categoryDraft) {
                            Text("All categories").tag(String?.none)
                            ForEach(Self.categories, id: \.self) { category in
                                Text(category).tag(String?.some(category))
                            }
                        }
                        .pickerStyle(.inline)
                        .onChange(of: categoryDraft) { _, newValue in
                            store.setCategoryFilter(newValue, for: widget)
                        }
                    }
                }

                if widget.kind == .editorial {
                    Section("Editorial note") {
                        TextEditor(text: $editorialDraft)
                            .frame(minHeight: 140)
                            .font(.kisiselBody)
                            .onChange(of: editorialDraft) { _, newValue in
                                store.setEditorialBody(newValue, for: widget)
                            }
                        Text("Visible to anyone who reads or follows this newspaper once published.")
                            .font(.kisiselCaption)
                            .foregroundStyle(Color.textMuted)
                    }
                }

                Section {
                    Button(role: .destructive) {
                        store.removeWidget(widget)
                        dismiss()
                    } label: {
                        Label("Remove this widget", systemImage: "trash")
                    }
                }
            }
            .navigationTitle(widget.title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) { Button("Done") { dismiss() }.fontWeight(.bold) }
            }
            .onAppear {
                editorialDraft = widget.editorialBody ?? ""
                categoryDraft = widget.categoryFilter
            }
        }
    }

    private var currentWidget: FeedWidget? {
        store.myNewspaper.widgets.first { $0.id == widget.id }
    }
}

// MARK: - Share sheet (UC-13 Publish newspaper)
//
// Mirrors the "Share" tab: generates a public slug + shareable URL, mirrored
// into `sharedNewspapers` so it immediately becomes visible in Discover.

struct ShareNewspaperSheet: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss
    @State private var slug: String?
    @State private var copied = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 22) {
                VStack(spacing: 8) {
                    Image(systemName: "globe")
                        .font(.system(size: 34))
                        .foregroundStyle(Color.accent)
                    Text("Publish your newspaper")
                        .font(.kisiselH1)
                        .foregroundStyle(Color.ink)
                    Text("Generate a public link so guests can read your layout, follow you, or fork it as their own starting point.")
                        .font(.kisiselBody)
                        .foregroundStyle(Color.textMuted)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 12)

                if let slug {
                    VStack(spacing: 12) {
                        Text(store.shareURL(for: slug).absoluteString)
                            .font(.kisiselLabel)
                            .foregroundStyle(Color.ink)
                            .padding(12)
                            .frame(maxWidth: .infinity)
                            .background(Color.surfaceHover)
                            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))

                        HStack(spacing: 10) {
                            KBtn(title: copied ? "Copied!" : "Copy link", systemImage: copied ? "checkmark" : "doc.on.doc", kind: .secondary) {
                                UIPasteboard.general.string = store.shareURL(for: slug).absoluteString
                                withAnimation { copied = true }
                                DispatchQueue.main.asyncAfter(deadline: .now() + 1.6) { withAnimation { copied = false } }
                            }
                            ShareLink(item: store.shareURL(for: slug)) {
                                HStack(spacing: 6) { Image(systemName: "square.and.arrow.up"); Text("Share") }
                                    .font(.kisiselButton)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 12)
                                    .background(Color.ink)
                                    .foregroundStyle(Color.surface)
                                    .clipShape(Capsule())
                            }
                        }
                    }
                } else {
                    KBtn(title: "Generate public link", systemImage: "link.badge.plus", kind: .primary) {
                        withAnimation { slug = store.publishNewspaper() }
                    }
                }

                Spacer()
            }
            .padding(24)
            .background(Color.paper.ignoresSafeArea())
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Close") { dismiss() } }
            }
            .onAppear { slug = store.publishedSlug }
        }
    }
}
