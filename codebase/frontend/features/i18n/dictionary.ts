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
  "login.signIn": { en: "Sign in", tr: "Giriş yap" },
  "login.register": { en: "Create account", tr: "Hesap oluştur" },
  "login.email": { en: "Email", tr: "E-posta" },
  "login.password": { en: "Password", tr: "Parola" },
  "login.name": { en: "Name", tr: "Ad" },
} as const;

export type TranslationKey = keyof typeof DICTIONARY;

export function translate(key: TranslationKey, language: Language): string {
  return DICTIONARY[key][language];
}
