# TrainOS — Claude Code Project Guide

**Last updated: 2026-03-30**

## FIRST THING TO DO

Read this file fully before touching anything. Also read TASKS.md, DECISIONS.md, and MEMORY.md for context.

---

## What Is This

TrainOS is an admin platform for managing teacher training at BrightChamps. It has four pages:
- **Dashboard** — KPI overview + subject breakdown
- **Courses** — course cards with assign + analytics buttons
- **Analytics** — module funnel chart + health table per course
- **Teachers** — assignment table with sort, filter, inline deadline edit, bulk remind, profile drill-down

Data flows: Google Sheets (4 tabs) → Pull → React state → Push → Supabase + Google Sheet (via AppScript)

---

## Tech Stack (Locked — Do Not Change)

| Concern | Choice |
|---|---|
| Framework | React 18 + JSX (no TypeScript) |
| Bundler | Vite 5 |
| Routing | React Router v6 (useNavigate + useLocation) |
| State | useState in App.jsx only — no Zustand |
| Charts | Recharts (Analytics page only) |
| Styling | Inline style objects only — zero CSS files |
| Auth | Supabase Auth + Google OAuth |
| Read source | Google Sheets (gviz JSON API) |
| Write target | Supabase + Google Sheet (Apps Script doPost) |
| Package manager | pnpm |
| Node | 20+ |

---

## Design System (BrightChamps)

**Fonts** (loaded via Google Fonts in index.html):
- `Nunito Sans` — display/headers (F.display)
- `Poppins` — body text (F.body)
- `SF Mono / Fira Code` — monospace fallback (F.mono)

**Color tokens** (object `C` in theme.js):
```
canvas:  #FAFAFA   ← page background
surface: #FCFCFC   ← sidebar/card surface
surf2:   #F5F5F5
surf3:   #EEEEEE
border:  #E8E8E8
border2: #D0D0D0
text:    #0D1D2D   ← primary headings
text2:   #4D5D6D   ← secondary/label
text3:   #6A737D   ← muted/nav
brand:   #4360FD   ← BrightChamps blue accent
green:   #16a34a   greenLo: #f0fdf4
red:     #dc2626   redLo:   #fef2f2
amber:   #d97706   amberLo: #fffbeb
blue:    #3b82f6   blueLo:  #eff6ff
purple:  #7c3aed   purpleLo:#f5f3ff
```

Card border-radius: 22px. Field border-radius: 10px.

---

## Data Model

### Teacher object (from Google Sheet Teachers tab)
```js
{
  id: Number,              // teacher_id from sheet
  name: String,
  email: String,
  phone: String,           // often "—" (not in metadata)
  vertical: String,        // "Codechamps" | "MathChamps" | "Finchamps" | "Robochamps"
  teamLead: String,
  region: String,
  joinDate: String,        // YYYY-MM-DD (parsed from "Date(Y,M,D)" or "Month D, YYYY")
  status: String,          // "Active" | "Inactive" | "Offboarding"
  adhyayanUserId: String,
  learningPathLink: String,
  _pending: Boolean,       // client-only: true if added locally but not yet pushed
}
```

### Assignment object (from Google Sheet Assignments tab)
```js
{
  id: Number,
  teacherId: Number,
  courseId: String,         // "c1" through "c13"
  assignedDate: String,    // YYYY-MM-DD
  deadline: String,        // YYYY-MM-DD
  status: String,          // "Not Started" | "In Progress" | "Completed"
  _pending: Boolean,       // client-only
}
```
Note: `pct` is NOT on the assignment object. Progress comes from the Progress tab and is merged by `mergeData()`.

### Course object (hardcoded COURSES merged with sheet overrides)
```js
{
  id: String,              // "c1" through "c13"
  name: String,
  cat: String,             // "coding" | "maths" | "finlit" | "robotics"
  icon: String,            // emoji
  desc: String,
  modules: Number,
  status: String,          // "active" | "draft"
  enrolled: Number,        // hardcoded (not from sheet yet)
  completed: Number,       // hardcoded
  avg: Number,             // hardcoded
}
```

### Progress object (from Google Sheet Progress tab)
```js
{
  teacherId: Number,
  courseId: String,
  pct: Number,             // 0-100
  completionStatus: String,
  kc1Score: Number|null,
  kc2Score: Number|null,
  avgScore: Number|null,
  lastUpdated: String,
  adhyayanUserId: String,
  name: String,
}
```

### mergeData() output (enriched assignment for UI)
```js
mergeData(teachers, assignments, progress, courses) → [{
  ...assignment,
  pct, completionStatus, kc1Score, kc2Score, avgScore,  // from progress
  teacherName, teacherEmail, teacherVertical,            // flattened
  teacher: { ...fullTeacherObject },
  course: { ...fullCourseObject },
}]
```

---

## Repository Structure

```
trainos/
├── CLAUDE.md                    ← this file
├── TASKS.md                     ← task tracker
├── DECISIONS.md                 ← architecture decisions
├── MEMORY.md                    ← bugs fixed + patterns
├── .env                         ← env vars (not committed)
├── index.html
├── vite.config.js
├── package.json
├── public/
│   └── _redirects               ← SPA redirect
├── audit/                       ← audit reports
├── sheet_data/                  ← CSV exports for Google Sheet
├── _reference/                  ← original monolith JSX files
└── src/
    ├── main.jsx
    ├── App.jsx                  ← ALL useState, ALL handlers, ErrorBoundary
    ├── data/
    │   ├── theme.js             ← F, C, card, field, pill, mkBtn
    │   ├── courses.js           ← CATEGORIES, COURSES, MODULES
    │   ├── teachers.js          ← INIT_TEACHERS (seed fallback only)
    │   ├── helpers.js           ← initials, avC, fmtD, fmtS, dLeft, hColor
    │   └── nav.js               ← SHEETS, SHEET_FILE, LAST_PULL, NAV, VERTICALS
    ├── lib/
    │   ├── api.js               ← fetch*, push*, mergeData, parseSheetJson, parseJoinDate
    │   ├── supabase.js          ← createClient
    │   └── sheetsWriter.js      ← writeAssignmentsToSheet (Apps Script POST)
    └── components/
        ├── Av.jsx
        ├── Tag.jsx              ← Tag, StatusTag (handles Active/Inactive/Offboarding)
        ├── PBar.jsx
        ├── Kpi.jsx
        ├── SectionHeader.jsx
        ├── EmptyState.jsx
        ├── Toast.jsx
        ├── Modal.jsx
        ├── SyncBar.jsx
        ├── Login.jsx            ← Google OAuth, @brightchamps.com domain check
        ├── dashboard/
        │   └── Dashboard.jsx
        ├── courses/
        │   └── Courses.jsx
        ├── analytics/
        │   └── Analytics.jsx
        └── teachers/
            ├── Teachers.jsx
            ├── AddTeacherModal.jsx
            └── AssignModal.jsx
```

---

## Environment Variables (.env)

```
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_SHEET_TEACHERS_URL=https://docs.google.com/.../gviz/tq?tqx=out:json&sheet=Teachers
VITE_SHEET_COURSES_URL=https://docs.google.com/.../gviz/tq?tqx=out:json&sheet=Courses
VITE_SHEET_ASSIGNMENTS_URL=https://docs.google.com/.../gviz/tq?tqx=out:json&sheet=Assignments
VITE_SHEET_PROGRESS_URL=https://docs.google.com/.../gviz/tq?tqx=out:json&sheet=Progress
VITE_SHEET_WRITER_URL=https://script.google.com/macros/s/.../exec
```

---

## Key Functions in api.js

- `parseSheetJson(text)` — strips gviz wrapper, detects col.label vs first-row-as-header mode
- `parseJoinDate(raw)` — handles `Date(Y,M,D)` (0-indexed month), `"Month D, YYYY"`, `YYYY-MM-DD`
- `normalizeStatus(s)` — maps to `"Completed"` | `"In Progress"` | `"Not Started"`
- `fetchTeachers()` → `VITE_SHEET_TEACHERS_URL` → fallback: `INIT_TEACHERS`
- `fetchCourses()` → `VITE_SHEET_COURSES_URL` → merge with hardcoded COURSES → preserves icon/desc/enrolled
- `fetchAssignments()` → `VITE_SHEET_ASSIGNMENTS_URL` → fallback: `[]`
- `fetchProgress()` → `VITE_SHEET_PROGRESS_URL` → filter `teacherId > 0` → fallback: `[]`
- `mergeData(teachers, assignments, progress, courses)` → enriched assignment rows for UI
- `pushTeacher(teacher)` → Supabase upsert (warns on error, doesn't throw)
- `pushAssignments(assignments)` → Supabase upsert + `writeAssignmentsToSheet()`

---

## Known Gotchas

1. **Always String() normalize IDs before comparing** — sheet returns numbers, UI may pass strings. `String(a.teacherId) === String(tid)`.
2. `avC(name)` uses `name.charCodeAt(0)` — never pass undefined/null names.
3. `dLeft(deadline)` returns `null` on empty/invalid dates — check for null in display logic, show "—".
4. The `_pending` flag drives both SyncBar count AND the orange dot on table rows.
5. `handleFilterTeachers` attaches `_ts: Date.now()` to the filter object — forces useEffect to re-run.
6. Recharts `<ResponsiveContainer>` requires a parent div with explicit height.
7. `SyncBar` receives `pendingT` and `pendingA` as separate props — App.jsx computes both with useMemo.
8. `CATEGORIES[catId]` can be undefined — always use `CATEGORIES[x] || CATEGORIES['coding']` fallback.
9. `parseSheetJson` detects header mode: if ALL col.labels populated → data starts at row 0; otherwise row 0 is headers.
10. **Don't store pct on assignment objects** — progress comes from Progress tab, merged at display time by `mergeData()`.
11. **Don't use `new Date("March 28, 2026")`** — locale dependent. Use `parseJoinDate()` instead.
12. **Don't use setTimeout for state-dependent ops** — use useEffect with the state as dependency.
13. Assignments initialize as `[]` not seed data — seed teacher IDs don't match real sheet IDs.

---

## Opening Prompt for Claude Code

> Read CLAUDE.md, TASKS.md, DECISIONS.md, and MEMORY.md before doing anything. The app is deployed on Cloudflare Pages with Google Sheets as the read source and Supabase as the write target. Check TASKS.md for current status. Do not modify the data model or sync architecture without reading DECISIONS.md first.
