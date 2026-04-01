# TrainOS — Final Pre-Deployment Audit

**Date:** 2026-03-30
**Build:** `pnpm build` passes (794 KB bundle)
**Purpose:** Single deployment to fix everything remaining

---

## SECTION 1: Code Quality

### 1.1 Console Statements

| File | Line | Statement | Verdict |
|------|------|-----------|---------|
| App.jsx | 81 | `console.log('[debug] first merged row:', result[0])` | REMOVE — debug noise |
| api.js | 80 | `console.log('[api] fetchTeachers URL:', url)` | REMOVE — debug noise |
| api.js | 87 | `console.info('[api] Teachers sheet is empty, using seed data')` | KEEP — ops |
| api.js | 90 | `console.log('[api] sample joinDate raw:', rows?.[0]?.joinDate)` | REMOVE — debug noise |
| api.js | 110 | `console.error('[api] fetchTeachers FAILED:', e)` | KEEP — ops |
| api.js | 123 | `console.info('[api] Courses sheet is empty, using hardcoded courses')` | KEEP — ops |
| api.js | 143 | `console.info('[api] fetchCourses: ... in sheet, ... total')` | KEEP — ops |
| api.js | 146 | `console.error('[api] fetchCourses FAILED:', e)` | KEEP — ops |
| api.js | 159 | `console.info('[api] Assignments sheet is empty')` | KEEP — ops |
| api.js | 171 | `console.warn('[api] fetchAssignments failed')` | KEEP — ops |
| api.js | 184 | `console.log('[api] Progress first 3 parsed objects:', rows.slice(0,3))` | REMOVE — debug noise |
| api.js | 199 | `console.info('[api] fetchProgress: ... total, ... valid')` | KEEP — ops |
| api.js | 201 | `console.warn('[api] Progress: all rows filtered out...')` | KEEP — ops |
| api.js | 205 | `console.error('[api] fetchProgress FAILED:', e)` | KEEP — ops |
| api.js | 251 | `console.warn('[api] pushTeacher: Supabase error')` | KEEP — ops |
| api.js | 255 | `console.error('[api] pushTeacher failed:', e)` | KEEP — ops |
| api.js | 272 | `console.log('[api] pushAssignments: upserting N rows')` | KEEP — ops |
| api.js | 275 | `console.warn('[api] pushAssignments: Supabase upsert error')` | KEEP — ops |
| api.js | 277 | `console.log('[api] pushAssignments: Supabase success')` | KEEP — ops |
| api.js | 282 | `console.error('[api] pushAssignments failed:', e)` | KEEP — ops |
| sheetsWriter.js | 4 | `console.warn('[sheets] VITE_SHEET_WRITER_URL not set')` | KEEP — ops |
| sheetsWriter.js | 24 | `console.log('[sheets] write sent (no-cors)')` | KEEP — ops |
| sheetsWriter.js | 27 | `console.error('[sheets] write failed:', err)` | KEEP — ops |

**4 to REMOVE, 19 to KEEP.**

### 1.2 TODO Comments

None found.

### 1.3 Hardcoded Values

| File | Value | Issue | Fix needed? |
|------|-------|-------|-------------|
| AssignModal.jsx:12 | `"2026-04-30"` default deadline | Will be stale after April 2026 | P2 — compute 30 days from today |
| AddTeacherModal.jsx:5 | `["Codechamps","MathChamps","Finchamps","Robochamps"]` | Duplicated in Teachers.jsx:139 | P1 — centralize in nav.js |
| Teachers.jsx:139 | Same verticals list | Duplicate | P1 — import from shared constant |
| Analytics.jsx:18 | `"c1"` default course | Assumes c1 always exists | P2 — use `courses[0]?.id` |
| Courses.jsx:21 | `"+ New Course"` button | No onClick handler | P1 — either wire or remove |

### 1.4 Dead Code

| File | Issue |
|------|-------|
| data/teachers.js | `INIT_ASSIGNMENTS` exported but never imported (removed from api.js and App.jsx) |
| data/teachers.js | `BATCHES` exported but never imported (bLbl removed) |

---

## SECTION 2: Data Flow

### 2.1 Assignment Lifecycle

| Step | Status | Notes |
|------|--------|-------|
| Created in AssignModal → handleAssign | ✅ | Adds to state with `_pending:true` |
| Appears in Teachers assignments tab | ✅ | mergeData joins teacher+course |
| Duplicate guard | ✅ | Filters existing teacherId+courseId |
| Auto-push fires (useEffect) | ⚠️ | 500ms delay, relies on state settling |
| Push → Supabase upsert | ⚠️ | Works but Supabase errors are warned, not thrown (non-blocking) |
| Push → Google Sheet write | ⚠️ | no-cors mode, can't confirm success |
| Pull → reads from Sheet | ✅ | parseSheetJson handles both col modes |
| Pull → merges with pending | ✅ | `[...sheetAssigns, ...pendingAssigns]` |
| Persist across refresh | ⚠️ | Only if Sheet write succeeded before refresh. No localStorage fallback. |

### 2.2 Progress Lifecycle

| Step | Status | Notes |
|------|--------|-------|
| Adhyayan DB → Progress sheet | ✅ | Manual export, 2657 rows |
| Sheet → fetchProgress | ✅ | parseSheetJson parses, filter teacherId > 0 |
| Progress → mergeData | ✅ | Matches on teacherId + courseId |
| mergeData → Teachers UI | ✅ | pct, kc1Score, kc2Score, avgScore on merged row |
| Teachers without progress | ✅ | `prog?.pct ?? 0` fallback |

### 2.3 Page Refresh

| State | On refresh |
|-------|-----------|
| `teachers` | Resets to INIT_TEACHERS (20 seed). Must Pull to get 847 from sheet. |
| `assignments` | Resets to `[]`. Must Pull to get from sheet. |
| `courses` | Resets to hardcoded COURSES (13). Must Pull for sheet overrides. |
| `progress` | Resets to `[]`. Must Pull. |
| `session` | Persisted by Supabase auth (survives refresh). |
| Pending items | **LOST** unless Push completed before refresh. |

---

## SECTION 3: UI/UX Bugs

### 3.1 Potential Render Issues

| File:Line | Expression | Risk | Fix |
|-----------|-----------|------|-----|
| Analytics.jsx:19 | `const c = courses.find(x=>x.id===cid)` | CRITICAL — `c` can be undefined if cid not in courses | Add `if (!c) return <EmptyState .../>` guard |
| Analytics.jsx:20 | `c.completed`, `c.enrolled` | Crashes if c is undefined | Guarded by fix above |
| Teachers.jsx:119 | `Math.round(a.pct/100*c.modules)` | NaN if pct is undefined | `a.pct` comes from mergeData which defaults to 0 — OK |
| Teachers.jsx:232 | `dLeft(r.deadline)` → `${Math.abs(dl)}d over` | NaN if deadline is empty string | `dLeft('')` → NaN → "NaNd over" |
| helpers.js:16 | `dLeft = d => Math.ceil((new Date(d)-new Date())/86400000)` | NaN on invalid date | No guard |

### 3.2 Dead Buttons

| File:Line | Button | Issue |
|-----------|--------|-------|
| Courses.jsx:21 | `+ New Course` | No onClick handler — does nothing |

### 3.3 Navigation Issues

None found — all routes work correctly.

### 3.4 Empty States

All empty states render correctly when data is empty.

### 3.5 Mobile Responsiveness

The app uses `display:flex` with a fixed 210px sidebar. No explicit min-width. On tablet (768px), the main content area gets ~558px — usable but tight for the 8-column assignment table. On phone (<480px), the sidebar and table will overflow.

---

## SECTION 4: Security

### 4.1 XSS Risk

All user inputs (search, name, email) are rendered via React JSX which auto-escapes. No `dangerouslySetInnerHTML` found. **Low risk.**

### 4.2 Supabase Anon Key

Yes, `VITE_SUPABASE_ANON_KEY` is embedded in the bundle. This is expected for Supabase — the anon key is designed to be public. Security relies on RLS policies (not yet configured). **Acceptable for current stage, must add RLS before production.**

### 4.3 Unauthenticated Routes

No routes are accessible without auth. `if (!session) return <Login />` guards the entire app. The ErrorBoundary is inside the authenticated wrapper. **Secure.**

---

## SECTION 5: Performance

### 5.1 Bundle Size

794 KB (226 KB gzipped). Recharts is the largest dependency (~300KB). Could be code-split with dynamic import on the Analytics route. **P2.**

### 5.2 N+1 Patterns

`mergeData()` does `teachers.find()`, `courses.find()`, `progress.find()` inside `assignments.map()`. With 847 teachers × 40 assignments, this is O(n×m). Convert to Map lookups for better performance. **P2** — not noticeable with current data size.

### 5.3 useMemo/useEffect

All dependency arrays are correct. No missing deps. The auto-push `useEffect` on `[assignments]` could fire unnecessarily on Pull (when assignments change but none are pending) — the `if (pending.length > 0)` guard handles this correctly.

---

## SECTION 6: Remaining QA Failures

Cross-referenced with the earlier QA test plan:

| ID | Issue | Status | Fix needed | Effort |
|----|-------|--------|-----------|--------|
| D03 | joinDate parsing | ✅ FIXED | parseJoinDate handles Date(Y,M,D), "Month D, YYYY", YYYY-MM-DD | — |
| D06 | Progress col.label detection | ✅ FIXED | parseSheetJson handles both col modes | — |
| A02 | Duplicate assignment | ✅ FIXED | Guard in handleAssign | — |
| A05 | Merged assignment may not find teacher | ⚠️ STILL PARTIAL | Seed teacher ids (1-20) won't match sheet ids (18000+). Only matters during first load before Pull. | S — acceptable |
| A06 | Assignments lost on refresh | ⚠️ STILL PARTIAL | Sheet writer wired but no-cors can't confirm success. No localStorage fallback. | M |
| A09 | Push to Sheet | ⚠️ IMPROVED | sheetsWriter sends no-cors POST. Can't verify response. | S — test with real Apps Script |
| A13 | Auto-push timing | ✅ FIXED | useEffect with 500ms delay replaces setTimeout | — |
| P04 | KC scores in profile | ✅ FIXED | Shows KC1/KC2/Avg in profile assignment cards | — |
| T05 | Vertical filter | ✅ FIXED | Dropdown in roster view | — |
| T07 | StatusTag for Active/Inactive | ✅ FIXED | Map-based lookup with fallback | — |
| T09 | Profile teamLead/region | ✅ FIXED | Added to profile header | — |
| T10 | Learning path link | ✅ FIXED | Clickable link in profile | — |
| DA02-04 | Dashboard KPIs show 0 | ✅ FIXED | Assignments start as [], honest 0 | — |
| AN05 | c1 14 vs 13 modules mismatch | ⚠️ COSMETIC | Sheet says 14, MODULES has 13 entries. Low priority. | S |

---

## FINAL FIX LIST

### P0 — Must fix before sharing

| # | Description | File(s) | Effort |
|---|-------------|---------|--------|
| 1 | Analytics.jsx: guard against undefined `c` when course not found | Analytics.jsx:19 | S |
| 2 | Remove 4 debug console.logs | api.js, App.jsx | S |
| 3 | Guard `dLeft()` against invalid dates (return 0 instead of NaN) | helpers.js:16 | S |
| 4 | Remove dead exports: INIT_ASSIGNMENTS, BATCHES from teachers.js | teachers.js | S |

### P1 — Must fix before handover

| # | Description | File(s) | Effort |
|---|-------------|---------|--------|
| 5 | Centralize VERTICALS constant (duplicated in AddTeacherModal + Teachers) | nav.js, AddTeacherModal.jsx, Teachers.jsx | S |
| 6 | Remove or wire "+ New Course" button (currently dead) | Courses.jsx:21 | S |
| 7 | Default deadline in AssignModal: compute 30 days from today instead of hardcoded "2026-04-30" | AssignModal.jsx:12 | S |
| 8 | Analytics default course: use `courses[0]?.id || "c1"` instead of hardcoded "c1" | Analytics.jsx:18 | S |

### P2 — Nice to have, post-handover

| # | Description | File(s) | Effort |
|---|-------------|---------|--------|
| 9 | localStorage fallback for pending assignments (survive refresh) | App.jsx | M |
| 10 | Code-split Analytics route (Recharts is ~300KB) | App.jsx, Analytics.jsx | M |
| 11 | Convert mergeData find() loops to Map lookups for perf | api.js | M |
| 12 | Update MODULES[c1] to have 14 entries (match sheet totalModules) | courses.js | S |
| 13 | Add Supabase RLS policies before production | Supabase dashboard | M |
| 14 | Mobile responsive: add min-width or collapse sidebar on small screens | App.jsx | L |
