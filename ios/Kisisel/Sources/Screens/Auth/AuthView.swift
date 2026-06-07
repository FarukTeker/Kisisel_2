import SwiftUI
import UIKit

// MARK: - Auth flow (UC-01 Register account, UC-02 Log in)
//
// Mirrors `frontend/src/app/login/page.tsx`: a single screen toggling between
// login and register forms, backed by mock validation in `AppStore`.

struct AuthFlowView: View {
    @EnvironmentObject private var store: AppStore
    @State private var mode: Mode = .login

    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""

    private enum Mode { case login, register }

    var body: some View {
        ScrollView {
            VStack(spacing: 26) {
                header

                modeSwitcher

                VStack(spacing: 14) {
                    if mode == .register {
                        KTextField(label: "Full name", text: $name, icon: "person")
                    }
                    KTextField(label: "Email", text: $email, icon: "envelope", keyboard: .emailAddress)
                    KTextField(label: "Password", text: $password, icon: "lock", isSecure: true)
                    if mode == .register {
                        KTextField(label: "Confirm password", text: $confirmPassword, icon: "lock.rotation", isSecure: true)
                    }
                }

                if let error = store.authError {
                    Text(error)
                        .font(.kisiselLabel)
                        .foregroundStyle(Color.danger)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 4)
                }

                KBtn(title: mode == .login ? "Log in" : "Create account", kind: .primary, action: submit)

                Button(mode == .login ? "Don't have an account? Register" : "Already have an account? Log in") {
                    withAnimation { toggleMode() }
                }
                .font(.kisiselLabel)
                .foregroundStyle(Color.accent)
            }
            .padding(24)
        }
        .background(Color.paper.ignoresSafeArea())
        .scrollDismissesKeyboard(.interactively)
    }

    private var header: some View {
        VStack(spacing: 6) {
            Text(mode == .login ? "Welcome back" : "Create your account")
                .font(.kisiselDisplay)
                .foregroundStyle(Color.ink)
            Text(mode == .login
                 ? "Log in to open your personal newspaper."
                 : "Register to start composing your own front page.")
                .font(.kisiselBody)
                .foregroundStyle(Color.textMuted)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 12)
    }

    private var modeSwitcher: some View {
        HStack(spacing: 0) {
            modeTab("Log in", isSelected: mode == .login) { withAnimation { mode = .login; store.authError = nil } }
            modeTab("Register", isSelected: mode == .register) { withAnimation { mode = .register; store.authError = nil } }
        }
        .padding(4)
        .background(Color.surfaceHover)
        .clipShape(Capsule())
    }

    private func modeTab(_ title: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.kisiselButton)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(isSelected ? Color.ink : Color.clear)
                .foregroundStyle(isSelected ? Color.surface : Color.textMuted)
                .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }

    private func toggleMode() {
        mode = (mode == .login) ? .register : .login
        store.authError = nil
    }

    private func submit() {
        switch mode {
        case .login:
            store.login(email: email, password: password)
        case .register:
            guard password == confirmPassword else {
                store.authError = "Passwords do not match."
                return
            }
            store.register(name: name, email: email, password: password)
        }
    }
}

// MARK: - Reusable text field (login/register/source-add forms)

struct KTextField: View {
    let label: String
    @Binding var text: String
    var icon: String? = nil
    var isSecure: Bool = false
    var keyboard: UIKeyboardType = .default

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.kisiselLabel)
                .foregroundStyle(Color.textMuted)
            HStack(spacing: 10) {
                if let icon {
                    Image(systemName: icon)
                        .foregroundStyle(Color.textSoft)
                        .frame(width: 18)
                }
                Group {
                    if isSecure {
                        SecureField("", text: $text)
                    } else {
                        TextField("", text: $text)
                            .keyboardType(keyboard)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                    }
                }
                .font(.kisiselBody)
                .foregroundStyle(Color.ink)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(Color.surface)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(Color.hairline, lineWidth: 1.2))
        }
    }
}
