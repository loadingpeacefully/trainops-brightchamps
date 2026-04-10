# TrainOS — Handover Document

**Date:** 2026-04-10 (revised)
**Status:** Live, in production use
**Live URL:** https://trainops-brightchamps.pages.dev
**Repo:** https://github.com/loadingpeacefully/trainops-brightchamps
**Latest commit on `main`:** `3a8269d` — fix: graceful auth failure when Supabase is unreachable

---

## 1. What is this project

TrainOS is an admin platform for managing teacher training at BrightChamps. Ops admins use it to assign training courses to ~847 teachers, track their progress through Adhyayan (the LMS), and identify teachers who haven't started or are past deadline. It solves the problem of training visibility — before TrainOS, ops had to manually cross-reference Google Sheets with Adhyayan to know who was on track. Status: live and in production use by the BrightChamps ops team. Live URL: https://trainops-brightchamps.pages.dev.

---

## 2. What is actually working right now

| Feature | Status | Notes |
|---|---|---|
| Login (Google OAuth, @brightchamps.com restriction) | ✅ WORKS | Domain check on `onAuthStateChange` |
| Auto-pull on page load | ✅ WORKS | Fires once after auth confirmed |
| Teachers roster (load, search, filter by vertical) | ✅ WORKS | Loads 847 teachers from sheet |
| Teacher profile (KC scores, learning path, team info) | ✅ WORKS | Profile shows vertical, teamLead, region, KC1/KC2/avg |
| Assignment creation (assign course to teacher) | ✅ WORKS | Duplicate guard via String-normalized teacherId |
| Assignment persistence (survives refresh) | ✅ WORKS | Written to Supabase, fetched on next Pull |
| Assignment status (shows correct completionStatus) | ✅ WORKS | Uses `completionStatus \|\| status` everywhere |
| Progress display (pct, progress bar, colors) | ✅ WORKS | hColor maps red/amber/green/brand correctly |
| Deadline tracking (days left, overdue) | ✅ WORKS | dLeft() returns null on invalid dates |
| Send reminder | ⚠️ PARTIAL | Toast says "not yet configured" — no email sent |
| Add new teacher | ⚠️ PARTIAL | Writes to Supabase + Sheet (no-cors, unverifiable) |
| Dashboard KPI: In Training | ✅ WORKS | Counts teachers with assignment AND pct > 0 |
| Dashboard KPI: Not Started | ✅ WORKS | Counts assigned teachers with no progress |
| Dashboard KPI: Overdue | ✅ WORKS | Uses completionStatus, not raw assignment status |
| Dashboard subject cards | ✅ WORKS | Real assignment counts and progress avg per subject |
| Courses page (13 courses, assign flow) | ⚠️ PARTIAL | Assign flow works; some hardcoded `enrolled`/`avg`/`completed` still on c4, c7-c12 (see Section 8) |
| Analytics page | ⚠️ PARTIAL | Course KPIs work; module funnel is placeholder ("Phase 2") |
| Data Audit tab | ✅ WORKS | Shows complete/no-progress/no-assignment/ghost classification |
| Pull button (manual refresh) | ✅ WORKS | Validates that data actually arrived before marking done |
| Push button (manual sync) | ✅ WORKS | Only clears _pending if Supabase write succeeds |
| Sheet writer (assignments → Google Sheet) | ⚠️ PARTIAL | no-cors POST, can't confirm success. Best-effort only. |
| Auth resilience (Supabase outage handling) | ✅ WORKS | `getSession()` has `.catch()` — falls back to Login screen instead of hanging on a stale refresh token (added in `3a8269d`) |

---

## 3. Data architecture

### Where data is read from

| Data | Primary source | Fallback |
|---|---|---|
| Teachers | Google Sheet `Teachers` tab (gviz JSON) | Supabase `teachers` table |
| Courses | Google Sheet `Courses` tab (merged with hardcoded base) | Hardcoded `COURSES` in courses.js |
| Assignments | Supabase `assignments` table | Google Sheet `Assignments` tab |
| Progress | Google Sheet `Progress` tab | None (returns `[]`) |

### Where data is written to

| Action | Primary write | Best-effort secondary |
|---|---|---|
| New assignment | Supabase `assignments` table (upsert on `id`) | Apps Script doPost → Sheet `Assignments` tab |
| New teacher | Supabase `teachers` table (upsert on `teacher_id`) | Apps Script doPost → Sheet `Teachers` tab |
| Deadline edit | Supabase `assignments` table (upsert) | Apps Script doPost → Sheet |

### Join chain

The teacher → progress join is the heart of the system. mergeData (api.js:252) does:

1. **Primary key:** `assignment.teacherId === progress.teacherId` (both numbers, both from sheet)
2. **Fallback key:** `teacher.adhyayanUserId === progress.adhyayanUserId` (string)

The fallback is needed because Adhyayan has two account types:
- Newer accounts have `teacher_id` populated → primary join works
- Older `tt_*` training accounts only have `adhyayan_user_id` → fallback join needed

**Coverage (as of 2026-04-10):**
- Primary key (`teacher_id`): ~600/848 teachers
- Fallback key (`adhyayan_user_id`): adds coverage for ~244 more teachers
- Total joinable: ~844/848. The remaining 4 will always show 0% until tech team backfills `adhyayanUserId` in the Teachers sheet.

---

## 4. File map

### Project root
- `index.html` — Vite HTML entry, loads main.jsx + Google Fonts (Poppins, Nunito Sans)
- `vite.config.js` — Vite config: React plugin, path aliases, sourcemap disabled
- `package.json` — pnpm + React 18 + Vite 5 + Recharts + Supabase
- `.env` — secrets (gitignored): Supabase URL/key, 4 sheet URLs, AppScript writer URL
- `.gitignore` — excludes node_modules, dist, .env, .DS_Store, _reference, sheet_data
- `.nvmrc` — Node 20 pin
- `public/_redirects` — `/* /index.html 200` (SPA fallback for Cloudflare Pages)

### Documentation
- `README.md` — public-facing project front page (linked from GitHub)
- `HANDOVER.md` — this document
- `TROUBLESHOOTING.md` — common issues with fixes (Supabase pause, blank screen, etc.)
- `CLAUDE.md` — project guide for Claude Code sessions
- `TASKS.md` — backlog and completed work tracker
- `DECISIONS.md` — architecture decisions log
- `MEMORY.md` — bugs fixed, anti-patterns to avoid
- `LICENSE` — proprietary, BrightChamps internal use only
- `.env.example` — template for the 7 required env vars (no values)
- `audit/` — 6 historical audit reports (data wiring, QA test plan, brutal honest audit, etc.)

### src/
- `main.jsx` — React entry, mounts BrowserRouter + App
- `App.jsx` — All useState, all handlers, ErrorBoundary, sidebar, routes

### src/data/
- `theme.js` — Color tokens (`C`), font families (`F`), reusable card/field/pill/mkBtn styles
- `courses.js` — Hardcoded `CATEGORIES` (4 subjects) and `COURSES` (13 entries) — sheet overrides name/status/modules at fetch time
- `helpers.js` — `initials`, `avBg`, `avFg`, `fmtD`, `fmtS`, `dLeft`, `hColor`
- `nav.js` — `SHEETS` config, `NAV` items, `VERTICALS` list, `LAST_PULL` (empty string)

### src/lib/
- `api.js` — `parseSheetJson`, `parseJoinDate`, `normalizeStatus`, `fetchTeachers/Courses/Assignments/Progress`, `mergeData`, `pushTeacher`, `pushAssignments`
- `sheetsWriter.js` — `writeAssignmentsToSheet`, `writeTeacherToSheet` (no-cors POST to Apps Script)
- `supabase.js` — Supabase client init from env vars

### src/components/
- `Av.jsx` — Avatar with initials + deterministic color
- `Tag.jsx` — Pill badge; `StatusTag` maps status string to color
- `PBar.jsx` — Horizontal progress bar
- `Kpi.jsx` — Dashboard KPI card with hover + click
- `SectionHeader.jsx` — Page title + subtitle + action slot
- `EmptyState.jsx` — Icon + title + sub for empty lists
- `Toast.jsx` — Top-right notification toast
- `Modal.jsx` — Modal shell with overlay + close
- `SyncBar.jsx` — Top sync status bar with Pull/Push buttons + sheet tabs
- `Login.jsx` — Google OAuth login screen with @brightchamps.com domain restriction

### src/components/dashboard/
- `Dashboard.jsx` — 4 KPIs + By Subject cards (real counts via Map lookups)

### src/components/courses/
- `Courses.jsx` — Course cards grouped by category, assign + analytics buttons

### src/components/analytics/
- `Analytics.jsx` — Course picker + 3 KPIs + "Phase 2" placeholder for module funnel

### src/components/teachers/
- `Teachers.jsx` — 4 tabs: Assignments, All Teachers (roster), Data Audit, Profile drill-down
- `AssignModal.jsx` — 3-step assign flow: course → teachers → confirm + deadline
- `AddTeacherModal.jsx` — Add new teacher form

---

## 5. Environment variables

All 7 vars are in `.env` (gitignored locally) and configured in Cloudflare Pages dashboard.

| Variable | Critical? | Where used | Purpose |
|---|---|---|---|
| `VITE_SUPABASE_URL` | YES | `src/lib/supabase.js` | Supabase project URL for auth + assignments table |
| `VITE_SUPABASE_ANON_KEY` | YES | `src/lib/supabase.js` | Supabase anon JWT (safe to expose, RLS-bound) |
| `VITE_SHEET_TEACHERS_URL` | YES | `src/lib/api.js:79` | gviz JSON for Teachers tab — primary teacher source |
| `VITE_SHEET_COURSES_URL` | NO | `src/lib/api.js:138` | gviz JSON for Courses tab — overrides hardcoded base |
| `VITE_SHEET_ASSIGNMENTS_URL` | NO | `src/lib/api.js:193` | gviz JSON for Assignments tab — fallback only (Supabase is primary) |
| `VITE_SHEET_PROGRESS_URL` | YES | `src/lib/api.js:218` | gviz JSON for Progress tab — only source for pct/KC scores |
| `VITE_SHEET_WRITER_URL` | NO | `src/lib/sheetsWriter.js:2,33` | Apps Script doPost endpoint for sheet writeback |

**Critical = the app shows wrong/empty data without it.**
**Non-critical = falls back gracefully to hardcoded defaults or alternative source.**

---

## 6. External dependencies

| Service | Purpose | Credentials location | Failure mode |
|---|---|---|---|
| **Supabase** | Auth (Google OAuth) + assignments table + teachers fallback table | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` in `.env` | Login fails, assignments can't persist, app shows empty |
| **Google Sheets (gviz JSON API)** | Read source for Teachers, Courses, Assignments, Progress tabs | 4 `VITE_SHEET_*_URL` in `.env` (URLs include sheet ID) | Falls back to Supabase or empty arrays |
| **Google Apps Script (doPost)** | Write target for assignments and teachers (mirrors to Sheet) | `VITE_SHEET_WRITER_URL` in `.env` | Sheet stays stale; Supabase still gets writes |
| **Google OAuth (Cloud Console)** | OAuth provider for Supabase Auth | OAuth client ID/secret in Supabase dashboard | Login broken |
| **Cloudflare Pages** | Hosting + auto-deploy from GitHub | Cloudflare account → Pages project linked to GitHub repo | App goes offline |
| **GitHub** | Source code repo, triggers Cloudflare deploys on push | https://github.com/loadingpeacefully/trainops-brightchamps | Manual deploys still possible from Cloudflare dashboard |

---

## 7. Handover details

### Git repo

- **URL:** https://github.com/loadingpeacefully/trainops-brightchamps
- **What's in it:** 25 source files in `src/`, 6 audit docs, 7 root MD files (README, HANDOVER, TROUBLESHOOTING, CLAUDE, TASKS, DECISIONS, MEMORY), LICENSE, .env.example, config (vite.config.js, package.json, .gitignore, .nvmrc, public/_redirects, index.html)
- **What's NOT in it:** `.env` (secrets — gitignored), `node_modules/`, `dist/` (build output), `.DS_Store`
- **Run locally:**
  ```bash
  pnpm install              # Node 20+ (.nvmrc)
  cp .env.example .env      # then fill in real values from current owner
  pnpm dev                  # http://localhost:5173
  ```
- **Deploy:** Push to `main` branch → Cloudflare Pages auto-builds and deploys to `trainops-brightchamps.pages.dev`. Build command: `pnpm build`. Output dir: `dist/`. Build time ~1-2 min.

### Accounts to transfer

| Service | Current owner | Transfer method |
|---|---|---|
| GitHub repo `loadingpeacefully/trainops-brightchamps` | Personal account | Transfer to BrightChamps GitHub org via Settings → Transfer ownership |
| Cloudflare Pages project | Personal Cloudflare account | Add BrightChamps team as admin, then delete personal project after BrightChamps re-deploys from their org repo |
| Supabase project `shdofgxhdtppedjoprfm` | Personal Supabase account | Transfer to BrightChamps org via Supabase dashboard → Settings → Transfer project |
| Google Cloud Console (OAuth client) | Personal Google account | BrightChamps creates new OAuth client in their Google Cloud project; update Supabase with new client ID/secret |
| Google Sheet (TrainOS_Data) | Personal Google account | Transfer ownership in Sheet → Share → Transfer ownership |
| Google Apps Script (doPost) | Personal Google account | Re-deploy under BrightChamps account (existing URL stops working when ownership changes) |

### Credentials new owner needs

| Credential | Currently in | Action |
|---|---|---|
| Supabase URL + anon key | `.env` | Same values work post-transfer |
| Supabase service role key (if needed for admin scripts) | Supabase dashboard | Generate after transfer |
| Google OAuth client ID + secret | Supabase Auth → Providers → Google | Recreate in BrightChamps Google Cloud, update in Supabase |
| Sheet ID `13l0gDolgE13Gq8PLr79irn5gu884ykOtzii7k5YzAZ0` | All 4 `VITE_SHEET_*_URL` env vars | Update if BrightChamps creates a new sheet |
| Apps Script web app URL | `VITE_SHEET_WRITER_URL` | Update after BrightChamps re-deploys the Apps Script |
| Cloudflare Pages env vars (all 7 above) | Cloudflare Pages dashboard | Re-add to BrightChamps Cloudflare project |

---

## 8. Known gaps and pending work

### Operational risks (will bite if ignored)
- **Supabase free-tier auto-pause** — The Supabase project pauses after ~7 days of inactivity. When paused, the URL stops resolving (`ERR_NAME_NOT_RESOLVED`) and the app falls back to the Login screen with no working backend. This already happened once on 2026-04-10 — the app now handles it gracefully (shows Login instead of hanging) but the underlying data is still inaccessible until someone restores the project from the Supabase dashboard. **Mitigation:** upgrade to a paid Supabase plan, OR set up a weekly cron that pings the Supabase REST endpoint to keep it warm. See [TROUBLESHOOTING.md § 1](./TROUBLESHOOTING.md#1-live-site-shows-a-blank-page).

### Pending (built but not yet wired)
- **Apps Script writeback verification** — `writeAssignmentsToSheet` and `writeTeacherToSheet` use `mode: 'no-cors'` so success can't be confirmed. Sheet may silently fall behind Supabase. Owner: needs Apps Script redeploy with proper CORS headers, or accept Sheet as best-effort mirror.
- **Recharts dead dependency** — Recharts is in `package.json` (~300 KB) but no file in `src/` imports it. Was used by the old Analytics module funnel which is now a Phase 2 placeholder. Safe to remove with `pnpm remove recharts`. Owner: post-handover cleanup.

### Blocked (waiting on tech team)
- **244 teachers missing `adhyayanUserId`** — Will show 0% progress until tech team ensures all teachers get training links sent and sheet is backfilled. Owner: BrightChamps tech team.
- **Module-level analytics** — Analytics page funnel is a placeholder. Needs Metabase wiring or Adhyayan API access. Owner: tech team to expose module-level data.

### Deferred (post-handover)
- **Email reminders** — `Send Reminder` button shows "not yet configured" toast. Needs Supabase Edge Function + Resend API. Owner: post-handover.
- **localStorage fallback for pending items** — If user refreshes before Push completes, pending items are lost. Owner: post-handover.
- **Supabase RLS policies** — Currently the anon key has full read/write. Needs row-level security before scaling to more users. Owner: post-handover.
- **Mobile responsive sidebar** — Desktop-first design. Sidebar doesn't collapse on small screens. Owner: post-handover.

---

## 9. How to do key ops tasks

### 1. How to add a new course to the platform

Courses are partly hardcoded and partly sheet-driven. To add a new course:

1. Open `src/data/courses.js`
2. Add a new entry to the `COURSES` array with at minimum: `id` (e.g., `"c14"`), `cat`, `icon`, `name`, `modules`, `status: "active"`, `enrolled: 0`, `completed: 0`, `avg: 0`, `desc`
3. Open the Google Sheet → `Courses` tab → add a row with matching `courseId` (`c14`), `name`, `subject`, `totalModules`, `status`, `adhyayanProjectId`
4. Commit and push to `main` → Cloudflare auto-deploys
5. Click Pull in the app to load the new course from the sheet

The hardcoded entry provides icon/desc/cat (sheet doesn't have those). The sheet provides name/modules/status/adhyayanProjectId (overrides hardcoded values).

### 2. How to refresh progress data (Adhyayan → Sheet)

This is a manual process. The Progress sheet tab is populated from Adhyayan via Metabase export.

1. Open Metabase → Adhyayan progress query → run for current date range
2. Export results as CSV
3. Open Google Sheet → `Progress` tab → clear existing rows (keep header)
4. Paste CSV contents starting at row 2
5. Verify column headers match exactly: `teacherId`, `courseId`, `pct`, `completionStatus`, `kc1Score`, `kc2Score`, `avgScore`, `lastUpdated`, `adhyayanUserId`, `name`
6. Have admins click Pull in TrainOS to load fresh data

**Frequency:** Currently manual. Should run weekly minimum. Auto-refresh via Apps Script time trigger is in the backlog.

### 3. How to assign a course to teachers in bulk

1. Open https://trainops-brightchamps.pages.dev → log in
2. Navigate to Courses page
3. Click "Assign Teachers" on the target course card
4. Step 2: Select multiple teachers via checkboxes (search by name/email to filter)
5. Step 3: Set deadline (defaults to today + 30 days)
6. Click Confirm
7. Auto-push fires after 500ms → assignments saved to Supabase
8. Pending dot (●) appears next to each new row, clears after Push completes
9. Verify in Teachers → Assignments tab that all rows show with correct deadline

**Limits:** No upper limit enforced. Tested with 50+ in one bulk assign.

### 4. How to check which teachers are overdue

1. Dashboard → click the "Overdue" KPI card → navigates to Teachers page with overdue filter pre-applied
2. OR: Teachers → Assignments tab → click "Overdue" filter pill
3. Sort by Days Left (ascending) to see most overdue first
4. Days shown as red `Xd over` for past deadline, amber `Xd left` for ≤7 days, grey for >7 days
5. To remind: select rows via checkbox → "Send Reminder (N)" button (currently shows toast only, no email — see Section 8)

### 5. How to redeploy after a code change

1. Make code changes locally
2. `pnpm build` — verify zero errors locally
3. `git add -A && git commit -m "..." && git push origin main`
4. Cloudflare Pages auto-detects the push and starts a new build (~1-2 min)
5. Watch progress in Cloudflare dashboard → trainops-brightchamps → Deployments
6. Once green, hard-refresh `https://trainops-brightchamps.pages.dev` (Cmd+Shift+R) to bypass cache
7. Verify the change is live

**Rollback:** Cloudflare Pages → Deployments → click any previous deployment → "Rollback to this deployment". Takes ~30 seconds.

---

## Summary

TrainOS is a working admin tool for BrightChamps' teacher training program. The core flow (assign → track → identify overdue) is solid. Two known partial features need post-handover work: **email reminders** (button is honest about being unconfigured) and **module-level analytics** (placeholder until Metabase is wired).

**The single biggest operational risk is Supabase free-tier auto-pause** — the backend goes silent after ~7 days of inactivity and someone has to manually restore it. The app now handles this gracefully on the frontend (added 2026-04-10 in `3a8269d`), but the only permanent fix is a paid Supabase plan or a keep-alive cron. See [TROUBLESHOOTING.md § 1](./TROUBLESHOOTING.md#1-live-site-shows-a-blank-page).

The system has been deliberately designed to fail loudly rather than fake success. Pull validates data arrived. Push only clears pending state if Supabase confirms write. The "Reminder" button explicitly says "not yet configured" instead of pretending to send. These are intentional design choices documented in [DECISIONS.md](./DECISIONS.md) and [MEMORY.md](./MEMORY.md).

For any handover questions, read [README.md](./README.md) first, then [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues. The `audit/` folder contains 6 historical reports showing every bug found during development and how each was fixed.
