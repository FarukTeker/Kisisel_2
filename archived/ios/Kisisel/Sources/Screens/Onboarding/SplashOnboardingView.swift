import SwiftUI

// MARK: - Onboarding flow
//
// First-run explainer carousel — primes the user for the five core ideas listed
// in `docs/use-cases-and-requirements.md` ("Product Understanding") before they
// hit the auth gate (UC-01 / UC-02).

private struct OnboardingPage: Identifiable {
    let id = UUID()
    let icon: String
    let title: String
    let body: String
}

private let onboardingPages: [OnboardingPage] = [
    OnboardingPage(icon: "square.grid.2x2.fill",
                   title: "Compose your own front page",
                   body: "Add, move, and resize widgets to build a newspaper that reflects exactly what you care about."),
    OnboardingPage(icon: "sparkles",
                   title: "AI summaries, real sources",
                   body: "Every story pairs an AI-generated preview with clear publisher attribution — skim fast, verify deeper."),
    OnboardingPage(icon: "shuffle",
                   title: "Designed serendipity",
                   body: "Popular and Random widgets pull you outside your usual interests on purpose — no filter bubble by default."),
    OnboardingPage(icon: "person.2.fill",
                   title: "Share, follow, and remix",
                   body: "Publish your layout, follow curators you trust, and fork any newspaper as a starting point for your own."),
]

struct OnboardingFlowView: View {
    @EnvironmentObject private var store: AppStore
    @State private var pageIndex = 0

    var body: some View {
        VStack(spacing: 0) {
            Spacer(minLength: 24)

            TabView(selection: $pageIndex) {
                ForEach(Array(onboardingPages.enumerated()), id: \.element.id) { index, page in
                    OnboardingPageView(page: page).tag(index)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .always))
            .indexViewStyle(.page(backgroundDisplayMode: .always))

            VStack(spacing: 12) {
                KBtn(title: pageIndex == onboardingPages.count - 1 ? "Get started" : "Continue", kind: .primary) {
                    if pageIndex == onboardingPages.count - 1 {
                        store.completeOnboarding()
                    } else {
                        withAnimation { pageIndex += 1 }
                    }
                }
                if pageIndex < onboardingPages.count - 1 {
                    Button("Skip") { store.completeOnboarding() }
                        .font(.kisiselLabel)
                        .foregroundStyle(Color.textMuted)
                }
            }
            .padding(.horizontal, 28)
            .padding(.bottom, 28)
        }
        .background(Color.paper.ignoresSafeArea())
    }
}

private struct OnboardingPageView: View {
    let page: OnboardingPage

    var body: some View {
        VStack(spacing: 22) {
            Spacer()
            ZStack {
                Circle().fill(Color.accent.opacity(0.12)).frame(width: 132, height: 132)
                Image(systemName: page.icon)
                    .font(.system(size: 46, weight: .semibold))
                    .foregroundStyle(Color.accent)
            }
            VStack(spacing: 10) {
                Text(page.title)
                    .font(.kisiselH1)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(Color.ink)
                Text(page.body)
                    .font(.kisiselBody)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(Color.textMuted)
                    .padding(.horizontal, 36)
            }
            Spacer()
            Spacer()
        }
    }
}
