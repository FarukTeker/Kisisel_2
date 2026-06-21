# Kişisel — Your Personal Newspaper

Kişisel is a personalized digital newspaper (CENG 318 — HCI, Group 12, İYTE).
Users compose their own front page from drag-and-drop widgets backed by **live RSS
feeds**, get **AI summaries** (Groq) and **bilingual TR/EN** content with optional
**text-to-speech narration**, and **share** their newspaper so others can discover,
follow and fork it.

The active code lives in **`codebase/`** — three apps over one API:

```
codebase/
├── backend/    NestJS + Prisma (SQLite)   REST API   → http://localhost:4000
├── frontend/   Next.js 16 + React 19      web app    → http://localhost:3000
└── mobile/     Expo SDK 56 + Expo Router   iOS/Android app
```

> `legacy/` holds older Express/Next prototypes and `archived/` an old SwiftUI app —
> ignore both for current work.

## Requirements

- Node.js 20+ and npm 10+
- (mobile) Expo Go on a device, or iOS Simulator / Android Emulator
- (mobile) Xcode 15+ for the iOS simulator

## 1) Backend — `codebase/backend`

```bash
cd codebase/backend
npm install
cp .env.example .env          # then fill in the keys (see table below)
npx prisma db push            # create / sync the SQLite schema (dev.db)
npx prisma generate
npm run start:dev             # API on :4000, runs RSS ingestion on startup
```

Environment (`codebase/backend/.env`, **not committed**):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite path, e.g. `file:./dev.db` |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Auth token signing |
| `PORT` | API port (default 4000) |
| `CORS_ORIGIN` | Web origin, e.g. `http://localhost:3000` |
| `GROQ_API_KEY`, `GROQ_MODEL` | AI summaries / translation (Groq) |
| `GOOGLE_TTS_API_KEY`, `GOOGLE_TTS_VOICE_TR/EN`, `GOOGLE_TTS_LANG_TR/EN` | Text-to-speech narration |

AI summaries, translation and narration **degrade gracefully** if their keys are
missing — the rest of the app still works.

### Seed the Discover page (mock curators)

So the Discover page isn't empty, seed a few real curator accounts with shared
newspapers (real API data — not hardcoded in the frontend). Safe to re-run:

```bash
cd codebase/backend
npx tsx prisma/seed.ts
```

Creates curators **Ece, Kerem, Alara, Berk, Deniz** (login password: `password123`),
each with a shared newspaper that appears under Discover.

## 2) Web — `codebase/frontend`

```bash
cd codebase/frontend
npm install
npm run dev                   # http://localhost:3000
```

Reads `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:4000`). Start the backend
first so the web app has data.

Features: drag-and-drop front-page editor (react-grid-layout), themes/fonts,
TR/EN language switch, AI summaries, "Listen" narration, sharing via slug, and a
Discover page for shared newspapers.

## 3) Mobile — `codebase/mobile`

```bash
cd codebase/mobile
npm install
npx expo start                # press i (iOS) / a (Android), or scan in Expo Go
```

The API URL is auto-derived from the Metro host so a device/emulator reaches the
backend on `:4000`. Override with `EXPO_PUBLIC_API_URL=http://<LAN-IP>:4000`.

Expo SDK 56 + Expo Router. Hybrid data: live API (auth, articles, AI summaries,
discover, dashboard save/share) + local storage (follow, fork, custom sources,
onboarding). See `codebase/mobile/README.md` for details.

## Run everything

Two terminals (backend first so the others have data):

```bash
# Terminal 1
cd codebase/backend && npm run start:dev      # :4000

# Terminal 2
cd codebase/frontend && npm run dev           # :3000
# (and/or)  cd codebase/mobile && npx expo start
```

## Architecture notes

- **Auth** is a JWT **Bearer token** (not cookies) — the same API serves web and mobile.
- **RSS ingestion** runs on a cron (~30 min) and on startup; articles are served from
  the DB, never fetched per request. Sources live in the ingestion service.
- After editing `codebase/backend/prisma/schema.prisma`, run
  `npx prisma db push && npx prisma generate`.
- `codebase/backend/prisma/dev.db` is local state — don't delete it casually.

## Team — Group 12 · İYTE

Sübhan Akbenli · Berkay Fehmi Tekin · Zübeyir Almaho · Yasin Sezgin · Ömer Faruk Teker
