# TrainOS — System Architect Audit Report

**Date:** 2026-03-30
**Trigger:** App goes blank after Pull with real Google Sheets data
**Auditor:** Claude Code
**Build:** `pnpm build` passes — runtime crash only

---

## Confirmed Symptoms

| # | Symptom | Status |
|---|---------|--------|
| 1 | fetchTeachers returns 847 rows | OK |
| 2 | fetchCourses returns 12 rows (expected 13 — c13 draft missing) | ISSUE |
| 3 | fetchAssignments returns 0 rows (empty sheet, expected) | OK |
| 4 | fetchProgress returns 2656 rows but 0 with valid teacherId | ISSUE |
| 5 | Courses page crashes: "Cannot read properties of undefined (reading 'color')" | CRASH |
| 6 | Teachers page shows 0 teachers after Pull | CASCADE |

---

## SECTION 1: Data Flow Trace

### 1. Props passed to Teachers after handlePull

From `src/App.jsx:178`:
```
teachers={teachers}             ← 847 real teachers from sheet + 0 pending
assignments={mergedAssignments} ← useMemo → mergeData(teachers, assignments, progress, courses)
courses={courses}               ← 12 courses from sheet (c13 draft missing)
```

`mergedAssignments` = `mergeData(847 teachers, [] assignments, [] progress, 12 courses)` = `[]`
Because mergeData maps over assignments, and assignments is empty.

### 2. mergeData() with assignments=[]

```js
// src/lib/api.js:169-187
export function mergeData(teachers, assignments, progress, courses) {
  return assignments.map(a => { ... }).filter(r => r.teacher && r.course);
}
```

`[].map(...)` = `[]`. Returns empty array. Teachers page receives `assignments=[]`.

### 3. "All Teachers" tab data source

- **RosterView** (Teachers.jsx:132): maps over `teachers` prop directly — NOT mergedAssignments
- **Tab count** (Teachers.jsx:164): `["roster","All Teachers",teachers.length]` — raw prop
- This should show 847 teachers. If it shows 0, the page isn't rendering at all (cascade crash).

### 4. Fields Courses.jsx reads from each course object

| Field | Line(s) | Used for |
|-------|---------|----------|
| `c.status` | 17, 21, 26, 32, 40, 45, 46, 67, 79, 80 | Filtering active/draft, conditional render |
| `c.cat` | 17, 26, 32 | Category grouping, CATEGORIES lookup |
| `c.enrolled` | 21, 40, 60 | Stats display, `.toLocaleString()` |
| `c.icon` | 53 | Course card icon |
| `c.name` | 55 | Course card title |
| `c.desc` | 56 | Course card description |
| `c.modules` | 60 | Module count display |
| `c.avg` | 71, 73 | Avg completion bar |
| `c.id` | 44, 78 | Key, assign handler |

Also: `CATEGORIES[catId]` looked up at line 32 — returns `{label, color, lo, bg}`.
If catId not in CATEGORIES → `cat` is `undefined` → `cat.color` CRASH.

### 5. What fetchCourses() actually returns

```js
// src/lib/api.js:86-104
const hc = COURSES.find(c => c.id === cid) || {};
return {
  ...hc,                    // spreads: icon, desc, cat, enrolled, completed, avg (from hardcoded)
  id, courseId, name,       // from sheet (overrides hardcoded)
  subject, cat,             // from sheet subject column
  modules, totalModules,    // from sheet totalModules
  status,                   // from sheet
};
```

The `...hc` spread carries `icon`, `desc`, `enrolled`, `completed`, `avg` from hardcoded COURSES.
If `hc = {}` (no hardcoded match), those fields are missing — `c.enrolled.toLocaleString()` crashes.

Sheet Courses.csv has `subject` values: `coding`, `maths`, `finlit`, `robotics` (lowercase).
CATEGORIES keys: `coding`, `maths`, `finlit`, `robotics` (lowercase).
These match — but only if the Google Sheet returns them exactly as-is.

---

## SECTION 2: Root Cause Analysis

### Bug 6: Courses page crash on 'color'

**Trace:**
1. `Courses.jsx:17` — `activeCats = courses.filter(c=>c.status==="active").map(c=>c.cat)`
2. `Courses.jsx:31-32` — `visibleCats.map(catId => { const cat = CATEGORIES[catId] ... })`
3. `Courses.jsx:36` — `cat.color` → CRASH if cat is undefined

**Root cause:** `CATEGORIES[catId]` returns `undefined` when `catId` is not one of `coding|maths|finlit|robotics`. This happens when:
- A sheet course has `subject` = `null` → `cat: '' || hc.cat || ''` → if `hc.cat` is also empty → `cat = ''` → `CATEGORIES['']` = undefined
- OR `subject` has unexpected casing/whitespace from Google Sheets JSON parsing

**Secondary cause:** If the Courses sheet returns only 12 rows (c13 draft excluded), `c13` disappears from state. Not a direct crash, but data loss.

### Bug 7: Teachers shows 0 after Pull

**Root cause:** This is a **cascade failure**, not a Teachers-specific bug.

The crash in Courses.jsx (or Analytics.jsx or Dashboard.jsx) propagates up the React tree. Since there is **no Error Boundary** in App.jsx, any render crash in any route component unmounts the entire app → blank page.

The Teachers page code is structurally correct. `teachers.length` should show 847. But the app never gets to render it because an earlier crash blanks everything.

### Bug 8: fetchProgress returns 0 with valid teacherId

**Trace:**
```js
// src/lib/api.js:147
teacherId: Number(r.teacherId) || 0,
// ...
.filter(r => r.teacherId > 0);
```

`r.teacherId` is looked up from the parsed sheet row using the header name `teacherId`. If the actual column header in the Google Sheet is different (e.g., `teacher_id`, or `TeacherId`, or has a trailing space), `r.teacherId` is `undefined` → `Number(undefined) || 0` = 0 → filtered out.

**The Progress.csv we generated has header `teacherId`**, but the actual Google Sheet column name may differ if it was renamed or has whitespace. Also, of 2657 progress rows, only ~600 have teacherId filled — the rest are blank. So the expected count after filtering is ~600, not 0.

**If the result is 0, the column header doesn't match.**

---

## SECTION 3: All Other Broken Things

### Components at risk

| Component | File:Line | Issue | Severity |
|-----------|-----------|-------|----------|
| Analytics.jsx | :43 | `CATEGORIES[course.cat]` — same crash as Courses if `cat` doesn't match | CRASH |
| Analytics.jsx | :19 | `courses.find(x=>x.id===cid)` — returns undefined if cid="c1" not in courses → `c.completed` crash | LOW (c1 exists) |
| Analytics.jsx | :20 | `c.completed`, `c.enrolled` — come from `...hc` spread, 0 if unmatched | OK |
| Dashboard.jsx | :12 | `courses.reduce((s,c)=>s+c.enrolled,0)` — NaN if `enrolled` undefined | LOW |
| Dashboard.jsx | :35 | `cat.bg` — iterates CATEGORIES keys, always valid | OK |
| Teachers.jsx | :94 | `ta.reduce((s,a)=>s+a.pct,0)` — `pct` may be undefined on raw assignments | LOW (ta=[] when empty) |
| Teachers.jsx | :103 | `hColor(a.pct,...)` — undefined pct | LOW (path requires ta items) |
| AssignModal.jsx | :31 | `c.enrolled.toLocaleString()` — crashes if enrolled undefined on unmatched course | CRASH if unmatched |

### SyncBar tab config

| nav.js SHEETS | Actual sheet tab |
|---------------|-----------------|
| Teachers | Teachers |
| Courses | Courses |
| Assignments | Assignments |
| Progress | Progress |

**Match confirmed.** SyncBar displays correctly.

### Debug logs still in code

`src/lib/api.js` has 5 `console.log` statements prefixed `[smoke]` from earlier debugging sessions (lines 43, 46, 48, 81, 118). These should be removed before production.

---

## SECTION 4: Fix Plan (Priority Order)

### P0 — CRASH: CATEGORIES lookup guard

**Root cause:** `CATEGORIES[catId]` returns undefined for unexpected cat values.

**Fix:**
- `src/lib/api.js:98` — Normalize: `cat: (subject || hc.cat || '').toLowerCase().trim()`
- `src/components/courses/Courses.jsx:32` — Guard: `const cat = CATEGORIES[catId]; if (!cat) return null;`
- `src/components/analytics/Analytics.jsx:43` — Guard: `const cat = CATEGORIES[course.cat]; if (!cat) return null;` (inside the .map)

**Risk:** Low

---

### P0 — CRASH: Missing enrolled/avg/desc on unmatched courses

**Root cause:** `fetchCourses()` relies on `...hc` spread for `enrolled`, `completed`, `avg`, `icon`, `desc`. If `hc = {}` (courseId not in hardcoded COURSES), these fields are missing.

**Fix:**
- `src/lib/api.js` fetchCourses() — After the `...hc` spread, add explicit defaults:
  ```js
  enrolled:  hc.enrolled  ?? 0,
  completed: hc.completed ?? 0,
  avg:       hc.avg       ?? 0,
  icon:      hc.icon      || '📘',
  desc:      hc.desc      || '',
  ```

**Risk:** Low

---

### P0 — DATA LOSS: c13 (draft course) dropped after Pull

**Root cause:** `setCourses(courseData)` replaces entire courses array. If sheet returns 12 rows (no c13), draft course disappears.

**Fix:**
- `src/lib/api.js` fetchCourses() — After mapping sheet rows, append hardcoded COURSES entries whose `id` is not already in the result:
  ```js
  const sheetIds = new Set(result.map(c => c.id));
  const missing = COURSES.filter(c => !sheetIds.has(c.id));
  return [...result, ...missing];
  ```

**Risk:** Low

---

### P1 — DATA: fetchProgress teacherId column mismatch

**Root cause:** Progress sheet column header may not be exactly `teacherId` — could be `teacher_id` or have different casing.

**Fix:**
- Add diagnostic `console.log` of raw headers from Progress sheet to verify exact column name
- Update `r.teacherId` mapping to match actual header
- Alternatively: make the header lookup case-insensitive

**Risk:** Low

---

### P1 — UX: Default view shows empty assignments

**Root cause:** Teachers.jsx default state is `useState("assignments")`. With empty Assignments sheet, shows "No results" empty state. User must manually click "All Teachers" tab.

**Fix:**
- `src/components/teachers/Teachers.jsx:19` — Default to `"roster"` when no assignments exist, or auto-switch: `useState(assignments.length > 0 ? "assignments" : "roster")`

**Risk:** Low

---

### P2 — RESILIENCE: No error boundary

**Root cause:** Any render crash in any component propagates up and blanks the entire app. No error boundary exists.

**Fix:**
- Create `src/components/ErrorBoundary.jsx` — catches render errors, shows fallback UI
- Wrap `<Routes>` in App.jsx with `<ErrorBoundary>`

**Risk:** Medium (new component, but standard React pattern)

---

### P3 — CLEANUP: Remove smoke console.logs

**Root cause:** Debug logs from testing sessions still in production code.

**Fix:**
- `src/lib/api.js` — Remove lines 43, 46, 48 (`[smoke] fetchTeachers`), line 81 (`Courses from sheet`), line 118 (`Assignments from sheet`)
- Keep `[api]` prefixed info/warn/error logs (these are operational)

**Risk:** Low

---

## Execution Order

1. Fix fetchCourses() — normalize cat, add defaults, preserve missing hardcoded courses
2. Add CATEGORIES guard in Courses.jsx and Analytics.jsx
3. Diagnose fetchProgress teacherId header mismatch
4. Remove smoke logs
5. Change Teachers default view
6. Add error boundary
7. `pnpm build` + test Pull end-to-end
