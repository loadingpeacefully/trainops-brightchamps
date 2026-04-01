# TrainOS — Decisions

## Pull/Push sync model instead of live API
Context: Teachers needed a source of truth they could edit (Google Sheet) but the app needed to write new assignments.
Decision: Pull reads from Google Sheets (4 tabs), Push writes to Supabase + Google Sheet via AppScript.
Why: Ops team already uses Sheets. No custom backend needed.
Tradeoff: Data is stale until Pull is clicked. Pending state shows what hasn't been synced yet.

## Progress join via teacherId not email
Context: Adhyayan has two accounts per teacher — an old tt_ training account (created via activateTeacher AppScript) and a newer account linked via teacher_id. The old accounts have progress data but no teacher_id FK.
Decision: Join via teacherId where available (600/848 matched). For the 244 unmatched, show 0% progress.
Why: Email doesn't exist in adhyayan.users schema. The only complete join key is the training deck (Google Sheet) which maps email to adhyayanUserId. This is the AppScript join.
Tradeoff: 29% of teachers show 0% progress until their adhyayanUserId is filled in the Teachers sheet.

## parseSheetJson dual-mode detection
Context: Google Sheets gviz JSON API returns col.label populated for some sheets but empty for others (when the first column contains numbers, Google treats row 1 as data).
Decision: Check if ALL col.labels are populated. If yes, use them as keys. If any are empty, use first data row as headers and shift data start to row 1.
Why: The Progress tab (numeric teacherId in col A) triggered the empty-label mode. Teachers tab worked fine.
Tradeoff: If a sheet has intentionally empty headers, this logic will misread it.

## mergeData as the single join layer
Context: Teachers page needed teacher name + course name + progress % all on one row.
Decision: mergeData(teachers, assignments, progress, courses) produces one enriched object per assignment with all fields flattened (teacherName, teacherEmail, teacherVertical, pct, kc1Score etc.)
Why: Eliminates N+1 lookups in components. Components receive complete data, never do their own joins.
Tradeoff: mergeData runs on every render via useMemo. With 847 teachers and 40+ assignments, still fast (<1ms).

## Google Apps Script doPost for sheet writes
Context: Browser can't write to Google Sheets directly. Supabase is the write DB but the sheet needs to stay in sync.
Decision: Deploy an Apps Script web app that accepts POST requests and upserts rows to the Assignments tab.
Why: Free, no additional infrastructure. Ops team can verify data in the sheet directly.
Tradeoff: no-cors fetch means we can't confirm success. Assumed success if no exception thrown.

## VERTICALS as a shared constant in nav.js
Context: The verticals list (Codechamps, MathChamps etc.) was duplicated in AddTeacherModal and Teachers roster filter.
Decision: Export VERTICALS from nav.js, import everywhere.
Why: Single source of truth. Adding a new vertical requires one change.

## Assignments start as empty array, not seed data
Context: Seed teacher ids (1-20) don't match real sheet teacher ids (18000+). Seed assignments referenced non-existent teachers, causing mergeData to filter everything out and dashboard KPIs to show 0.
Decision: Initialize assignments state as [] instead of INIT_ASSIGNMENTS. Show honest 0 until Pull loads real data.
Why: Fake data that doesn't join correctly is worse than no data. Users see "Pull to load assignments" hint.

## BrightChamps design system over original Dark Ops
Context: The original trainos-v5.jsx used a dark theme (Syne/Epilogue fonts, orange #F97316 accent). BrightChamps has an official design system with Poppins/Nunito Sans fonts and blue #4360FD accent.
Decision: Replaced all theme tokens to match BrightChamps brand. Light background (#FAFAFA), blue accent, 22px card radius.
Why: Product ships under BrightChamps brand. Visual consistency with other BC tools.
