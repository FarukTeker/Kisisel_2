import SwiftUI

// MARK: - Design Tokens
//
// Mirrors the web prototype's light "paper" theme defined in
// `frontend/src/app/globals.css` (:root custom properties).

extension Color {
    init(hex: String) {
        let h = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: h).scanHexInt64(&int)
        let r = Double((int >> 16) & 0xFF) / 255
        let g = Double((int >> 8) & 0xFF) / 255
        let b = Double(int & 0xFF) / 255
        self.init(red: r, green: g, blue: b)
    }

    // Backgrounds — `--background`, `--surface`, `--surface-hover`
    static let paper        = Color(hex: "F3EEE6")
    static let surface      = Color(hex: "FFFDFA")
    static let surfaceHover = Color(hex: "F8F3EB")

    // Text — `--foreground`, `--text-muted`, `--text-soft`
    static let ink          = Color(hex: "171717")
    static let textMuted    = Color(hex: "6A665F")
    static let textSoft     = Color(hex: "8B8478")

    // Brand & accent — `--primary`, `--primary-hover`
    static let accent       = Color(hex: "2647D6")
    static let accentPress  = Color(hex: "1D37A4")

    // Borders / hairlines — `--border`, `--paper-line`
    static let hairline     = Color(hex: "D7CCBD")
    static let paperLine    = Color.ink.opacity(0.08)

    // Semantic
    static let success = Color(hex: "059669")
    static let warning = Color(hex: "D97706")
    static let danger  = Color(hex: "EF4444")
    static let info    = Color(hex: "2563EB")

    // Category pill palette — mirrors `CATEGORY_COLORS` in Widget.tsx
    static func categoryBg(_ category: String) -> Color {
        switch category {
        case "Technology": return Color(hex: "DBEAFE")
        case "Science":    return Color(hex: "D1FAE5")
        case "Finance":    return Color(hex: "FEF3C7")
        case "Food":       return Color(hex: "FCE7F3")
        case "Culture":    return Color(hex: "EDE9FE")
        default:           return Color(hex: "F3F4F6")
        }
    }

    static func categoryFg(_ category: String) -> Color {
        switch category {
        case "Technology": return Color(hex: "1D4ED8")
        case "Science":    return Color(hex: "065F46")
        case "Finance":    return Color(hex: "92400E")
        case "Food":       return Color(hex: "9D174D")
        case "Culture":    return Color(hex: "5B21B6")
        default:           return Color(hex: "374151")
        }
    }
}

// MARK: - Typography
//
// Mirrors the weight/scale rhythm of the web app's headings (font-weight 800/900,
// tight letter-spacing) using the system rounded/default fonts.

extension Font {
    static let kisiselDisplay = Font.system(size: 34, weight: .heavy, design: .rounded)
    static let kisiselH1      = Font.system(size: 22, weight: .heavy)
    static let kisiselH2      = Font.system(size: 18, weight: .bold)
    static let kisiselH3      = Font.system(size: 15, weight: .bold)
    static let kisiselBody    = Font.system(size: 14, weight: .regular)
    static let kisiselLabel   = Font.system(size: 12, weight: .semibold)
    static let kisiselCaption = Font.system(size: 11, weight: .medium)
    static let kisiselButton  = Font.system(size: 14, weight: .bold)
    static let kisiselPill    = Font.system(size: 10, weight: .heavy)
}

// MARK: - Primitive Components

/// Pill-shaped action button — mirrors `.btn-primary` / outline buttons in the web app.
struct KBtn: View {
    enum Kind { case primary, secondary, outline, ghost, destructive }
    let title: String
    var systemImage: String? = nil
    var kind: Kind = .primary
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                if let systemImage {
                    Image(systemName: systemImage)
                }
                Text(title)
            }
            .font(.kisiselButton)
            .frame(maxWidth: kind == .ghost ? nil : .infinity)
            .padding(.vertical, 12)
            .padding(.horizontal, kind == .ghost ? 4 : 16)
            .background(background)
            .foregroundStyle(foreground)
            .clipShape(Capsule())
            .overlay(Capsule().stroke(borderColor, lineWidth: borderWidth))
        }
        .buttonStyle(.plain)
    }

    private var background: Color {
        switch kind {
        case .primary:     return .ink
        case .secondary:   return .surface
        case .outline:     return .clear
        case .ghost:       return .clear
        case .destructive: return .surface
        }
    }
    private var foreground: Color {
        switch kind {
        case .primary:     return .surface
        case .secondary:   return .ink
        case .outline:     return .ink
        case .ghost:       return .accent
        case .destructive: return .danger
        }
    }
    private var borderColor: Color {
        switch kind {
        case .outline, .secondary: return .ink
        case .destructive:         return .danger
        default:                   return .clear
        }
    }
    private var borderWidth: CGFloat {
        switch kind {
        case .outline, .secondary, .destructive: return 1.5
        default: return 0
        }
    }
}

/// Small uppercase label pill — mirrors `renderCategoryPill` in Widget.tsx.
struct KCategoryPill: View {
    let category: String

    var body: some View {
        Text(category.uppercased())
            .font(.kisiselPill)
            .tracking(0.4)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(Color.categoryBg(category))
            .foregroundStyle(Color.categoryFg(category))
            .clipShape(Capsule())
    }
}

/// Status pill for AI-summary state — mirrors `renderAiStatusPill` in Widget.tsx.
struct KAiStatusPill: View {
    enum State { case loading, live, preview(String) }
    let state: State

    var body: some View {
        HStack(spacing: 5) {
            Circle().fill(dotColor).frame(width: 6, height: 6)
            Text(label).font(.kisiselCaption).fontWeight(.bold)
        }
        .padding(.horizontal, 9)
        .padding(.vertical, 5)
        .background(bg)
        .foregroundStyle(fg)
        .clipShape(Capsule())
        .overlay(Capsule().stroke(border, lineWidth: 1))
    }

    private var label: String {
        switch state {
        case .loading: return "Generating…"
        case .live: return "AI summary"
        case .preview(let l): return l
        }
    }
    private var dotColor: Color {
        switch state {
        case .loading: return Color(hex: "D1D5DB")
        case .live: return .success
        case .preview: return .info
        }
    }
    private var bg: Color {
        switch state {
        case .loading: return Color(hex: "F9FAFB")
        case .live: return Color(hex: "F0FDF4")
        case .preview: return Color(hex: "EFF6FF")
        }
    }
    private var fg: Color {
        switch state {
        case .loading: return Color(hex: "9CA3AF")
        case .live: return Color(hex: "15803D")
        case .preview: return Color(hex: "2563EB")
        }
    }
    private var border: Color {
        switch state {
        case .loading: return Color(hex: "E5E7EB")
        case .live: return Color(hex: "BBF7D0")
        case .preview: return Color(hex: "BFDBFE")
        }
    }
}

/// Card surface modifier — mirrors `.card` in globals.css (surface bg, hairline border, soft shadow).
struct KCardBackground: ViewModifier {
    var selected: Bool = false
    var editing: Bool = false

    func body(content: Content) -> some View {
        content
            .background(Color.surface)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(selected ? Color.accent : (editing ? Color.accent.opacity(0.55) : Color.ink.opacity(0.12)),
                            style: StrokeStyle(lineWidth: selected ? 2.5 : (editing ? 2 : 1.2), dash: editing && !selected ? [5, 4] : []))
            )
            .shadow(color: Color.ink.opacity(selected ? 0.12 : 0.06), radius: selected ? 10 : 6, x: 0, y: 3)
    }
}

extension View {
    func kCard(selected: Bool = false, editing: Bool = false) -> some View {
        modifier(KCardBackground(selected: selected, editing: editing))
    }
}

/// Section eyebrow label — mirrors the uppercase tracked subtitle pattern (`subLabel`) used across widgets.
struct KEyebrow: View {
    let text: String
    var color: Color = .accent

    var body: some View {
        Text(text.uppercased())
            .font(.kisiselCaption)
            .fontWeight(.heavy)
            .tracking(1.1)
            .foregroundStyle(color)
    }
}
