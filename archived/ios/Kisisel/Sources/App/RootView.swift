import SwiftUI

// MARK: - Root navigation flow
//
// Mirrors the web prototype's gating in `frontend/src/app/page.tsx` /
// `frontend/src/lib/prototypeState.ts`:
//   splash → onboarding → auth (UC-01/UC-02) → personal newspaper (UC-03)

struct RootView: View {
    @EnvironmentObject private var store: AppStore
    @State private var showSplash = true

    var body: some View {
        ZStack {
            Color.paper.ignoresSafeArea()

            if showSplash {
                SplashView()
                    .transition(.opacity)
            } else if !store.hasCompletedOnboarding {
                OnboardingFlowView()
                    .transition(.asymmetric(insertion: .move(edge: .trailing), removal: .opacity))
            } else if !store.isAuthenticated {
                AuthFlowView()
                    .transition(.asymmetric(insertion: .move(edge: .trailing), removal: .opacity))
            } else {
                MainTabView()
                    .transition(.asymmetric(insertion: .move(edge: .trailing), removal: .opacity))
            }
        }
        .animation(.easeInOut(duration: 0.35), value: showSplash)
        .animation(.easeInOut(duration: 0.35), value: store.hasCompletedOnboarding)
        .animation(.easeInOut(duration: 0.35), value: store.isAuthenticated)
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.4) {
                withAnimation { showSplash = false }
            }
        }
    }
}

// MARK: - Splash

struct SplashView: View {
    var body: some View {
        VStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .fill(Color.ink)
                    .frame(width: 84, height: 84)
                Text("K")
                    .font(.system(size: 40, weight: .black, design: .rounded))
                    .foregroundStyle(Color.paper)
            }
            Text("Kişisel")
                .font(.kisiselDisplay)
                .foregroundStyle(Color.ink)
            Text("Your personal newspaper, composed by you")
                .font(.kisiselBody)
                .foregroundStyle(Color.textMuted)
        }
    }
}
