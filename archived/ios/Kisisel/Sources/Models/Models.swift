import Foundation

// MARK: - User
//
// Mirrors `prototypeState.ts` mock-user records (UC-01 register / UC-02 login).

struct KisiselUser: Identifiable, Codable, Equatable {
    var id: UUID = UUID()
    var name: String
    var email: String
    var passwordHash: String
}

// MARK: - Reading mode
//
// Mirrors the `S | H | F` reading-mode toggle in the navbar (UC-08).
// S = Scan (headline-only), H = Skim (summary-light), F = Full read (deep dive).

enum ReadingMode: String, CaseIterable, Codable {
    case scan = "S"
    case skim = "H"
    case full = "F"

    var label: String {
        switch self {
        case .scan: return "Scan"
        case .skim: return "Skim"
        case .full: return "Full read"
        }
    }
    var detail: String {
        switch self {
        case .scan: return "Headlines only — fastest pass"
        case .skim: return "Short summaries with metadata"
        case .full: return "One story at a time, in depth"
        }
    }
    var systemImage: String {
        switch self {
        case .scan: return "text.line.first.and.arrowtriangle.forward"
        case .skim: return "list.bullet.rectangle"
        case .full: return "doc.text.magnifyingglass"
        }
    }
}

// MARK: - Article
//
// Mirrors `LiveArticle` / `NewsArticle` shapes from `articlesApi.ts` & `mockData.ts`.

struct Article: Identifiable, Codable, Equatable, Hashable {
    var id: String
    var title: String
    var summary: String
    var fullContent: String
    var publisher: String
    var author: String
    var date: String
    var category: String
    var sourceUrl: String
    var imageUrl: String?
    /// e.g. "Trending" for popular picks, "Serendipity pick" for random discovery
    var summaryLabel: String?

    static func == (lhs: Article, rhs: Article) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

// MARK: - RSS Source
//
// Mirrors the live source list returned by `GET /articles/sources` (UC-07).

struct NewsSource: Identifiable, Codable, Equatable {
    var id: String
    var name: String
    var category: String
    var feedUrl: String
    var isCustom: Bool = false
}

// MARK: - Widget
//
// Mirrors `FeedWidget` / `WidgetKind` / `WidgetLayoutType` in `prototypeNewspapers.ts`.
// Layout slot determines how much space (and therefore how many articles) is shown —
// the iOS layer keeps it simpler with a `size` enum instead of a 12-col grid.

enum WidgetKind: String, Codable, CaseIterable {
    case news, editorial, popular, random

    var label: String {
        switch self {
        case .news: return "Source feed"
        case .editorial: return "Editorial note"
        case .popular: return "Popular picks"
        case .random: return "Random discovery"
        }
    }
    var systemImage: String {
        switch self {
        case .news: return "newspaper"
        case .editorial: return "quote.bubble"
        case .popular: return "flame"
        case .random: return "shuffle"
        }
    }
}

enum WidgetSize: String, Codable, CaseIterable {
    case compact, regular, large

    var rowSpan: CGFloat {
        switch self {
        case .compact: return 140
        case .regular: return 240
        case .large: return 360
        }
    }
    var label: String {
        switch self {
        case .compact: return "Compact"
        case .regular: return "Regular"
        case .large: return "Large"
        }
    }
}

struct FeedWidget: Identifiable, Codable, Equatable {
    var id: UUID = UUID()
    var title: String
    var kind: WidgetKind
    var sourceId: String?
    var categoryFilter: String?
    var size: WidgetSize = .regular
    var editorialBody: String?
    /// Display order within the layout — mirrors react-grid-layout's `y` ordering.
    var order: Int = 0
}

// MARK: - Shared / Public Newspaper
//
// Mirrors `SharedNewspaper` in `prototypeNewspapers.ts` (UC-13/14/15/16/17).

struct Newspaper: Identifiable, Codable, Equatable {
    var id: String              // public slug
    var name: String
    var curator: String
    var description: String
    var readingMode: ReadingMode
    var widgets: [FeedWidget]
    var isOwned: Bool = false
}

// MARK: - Follow relationship
//
// Mirrors `toggleFollowSlug` / `isFollowingSlug` in `prototypeState.ts` (UC-15).

struct FollowEntry: Identifiable, Codable, Equatable {
    var id: String { newspaperId }
    var newspaperId: String
    var followedAt: Date = Date()
}
