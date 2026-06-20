# CLAUDE.md

Guidance for working in this repository.

## What this is

**Kişisel** is a personalized newspaper prototype (CENG318 course project). Users
compose their own front page from drag-and-drop widgets backed by live RSS feeds,
get AI summaries, and share newspapers via slugs. The repo is a small monorepo with
three independent apps plus academic material.

```
Kisisel_2/
├── backend/    Express + Prisma (SQLite) REST API   → http://localhost:4000
├── frontend/   Next.js 16 App Router + React 19      → http://localhost:3000
├── ios/        SwiftUI prototype (seeded data, standalone)
├── docs/       Use cases, design, proposal
├── papers/ survey/ personas.md   Academic / research artifacts
```

> The root `readme.md` refers to the API as `apps/api/` — that is outdated. The API
> actually lives in `backend/`.

## Running

Two terminals (backend first so the frontend has data):

```bash
# Terminal 1 — API
cd backend
npm install
npm run dev          # tsx watch, listens on :4000, runs RSS ingestion on startup

# Terminal 2 — web
cd frontend
npm install
npm run dev          # Next.js dev server on :3000
```

Backend env (`backend/.env`, not committed):

- `DATABASE_URL` — required by Prisma (SQLite), e.g. `file:./prisma/dev.db`
- `GROQ_API_KEY` — required for AI summaries (`/summaries/preview`)
- `GROQ_MODEL` — defaults to `llama3-8b-8192`
- `JWT_SECRET` — falls back to a dev default if unset
- `PORT` — defaults to `4000`

Frontend reads `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:4000`).

After editing `backend/prisma/schema.prisma`, run `npx prisma migrate dev` (or
`npx prisma db push`) and `npx prisma generate` from `backend/`.

## Backend architecture (`backend/`)

ESM TypeScript Express app. Entry `src/index.ts` mounts four routers and starts the
RSS cron.

- **Data layer** — Prisma over SQLite (`src/db.ts` exports a singleton `prisma`).
  Models in `prisma/schema.prisma`: `User`, `Newspaper`, `Widget`, `Publisher`,
  `Article`. `Widget` stores react-grid-layout geometry (`layoutX/Y/W/H/MinW/MinH`)
  so a saved dashboard round-trips exactly.
- **Auth** (`routes/auth.ts`) — bcrypt password hashing, JWT issued as an
  **httpOnly cookie** named `token`. Routes: `register`, `login`, `logout`, `me`.
  There is no auth middleware; routes that need a user call a local `getUserId(req)`
  that verifies the cookie (see `routes/newspapers.ts`).
- **RSS ingestion** (`services/rssIngestion.ts`) — `node-cron` every 30 min (and once
  on startup) parses each feed in `RSS_SOURCES`, cleans HTML, extracts/falls back an
  image, derives a deterministic id from `title + sourceId`, and upserts `Article`
  rows. **Articles are served from the DB; feeds are never fetched per-request.**
- **Articles** (`routes/articles.ts` + `services/rssService.ts`) — list sources, list
  by source, `popular` (recency score + cross-source headline-word overlap), `random`.
- **AI summaries** (`services/groqSummary.ts`) — calls the **Groq** chat API. A global
  serial queue spaces requests ~2s apart with 429 backoff to respect free-tier limits;
  the result is persisted to `Article.aiSummary`.

`RSS_SOURCES` (in `services/rssService.ts`) is the single source of truth for feeds;
add or change publishers there.

## Frontend architecture (`frontend/`)

Next.js App Router, React 19, Tailwind v4, TypeScript. Most pages are client
components (`"use client"`).

- **`app/page.tsx`** — the main dashboard/editor (~1100 lines): drag-and-drop layout
  via `react-grid-layout`, edit mode, theme/font selection, share flow.
- **`app/feed/`** — discovery feed of shared newspapers.
- **`app/newspaper/[slug]/`** — server component that fetches a shared newspaper, with
  fallback to the local prototype data in `lib/prototypeNewspapers.ts`.
- **`app/login/`, `app/profile/`** — auth and account screens.
- **`components/Widget.tsx`** — the central renderer; branches on `layoutType`
  (`card1`–`card6`, `editorial`, `discovery`) and `kind` (`news` / `editorial` /
  `popular` / `random`).
- **`lib/`** — the API client layer. `articlesApi` and `summaryApi` (REST calls),
  `prototypeState` (auth, `credentials: 'include'`), `prototypeDashboardState`
  (load/save/share dashboard), `prototypeNewspapers` (shared types + default and
  sample newspapers).
- **`hooks/useLiveSources.ts`** — fetches RSS sources and per-source articles.

## Frontend ↔ backend contract

The browser talks to the API over `fetch` with cookie auth (`credentials: 'include'`).
The dashboard is persisted as a flat list of widgets that each carry their layout
geometry; `prototypeDashboardState.ts` merges `widgets` + `layout` before POSTing and
splits them back on load. Sharing creates a `share-xxxxxx` slug.

Widget/newspaper shapes are mirrored in two places — keep them in sync when changing
either side:
- backend: `Widget` model in `prisma/schema.prisma`
- frontend: `FeedWidget` / `SharedNewspaper` in `lib/prototypeNewspapers.ts`

## Theming

`frontend/src/app/globals.css` defines CSS variables themed by a `data-theme`
attribute (`Light` / `Dark` / `Sepia`) plus Google Font variables wired in
`app/layout.tsx`. Prefer existing CSS variables (`--background`, `--surface`,
`--primary`, `--font-*`, …) over hardcoded colors — the recent history migrated away
from literal values.

## Conventions

- Backend is ESM: relative imports use explicit `.js` extensions (e.g.
  `import { prisma } from '../db.js'`) even though the source is `.ts`.
- No test suite or linter config beyond `eslint` in the frontend; verify changes by
  running both apps.
- `prisma/dev.db` is committed local state — don't delete it casually; it holds seeded
  articles.
