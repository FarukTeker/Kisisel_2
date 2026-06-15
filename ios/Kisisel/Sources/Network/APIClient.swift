import Foundation

// MARK: - Response DTOs

struct RegisterResponse: Decodable {
    let message: String
    let email: String
    let devCode: String?
}

struct UserDTO: Decodable {
    let id: String
    let name: String
    let email: String
    let isVerified: Bool
    let defaultReadingMode: String
}

struct AuthResponse: Decodable {
    let user: UserDTO
    let token: String
}

struct SourceDTO: Decodable {
    let id: String
    let name: String
    let rssUrl: String
    let category: String
    let isActive: Bool
}

struct ArticleSummaryDTO: Decodable {
    let summaryText: String?
}

struct ArticleSourceDTO: Decodable {
    let id: String
    let name: String
    let rssUrl: String
    let category: String
}

struct ArticleDTO: Decodable {
    let id: String
    let title: String
    let canonicalUrl: String
    let rawDescription: String?
    let author: String?
    let publishedAt: String?
    let category: String?
    let source: ArticleSourceDTO?
    let summary: ArticleSummaryDTO?
}

struct NewspaperListDTO: Decodable {
    let id: String
    let slug: String
    let title: String
    let description: String?
    let readingMode: String?
    let subscriberCount: Int?
}

// MARK: - Error

enum APIError: Error, LocalizedError {
    case unauthorized
    case server(String)
    case decoding(Error)
    case network(Error)

    var errorDescription: String? {
        switch self {
        case .unauthorized:       return "Session expired. Please log in again."
        case .server(let msg):    return msg
        case .decoding(let err):  return "Response error: \(err.localizedDescription)"
        case .network(let err):   return "Network error: \(err.localizedDescription)"
        }
    }
}

// message can be String or [String] depending on NestJS error shape
private struct ErrorBody: Decodable {
    let message: String

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        if let s = try? c.decode(String.self, forKey: .message) {
            message = s
        } else if let arr = try? c.decode([String].self, forKey: .message) {
            message = arr.joined(separator: ". ")
        } else {
            message = "Unknown server error"
        }
    }

    private enum CodingKeys: String, CodingKey { case message }
}

// MARK: - Client

final class APIClient {
    static let shared = APIClient()

    var baseURL = "http://localhost:3000"

    private let tokenKey = "kisisel.api.token"

    var token: String? {
        get { UserDefaults.standard.string(forKey: tokenKey) }
        set {
            if let v = newValue { UserDefaults.standard.set(v, forKey: tokenKey) }
            else { UserDefaults.standard.removeObject(forKey: tokenKey) }
        }
    }

    // MARK: Generic

    func get<T: Decodable>(_ path: String, auth: Bool = false) async throws -> T {
        try await fetch(path, method: "GET", body: nil, auth: auth)
    }

    func post<T: Decodable>(_ path: String, body: [String: Any]? = nil, auth: Bool = false) async throws -> T {
        try await fetch(path, method: "POST", body: body, auth: auth)
    }

    func postVoid(_ path: String, auth: Bool = false) async {
        guard let url = URL(string: baseURL + path) else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if auth, let token { req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
        _ = try? await URLSession.shared.data(for: req)
    }

    private func fetch<T: Decodable>(_ path: String, method: String, body: [String: Any]?, auth: Bool) async throws -> T {
        guard let url = URL(string: baseURL + path) else {
            throw APIError.server("Invalid URL: \(path)")
        }

        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if auth, let token { req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
        if let body { req.httpBody = try? JSONSerialization.data(withJSONObject: body) }

        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await URLSession.shared.data(for: req)
        } catch {
            throw APIError.network(error)
        }

        let status = (response as? HTTPURLResponse)?.statusCode ?? 0

        if status == 401 { throw APIError.unauthorized }

        guard (200..<300).contains(status) else {
            let msg = (try? JSONDecoder().decode(ErrorBody.self, from: data))?.message ?? "Server error \(status)"
            throw APIError.server(msg)
        }

        do {
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            throw APIError.decoding(error)
        }
    }

    // MARK: Auth

    func register(name: String, email: String, password: String) async throws -> RegisterResponse {
        try await post("/auth/register", body: ["name": name, "email": email, "password": password])
    }

    func verifyEmail(email: String, code: String) async throws -> AuthResponse {
        try await post("/auth/verify-email", body: ["email": email, "code": code])
    }

    func login(email: String, password: String) async throws -> AuthResponse {
        try await post("/auth/login", body: ["email": email, "password": password])
    }

    func me() async throws -> UserDTO {
        try await get("/auth/me", auth: true)
    }

    // MARK: Sources

    func getSources() async throws -> [SourceDTO] {
        try await get("/sources", auth: true)
    }

    func createSource(name: String, rssUrl: String, category: String) async throws -> SourceDTO {
        try await post("/sources", body: ["name": name, "rssUrl": rssUrl, "category": category], auth: true)
    }

    // MARK: Articles

    func ingestArticles() async {
        await postVoid("/articles/ingest", auth: true)
    }

    func getPopularArticles(limit: Int = 8) async throws -> [ArticleDTO] {
        try await get("/articles/popular?limit=\(limit)")
    }

    func getRandomArticles(limit: Int = 6) async throws -> [ArticleDTO] {
        try await get("/articles/random?limit=\(limit)")
    }

    func getArticlesBySource(_ sourceId: String, limit: Int = 15) async throws -> [ArticleDTO] {
        try await get("/articles/by-source/\(sourceId)?limit=\(limit)")
    }

    // MARK: Newspapers

    func getNewspapers() async throws -> [NewspaperListDTO] {
        try await get("/newspapers")
    }
}

// MARK: - Model conversions

extension Article {
    init(from dto: ArticleDTO, label: String? = nil) {
        let dateStr: String
        if let raw = dto.publishedAt {
            let iso = ISO8601DateFormatter()
            iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let d = iso.date(from: raw) {
                let fmt = DateFormatter()
                fmt.dateFormat = "MMM d, HH:mm"
                dateStr = fmt.string(from: d)
            } else {
                dateStr = String(raw.prefix(10))
            }
        } else {
            dateStr = ""
        }

        self.init(
            id: dto.id,
            title: dto.title,
            summary: dto.summary?.summaryText ?? String((dto.rawDescription ?? "").prefix(160)),
            fullContent: dto.rawDescription ?? dto.title,
            publisher: dto.source?.name ?? "",
            author: dto.author ?? "",
            date: dateStr,
            category: dto.category ?? dto.source?.category ?? "",
            sourceUrl: dto.canonicalUrl,
            imageUrl: nil,
            summaryLabel: label
        )
    }
}

extension NewsSource {
    init(from dto: SourceDTO) {
        self.init(
            id: dto.id,
            name: dto.name,
            category: dto.category,
            feedUrl: dto.rssUrl,
            isCustom: false
        )
    }
}

extension ReadingMode {
    init(apiValue: String) {
        switch apiValue {
        case "headline": self = .scan
        case "full":     self = .full
        default:         self = .skim
        }
    }
}
