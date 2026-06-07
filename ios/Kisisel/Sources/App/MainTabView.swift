import SwiftUI

// MARK: - Main tab bar
//
// Three destinations mirror the prototype's primary navigation
// (`frontend/src/app/page.tsx`, `/feed`, settings panel):
//   Newspaper (UC-03…UC-12) · Discover (UC-13…UC-17) · Settings (UC-07/08)

struct MainTabView: View {
    var body: some View {
        TabView {
            NewspaperView()
                .tabItem { Label("Newspaper", systemImage: "newspaper") }

            DiscoverView()
                .tabItem { Label("Discover", systemImage: "sparkle.magnifyingglass") }

            SettingsView()
                .tabItem { Label("Settings", systemImage: "gearshape") }
        }
        .tint(Color.ink)
    }
}
