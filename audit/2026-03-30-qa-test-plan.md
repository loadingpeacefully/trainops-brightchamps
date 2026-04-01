# TrainOS — QA Test Plan

**Date:** 2026-03-30
**Build:** `pnpm build` passes
**Data:** Google Sheet with 4 tabs (Teachers: 848, Courses: 13, Assignments: 0, Progress: 2657)

---

## 1. DATA LOADING (Pull)

| ID | Feature | Test Case | Expected | Status | Root Cause |
|----|---------|-----------|----------|--------|------------|
| D01 | Teachers load | Click Pull → check teacher count | 847 teachers in state (1 filtered for blank name) | 🔲 UNTESTED | — |
| D02 | Teacher fields | After Pull, open teacher profile | Shows name, email, vertical, teamLead, region, joinDate, status | 🔲 UNTESTED | — |
| D03 | joinDate parsing | Teacher joinDate shows in profile | "28 Mar 2026" not "Invalid Date" | ⚠️ PARTIAL | `new Date("March 28, 2026")` works in Chrome but may fail in Safari. Parsing human-readable dates via `new Date()` is locale-dependent. Fix: use explicit month parsing if Safari breaks. |
| D04 | Courses load | Click Pull → check courses | 13 courses (12 active + 1 draft from hardcoded fallback) | ✅ PASS | fetchCourses starts from hardcoded COURSES.map, sheet overrides name/modules/status only |
| D05 | Course merge | Course cards show icon, desc, enrolled, avg | All hardcoded fields preserved, sheet overrides name/status/modules | ✅ PASS | `{...hc, ...sheetOverrides}` pattern |
| D06 | Progress load | Click Pull → check console | Shows `[api] fetchProgress: 2656 total rows, N with valid teacherId` | ⚠️ PARTIAL | Depends on parseSheetJson correctly detecting col.label vs row-as-header mode. If col.label empty, first row is used as headers and teacherId column may map incorrectly. |
| D07 | Progress teacherId join | Progress rows with teacherId > 0 are kept | ~600 rows expected (only those with filled teacherId) | ⚠️ PARTIAL | If parseSheetJson returns wrong keys, all rows get teacherId=0 → filtered to 0. Console warn fires. |
| D08 | Assignments load (empty) | Pull with empty Assignments sheet | Falls back to seed data (40 assignments from INIT_ASSIGNMENTS, pct stripped) | ✅ PASS | `rows.length === 0` check returns seed |
| D09 | Pull merge pending | Add teacher locally → Pull → teacher still in list | Local _pending teachers preserved, sheet teachers loaded fresh | ✅ PASS | `[...sheetTeachers, ...pendingTeachers]` merge |
| D10 | Pull no wipe | Add teacher (pending) → Pull → pending teacher stays with orange dot | _pending flag survives Pull | ✅ PASS | Only `_pending:true` items kept from previous state |
| D11 | Teachers without progress | Teacher with no matching progress row | Shows pct:0, completionStatus:'Not Started' in merged data | ✅ PASS | `mergeData`: `prog?.pct ?? 0` fallback |
| D12 | Network failure on Pull | Disconnect network → Pull | "Pull failed" in console, existing data stays, syncStatus returns to idle | ✅ PASS | try/catch in handlePull, catch sets idle |

---

## 2. ASSIGNMENTS

| ID | Feature | Test Case | Expected | Status | Root Cause |
|----|---------|-----------|----------|--------|------------|
| A01 | Assign 1 teacher | Open AssignModal → select course → select 1 teacher → confirm | Assignment appears in state with _pending:true | ✅ PASS | handleAssign pushes to assignments state |
| A02 | Duplicate check | Assign same course to same teacher twice | ❌ FAIL | No duplicate check exists. `handleAssign` always creates new assignment objects with `id:Date.now()+tid`. Same teacher+course can be assigned multiple times. Fix: in `handleAssign` (App.jsx:88), check `assignments.some(a=>a.teacherId===tid && a.courseId===cid)` before creating. |
| A03 | Multi-course same teacher | Assign c1, then c2, to same teacher | Both assignments appear | ✅ PASS | Each gets unique id |
| A04 | Multi-teacher same course | Select course → select 3 teachers → confirm | 3 assignments created | ✅ PASS | `tids.map(tid=>({...}))` |
| A05 | Appears in tab | After assign, Assignments tab shows new row | Row shows with _pending orange dot | ⚠️ PARTIAL | Depends on mergeData finding matching teacher+course. If teacher id from seed data doesn't match sheet teacher ids, row is filtered out by `.filter(r => r.teacher && r.course)`. |
| A06 | Persist after refresh | Assign → refresh page | ❌ FAIL | Assignment is in React state only. Page refresh reloads from sheet (empty) + seed data. Local assignment is lost. No localStorage persistence. Fix: either persist to localStorage on assign, or ensure Push writes to sheet. |
| A07 | Persist after Pull | Assign → Pull | ✅ PASS | Pending assignments survive Pull merge |
| A08 | Push to Supabase | Assign → Push button | Upsert to Supabase `assignments` table | ⚠️ PARTIAL | Push calls `pushAssignments()` which upserts to Supabase. Will fail if Supabase `assignments` table doesn't exist yet. Console logs success/failure. |
| A09 | Push to Sheet | After Push, assignment in Google Sheet | ❌ FAIL | Not implemented. `pushAssignments` has a TODO comment. Assignments sheet stays empty. On next Pull, assignment disappears (sheet wins). Fix: wire Google Apps Script web app to append rows to sheet. |
| A10 | Pending dot | New assignment shows orange ● | Dot visible in Teacher column | ✅ PASS | `r._pending && <span>●</span>` in Teachers.jsx:212 |
| A11 | Push clears pending | Push succeeds → pending dots gone | _pending set to false on all items | ✅ PASS | `setAssigns(p => p.map(a => ({...a, _pending:false})))` |
| A12 | Push failure retry | Push fails (Supabase down) → pending stays | User can click Push again | ✅ PASS | Catch block sets syncStatus to idle, doesn't clear _pending |
| A13 | Auto-push after assign | Assign course → Push fires automatically | Push runs 100ms after assign | ⚠️ PARTIAL | `setTimeout(()=>handlePush(), 100)` — but handlePush reads `pendingT+pendingA` from useMemo which may not have updated yet in 100ms (React batching). The pending count could be 0 when handlePush runs, causing it to return early. Fix: use useEffect to watch for pending changes, or pass pending items directly. |

---

## 3. PROGRESS DISPLAY

| ID | Feature | Test Case | Expected | Status | Root Cause |
|----|---------|-----------|----------|--------|------------|
| P01 | Matched teacher pct | Teacher 18780 (Sanyukta) with progress → assignment row | Shows real pct from Progress sheet | ⚠️ PARTIAL | Requires: (1) teacher has assignment, (2) progress row has matching teacherId+courseId. Currently 0 assignments in sheet, so mergeData returns []. No rows to display progress on. |
| P02 | Unmatched teacher | Teacher with no teacherId in Progress | Shows pct:0, status:Not Started | ✅ PASS | `prog?.pct ?? 0` in mergeData |
| P03 | Progress bar color | Red=overdue, amber=<30%, green=completed, brand=in progress, grey=not started | Colors follow hColor() logic | ✅ PASS | hColor in helpers.js checks status/deadline/pct |
| P04 | KC scores in profile | Click teacher → profile drilldown → KC1/KC2/avg | ❌ FAIL | Profile drilldown (Teachers.jsx:73-123) does NOT display kc1Score, kc2Score, avgScore anywhere. These fields exist in merged data but no UI renders them. Fix: add KC score display to profile view. |
| P05 | Days Left column | Assignment row shows "Xd left" or "Xd over" | Correct calculation from deadline | ✅ PASS | `dLeft(r.deadline)` in Teachers.jsx:207 |
| P06 | Overdue display | Past deadline → red text "Xd over" | Shows red with absolute days | ✅ PASS | `late?C.red:...` and `Math.abs(dl)` |

---

## 4. TEACHER ROSTER

| ID | Feature | Test Case | Expected | Status | Root Cause |
|----|---------|-----------|----------|--------|------------|
| T01 | All teachers show | Click "All Teachers" tab | 847 teachers listed | ✅ PASS | RosterView maps over `teachers` prop directly |
| T02 | Default tab | Open Teachers page with 0 assignments | Defaults to "roster" tab | ✅ PASS | `useState(assignments?.length>0?"assignments":"roster")` |
| T03 | Search by name | Type "Ardhendu" in search | Filters to matching teachers | ✅ PASS | `t.name.toLowerCase().includes(search)` |
| T04 | Search by email | Type "ardhendu" in search | Matches email too | ✅ PASS | `t.email.toLowerCase().includes(search)` |
| T05 | Filter by vertical | No vertical filter exists | ❌ FAIL | RosterView has no vertical filter dropdown. Only search box. Teachers.jsx roster has no filter by vertical/region/status. Fix: add a vertical dropdown filter in the roster view toolbar. |
| T06 | Joined date display | Teacher row shows "28 Mar" | Not "Invalid Date" | ⚠️ PARTIAL | Depends on joinDate parsing in fetchTeachers (D03). `fmtS(t.joinDate)` works if YYYY-MM-DD. |
| T07 | Status badge | Active/Inactive/Offboarding show correctly | StatusTag renders the status string | ⚠️ PARTIAL | StatusTag was designed for "In Progress"/"Not Started"/"Completed". Teacher statuses are "Active"/"Inactive"/"Offboarding" — these won't match the color logic in Tag.jsx. They'll render as plain text with default styling. Fix: update StatusTag to handle Active/Inactive/Offboarding. |
| T08 | Click → profile | Click teacher name → profile view | Profile opens with teacher details | ✅ PASS | `setProfile(t.id)` → profile render |
| T09 | Profile vertical/teamLead/region | Profile shows vertical, teamLead, region | ❌ FAIL | Profile (Teachers.jsx:83-88) shows `t.email · t.phone` and `t.vertical`. Does NOT show teamLead or region. Fix: add teamLead and region to profile display. |
| T10 | Learning path link | Profile shows clickable learningPathLink | ❌ FAIL | `learningPathLink` is in the teacher object but NOT rendered anywhere in the profile. Fix: add a link/button in profile view. |
| T11 | Profile assignments | Profile shows teacher's assigned courses | Shows assignments from merged data with progress | ⚠️ PARTIAL | Works when assignments exist. With empty Assignments sheet + seed fallback, seed teacher ids (1-20) won't match sheet teacher ids (18000+). Profile shows "No Courses Assigned". |

---

## 5. COURSES PAGE

| ID | Feature | Test Case | Expected | Status | Root Cause |
|----|---------|-----------|----------|--------|------------|
| C01 | Course count | 12 active + 1 draft | 13 cards rendered | ✅ PASS | fetchCourses preserves all hardcoded courses |
| C02 | Card fields | Name, icon, modules, enrolled, avg visible | All fields from hardcoded COURSES | ✅ PASS | `{...hc, ...sheetOverrides}` |
| C03 | Subject filter | Click "Maths" pill | Shows only maths courses | ✅ PASS | `catFilter` state + CATEGORIES filter |
| C04 | Assign button | Click "Assign Teachers" on course card | AssignModal opens with course pre-selected | ✅ PASS | `setAssignOpen(c.id)` |
| C05 | Analytics button | Click "Analytics" on course card | Navigates to /analytics | ✅ PASS | `navigate("/analytics")` |
| C06 | Draft course | c13 shows with 60% opacity + "Draft" badge | Draft styling applied | ✅ PASS | `c.status==="draft"` check |

---

## 6. ANALYTICS PAGE

| ID | Feature | Test Case | Expected | Status | Root Cause |
|----|---------|-----------|----------|--------|------------|
| AN01 | Course picker | 12 active courses as pills | All active courses shown | ✅ PASS | `courses.filter(c=>c.status==="active")` |
| AN02 | Module funnel | Select c1 → funnel chart renders | BarChart with reached/completed bars | ✅ PASS | MODULES[cid] provides data |
| AN03 | KPI update | Switch course → KPIs change | Enrolled, completion rate, at risk update | ✅ PASS | `c=courses.find(x=>x.id===cid)` re-evaluates |
| AN04 | Module health table | Table rows with health badges | Good/Watch/Critical/Inactive labels | ✅ PASS | `hs()` function maps health to color/label |
| AN05 | c1 modules=14 | Sheet says 14 modules, hardcoded says 13 | ⚠️ PARTIAL | fetchCourses overrides `modules: parseInt(s.totalModules) || hc.modules`. Sheet has 14, so modules=14. But MODULES[c1] has 13 entries. Module funnel shows 13 rows but header says "14 modules". Cosmetic mismatch. |

---

## 7. DASHBOARD

| ID | Feature | Test Case | Expected | Status | Root Cause |
|----|---------|-----------|----------|--------|------------|
| DA01 | Active courses | KPI card shows 12 | `courses.filter(c=>c.status==="active").length` | ✅ PASS | |
| DA02 | In Training | Count of teachers with at least 1 in-progress assignment | Based on mergedAssignments (currently 0 with empty Assignments sheet) | ⚠️ PARTIAL | Shows 0 when Assignments sheet is empty. With seed fallback assignments, seed teacher ids (1-20) don't match sheet teacher ids → mergeData filters them out → 0. |
| DA03 | Not Started | Assignment count where status=Not Started | Same issue as DA02 | ⚠️ PARTIAL | |
| DA04 | Overdue | Assignments past deadline | Same issue as DA02 | ⚠️ PARTIAL | |
| DA05 | KPI click → Teachers | Click "In Training" KPI → navigate to /teachers with filter | Filter applied, Teachers page opens | ✅ PASS | `handleFilterTeachers` sets tFilter + navigates |
| DA06 | By Subject cards | 4 cards: Coding, Maths, Fin. Literacy, Robotics | Shows count, enrolled, avgComp from hardcoded data | ✅ PASS | catSummary iterates CATEGORIES |

---

## 8. AUTH

| ID | Feature | Test Case | Expected | Status | Root Cause |
|----|---------|-----------|----------|--------|------------|
| AU01 | Google login BC | Login with @brightchamps.com | Redirects to app, session created | ✅ PASS | Supabase OAuth + redirectTo |
| AU02 | Google login blocked | Login with @gmail.com | Signs out + shows error | ✅ PASS | Login.jsx onAuthStateChange checks email domain |
| AU03 | Logout | Click "Sign out" in sidebar | Returns to login screen | ✅ PASS | `supabase.auth.signOut()` |
| AU04 | Refresh persistence | Login → refresh page | Stays logged in | ✅ PASS | `supabase.auth.getSession()` on mount |

---

## 9. SYNC BAR

| ID | Feature | Test Case | Expected | Status | Root Cause |
|----|---------|-----------|----------|--------|------------|
| S01 | 4 tab names | SyncBar shows Teachers, Courses, Assignments, Progress | 4 pills with icons | ✅ PASS | nav.js SHEETS matches sheet tabs |
| S02 | Pending count | Add teacher → count increments | "1 pending write" shows | ✅ PASS | `pendingT + pendingA` |
| S03 | Push button count | 3 pending → button shows "(3)" | Push (3) label | ✅ PASS | `Push {pending>0?`(${pending})`:``}` |
| S04 | Push success | Push → clears pending | Count goes to 0, dots removed | ⚠️ PARTIAL | Works for local state. Supabase write may fail if table doesn't exist. |
| S05 | Push failure | Supabase down → Push | Error in console, pending stays | ✅ PASS | Catch block preserves pending state |

---

## 10. EDGE CASES

| ID | Feature | Test Case | Expected | Status | Root Cause |
|----|---------|-----------|----------|--------|------------|
| E01 | Empty Assignments sheet | Pull with no assignment rows | Seed fallback, no crash | ✅ PASS | |
| E02 | Empty Progress sheet | Pull with no progress rows | All teachers show 0%, no crash | ✅ PASS | |
| E03 | Teacher no adhyayanUserId | Teacher row with blank adhyayanUserId | No crash, field is empty string | ✅ PASS | `String(r.adhyayanUserId || '').trim()` |
| E04 | Course not in hardcoded | Sheet has courseId "c99" not in COURSES | ❌ N/A | fetchCourses starts from hardcoded COURSES.map — sheet-only courses are ignored. If a sheet row has a courseId not in hardcoded, it's silently dropped. Not a crash, but a data gap. |
| E05 | Network failure Pull | Kill network → Pull | Graceful error, existing data preserved | ✅ PASS | |
| E06 | Supabase down Push | Supabase unreachable → Push | Error logged, pending stays | ✅ PASS | |
| E07 | Error boundary | Component crash during render | "Something went wrong" with Try again button | ✅ PASS | ErrorBoundary in App.jsx wraps Routes |
| E08 | CATEGORIES mismatch | Course with unknown cat value | Falls back to CATEGORIES['coding'] | ✅ PASS | `CATEGORIES[x] || CATEGORIES['coding']` guard |

---

## Failure Summary

### CRITICAL (app-breaking)

| ID | Issue | Fix |
|----|-------|-----|
| — | None currently. ErrorBoundary catches render crashes. | — |

### HIGH (data loss or wrong data)

| ID | Issue | Fix |
|----|-------|-----|
| A06 | Assignments lost on page refresh | Persist pending assignments to localStorage, or ensure Push writes to sheet before refresh |
| A09 | Push doesn't write to Google Sheet | Wire Google Apps Script web app URL to append assignment rows to Assignments sheet tab |
| A13 | Auto-push after assign may not fire | `handlePush()` runs via setTimeout(100ms) but `pendingA` useMemo may not have updated yet. Use `useEffect` watching assignments for pending items, or call push with explicit pending list |
| A02 | No duplicate assignment check | Add `assignments.some(a=>a.teacherId===tid && a.courseId===cid)` guard in handleAssign |
| DA02-04 | Dashboard KPIs show 0 | Seed teacher ids (1-20) don't match sheet teacher ids (18000+). mergeData returns [] for seed assignments. Either remove seed fallback for assignments, or update seed data to use real teacher ids. |

### MEDIUM (UX issues)

| ID | Issue | Fix |
|----|-------|-----|
| T05 | No vertical filter in roster | Add vertical dropdown filter in Teachers roster view toolbar |
| T07 | StatusTag doesn't handle Active/Inactive/Offboarding | Update StatusTag in Tag.jsx to map these teacher statuses to appropriate colors |
| T09 | Profile missing teamLead + region | Add teamLead and region display to Teachers.jsx profile view (line ~84) |
| T10 | Learning path link not shown | Add clickable link in profile view for `t.learningPathLink` |
| P04 | KC scores not displayed | Add kc1Score/kc2Score/avgScore to profile assignment cards |
| AN05 | c1 shows 14 modules in card but funnel has 13 rows | Sheet says 14, MODULES has 13 entries. Update MODULES[c1] to have 14 entries, or accept cosmetic mismatch |
| A05 | Merged assignment may not find teacher | Seed teacher ids (1-20) vs sheet ids (18000+). When assignments sheet is empty, seed fallback assignments reference ids 1-20 which don't exist in sheet teachers |

### LOW (cosmetic)

| ID | Issue | Fix |
|----|-------|-----|
| D03 | joinDate parsing locale-dependent | `new Date("March 28, 2026")` works in Chrome but may fail in Safari. Add explicit month name parsing as fallback. |
| E04 | Sheet-only courses (not in hardcoded) are silently dropped | fetchCourses starts from COURSES.map — any sheet courseId not in hardcoded array is ignored. Add append logic for new sheet-only courses if needed. |
