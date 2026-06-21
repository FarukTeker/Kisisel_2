import type { Language } from "@/features/settings/store";

/**
 * UI string table. Add a key here, then use it via `useT()` / `t(key)`.
 * Content (article text) is translated server-side; this covers app chrome.
 */
export const DICTIONARY = {
  // Navbar
  "nav.discover": { en: "Discover", tr: "Keşfet" },
  "nav.share": { en: "Share", tr: "Paylaş" },
  "nav.edit": { en: "Edit", tr: "Düzenle" },
  "nav.settings": { en: "Settings", tr: "Ayarlar" },
  "nav.logout": { en: "Log out", tr: "Çıkış yap" },

  // Reading modes
  "mode.S": { en: "Summary", tr: "Özet" },
  "mode.H": { en: "Headline", tr: "Başlıklar" },
  "mode.F": { en: "Focused", tr: "Detaylı" },

  // Settings modal
  "settings.page": { en: "Page settings", tr: "Sayfa ayarları" },
  "settings.tab.design": { en: "Design", tr: "Tasarım" },
  "settings.tab.layout": { en: "Layout", tr: "Düzen" },
  "settings.tab.widgets": { en: "Widgets", tr: "Bileşenler" },
  "settings.tab.share": { en: "Share", tr: "Paylaş" },
  "settings.theme": { en: "Theme", tr: "Tema" },
  "settings.font": { en: "Font", tr: "Yazı tipi" },
  "settings.language": { en: "Language", tr: "Dil" },
  "settings.columns": { en: "Column count", tr: "Sütun sayısı" },
  "settings.columnsHint": {
    en: "Changes how many columns the dashboard grid uses.",
    tr: "Panodaki sütun sayısını değiştirir.",
  },
  "settings.shareHint": {
    en: "Generate a public link to share a snapshot of your current newspaper.",
    tr: "Mevcut gazetenizin bir anlık görüntüsünü paylaşmak için herkese açık bir bağlantı oluşturun.",
  },
  "settings.shareButton": {
    en: "Generate link & copy",
    tr: "Bağlantı oluştur & kopyala",
  },

  // Audio / narration
  "audio.listen": { en: "Listen", tr: "Dinle" },
  "audio.loading": { en: "Preparing…", tr: "Hazırlanıyor…" },
  "audio.stop": { en: "Stop", tr: "Durdur" },
  "audio.error": { en: "Audio failed", tr: "Ses hatası" },

  // Discover
  "discover.title": { en: "Discover", tr: "Keşfet" },
  "discover.subtitle": {
    en: "Newspapers shared by the community.",
    tr: "Topluluk tarafından paylaşılan gazeteler.",
  },
  "discover.empty": {
    en: "No shared newspapers yet.",
    tr: "Henüz paylaşılan gazete yok.",
  },

  // Login
  "login.loginTitle": { en: "Login", tr: "Giriş" },
  "login.registerTitle": { en: "Register", tr: "Kayıt" },
  "login.welcomeBack": { en: "Welcome back", tr: "Tekrar hoş geldin" },
  "login.newCurator": { en: "New curator setup", tr: "Yeni küratör kaydı" },
  "login.intro": {
    en: "Build a calmer reading flow, publish your own newspaper, and add editorial context to every story.",
    tr: "Daha sakin bir okuma akışı kur, kendi gazeteni yayınla ve her habere editöryel bağlam ekle.",
  },
  "login.email": { en: "email", tr: "e-posta" },
  "login.password": { en: "password", tr: "parola" },
  "login.repeat": { en: "repeat", tr: "tekrar" },
  "login.repeatPlaceholder": { en: "repeat password", tr: "parolayı tekrar gir" },
  "login.name": { en: "name", tr: "ad" },
  "login.namePlaceholder": { en: "username", tr: "kullanıcı adı" },
  "login.submitLogin": { en: "Login", tr: "Giriş yap" },
  "login.submitRegister": { en: "Register", tr: "Kayıt ol" },
  "login.wait": { en: "Please wait…", tr: "Lütfen bekle…" },
  "login.toRegister": { en: "New user?", tr: "Yeni kullanıcı?" },
  "login.toLogin": { en: "Already a user? Login", tr: "Hesabın var mı? Giriş yap" },
  "login.genericError": {
    en: "Something went wrong. Try again.",
    tr: "Bir şeyler ters gitti. Tekrar dene.",
  },
  "login.forgot": { en: "Forgot password?", tr: "Parolanı mı unuttun?" },
  "login.forgotTitle": { en: "Reset", tr: "Sıfırla" },
  "login.forgotIntro": {
    en: "Enter your email. If it matches an account, you can set a new password.",
    tr: "E-postanı gir. Bir hesapla eşleşiyorsa yeni bir parola belirleyebilirsin.",
  },
  "login.continue": { en: "Continue", tr: "Devam et" },
  "login.newPassword": { en: "new password", tr: "yeni parola" },
  "login.resetSubmit": { en: "Set new password", tr: "Yeni parolayı kaydet" },
  "login.backToLogin": { en: "Back to login", tr: "Girişe dön" },
  "login.emailNotFound": {
    en: "No account found for that email.",
    tr: "Bu e-postayla bir hesap bulunamadı.",
  },

  // General Action buttons / States
  "action.open": { en: "Open ↗", tr: "Aç ↗" },
  "action.back": { en: "← Back", tr: "← Geri" },
  "action.myNewspaper": { en: "My newspaper", tr: "Gazetem" },
  "action.loading": { en: "Loading…", tr: "Yükleniyor…" },
  "action.newspaperNotFound": { en: "Newspaper not found.", tr: "Gazete bulunamadı." },
  "action.by": { en: "by", tr: "yazan" },
  "action.done": { en: "Done", tr: "Tamam" },

  // Follow actions
  "follow.following": { en: "✓ Following", tr: "✓ Takip Ediliyor" },
  "follow.follow": { en: "Follow", tr: "Takip Et" },
  "follow.title": { en: "Following", tr: "Takip Edilenler" },
  "follow.dailyNewspapers": { en: "Your daily newspapers", tr: "Günlük gazeteleriniz" },
  "follow.emptyTitle": { en: "No newspapers yet", tr: "Henüz gazete yok" },
  "follow.emptySubtitle": {
    en: "Follow curators in Discover to build your daily list.",
    tr: "Günlük listenizi oluşturmak için Keşfet sayfasındaki küratörleri takip edin.",
  },
  "follow.goDiscover": { en: "Go to Discover", tr: "Keşfet'e Git" },

  // Navigation additions
  "nav.following": { en: "Following", tr: "Takip Edilenler" },

  // Widget templates and properties
  "widget.template": { en: "Template", tr: "Şablon" },
  "widget.source": { en: "Source", tr: "Kaynak" },
  "widget.mode": { en: "Mode", tr: "Mod" },
  "widget.title": { en: "Title", tr: "Başlık" },
  "widget.titleOptional": { en: "Title (optional)", tr: "Başlık (isteğe bağlı)" },
  "widget.titlePlaceholder": { en: "Widget title", tr: "Bileşen başlığı" },
  "widget.add": { en: "Add widget", tr: "Bileşen ekle" },
  "widget.delete": { en: "Delete widget", tr: "Bileşeni sil" },
  "widget.editorialNote": { en: "Editorial note", tr: "Editör notu" },
  "widget.editorialPlaceholder": { en: "Write your curator commentary…", tr: "Küratör yorumunuzu yazın…" },
  "widget.categoryFilter": { en: "Category filter", tr: "Kategori filtresi" },
  "widget.popularHint": { en: "Shows trending stories scored across all sources.", tr: "Tüm kaynaklardaki popüler haberleri gösterir." },
  "widget.randomHint": { en: "Surfaces unexpected stories sampled outside your usual feed.", tr: "Alışılmış akışınızın dışından beklenmedik haberler sunar." },
  "widget.label": { en: "Widget", tr: "Bileşen" },
  
  // Widget default names
  "widget.default.editorial": { en: "Editorial Note", tr: "Editör Notu" },
  "widget.default.popular": { en: "Popular Picks", tr: "Popüler Seçimler" },
  "widget.default.random": { en: "Serendipity", tr: "Rastgele Keşif" },
  "widget.widgetsCount": { en: "widgets", tr: "bileşen" },
  "widget.newsTag": { en: "News", tr: "Haber" },

  // Widget templates labels & descriptions
  "template.card1.label": { en: "Feature", tr: "Öne Çıkan" },
  "template.card1.desc": { en: "Large story with image and long body.", tr: "Görselli ve uzun metinli büyük haber." },
  "template.card2.label": { en: "Wide Brief", tr: "Geniş Özet" },
  "template.card2.desc": { en: "Horizontal image and short summary.", tr: "Yatay görsel ve kısa özet." },
  "template.card3.label": { en: "Compact", tr: "Kompakt" },
  "template.card3.desc": { en: "Small image with concise body text.", tr: "Küçük görsel ve kısa metin." },
  "template.card4.label": { en: "Text Column", tr: "Metin Sütunu" },
  "template.card4.desc": { en: "Text-first column for reading.", tr: "Okuma odaklı metin sütunu." },
  "template.card5.label": { en: "Visual Story", tr: "Görsel Haber" },
  "template.card5.desc": { en: "Title, large image, and body.", tr: "Başlık, büyük görsel ve metin." },
  "template.card6.label": { en: "Gallery", tr: "Galeri" },
  "template.card6.desc": { en: "Wide feature with image strip.", tr: "Görsel şeritli geniş öne çıkan." },
  "template.editorial.label": { en: "Editorial", tr: "Editör Yazısı" },
  "template.editorial.desc": { en: "Curator commentary block.", tr: "Küratör yorum alanı." },
  "template.discovery.label": { en: "Discovery", tr: "Keşif" },
  "template.discovery.desc": { en: "Popular or random high-signal stories.", tr: "Popüler veya rastgele yüksek etkileşimli haberler." },

  // Discover page items
  "discover.newspapersCount": { en: "newspapers", tr: "gazete" },
  "discover.emptyState": { en: "No shared newspapers yet. Share yours from the dashboard to see it here.", tr: "Henüz paylaşılan gazete yok. Burada görmek için panodan sizinkini paylaşın." },
  "discover.instructions": { en: "Drag background to explore · Grab cards to rearrange", tr: "Keşfetmek için arka planı sürükleyin · Yeniden düzenlemek için kartları tutun" },

  // Shared card items
  "card.shared": { en: "Shared", tr: "Paylaşıldı" },

  // Categories
  "category.All": { en: "All", tr: "Hepsi" },
  "category.Technology": { en: "Technology", tr: "Teknoloji" },
  "category.Science": { en: "Science", tr: "Bilim" },
  "category.Food": { en: "Food", tr: "Yemek" },
  "category.Finance": { en: "Finance", tr: "Finans" },
  "category.Culture": { en: "Culture", tr: "Kültür" },
} as const;

export type TranslationKey = keyof typeof DICTIONARY;

export function translate(key: TranslationKey, language: Language): string {
  return DICTIONARY[key][language];
}
