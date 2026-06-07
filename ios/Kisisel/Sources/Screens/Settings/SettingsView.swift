import SwiftUI

// MARK: - Settings & sources
//
// The iOS counterpart of the settings panel in `frontend/src/app/page.tsx`. Realises:
//   UC-07 Manage custom sources · UC-08 Switch reading mode (account-level default)

struct SettingsView: View {
    @EnvironmentObject private var store: AppStore
    @State private var showAddSource = false
    @State private var confirmLogout = false

    var body: some View {
        NavigationStack {
            Form {
                accountSection
                readingModeSection
                sourcesSection
                aboutSection
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.large)
            .sheet(isPresented: $showAddSource) { AddSourceSheet() }
            .confirmationDialog("Log out of Kişisel?", isPresented: $confirmLogout, titleVisibility: .visible) {
                Button("Log out", role: .destructive) { withAnimation { store.logout() } }
                Button("Cancel", role: .cancel) {}
            }
        }
    }

    // MARK: Account

    private var accountSection: some View {
        Section("Account") {
            HStack(spacing: 12) {
                Circle()
                    .fill(Color.accent.opacity(0.14))
                    .frame(width: 44, height: 44)
                    .overlay(Text(initials).font(.kisiselH3).foregroundStyle(Color.accent))
                VStack(alignment: .leading, spacing: 2) {
                    Text(store.currentUser?.name ?? "Guest reader").font(.kisiselH3).foregroundStyle(Color.ink)
                    Text(store.currentUser?.email ?? "—").font(.kisiselCaption).foregroundStyle(Color.textMuted)
                }
            }
            .padding(.vertical, 4)

            Button(role: .destructive) { confirmLogout = true } label: {
                Label("Log out", systemImage: "rectangle.portrait.and.arrow.right")
            }
        }
    }

    private var initials: String {
        let parts = (store.currentUser?.name ?? "Guest").split(separator: " ")
        let letters = parts.prefix(2).compactMap { $0.first }
        return String(letters).uppercased()
    }

    // MARK: Reading mode (UC-08)

    private var readingModeSection: some View {
        Section {
            Picker("Default reading mode", selection: Binding(
                get: { store.readingMode },
                set: { newMode in withAnimation { store.setReadingMode(newMode) } }
            )) {
                ForEach(ReadingMode.allCases, id: \.self) { mode in
                    Label(mode.label, systemImage: mode.systemImage).tag(mode)
                }
            }
            Text(store.readingMode.detail)
                .font(.kisiselCaption)
                .foregroundStyle(Color.textMuted)
        } header: {
            Text("Reading")
        } footer: {
            Text("Controls how much of every story your widgets show — Scan for headlines, Skim for summaries, Full for the complete read.")
        }
    }

    // MARK: Sources (UC-07)

    private var sourcesSection: some View {
        Section {
            ForEach(store.sources) { source in
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(source.name).font(.kisiselH3).foregroundStyle(Color.ink)
                        Text("\(source.category) · \(source.feedUrl)")
                            .font(.kisiselCaption)
                            .foregroundStyle(Color.textMuted)
                            .lineLimit(1)
                    }
                    Spacer()
                    if source.isCustom {
                        Text("Custom")
                            .font(.kisiselPill)
                            .padding(.horizontal, 8).padding(.vertical, 4)
                            .background(Color.accent.opacity(0.12))
                            .foregroundStyle(Color.accent)
                            .clipShape(Capsule())
                    }
                }
            }
            .onDelete(perform: deleteCustomSources)

            Button { showAddSource = true } label: {
                Label("Add a custom source", systemImage: "plus.circle")
            }
        } header: {
            Text("Sources")
        } footer: {
            Text("Custom sources can be removed; built-in publishers stay in your library so widgets keep working.")
        }
    }

    private func deleteCustomSources(at offsets: IndexSet) {
        for index in offsets {
            let source = store.sources[index]
            guard source.isCustom else { continue }
            withAnimation { store.removeSource(source) }
        }
    }

    // MARK: About

    private var aboutSection: some View {
        Section("About") {
            LabeledContent("App", value: "Kişisel")
            LabeledContent("Version", value: "1.0 (prototype)")
        }
    }
}

// MARK: - Add custom source sheet (UC-07)

struct AddSourceSheet: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var feedUrl = ""
    @State private var category = "Technology"

    private static let categories = ["Technology", "Science", "Finance", "Food", "Culture"]

    var body: some View {
        NavigationStack {
            Form {
                Section("New source") {
                    TextField("Publisher name", text: $name)
                    TextField("Feed URL (https://…)", text: $feedUrl)
                        .keyboardType(.URL)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                    Picker("Category", selection: $category) {
                        ForEach(Self.categories, id: \.self) { Text($0) }
                    }
                }
                if let error = store.sourceAddError {
                    Section {
                        Text(error).font(.kisiselLabel).foregroundStyle(Color.danger)
                    }
                }
            }
            .navigationTitle("Add source")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        let trimmedName = name.trimmingCharacters(in: .whitespaces)
                        guard !trimmedName.isEmpty else {
                            store.sourceAddError = "Give your source a name."
                            return
                        }
                        if store.addCustomSource(name: trimmedName, feedUrl: feedUrl, category: category) {
                            dismiss()
                        }
                    }
                    .fontWeight(.bold)
                }
            }
        }
    }
}
