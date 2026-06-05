# Kisisel Use Case Implementation Status

## Purpose

This document checks the current prototype against the formal use cases in `docs/use-cases-and-requirements.md` and the related test cases in `docs/test-cases.md`.

Status labels:

- Done: prototype behavior is present and testable now
- Partial: the main UI flow exists, but persistence, validation, or backend behavior is still incomplete
- Missing: still needs implementation

## Summary Matrix

| Use Case | Status | Current State | Related Test Cases |
| --- | --- | --- | --- |
| UC-01 Register account | Partial | Mock registration works with duplicate email check and creates a test user in local storage. No backend auth yet. | TC-UC01-01, TC-UC01-02, TC-UC01-03 |
| UC-02 Log in | Partial | Mock login works with stored test users and current user switching. No secure session/backend auth yet. | TC-UC02-01, TC-UC02-02, TC-UC02-03 |
| UC-03 Create or open personal newspaper | Done | Dashboard loads for logged-in users and restores user-specific saved state. | TC-UC03-01, TC-UC03-02, TC-UC03-03 |
| UC-04 Add widget to layout | Done | News, editorial, popular, and random widgets can be added from page settings. | TC-UC04-01, TC-UC04-03 |
| UC-05 Move and resize widget | Done | Drag/resize works in edit mode and is blocked in view mode. | TC-UC05-01, TC-UC05-02, TC-UC05-03 |
| UC-06 Configure widget content | Done | Category filter per widget implemented and persisted. Selecting a category narrows articles shown in that widget. Editorial body editing works. | TC-UC06-01, TC-UC06-03 |
| UC-07 Manage sources | Partial | Sources tab in Page Settings shows all 5 live RSS feeds. Custom feed add/remove works in-session with URL validation (TC-UC07-02) and duplicate prevention (TC-UC07-03). No backend persistence yet. | TC-UC07-01, TC-UC07-02, TC-UC07-03 |
| UC-08 Switch reading mode | Done | Reading mode is global and now persists per user dashboard state. | TC-UC08-01, TC-UC08-03 |
| UC-09 Read article summary and open original source | Done | Source metadata, AI preview labeling, and source open buttons are implemented across cards. | TC-UC09-01, TC-UC09-03 |
| UC-10 Discover serendipitous content | Done | Popular and Random are now native widget types and appear in the default layout. | TC-UC10-01, TC-UC10-02 |
| UC-11 Create editorial note widget | Done | Editorial is now a native widget with title, body, rendering, and public placement. Empty body is now blocked on save (TC-UC11-02 fixed). | TC-UC11-01, TC-UC11-02, TC-UC11-03 |
| UC-12 Save layout and preferences | Done | Widgets, layout, and reading mode are persisted per mock user in local storage. | TC-UC12-01, TC-UC12-03 |
| UC-13 Publish newspaper | Partial | Prototype share URL and slug route exist, but there is no real user-owned publication lifecycle yet. | TC-UC13-01 |
| UC-14 View public newspaper | Done | `/newspaper/[slug]` is implemented as a read-only public route with curator context. `notFound()` handles invalid slugs (TC-UC14-02). | TC-UC14-01, TC-UC14-02, TC-UC14-03 |
| UC-15 Follow curator/newspaper | Done | Follow/unfollow works in local prototype state and is visible from Discover and public newspaper views. Unauthenticated follow redirects to login. | TC-UC15-01, TC-UC15-02, TC-UC15-03 |
| UC-16 Fork or reuse layout | Done | `Use this layout` imports a shared newspaper into the current user's dashboard and persists it. Unauthenticated fork now redirects to login (TC-UC16-02 fixed). | TC-UC16-01, TC-UC16-02 |
| UC-17 Browse discover feed | Done | Discover shows shared newspapers, supports opening them, and supports follow actions. | TC-UC17-01 |
| UC-18 Refresh news corpus and summaries | Partial | Live RSS pipeline implemented (`rssService.ts`, `/articles` route, 5 sources). `gemma3:4b` Ollama generates real AI summaries on demand. Widget fetches summaries lazily per article. Persistent DB store and batch ingestion still missing. | TC-UC18-01, TC-UC18-02, TC-UC18-03 |

## Detailed Check

### Authentication

- UC-01 is prototype-ready, not production-ready.
- UC-02 is prototype-ready, not production-ready.
- Evidence:
  - `frontend/src/app/login/page.tsx`
  - `frontend/src/lib/prototypeState.ts`

### Dashboard and Curation

- UC-03, UC-04, UC-05 are working in the current prototype.
- UC-06 is partially working because content behavior is still mostly mock-driven.
- Evidence:
  - `frontend/src/app/page.tsx`
  - `frontend/src/components/Widget.tsx`
  - `frontend/src/lib/prototypeDashboardState.ts`

### Reading and Source Trust

- UC-08 is implemented and persisted.
- UC-09 is implemented with visible AI preview labeling and source buttons.
- Evidence:
  - `frontend/src/components/Navbar.tsx`
  - `frontend/src/components/Widget.tsx`
  - `frontend/src/lib/mockData.ts`

### Serendipity and Editorial Agency

- UC-10 is implemented as first-class widget types.
- UC-11 is implemented as a first-class editorial widget.
- Evidence:
  - `frontend/src/app/page.tsx`
  - `frontend/src/components/Widget.tsx`

### Sharing, Public View, Following, and Forking

- UC-13 is only partial because sharing is still based on prototype static slugs.
- UC-14 is implemented.
- UC-15 is implemented in local prototype state.
- UC-16 is implemented in local prototype state.
- UC-17 is implemented.
- Evidence:
  - `frontend/src/app/newspaper/[slug]/page.tsx`
  - `frontend/src/components/SharedNewspaperView.tsx`
  - `frontend/src/app/feed/page.tsx`
  - `frontend/src/lib/prototypeNewspapers.ts`
  - `frontend/src/lib/prototypeState.ts`

### Backend and AI Pipeline

- UC-18 is still missing.
- There is no active API source layer yet for ingestion, summarization jobs, or persistent shared ownership.
- This is the main remaining gap between the prototype and the proposal architecture.

## Current Coverage Verdict

The frontend prototype now covers the main HCI-facing flows much better than the initial state.

### Strongly covered now

- Layout composition
- Reading mode switching
- Serendipity widgets
- Editorial authorship
- Source attribution and source navigation
- Public newspaper reading
- Follow and fork behavior
- User-specific prototype persistence

### Still only partial

- Registration/login as true backend auth
- Source management as real RSS/feed management
- Share/publish as user-owned persistent publication workflow

### Still missing

- Backend ingestion pipeline
- Local AI summarization service integration
- Database-backed persistence
- Real API contracts for auth, layouts, newspapers, and summaries

## Recommended Next Backend Step

The highest-value next implementation is UC-18 support through a minimal backend path:

1. Recreate `apps/api` source scaffold.
2. Add a local AI summary service abstraction.
3. Expose one summary endpoint for mock article text.
4. Then expand toward article, layout, and newspaper persistence APIs.
