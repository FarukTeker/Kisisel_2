# Kisisel Use Cases and Requirements

## Purpose

This document turns four project inputs into a single end-to-end product definition:

- Proposal: `docs/proposal/main.tex`, `CENG318_G12_Project_Proposal.pdf`
- Paper prototype: `docs/design/G12_PaperPrototypes.pdf`
- Wireframes: `docs/design/G12_Wireframes.pdf`, `docs/design/wireframes/*`
- Interactive frontend prototype: `frontend/src/app/page.tsx`, `frontend/src/app/feed/page.tsx`, `frontend/src/app/login/page.tsx`

Its goal is to define a comprehensive use case set, clarify scope, and list the functional/non-functional requirements needed to evolve the current frontend prototype into a complete HCI project.

## Product Understanding

Kisisel is a desktop-first news aggregation and social curation platform where users build a personal newspaper out of widgets. The product is not only about reading news. Its core value comes from combining five ideas in one interface:

1. User-controlled layout composition.
2. AI-supported summary-first reading.
3. Reading depth switching through headline, summary, and full modes.
4. Designed serendipity through Popular and Random content.
5. Shareable, subscribable newspapers with editorial commentary.

## Inputs Mapped to Product Scope

### Proposal-driven concepts

- Widget-based personal newspaper
- AI summaries with source attribution
- Popular and Random widgets to reduce filter bubbles
- Editorial widget for user voice
- Public sharing and forking of layouts
- Read-only public newspaper view
- Desktop-first usability evaluation around six main tasks

### Wireframe-driven flows

- `auth_login.png`, `auth_register.png`: authentication
- `uc0_edit_mode_v1.png`, `uc0_edit_mode_v2.png`: edit mode and layout composition
- `uc1_widget_creator.png`: add widget flow
- `uc2_add_sources.png`: add and manage sources
- `uc3_reading_mode.png`: global reading mode switching
- `uc4_discover_follow.png`: discover and follow other newspapers
- `uc5_editorial_notes.png`: editorial note creation

### Current frontend-supported flows

- Login/register mock flow via local storage
- Main newspaper page with draggable/resizable widgets
- Global reading mode toggle in navbar
- Widget settings modal with category/editorial/popular/random-like controls
- Add widget from a mock publisher list
- Share modal with copy-link interaction
- Discover page for exploring shared newspapers visually

### Current frontend gaps

- No real backend, persistence, or RSS ingestion
- No public `/newspaper/:slug` route
- No actual subscribe/follow action
- No integrated editorial widget rendered as a native grid widget
- No true Popular or Random widget as first-class components
- No source management beyond mock publishers

## Primary Actors

1. Guest Visitor
2. Registered Reader
3. Curator
4. Subscriber/Follower
5. Admin or Demo Operator
6. External RSS Source
7. AI Summarization Service

## Actor Goals

### Guest Visitor

- View a shared newspaper
- Decide whether the curator is worth following
- Register to adopt the layout

### Registered Reader

- Read efficiently with different depth levels
- Open original sources quickly
- Discover relevant and unexpected news

### Curator

- Customize layout
- Add widgets and sources
- Write editorial notes
- Publish a shareable newspaper

### Subscriber/Follower

- Follow trusted curators
- Reuse a layout without building one from scratch

## Use Case Overview

| ID | Use Case | Primary Actor | Priority |
| --- | --- | --- | --- |
| UC-01 | Register account | Guest Visitor | High |
| UC-02 | Log in | Guest Visitor | High |
| UC-03 | Create or open personal newspaper | Registered Reader | High |
| UC-04 | Add widget to layout | Curator | High |
| UC-05 | Move and resize widget | Curator | High |
| UC-06 | Configure widget content | Curator | High |
| UC-07 | Manage sources | Curator | High |
| UC-08 | Switch reading mode | Registered Reader | High |
| UC-09 | Read article summary and open original source | Registered Reader | High |
| UC-10 | Discover serendipitous content | Registered Reader | High |
| UC-11 | Create editorial note widget | Curator | High |
| UC-12 | Save layout and preferences | Curator | High |
| UC-13 | Publish newspaper | Curator | High |
| UC-14 | View public newspaper | Guest Visitor | High |
| UC-15 | Follow curator/newspaper | Subscriber/Follower | Medium |
| UC-16 | Fork or reuse layout | Subscriber/Follower | High |
| UC-17 | Browse discover feed | Registered Reader | Medium |
| UC-18 | Refresh news corpus and summaries | Admin / System | Medium |

## Detailed Use Cases

### UC-01 Register Account

- Primary actor: Guest Visitor
- Goal: Create an account to save layouts and follow newspapers.
- Preconditions: User is not authenticated.
- Main flow:
1. User opens the auth page.
2. User enters email and password.
3. System validates the form.
4. System creates the account.
5. System starts a logged-in session.
- Postconditions: User profile exists and can create a newspaper.
- Prototype status: Partially represented in `frontend/src/app/login/page.tsx` with mock auth.

### UC-02 Log In

- Primary actor: Guest Visitor
- Goal: Access an existing personal newspaper and saved preferences.
- Preconditions: User account exists.
- Main flow:
1. User opens login.
2. User submits credentials or social login.
3. System authenticates the user.
4. System redirects the user to the home newspaper page.
- Postconditions: Authenticated session exists.
- Prototype status: Partially represented with local storage login.

### UC-03 Create or Open Personal Newspaper

- Primary actor: Registered Reader
- Goal: Access a working newspaper dashboard.
- Preconditions: User is logged in.
- Main flow:
1. User enters the home screen.
2. System loads the last-used or default newspaper layout.
3. System loads widget content and the saved reading mode.
4. User starts reading or editing.
- Alternative flow: If no layout exists, system creates a default starter layout including serendipity widgets.
- Postconditions: A layout is visible and interactive.
- Prototype status: Implemented as the main dashboard in `frontend/src/app/page.tsx`.

### UC-04 Add Widget to Layout

- Primary actor: Curator
- Goal: Extend the newspaper with a new content block.
- Preconditions: User is in edit mode.
- Main flow:
1. User opens page settings.
2. User selects the Widgets tab.
3. User chooses a source or publisher.
4. User chooses a widget template.
5. User adds the widget.
6. System places the widget into the grid.
- Postconditions: New widget appears in the layout.
- Prototype status: Implemented with mock publishers and templates.
- Related wireframe: `docs/design/wireframes/uc1_widget_creator.png`

### UC-05 Move and Resize Widget

- Primary actor: Curator
- Goal: Organize the newspaper spatially.
- Preconditions: Layout is open and edit mode is active.
- Main flow:
1. User drags a widget to a new position.
2. User resizes the widget if needed.
3. System updates the layout state.
4. System saves the new arrangement.
- Postconditions: Layout reflects the new spatial organization.
- Prototype status: Implemented visually; persistence is missing.
- Related wireframes: `uc0_edit_mode_v1.png`, `uc0_edit_mode_v2.png`

### UC-06 Configure Widget Content

- Primary actor: Curator
- Goal: Adjust what a widget shows.
- Preconditions: Widget exists and is selected.
- Main flow:
1. User opens widget settings.
2. User selects a category, popularity option, or randomization action.
3. System updates widget configuration.
4. User saves changes.
- Postconditions: Widget shows new content rules.
- Prototype status: Partially implemented in the widget settings modal.

### UC-07 Manage Sources

- Primary actor: Curator
- Goal: Control which publishers or feeds can populate the newspaper.
- Preconditions: User is logged in.
- Main flow:
1. User opens source management.
2. User searches for a source or chooses a suggested feed.
3. User adds, removes, or disables a source.
4. System updates the user's source library.
- Alternative flow: System proposes sources by topic or category.
- Postconditions: Source preferences are stored and reused in widgets.
- Prototype status: Not fully implemented; currently limited to choosing from mock publishers.
- Related wireframe: `docs/design/wireframes/uc2_add_sources.png`

### UC-08 Switch Reading Mode

- Primary actor: Registered Reader
- Goal: Change reading depth across the whole layout.
- Preconditions: Newspaper is visible.
- Main flow:
1. User selects Headline, Summary, or Full mode.
2. System updates all visible widgets.
3. System persists the selected mode as a user preference.
- Postconditions: The newspaper reflects the new depth level globally.
- Prototype status: Implemented visually in navbar; persistence is missing.
- Related wireframe: `docs/design/wireframes/uc3_reading_mode.png`

### UC-09 Read Article Summary and Open Original Source

- Primary actor: Registered Reader
- Goal: Decide quickly whether to go deeper into an article.
- Preconditions: Articles exist in the visible widgets.
- Main flow:
1. User scans a widget card.
2. System shows AI summary and source metadata.
3. User decides to open the original article.
4. System opens the source page.
- Postconditions: User reaches the authoritative source.
- Prototype status: Summary-like cards exist, but explicit source-link flow must be strengthened.

### UC-10 Discover Serendipitous Content

- Primary actor: Registered Reader
- Goal: See content beyond personal preferences.
- Preconditions: Dashboard contains Popular and Random discovery widgets.
- Main flow:
1. User visits the dashboard.
2. System presents Popular and Random items visibly.
3. User explores an unexpected article.
4. User optionally opens summary or source.
- Postconditions: User encounters content outside the normal interest bubble.
- Prototype status: Conceptually hinted at in settings, but missing as first-class widgets.

### UC-11 Create Editorial Note Widget

- Primary actor: Curator
- Goal: Add personal commentary inside the newspaper.
- Preconditions: User is logged in and editing a layout.
- Main flow:
1. User adds an Editorial widget.
2. User enters title and body text.
3. User saves the note.
4. System places the editorial note alongside other widgets.
5. Shared readers later see the note with curator attribution.
- Postconditions: Editorial content becomes a native part of the newspaper.
- Prototype status: Weakly represented through a textarea and an unused `EditorialWidget.tsx`; not fully integrated.
- Related wireframe: `docs/design/wireframes/uc5_editorial_notes.png`

### UC-12 Save Layout and Preferences

- Primary actor: Curator
- Goal: Preserve layout, widget configuration, and reading mode.
- Preconditions: User has a layout.
- Main flow:
1. User changes layout or widget settings.
2. User saves, or the system autosaves.
3. System serializes layout structure and configuration.
4. System stores the result against the user's account.
- Postconditions: Layout can be restored in future sessions.
- Prototype status: Missing persistence layer.

### UC-13 Publish Newspaper

- Primary actor: Curator
- Goal: Share a personal newspaper as a public artifact.
- Preconditions: User has a saved layout.
- Main flow:
1. User clicks Share or Publish.
2. System creates a public slug.
3. System generates a public URL.
4. User copies and shares the link.
- Postconditions: Public newspaper is available to visitors.
- Prototype status: Only placeholder copy-link behavior exists.

### UC-14 View Public Newspaper

- Primary actor: Guest Visitor
- Goal: Read a published newspaper without editing it.
- Preconditions: A public slug exists.
- Main flow:
1. Visitor opens the public URL.
2. System loads the shared layout in read-only mode.
3. Visitor reads news and editorial commentary.
4. Visitor may choose to follow or reuse the layout.
- Postconditions: Shared artifact is consumable without ownership privileges.
- Prototype status: Missing public route.

### UC-15 Follow Curator/Newspaper

- Primary actor: Subscriber/Follower
- Goal: Keep receiving a trusted curated newspaper.
- Preconditions: User is logged in and viewing a public newspaper or discover feed.
- Main flow:
1. User opens a shared newspaper.
2. User clicks Follow or Subscribe.
3. System adds the newspaper to the user's followed list.
4. The layout becomes available from a Following area.
- Postconditions: Follow relationship is stored.
- Prototype status: Discover/follow concept exists, but action is not implemented.
- Related wireframe: `docs/design/wireframes/uc4_discover_follow.png`

### UC-16 Fork or Reuse Layout

- Primary actor: Subscriber/Follower
- Goal: Adopt another curator's layout as a starting point.
- Preconditions: User is viewing a shared layout and is authenticated.
- Main flow:
1. User chooses Use This Layout.
2. System clones the public layout into the user's account.
3. User edits the forked layout as a personal newspaper.
- Postconditions: A new owned layout is created from the shared original.
- Prototype status: Required by proposal, not yet implemented.

### UC-17 Browse Discover Feed

- Primary actor: Registered Reader
- Goal: Explore available shared newspapers.
- Preconditions: User is logged in.
- Main flow:
1. User opens Discover.
2. System shows a collection of shared newspaper cards.
3. User filters or browses newspapers.
4. User opens one to inspect or follow.
- Postconditions: User identifies curators or layouts worth following.
- Prototype status: Visually implemented in `frontend/src/app/feed/page.tsx`, but opening/following is incomplete.

### UC-18 Refresh News Corpus and Summaries

- Primary actor: Admin / System
- Goal: Keep widget content fresh and summarized.
- Preconditions: Sources are configured.
- Main flow:
1. System fetches RSS feeds on a schedule.
2. System normalizes and deduplicates articles.
3. System generates or refreshes AI summaries.
4. System updates cached widget-ready content.
- Postconditions: Fresh articles are available in layouts and shared newspapers.
- Prototype status: Backend requirement only.

## Use Case Coverage Against HCI Evaluation Tasks

| Evaluation Task | Supported Use Cases |
| --- | --- |
| T1 Layout composition | UC-03, UC-04, UC-05, UC-12 |
| T2 Reading mode switch | UC-08 |
| T3 Serendipity engagement | UC-10 |
| T4 Source navigation | UC-09 |
| T5 Newspaper sharing | UC-13, UC-14, UC-15, UC-16 |
| T6 Editorial creation | UC-11 |

## Functional Requirements

### Authentication and user profile

- FR-01 The system shall allow users to register with email and password.
- FR-02 The system shall allow users to log in and log out.
- FR-03 The system shall persist authenticated sessions securely.

### Layout and widget management

- FR-04 The system shall create a default newspaper for first-time users.
- FR-05 The system shall allow users to add, remove, move, and resize widgets.
- FR-06 The system shall save widget positions and sizes as layout data.
- FR-07 The system shall support at least these widget types in the main prototype: source feed, category feed, Popular, Random, Editorial.
- FR-08 The system shall allow users to configure widget-level source or category rules.

### Reading experience

- FR-09 The system shall support three reading modes: Headline, Summary, Full.
- FR-10 The selected reading mode shall affect all widgets globally within the active layout.
- FR-11 The system shall show source metadata separately from AI-generated summary text.
- FR-12 The system shall allow users to open the original article source.

### Serendipity and discovery

- FR-13 The system shall include visible Popular and Random discovery widgets in the default experience.
- FR-14 The system shall allow users to browse shared newspapers in a discover area.
- FR-15 The system shall allow users to follow newspapers or curators.

### Editorial curation

- FR-16 The system shall provide a native Editorial widget.
- FR-17 The system shall allow users to create, edit, and save editorial notes.
- FR-18 The system shall display editorial authorship clearly in shared views.

### Sharing and reuse

- FR-19 The system shall allow users to publish a newspaper and generate a public slug.
- FR-20 The system shall provide a read-only public newspaper route at `/newspaper/:slug`.
- FR-21 The system shall allow authenticated visitors to fork a shared layout into their own account.

### Sources, ingestion, and summaries

- FR-22 The system shall ingest content from multiple RSS sources.
- FR-23 The system shall normalize and deduplicate incoming articles.
- FR-24 The system shall generate 2-3 sentence AI summaries asynchronously.
- FR-25 The system shall cache news and summaries so the UI is not blocked by generation latency.

## Non-Functional Requirements

- NFR-01 The interface shall be optimized for desktop-first usage at a minimum width of 1280px.
- NFR-02 Reading mode switching shall feel immediate and shall not require a network refetch.
- NFR-03 Shared newspapers shall preserve layout structure consistently across sessions.
- NFR-04 The system shall clearly distinguish editable owner views from public read-only views.
- NFR-05 The main usability tasks T1-T6 should each target at least 80% completion in evaluation.
- NFR-06 The reading mode control shall remain visible and easy to discover.
- NFR-07 Serendipity widgets shall be visible by default rather than hidden behind settings.
- NFR-08 The system shall maintain source transparency so AI does not replace source authority.
- NFR-09 The architecture shall support modular expansion from mock data to RSS-backed live data.
- NFR-10 The prototype shall be stable enough for moderated usability testing without manual recovery steps.

## End-to-End Scope Needed Beyond Current Frontend

### Already strong in the prototype

- Desktop-first dashboard concept
- Drag-and-drop layout editing
- Visual reading mode switcher
- Discover page concept
- Share and settings interaction patterns

### Must be completed for a full end-to-end project

1. Real authentication and user persistence.
2. Saved layouts and autosave behavior.
3. Real source management instead of mock publishers.
4. RSS ingestion and normalized article storage.
5. AI summary generation pipeline.
6. First-class Popular and Random widgets.
7. Native Editorial widget rendered in-grid.
8. Public slug page for shared newspapers.
9. Follow and fork flows.
10. Strong source attribution and outbound source navigation.

## Recommended MVP Boundary

To keep the project coherent for HCI evaluation, the MVP should fully support these six user-visible flows:

1. Compose a layout.
2. Switch reading mode.
3. Discover unexpected content through Popular/Random.
4. Open the original source from a summary card.
5. Publish and share a newspaper.
6. Add an editorial widget and save commentary.

If time is limited, advanced source search and social graph features can be reduced, but the six flows above should not be dropped because they directly match the proposal and usability study design.

## Implementation Notes from Current Codebase

- Main dashboard prototype: `frontend/src/app/page.tsx`
- Discover prototype: `frontend/src/app/feed/page.tsx`
- Auth prototype: `frontend/src/app/login/page.tsx`
- Navbar reading mode and edit/share controls: `frontend/src/components/Navbar.tsx`
- Unused editorial component that should become native: `frontend/src/components/EditorialWidget.tsx`
- Mock data standing in for backend content: `frontend/src/lib/mockData.ts`

## Final Assessment

The proposal, paper prototype, wireframes, personas, and coded frontend are aligned around the same product idea. The current project already demonstrates the interaction language of Kisisel well, especially for layout editing and reading mode switching. The main missing step is not redefining the concept, but completing the flows that make the system a real social curation platform: editorial authorship, serendipity widgets, public sharing, following, and persistent data.
