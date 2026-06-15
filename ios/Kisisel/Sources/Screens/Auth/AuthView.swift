import SwiftUI
import UIKit

// MARK: - Auth flow (UC-01 Register, UC-01 Verify, UC-02 Log in)

struct AuthFlowView: View {
    @EnvironmentObject private var store: AppStore
    @State private var mode: Mode = .login

    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var verificationCode = ""

    private enum Mode { case login, register }

    var body: some View {
        ScrollView {
            VStack(spacing: 26) {
                if let pendingEmail = store.pendingVerificationEmail {
                    verifyView(email: pendingEmail)
                } else {
                    loginOrRegisterView
                }
            }
            .padding(24)
        }
        .background(Color.paper.ignoresSafeArea())
        .scrollDismissesKeyboard(.interactively)
        .disabled(store.isLoading)
        .overlay {
            if store.isLoading {
                ProgressView()
                    .padding(20)
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 14))
            }
        }
    }

    // MARK: Login / Register

    private var loginOrRegisterView: some View {
        VStack(spacing: 26) {
            header

            modeSwitcher

            VStack(spacing: 14) {
                if mode == .register {
                    KTextField(label: "Full name", text: $name, icon: "person", contentType: .name)
                }
                KTextField(label: "Email", text: $email, icon: "envelope", keyboard: .emailAddress, contentType: .emailAddress)
                KTextField(label: "Password", text: $password, icon: "lock", isSecure: true,
                           contentType: mode == .login ? .password : .newPassword)
                if mode == .register {
                    KTextField(label: "Confirm password", text: $confirmPassword, icon: "lock.rotation",
                               isSecure: true, contentType: .newPassword)
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
    }

    // MARK: Verify email

    private func verifyView(email: String) -> some View {
        VStack(spacing: 26) {
            VStack(spacing: 6) {
                Text("Check your email")
                    .font(.kisiselDisplay)
                    .foregroundStyle(Color.ink)
                Text("We sent a verification code to **\(email)**. Enter it below to activate your account.")
                    .font(.kisiselBody)
                    .foregroundStyle(Color.textMuted)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding(.top, 12)

            KTextField(label: "Verification code", text: $verificationCode, icon: "key",
                       keyboard: .numberPad, contentType: nil)

            if let error = store.authError {
                Text(error)
                    .font(.kisiselLabel)
                    .foregroundStyle(Color.danger)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 4)
            }

            KBtn(title: "Verify & continue", kind: .primary) {
                store.verifyEmail(code: verificationCode)
            }

            Button("Use a different email") {
                store.pendingVerificationEmail = nil
                store.authError = nil
                withAnimation { mode = .register }
            }
            .font(.kisiselLabel)
            .foregroundStyle(Color.accent)
        }
    }

    // MARK: Helpers

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
            modeTab("Log in", isSelected: mode == .login) {
                withAnimation { mode = .login; store.authError = nil }
            }
            modeTab("Register", isSelected: mode == .register) {
                withAnimation { mode = .register; store.authError = nil }
            }
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

// MARK: - Reusable text field

struct KTextField: View {
    enum FieldContentType {
        case name, emailAddress, password, newPassword
    }

    let label: String
    @Binding var text: String
    var icon: String? = nil
    var isSecure: Bool = false
    var keyboard: UIKeyboardType = .default
    var contentType: FieldContentType? = nil

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
                        SecureField(label, text: $text)
                            .textContentType(swiftUIContentType)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                    } else {
                        TextField(label, text: $text)
                            .keyboardType(keyboard)
                            .textContentType(swiftUIContentType)
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

    private var swiftUIContentType: UITextContentType? {
        switch contentType {
        case .name:         return .name
        case .emailAddress: return .emailAddress
        case .password:     return .password
        case .newPassword:  return .newPassword
        case nil:           return nil
        }
    }
}
