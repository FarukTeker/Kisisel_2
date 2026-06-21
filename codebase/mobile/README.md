# Kişisel — Mobil (Expo)

Kişisel'in iOS + Android uygulaması. Arşivlenen SwiftUI prototipinin (`archived/ios`)
**tüm özellikleri ve "paper" görsel tarzı** buraya taşındı; veri **hibrit**:

- **Canlı API** (`../backend`, :4000, Bearer token): auth, haberler, AI özet, keşfet,
  paylaşılan gazete, dashboard kaydet/paylaş.
- **Yerel (AsyncStorage)**: takip (follow), fork, özel kaynaklar, onboarding durumu.

## Özellikler

- Akış: splash → 4 sayfa onboarding → login/register (tek ekran toggle) → sekmeler.
- **Newspaper** (editör): okuma modları (Scan/Skim/Full), widget ekle/taşı/boyutlandır/
  sil/yapılandır, editorial not, paylaş (public link). Değişiklikler backend'e (debounce) kaydedilir.
- **4 widget türü**: news (scan/skim/full), editorial (inline editör), popular & random
  (discovery). AI özet rozeti (preview/live), kaynak linki dışa açma, sayfalama.
- **Discover**: arama + All/Following filtresi, curator kartları; gazete aç → read-only
  görünüm + Follow + Fork.
- **Settings**: hesap, varsayılan okuma modu, özel kaynak ekle/sil, çıkış.

## Çalıştırma

```bash
cd ../backend && npm install && npm run start:dev   # API :4000 (önce)
npm install && npx expo start                        # Expo Go / i / a
```

API adresi `src/lib/env.ts` ile otomatik çözülür (Metro dev-host IP'si →
`http://<IP>:4000`). Elle override: `EXPO_PUBLIC_API_URL=http://192.168.1.20:4000 npx expo start`.

## Yapı

```
src/
├── app/                      Expo Router
│   ├── _layout.tsx           splash→onboarding→auth→tabs gate (Stack.Protected)
│   ├── (onboarding)/         4 sayfa tanıtım
│   ├── (auth)/login.tsx      login/register toggle
│   ├── (tabs)/               index=Newspaper editör, discover, settings
│   ├── add-widget / widget-settings / share / add-source   (modal)
│   └── newspaper/[slug]      public gazete + Follow/Fork (modal)
├── features/
│   ├── auth/store.ts         token (secure-store) + useAuth()
│   └── store/                zustand appStore + types + widget-map (backend ↔ model)
├── components/
│   ├── WidgetCard.tsx        4 tür, okuma modu, edit kontrolleri, AI pill
│   ├── DiscoverCard.tsx
│   └── ui/                   K* primitifler (KButton/KCard/KText/pills/Segmented/...)
├── theme/tokens.ts           paper paleti + tip ölçeği + kategori renkleri
└── lib/                      api client (Bearer+zod) + uçlar + tipler
```

Tasarım `archived/ios/.../Design/DesignSystem.swift`'ten port edildi (tek "paper" açık tema).

## Sınırlar
- Özel kaynaklar yerel; backend RSS sabit olduğundan özel-kaynak haber widget'ı canlı
  içerik yerine bilgilendirici durum gösterir.
- Gerçek parmakla sürükle-bırak yerine kart üzeri kontroller (yukarı/aşağı + boyut).
- Dark mode kapsam dışı (arşivle aynı, tek açık tema).
