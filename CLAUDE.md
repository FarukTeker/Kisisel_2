# CLAUDE.md

Guidance for working in this repository.

## What this is

**Kişisel** is a personalized newspaper prototype (CENG318 course project). Users
compose their own front page from drag-and-drop widgets backed by live RSS feeds,
get AI summaries and audio narration, follow other curators, and share newspapers
via slugs. The active code lives under `codebase/`; the repo root also holds
academic material.

```
Kisisel_2/
├── codebase/
│   ├── backend/    NestJS + Prisma (SQLite) REST API   → http://localhost:4000
│   ├── frontend/   Next.js (App Router) + React 19      → http://localhost:3000
│   └── mobile/     React Native / Expo app
├── docs/           Use cases, design, proposal
├── papers/ survey/ personas.md   Academic / research artifacts
├── archived/ legacy/   Older prototypes (not active)
```

> Historical note: an earlier version of this repo had an Express API in `backend/`
> at the root and a SwiftUI iOS app. Both are gone — the backend is now **NestJS**
> under `codebase/backend/`, and mobile is **Expo/React Native** under
> `codebase/mobile/`. The root `readme.md` may still reference the old layout.

Each app has its own `AGENTS.md` / `CLAUDE.md` with app-specific rules — read them
before working in that app (notably `codebase/frontend/AGENTS.md`: this Next.js
version has breaking changes vs. training data, so check `node_modules/next/dist/docs/`
before writing framework code).

## Running

Two terminals (backend first so the frontend has data):

```bash
# Terminal 1 — API
cd codebase/backend
npm install
npm run start:dev    # nest watch, listens on :4000, runs RSS ingestion on startup

# Terminal 2 — web
cd codebase/frontend
npm install
npm run dev          # Next.js dev server on :3000
```

Backend env (`codebase/backend/.env`, not committed — see `.env.example`):

- `DATABASE_URL` — required by Prisma (SQLite), e.g. `file:./dev.db`
- `JWT_SECRET` / `JWT_EXPIRES_IN` — auth signing (defaults to a dev value / `7d`)
- `PORT` — defaults to `4000`
- `CORS_ORIGIN` — allowed web origin, defaults to `http://localhost:3000`
- `GROQ_API_KEY` — required for AI summaries/translation (Groq chat API)
- `GROQ_MODEL` — defaults to `llama-3.1-8b-instant`
- `GOOGLE_TTS_API_KEY` — required for "Sesli Anlatım" TTS (`/articles/:id/audio?lang=`);
  narration degrades gracefully when empty
- `GOOGLE_TTS_VOICE_EN` / `GOOGLE_TTS_LANG_EN` — default `en-US-Standard-C` / `en-US`
- `GOOGLE_TTS_VOICE_TR` / `GOOGLE_TTS_LANG_TR` — default `tr-TR-Standard-A` / `tr-TR`

Frontend reads `NEXT_PUBLIC_API_URL` (see `codebase/frontend/lib/env.ts`; defaults to
`http://localhost:4000`).

After editing `codebase/backend/prisma/schema.prisma`, run `npx prisma migrate dev`
(or `npx prisma db push`) and `npx prisma generate` from `codebase/backend/`.

## Backend architecture (`codebase/backend/`)

NestJS (TypeScript). Entry `src/main.ts` enables CORS + a global `ValidationPipe`
(`whitelist: true, transform: true`) and boots `AppModule`. Feature modules:

- **Data layer** (`src/prisma/`) — `PrismaService` extends `PrismaClient` and is
  injected everywhere. The DB url is read from `ConfigService` (`DATABASE_URL`).
  Models in `prisma/schema.prisma`: `User`, `Follow`, `Newspaper`, `Widget`,
  `Publisher`, `Article`, `Edition`, `ArticleEdition`. `Widget` stores
  react-grid-layout geometry so a saved dashboard round-trips exactly.
- **Auth** (`src/auth/`) — bcrypt password hashing, JWT issued as a **Bearer token**
  (not a cookie). Routes under `/auth`: `register`, `login`, `me`, `forgot-password`,
  `reset-password`. Protected routes use `JwtAuthGuard` + the `@CurrentUser()`
  decorator. DTOs are class-validator classes in `dto/`.
- **Ingestion** (`src/ingestion/`) — a staged pipeline run on a **daily cron**
  (`@Cron('0 8 * * *')` in the edition timezone) and on startup. RSS sources live in
  `rss/rss-sources.service.ts`. The `PipelineRunner` runs ordered stages
  (`normalize` → `edition-tag` → AI `summary`/`headings`/`full` → `translate` →
  `persist`); AI enrichment is handled by an async `enrichment.worker`. Articles are
  served from the DB; feeds are never fetched per request.
- **Articles** (`src/articles/`) — list sources, list by source, `popular`, `random`,
  plus per-day **editions**. Audio narration is served by **TTS** (`src/tts/`):
  `narration.service` builds a script, `google-tts.service` synthesizes it, result is
  cached.
- **Newspapers** (`src/newspapers/`) — save/load a user's dashboard (widgets + layout)
  and share it under a slug.
- **Follows** (`src/follows/`) — follow/unfollow curators and read a following feed.
- **AI** (`src/ingestion/groq/`) — Groq chat API with rate-limit-aware queuing for the
  free tier.

Controllers mount at: `/auth`, `/articles`, `/newspapers`, `/follows`.

## Frontend architecture (`codebase/frontend/`)

Next.js App Router, React 19, Tailwind, TypeScript. Most pages are client components.

- **`app/page.tsx`** — the main dashboard/editor: drag-and-drop layout via
  `react-grid-layout`, edit mode, settings modal, share flow.
- **`app/discover/`** — discovery feed of shared newspapers.
- **`app/following/`** — newspapers from curators you follow.
- **`app/newspaper/[slug]/`** — a shared newspaper by slug.
- **`app/login/`** — auth screen.
- **`components/news/Widget.tsx`** — the central renderer; branches on `layoutType`
  (`card1`–`card6`, `editorial`, `discovery`) and `kind` (`news` / `editorial` /
  `popular` / `random`).
- **`components/news/GlobalAudioPlayer.tsx`** + **`features/audio/store.ts`** — a
  global, persistent narration player (zustand) with a play queue; mounted once in
  `app/providers.tsx`. `ListenButton` / `QueueButton` drive it from each article.
- **`features/`** — domain logic grouped by feature: `auth` (zustand store persisting
  the Bearer token to localStorage), `settings` (theme/font/language), `articles`,
  `dashboard`, `follow`, `audio`, `i18n`. Data fetching uses React Query
  (`@tanstack/react-query`) via `*/queries.ts` hooks.
- **`lib/api/client.ts`** — the fetch wrapper; attaches `Authorization: Bearer <token>`
  from the auth store. **`lib/env.ts`** — typed env access.
- **`features/i18n/`** — `dictionary.ts` holds `{ en, tr }` strings; `useT()` returns a
  `t(key)` bound to the selected language. **Add user-facing strings here, never
  hardcode them in components.**

## Frontend ↔ backend contract

The browser talks to the API over `fetch` with a **Bearer token** (from the persisted
auth store), not cookies. The dashboard is persisted as a flat list of widgets that
each carry their layout geometry; the dashboard feature merges `widgets` + `layout`
before POSTing and splits them back on load. Sharing creates a slug.

Widget/newspaper shapes are mirrored on both sides — keep them in sync when changing
either:
- backend: `Widget` model in `prisma/schema.prisma` + DTOs in `src/newspapers/dto/`
- frontend: types in `features/dashboard/` and `features/articles/schemas`

## Theming & i18n

`frontend/app/globals.css` defines CSS variables themed by a `data-theme` attribute
(`Light` / `Dark` / `Sepia`); Google Font variables (`--font-sans/-serif/-lora/
-outfit/-mono`) are wired in `app/layout.tsx`. Prefer existing CSS variables over
hardcoded colors. All user-facing copy goes through the i18n dictionary (en/tr).

## Conventions

- Backend follows standard NestJS module/controller/service/DTO structure; validate
  inputs with class-validator DTOs and the global `ValidationPipe`.
- Linting: `npm run lint` in each app. Backend tests use Jest (`npm test`); the
  frontend has no test suite — verify changes by running both apps.
- `codebase/backend/prisma/dev.db` is committed local state — don't delete it casually;
  it holds seeded articles/editions.
