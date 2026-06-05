# Kisisel Detailed Test Cases

## Purpose

This document derives detailed test cases from `docs/use-cases-and-requirements.md`.

It is intended for two phases:

1. Prototype and usability validation
2. Frontend and backend implementation verification

## Priority Levels

- P0: critical for MVP and HCI evaluation
- P1: important for complete prototype behavior
- P2: robustness and implementation hardening

## Test Case Template

Each test case contains:

- Test ID
- Related use case
- Objective
- Preconditions
- Test data
- Steps
- Expected result
- Priority

## Authentication

### TC-UC01-01 Register with valid credentials

- Related use case: UC-01 Register account
- Objective: Verify that a new user can create an account successfully.
- Preconditions: User is logged out and registration page is accessible.
- Test data:
  - Email: `newuser@example.com`
  - Password: `StrongPass123!`
- Steps:
1. Open the auth page.
2. Switch to registration mode if needed.
3. Enter a valid email.
4. Enter a valid password.
5. Confirm the password.
6. Submit the form.
- Expected result:
  - Form is accepted.
  - User account is created.
  - Session starts automatically.
  - User is redirected to the home newspaper page.
- Priority: P0

### TC-UC01-02 Register with invalid form data

- Related use case: UC-01
- Objective: Ensure invalid registration inputs are blocked.
- Preconditions: Registration page is open.
- Test data:
  - Empty email
  - Invalid email like `abc`
  - Weak or empty password
- Steps:
1. Open registration.
2. Leave one or more required fields empty or invalid.
3. Submit.
- Expected result:
  - Submission is blocked.
  - Validation messages are shown near relevant fields.
  - No session is created.
- Priority: P0

### TC-UC01-03 Register with duplicate email

- Related use case: UC-01
- Objective: Ensure duplicate accounts are not created.
- Preconditions: An account already exists for the test email.
- Test data:
  - Existing email: `existing@example.com`
- Steps:
1. Open registration.
2. Enter an email that already exists.
3. Enter a valid password.
4. Submit.
- Expected result:
  - Registration fails gracefully.
  - User sees a clear duplicate-account message.
  - User is guided to login instead.
- Priority: P1

### TC-UC02-01 Login with valid credentials

- Related use case: UC-02 Log in
- Objective: Verify successful login.
- Preconditions: User account exists.
- Test data:
  - Email: `existing@example.com`
  - Password: `StrongPass123!`
- Steps:
1. Open login.
2. Enter valid credentials.
3. Submit.
- Expected result:
  - User is authenticated.
  - Session is stored.
  - Dashboard opens.
- Priority: P0

### TC-UC02-02 Login with incorrect credentials

- Related use case: UC-02
- Objective: Ensure invalid login is rejected.
- Preconditions: User account exists.
- Test data:
  - Correct email, incorrect password
- Steps:
1. Open login.
2. Enter wrong password.
3. Submit.
- Expected result:
  - Login fails.
  - No session is created.
  - Clear error feedback is shown.
- Priority: P0

### TC-UC02-03 Session persistence after refresh

- Related use case: UC-02
- Objective: Verify login persistence behavior.
- Preconditions: User is already logged in.
- Steps:
1. Log in successfully.
2. Refresh the page.
3. Reopen the app in a new tab.
- Expected result:
  - Session persists according to product rules.
  - User does not unexpectedly lose access.
- Priority: P1

## Dashboard and Layout

### TC-UC03-01 Open existing personal newspaper

- Related use case: UC-03 Create or open personal newspaper
- Objective: Verify that a saved newspaper is restored.
- Preconditions: User is logged in and has a saved layout.
- Steps:
1. Open the home page.
2. Wait for dashboard data to load.
- Expected result:
  - Saved layout appears.
  - Widget arrangement matches stored state.
  - Reading mode and widget settings are restored.
- Priority: P0

### TC-UC03-02 Block unauthenticated dashboard access

- Related use case: UC-03
- Objective: Verify access control to the owner dashboard.
- Preconditions: User is logged out.
- Steps:
1. Navigate directly to the dashboard URL.
- Expected result:
  - User is redirected to login.
  - Owner data is not shown.
- Priority: P0

### TC-UC03-03 First-time user gets starter layout

- Related use case: UC-03
- Objective: Verify empty-state onboarding.
- Preconditions: New account exists with no layout.
- Steps:
1. Log in with a first-time user.
2. Open dashboard.
- Expected result:
  - System creates a starter layout.
  - Default widgets are visible.
  - Popular/Random discovery widgets are present by default.
- Priority: P0

### TC-UC04-01 Add widget successfully

- Related use case: UC-04 Add widget to layout
- Objective: Verify that a user can add a widget while editing.
- Preconditions: User is logged in and edit mode is enabled.
- Test data:
  - Source/publisher: valid source
  - Template: one valid widget template
- Steps:
1. Open page settings.
2. Go to Widgets tab.
3. Choose a source.
4. Choose a template.
5. Click Add Widget.
- Expected result:
  - Widget is inserted into the layout.
  - Widget appears in a valid non-overlapping position.
  - Widget becomes selectable.
- Priority: P0

### TC-UC04-02 Prevent widget addition in read mode

- Related use case: UC-04
- Objective: Ensure dashboard cannot be modified outside edit mode.
- Preconditions: User is on dashboard, edit mode is off.
- Steps:
1. Attempt to open widget creation from a read-only state.
- Expected result:
  - Action is blocked or user is prompted to enable edit mode.
- Priority: P1

### TC-UC04-03 Add widget in crowded layout

- Related use case: UC-04
- Objective: Verify widget placement when free space is limited.
- Preconditions: Layout already contains many widgets.
- Steps:
1. Add another widget.
- Expected result:
  - Widget is placed in the next valid position or
  - User receives clear placement feedback if limits are reached.
- Priority: P1

### TC-UC05-01 Move and resize widget

- Related use case: UC-05 Move and resize widget
- Objective: Verify spatial customization.
- Preconditions: Edit mode is on and at least one widget exists.
- Steps:
1. Drag a widget to a new position.
2. Resize the widget.
3. Release the interaction.
- Expected result:
  - New position and size are reflected immediately.
  - No overlap or broken rendering occurs.
- Priority: P0

### TC-UC05-02 Prevent drag in read-only mode

- Related use case: UC-05
- Objective: Ensure public or read mode cannot modify layout.
- Preconditions: Edit mode is off.
- Steps:
1. Attempt to drag or resize a widget.
- Expected result:
  - Layout remains unchanged.
  - Interaction handles are hidden or inactive.
- Priority: P0

### TC-UC05-03 Respect layout boundaries and minimum size

- Related use case: UC-05
- Objective: Verify layout constraints.
- Preconditions: Edit mode is on.
- Steps:
1. Resize a widget down to its minimum.
2. Try to drag a widget beyond the grid boundary.
- Expected result:
  - Minimum size is enforced.
  - Widget cannot move outside the grid.
- Priority: P1

### TC-UC06-01 Update widget configuration

- Related use case: UC-06 Configure widget content
- Objective: Verify widget settings update the widget behavior.
- Preconditions: Widget exists and settings modal can be opened.
- Steps:
1. Open widget settings.
2. Change category or content rule.
3. Save.
- Expected result:
  - Widget reflects updated configuration.
  - Changes persist after modal close.
- Priority: P0

### TC-UC06-02 Reject invalid widget configuration

- Related use case: UC-06
- Objective: Ensure invalid settings do not corrupt widget state.
- Preconditions: Widget settings are open.
- Steps:
1. Clear required fields or select an invalid combination.
2. Save.
- Expected result:
  - Save is blocked.
  - Clear validation feedback is displayed.
- Priority: P1

### TC-UC06-03 Switch widget behavior between normal, Popular, and Random

- Related use case: UC-06
- Objective: Verify advanced content modes.
- Preconditions: Widget supports multiple content rules.
- Steps:
1. Open widget settings.
2. Change the widget mode.
3. Save.
- Expected result:
  - Widget updates without breaking layout.
  - Content logic follows the selected mode.
- Priority: P1

## Sources and Reading

### TC-UC07-01 Add and remove a source

- Related use case: UC-07 Manage sources
- Objective: Verify that source management works end to end.
- Preconditions: Source management UI exists.
- Steps:
1. Open source management.
2. Add a valid source.
3. Save.
4. Remove or disable the same source.
- Expected result:
  - Source library updates correctly.
  - Source becomes available or unavailable to widgets accordingly.
- Priority: P1

### TC-UC07-02 Reject invalid feed source

- Related use case: UC-07
- Objective: Prevent malformed source configuration.
- Preconditions: Source addition form is open.
- Test data:
  - Invalid RSS URL or unsupported source metadata
- Steps:
1. Enter invalid source info.
2. Submit.
- Expected result:
  - Source is not added.
  - User sees a clear validation or fetch error.
- Priority: P1

### TC-UC07-03 Prevent duplicate source addition

- Related use case: UC-07
- Objective: Ensure duplicate feeds are handled safely.
- Preconditions: A source is already present in the library.
- Steps:
1. Try to add the same source again.
- Expected result:
  - Duplicate is rejected or merged cleanly.
- Priority: P2

### TC-UC08-01 Switch reading mode globally

- Related use case: UC-08 Switch reading mode
- Objective: Verify global reading mode behavior.
- Preconditions: Multiple widgets are visible.
- Steps:
1. Switch from Full to Summary.
2. Switch from Summary to Headline.
3. Switch back to Full.
- Expected result:
  - All widgets update in sync.
  - Mode change is immediate.
- Priority: P0

### TC-UC08-02 Reading mode control failure handling

- Related use case: UC-08
- Objective: Ensure no inconsistent UI appears if mode control fails.
- Preconditions: Simulated UI failure or disconnected state.
- Steps:
1. Attempt to change mode.
- Expected result:
  - System does not partially update widgets.
  - Failure is visible and recoverable.
- Priority: P1

### TC-UC08-03 Persist reading mode across sessions

- Related use case: UC-08
- Objective: Verify preference persistence.
- Preconditions: User has changed mode at least once.
- Steps:
1. Select a non-default reading mode.
2. Refresh or reopen the application.
- Expected result:
  - Same mode is restored.
- Priority: P0

### TC-UC09-01 Open original source from a card

- Related use case: UC-09 Read article summary and open original source
- Objective: Verify source navigation.
- Preconditions: Article card includes source metadata and source link.
- Steps:
1. Read an article card.
2. Click the original source action.
- Expected result:
  - Correct source page opens.
  - Source identity is clear before the click.
- Priority: P0

### TC-UC09-02 Handle broken source link

- Related use case: UC-09
- Objective: Ensure source failures do not break the app.
- Preconditions: Article card has an invalid or unavailable source URL.
- Steps:
1. Open article source.
- Expected result:
  - App handles failure gracefully.
  - User gets useful feedback.
- Priority: P1

### TC-UC09-03 Source navigation without summary

- Related use case: UC-09
- Objective: Verify fallback when summary generation is absent.
- Preconditions: Article exists but summary is unavailable.
- Steps:
1. View the article card.
2. Open the source.
- Expected result:
  - Source is still accessible.
  - Metadata remains sufficient for trust and context.
- Priority: P1

## Serendipity and Editorial Curation

### TC-UC10-01 Discover unexpected content via Popular/Random

- Related use case: UC-10 Discover serendipitous content
- Objective: Validate designed serendipity behavior.
- Preconditions: Dashboard contains Popular and Random widgets.
- Steps:
1. Open dashboard.
2. Locate Popular or Random content.
3. Open one unexpected article.
- Expected result:
  - User can discover non-personalized content easily.
  - Widget is visible without extra setup.
- Priority: P0

### TC-UC10-02 Detect absence of serendipity widgets in default experience

- Related use case: UC-10
- Objective: Verify compliance with proposal scope.
- Preconditions: First-load or starter dashboard is shown.
- Steps:
1. Inspect the default dashboard.
- Expected result:
  - Popular and/or Random widgets are present.
  - If absent, the test fails because a core design requirement is missing.
- Priority: P0

### TC-UC10-03 Random refresh repetition handling

- Related use case: UC-10
- Objective: Check perceived randomness quality.
- Preconditions: Random widget exists.
- Steps:
1. Refresh random content multiple times.
- Expected result:
  - Content usually changes.
  - If the pool is small, the system still behaves predictably and transparently.
- Priority: P2

### TC-UC11-01 Create and save Editorial widget

- Related use case: UC-11 Create editorial note widget
- Objective: Verify the platform's core commentary feature.
- Preconditions: User is logged in and edit mode is enabled.
- Steps:
1. Add an Editorial widget.
2. Enter title and note body.
3. Save.
- Expected result:
  - Editorial widget is visible in the layout.
  - Entered content persists.
  - Widget behaves as a native layout item.
- Priority: P0

### TC-UC11-02 Prevent empty editorial save

- Related use case: UC-11
- Objective: Validate basic editorial content rules.
- Preconditions: Editorial widget form is open.
- Steps:
1. Leave required fields empty.
2. Save.
- Expected result:
  - Save is blocked or a clear empty-state rule is applied.
  - User understands what must be filled.
- Priority: P1

### TC-UC11-03 Long editorial content rendering

- Related use case: UC-11
- Objective: Ensure long notes do not break layout.
- Preconditions: Editorial widget is available.
- Steps:
1. Paste a long multi-paragraph note.
2. Save.
3. Reopen the page.
- Expected result:
  - Layout remains stable.
  - Text is readable via truncation, expansion, or scroll behavior.
- Priority: P1

## Persistence, Sharing, and Social Flows

### TC-UC12-01 Save layout and restore later

- Related use case: UC-12 Save layout and preferences
- Objective: Verify persistence of core user work.
- Preconditions: User can modify layout.
- Steps:
1. Move widgets.
2. Change widget settings.
3. Change reading mode.
4. Save or wait for autosave.
5. Refresh the app.
- Expected result:
  - Layout, settings, and mode are restored.
- Priority: P0

### TC-UC12-02 Handle save failure

- Related use case: UC-12
- Objective: Verify error recovery during persistence failure.
- Preconditions: Backend or storage failure is simulated.
- Steps:
1. Modify layout.
2. Trigger save.
- Expected result:
  - User sees explicit save failure feedback.
  - Unsaved work is not silently lost.
- Priority: P1

### TC-UC12-03 Rapid edits during autosave

- Related use case: UC-12
- Objective: Ensure latest state wins safely.
- Preconditions: Autosave is enabled.
- Steps:
1. Quickly move and resize several widgets.
2. Change settings between moves.
3. Wait for autosave.
- Expected result:
  - Final persisted state matches latest visible UI state.
  - No corrupted layout is stored.
- Priority: P1

### TC-UC13-01 Publish newspaper and get share link

- Related use case: UC-13 Publish newspaper
- Objective: Verify creation of a public artifact.
- Preconditions: User is logged in and layout is saved.
- Steps:
1. Click Share or Publish.
2. Confirm publication if needed.
3. Copy generated link.
- Expected result:
  - Public slug is created.
  - Shareable URL is returned.
  - Link opens a public page.
- Priority: P0

### TC-UC13-02 Prevent publishing invalid layout

- Related use case: UC-13
- Objective: Avoid broken public artifacts.
- Preconditions: Layout is unsaved or invalid.
- Steps:
1. Attempt publication.
- Expected result:
  - Publication is blocked or save is required first.
- Priority: P1

### TC-UC13-03 Republishing after edits

- Related use case: UC-13
- Objective: Verify update behavior of an already shared newspaper.
- Preconditions: Newspaper has been published once before.
- Steps:
1. Edit the layout.
2. Publish again.
- Expected result:
  - Public newspaper updates predictably or versions are handled clearly.
- Priority: P2

### TC-UC14-01 Open valid public newspaper

- Related use case: UC-14 View public newspaper
- Objective: Verify shared layout consumption.
- Preconditions: Valid public slug exists.
- Steps:
1. Open the public URL.
- Expected result:
  - Read-only newspaper loads.
  - Articles and editorial notes appear.
  - Public viewer does not see owner-only editing tools.
- Priority: P0

### TC-UC14-02 Handle invalid public slug

- Related use case: UC-14
- Objective: Verify not-found behavior.
- Preconditions: Invalid or deleted slug.
- Steps:
1. Open a non-existing public URL.
- Expected result:
  - User sees a clear not-found or unavailable state.
- Priority: P0

### TC-UC14-03 Block editing in public view

- Related use case: UC-14
- Objective: Ensure owner/public separation.
- Preconditions: Public newspaper page is open.
- Steps:
1. Attempt drag, resize, or open owner settings.
- Expected result:
  - Editing is not possible.
  - Read-only state is obvious.
- Priority: P0

### TC-UC15-01 Follow a public newspaper

- Related use case: UC-15 Follow curator/newspaper
- Objective: Verify social subscription behavior.
- Preconditions: User is logged in and a public newspaper is open.
- Steps:
1. Click Follow or Subscribe.
- Expected result:
  - Follow relation is stored.
  - Newspaper appears in Following.
- Priority: P1

### TC-UC15-02 Require login before follow

- Related use case: UC-15
- Objective: Protect follow action.
- Preconditions: User is logged out.
- Steps:
1. Click Follow on a public newspaper.
- Expected result:
  - User is asked to log in or register.
  - Follow is not silently lost.
- Priority: P1

### TC-UC15-03 Prevent duplicate follow

- Related use case: UC-15
- Objective: Avoid duplicate relationships.
- Preconditions: User already follows the newspaper.
- Steps:
1. Click Follow again.
- Expected result:
  - UI indicates already-following state.
  - No duplicate record is created.
- Priority: P2

### TC-UC16-01 Fork shared layout into own account

- Related use case: UC-16 Fork or reuse layout
- Objective: Verify layout reuse flow.
- Preconditions: User is logged in and views a public newspaper.
- Steps:
1. Click Use This Layout.
2. Confirm fork.
3. Open personal dashboard.
- Expected result:
  - New owned layout is created.
  - Layout becomes editable in the user's account.
- Priority: P0

### TC-UC16-02 Require authentication before fork

- Related use case: UC-16
- Objective: Ensure ownership rules are respected.
- Preconditions: User is logged out.
- Steps:
1. Attempt to fork a public layout.
- Expected result:
  - User is redirected to login or shown an auth prompt.
- Priority: P1

### TC-UC16-03 Fork layout with unsupported widget data

- Related use case: UC-16
- Objective: Verify graceful degradation.
- Preconditions: Shared layout includes an unsupported or legacy widget.
- Steps:
1. Fork the layout.
- Expected result:
  - Compatible parts are preserved.
  - Incompatible elements are reported clearly.
- Priority: P2

### TC-UC17-01 Browse discover feed and open a newspaper

- Related use case: UC-17 Browse discover feed
- Objective: Verify discovery browsing flow.
- Preconditions: Discover page is available.
- Steps:
1. Open Discover.
2. Pan, scroll, or browse the list.
3. Select a newspaper.
- Expected result:
  - Discover items are navigable.
  - Selected newspaper opens correctly.
- Priority: P1

### TC-UC17-02 Handle discover empty/error state

- Related use case: UC-17
- Objective: Ensure graceful handling when nothing can be shown.
- Preconditions: Discover data returns empty or failed response.
- Steps:
1. Open Discover.
- Expected result:
  - User sees empty/error feedback with recovery guidance.
- Priority: P1

### TC-UC17-03 Maintain usability with many discover items

- Related use case: UC-17
- Objective: Verify performance and usability under denser data.
- Preconditions: Large number of discover items exists.
- Steps:
1. Browse extensively.
2. Pan around the discover space.
- Expected result:
  - Interaction remains usable.
  - Major frame drops or blocking behavior do not occur.
- Priority: P2

## Backend Data and Content Pipeline

### TC-UC18-01 Refresh articles and summaries successfully

- Related use case: UC-18 Refresh news corpus and summaries
- Objective: Verify the core ingestion pipeline.
- Preconditions: Valid RSS sources are configured.
- Steps:
1. Trigger scheduled or manual refresh.
2. Inspect stored content.
- Expected result:
  - New articles are fetched.
  - Duplicates are reduced.
  - Summaries are generated and stored.
- Priority: P1

### TC-UC18-02 Handle partial source or summary failure

- Related use case: UC-18
- Objective: Ensure robustness during upstream failure.
- Preconditions: At least one source or AI provider is unavailable.
- Steps:
1. Trigger refresh.
- Expected result:
  - Failed items are logged.
  - Existing content remains available.
  - Successful items continue processing.
- Priority: P1

### TC-UC18-03 Deduplicate overlapping RSS stories

- Related use case: UC-18
- Objective: Verify duplicate handling.
- Preconditions: Two sources publish the same story.
- Steps:
1. Run ingestion.
2. Inspect stored articles and widget-facing results.
- Expected result:
  - Duplicate stories are normalized into one logical article item or linked cluster.
- Priority: P2

## HCI Observation Checklist

These checks should be observed during moderated testing even when backend behavior is mocked:

- Reading mode control is easy to discover.
- Edit mode versus read-only mode is visually obvious.
- Share and follow actions are easy to locate.
- Popular and Random widgets are visible without configuration.
- Editorial commentary appears as a native part of the newspaper.
- Source attribution is clear and distinct from AI-generated summary text.
- Errors are recoverable and understandable.
- Main tasks remain usable on desktop at `1280px` and above.

## Recommended Execution Order

### First implementation and test wave

- UC-03 Dashboard load
- UC-04 Add widget
- UC-05 Move/resize widget
- UC-08 Reading mode
- UC-09 Source navigation
- UC-10 Serendipity widgets
- UC-11 Editorial widget
- UC-12 Save layout
- UC-13 Publish
- UC-14 Public newspaper
- UC-16 Fork layout

### Second wave

- UC-01 Register
- UC-02 Login
- UC-06 Widget configuration depth
- UC-07 Source management
- UC-15 Follow
- UC-17 Discover feed completion
- UC-18 Ingestion and summary jobs

## Current Repository Readiness Note

At the moment, the clearest editable product source is under `frontend/`.

The repository also contains `apps/api` and `apps/web`, but the available contents are mostly compiled output and dependencies rather than active source files. For implementation, this means:

1. Frontend work can start immediately from `frontend/`.
2. Backend implementation will likely need fresh source scaffolding or restoration under `apps/api`.
3. Shared newspaper, persistence, and ingestion features should be planned against a new or reconstructed API source layer.
