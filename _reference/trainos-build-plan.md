# TrainOS — Complete Project Plan for Claude Code

**Version:** 1.0  
**Written by:** Senior Technical Architect + Senior Developer perspective  
**Purpose:** Drop this file into Claude Code. Read it fully. Then execute Phase by Phase.  
**Last updated:** March 2026

---

## READ THIS FIRST

This is the authoritative build plan for TrainOS — a BrightChamps internal admin platform for
teacher training management. The UI prototype (v5) is already built and visually verified.
The component tree is split. What does not exist yet is:

- A real Vite project scaffold wired to the actual component files
- Live data (currently all hardcoded seed data)
- Routing (currently tab state, not React Router)
- A deployment target

This document tells you exactly what to build, in what order, with what commands,
and what decisions have already been made so you don't re-litigate them.

**Do not freestyle. Follow the phases in sequence.**  
**Do not skip a phase to "move faster". Each phase has gates.**  
**When in doubt, re-read this file.**

---

## Architectural Decisions (Already Made — Do Not Revisit)

| Decision | Choice | Rationale |
|---|---|---|
| Language | JavaScript (JSX), not TypeScript | Prototype is in JSX. TS migration is Phase 6+ |
| Bundler | Vite 5 | Fast HMR, minimal config, standard for React 18 |
| State | React `useState` lifted to `App.jsx` | No Zustand yet. Simple enough for current complexity |
| Routing | React Router v6 | `useNavigate` + `useLocation`, no hash routing |
| Styling | Inline style objects only | All tokens in `src/data/theme.js`. Zero CSS files |
| Charts | Recharts | Already in v5. Proven working |
| Data Layer (Phase 2) | Metabase Public Questions (read) + Supabase (write) | See Data Architecture section |
| Hosting | Netlify (free tier) | Static build, drag-drop or GitHub CI |
| Package manager | pnpm | Required. Do not use npm or yarn |
| Auth (Phase 4) | Supabase Auth + Google OAuth | BrightChamps uses Google Workspace |
| Node version | 20+ | Enforced via `.nvmrc` |

---

## Repository Structure (Final Target)

```
trainos/
├── .nvmrc                          ← "20"
├── .gitignore
├── CLAUDE.md                       ← AI context (already written)
├── README.md
├── package.json
├── vite.config.js
├── index.html
│
├── trainos-v5.jsx                  ← REFERENCE ONLY. Do not import from this.
│
└── src/
    ├── main.jsx                    ← ReactDOM.createRoot + BrowserRouter
    ├── App.jsx                     ← Sidebar + Routes + all useState
    │
    ├── lib/
    │   ├── api.js                  ← All data fetching (Metabase + Supabase calls)
    │   └── supabase.js             ← Supabase client init
    │
    ├── data/
    │   ├── theme.js                ← F, C, card, field, pill, mkBtn
    │   ├── courses.js              ← CATEGORIES, COURSES, MODULES
    │   ├── teachers.js             ← BATCHES, INIT_TEACHERS, INIT_ASSIGNMENTS
    │   ├── helpers.js              ← initials, avC, fmtD, fmtS, bLbl, dLeft, hColor
    │   └── nav.js                  ← SHEETS, SHEET_FILE, LAST_PULL, NAV
    │
    └── components/
        ├── FontLoader.jsx
        ├── Av.jsx
        ├── Tag.jsx
        ├── PBar.jsx
        ├── Kpi.jsx
        ├── SectionHeader.jsx
        ├── EmptyState.jsx
        ├── Toast.jsx
        ├── Modal.jsx
        ├── SyncBar.jsx
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

## Environment Setup (Do Once)

### Prerequisites Check

Before starting, verify these are installed:

```bash
node --version       # Must be >= 20.0.0
pnpm --version       # Must be >= 9.0.0. If missing: npm install -g pnpm
git --version        # Any recent version
```

If Node < 20:
```bash
# Install nvm if not present
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
nvm use 20
```

### Create Project

```bash
pnpm create vite@latest trainos -- --template react
cd trainos
pnpm install
```

### Add Dependencies

```bash
pnpm add react-router-dom recharts
pnpm add @supabase/supabase-js
pnpm add -D eslint eslint-plugin-react eslint-plugin-react-hooks
```

### Final package.json scripts section

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .jsx,.js"
  }
}
```

### .nvmrc

```
20
```

### .gitignore (additions to Vite default)

```
.env
.env.local
.env.production
dist/
node_modules/
.DS_Store
```

### vite.config.js

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@data': path.resolve(__dirname, './src/data'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@components': path.resolve(__dirname, './src/components'),
    }
  },
  server: {
    port: 5173,
    open: true
  }
})
```

### index.html

Replace Vite default with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TrainOS — Admin Console</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Epilogue:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body, #root { height: 100%; }
      body {
        background: #0B0B0F;
        color: #ECEAF2;
        font-family: 'Epilogue', sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      ::-webkit-scrollbar { width: 5px; height: 5px; }
      ::-webkit-scrollbar-track { background: #0B0B0F; }
      ::-webkit-scrollbar-thumb { background: #2A2A38; border-radius: 4px; }
      select, input, textarea { color-scheme: dark; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### Verify Dev Server Runs

```bash
pnpm dev
# Should open http://localhost:5173 with Vite default page
# If it opens → environment is ready. Kill server. Start Phase 1.
```

---

## Phase 1 — Scaffold & Wire Existing Components

**Goal:** Get the existing v5 component files running inside a proper Vite project with real React Router routing.  
**Exit criteria:** `pnpm dev` shows TrainOS UI. All 4 pages render. No console errors. Hot reload works.  
**Estimated time:** 2–3 hours  
**Data:** Seed data only (INIT_TEACHERS, INIT_ASSIGNMENTS). No real APIs yet.

---

### Step 1.1 — Copy Component Files

Copy all files from the split component tree into `src/`. The exact files are documented in `CLAUDE.md`.

**Do not copy `trainos-v5.jsx`** into `src/`. It stays at root as reference only.

Directory structure to create under `src/`:
```
src/data/         → theme.js, courses.js, teachers.js, helpers.js, nav.js
src/components/   → FontLoader.jsx, Av.jsx, Tag.jsx, PBar.jsx, Kpi.jsx,
                    SectionHeader.jsx, EmptyState.jsx, Toast.jsx, Modal.jsx, SyncBar.jsx
src/components/dashboard/   → Dashboard.jsx
src/components/courses/     → Courses.jsx
src/components/analytics/   → Analytics.jsx
src/components/teachers/    → Teachers.jsx, AddTeacherModal.jsx, AssignModal.jsx
src/lib/                    → api.js (stub), supabase.js (stub)
```

---

### Step 1.2 — Write main.jsx

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

---

### Step 1.3 — Rewrite App.jsx with React Router

This is the most significant Phase 1 change. The existing `App.jsx` uses a `tab` state string
for navigation. Replace with `useNavigate` and `useLocation`.

**Rules for this rewrite:**
- All `useState` (teachers, assignments, modals, sync) stays exactly as-is
- All action handlers (assignCourse, addTeacher, updateDeadline, pull, push) stay exactly as-is
- All props passed to page components stay exactly as-is
- ONLY the navigation mechanism changes

**What changes:**

```jsx
// BEFORE (tab state pattern)
const [tab, setTab] = useState('dashboard')
// ...
<button onClick={() => setTab('courses')}>Courses</button>
// ...
{tab === 'dashboard' && <Dashboard ... />}
{tab === 'courses' && <Courses ... />}
```

```jsx
// AFTER (React Router pattern)
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'

const navigate = useNavigate()
const location = useLocation()

// Sidebar nav item:
<button
  onClick={() => navigate('/courses')}
  style={{ borderLeft: `3px solid ${location.pathname === '/courses' ? C.br : 'transparent'}`, ... }}
>
  Courses
</button>

// Content area:
<Routes>
  <Route path="/"          element={<Dashboard ... />} />
  <Route path="/courses"   element={<Courses ... />} />
  <Route path="/analytics" element={<Analytics ... />} />
  <Route path="/teachers"  element={<Teachers ... />} />
  <Route path="*"          element={<Navigate to="/" replace />} />
</Routes>
```

**Important:** Pass `navigate` as a function prop to components that need to trigger navigation
(e.g., Dashboard KPI click → navigate to /teachers with filter). Do not use `useNavigate` inside
child components — keep navigation centralized in App.jsx for now.

**teacherFilter pattern:** Dashboard KPI click calls `onFilter({ status: 'overdue', course: 'all' })`.
App.jsx handles this:

```jsx
function handleFilter(filter) {
  setTeacherFilter({ ...filter, _ts: Date.now() })
  navigate('/teachers')
}
```

Teachers.jsx watches `initFilter` prop via `useEffect`:
```jsx
useEffect(() => {
  if (initFilter) {
    setCourseFilter(initFilter.course || 'all')
    setStatusFilter(initFilter.status || 'all')
    setView('assignments')
  }
}, [initFilter])
```

---

### Step 1.4 — Stub src/lib/api.js

Create this now. It exports functions that currently return seed data.
Phase 2 will replace the internals without changing the function signatures.

```js
// src/lib/api.js

import { INIT_TEACHERS, INIT_ASSIGNMENTS } from '@data/teachers'

// Phase 1: returns seed data
// Phase 2: will fetch from Metabase public question URLs
export async function fetchTeachers() {
  return INIT_TEACHERS
}

// Phase 1: returns seed data via factory
// Phase 2: will fetch from Metabase + Supabase
export async function fetchAssignments() {
  return INIT_ASSIGNMENTS()
}

// Phase 2: will fetch teacher module progress from Metabase
export async function fetchProgress() {
  return []
}

// Phase 3: push assignment mutations to Supabase
export async function pushAssignments(assignments) {
  console.log('[api] pushAssignments stub — not yet wired', assignments)
  return { ok: true }
}

// Phase 3: push new teacher to Supabase
export async function pushTeacher(teacher) {
  console.log('[api] pushTeacher stub — not yet wired', teacher)
  return { ok: true }
}
```

---

### Step 1.5 — Stub src/lib/supabase.js

```js
// src/lib/supabase.js
// Phase 1: stub. Phase 4: replace with real credentials from .env

export const supabase = null  // will be: createClient(url, key)

export const SUPABASE_READY = false
```

---

### Step 1.6 — Fix Any Import Paths

After copying files, audit all import statements. The v5 split may use relative imports
that need updating for the Vite alias system. Pattern:

```js
// Change any relative import like:
import { C, F } from '../../data/theme'
import { initials } from '../data/helpers'

// To alias imports:
import { C, F } from '@data/theme'
import { initials } from '@data/helpers'
```

Audit every file. Every import must resolve. Run `pnpm dev` — fix every console error before proceeding.

---

### Step 1.7 — Phase 1 Verification Checklist

Run through every item before calling Phase 1 done:

```
[ ] pnpm dev starts with zero errors
[ ] http://localhost:5173 shows TrainOS sidebar
[ ] Dashboard page renders with 4 KPI cards and By Subject grid
[ ] Clicking "Courses" in sidebar routes to /courses — URL changes in browser
[ ] Clicking "Analytics" routes to /analytics
[ ] Clicking "Teachers" routes to /teachers
[ ] Browser back/forward button navigates correctly
[ ] Dashboard KPI click ("Overdue") → navigates to /teachers with filter applied
[ ] Teachers page: Assignments tab shows table with 40 rows
[ ] Teachers page: Roster tab shows 20 teacher rows
[ ] Teachers page: Click a teacher name → profile view renders
[ ] Teachers page: Profile → "← Back" → returns to table
[ ] Courses page: Category filter pills work
[ ] Courses page: "Assign" button on course card opens AssignModal
[ ] AssignModal: All 3 steps navigate correctly
[ ] AddTeacherModal: Form opens, validates, adds row to table
[ ] Analytics page: Course picker pills work, funnel chart renders
[ ] SyncBar: Pull button shows "syncing…" then "synced just now"
[ ] SyncBar: Push button inactive when no pending changes
[ ] SyncBar: After adding teacher, Push button activates with count
[ ] Hot reload: Edit a color in theme.js → UI updates without refresh
[ ] Console: Zero errors, zero warnings
```

**Do not start Phase 2 until all 22 items are checked.**

---

## Phase 2 — Live Data Layer

**Goal:** Replace seed data with real data from Metabase (read) and prepare Supabase for writes.  
**Prerequisite:** Tech team has provided Adhyayan DB schema (see Tech Team Asks section).  
**Exit criteria:** Pull button fetches real teacher + progress data. UI renders live data correctly.  
**Estimated time:** 3–5 hours after receiving schema from tech team

---

### Step 2.1 — Environment Variables

Create `.env` file (never commit this):

```bash
# .env
VITE_METABASE_TEACHERS_URL=https://metabase.brightchamps.com/api/public/card/TOKEN_HERE/query/json
VITE_METABASE_PROGRESS_URL=https://metabase.brightchamps.com/api/public/card/TOKEN_HERE/query/json
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Create `.env.example` (commit this):

```bash
# .env.example — copy to .env and fill in values
VITE_METABASE_TEACHERS_URL=
VITE_METABASE_PROGRESS_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Access in code: `import.meta.env.VITE_METABASE_TEACHERS_URL`

---

### Step 2.2 — Metabase Response Shape

Metabase public question JSON response structure (all questions return same shape):

```json
{
  "data": {
    "cols": [
      { "name": "teacher_id" },
      { "name": "name" },
      { "name": "email" }
    ],
    "rows": [
      [1, "Priya Sharma", "priya@brightchamps.com"],
      [2, "Arjun Nair", "arjun@brightchamps.com"]
    ]
  }
}
```

Write a generic parser once, use everywhere:

```js
// src/lib/api.js — add this utility
function parseMetabase(json) {
  const cols = json.data.cols.map(c => c.name)
  return json.data.rows.map(row =>
    Object.fromEntries(cols.map((col, i) => [col, row[i]]))
  )
}
```

---

### Step 2.3 — Implement fetchTeachers

```js
// src/lib/api.js
export async function fetchTeachers() {
  const url = import.meta.env.VITE_METABASE_TEACHERS_URL
  if (!url) {
    console.warn('[api] VITE_METABASE_TEACHERS_URL not set — using seed data')
    return INIT_TEACHERS
  }
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Metabase returned ${res.status}`)
    const json = await res.json()
    const rows = parseMetabase(json)
    // Map Metabase columns → Teacher shape
    // IMPORTANT: Column names depend on your actual Metabase question.
    // Adjust these mappings once you know the real column names.
    return rows.map(r => ({
      id: r.teacher_id,
      name: r.name,
      email: r.email,
      phone: r.phone || '',
      batchId: r.batch_id || 'b1',
      joinDate: r.join_date || new Date().toISOString().split('T')[0],
      status: r.is_active ? 'In Progress' : 'Not Started',
      _pending: false,
    }))
  } catch (err) {
    console.error('[api] fetchTeachers failed, using seed data:', err)
    return INIT_TEACHERS
  }
}
```

**Fallback pattern:** Every fetch falls back to seed data on error. This means the app
always works, even when data sources are unavailable. Never let a fetch error break the UI.

---

### Step 2.4 — Implement fetchProgress

Progress data maps to the `pct` field on assignments. The Metabase question returns
one row per teacher per module.

```js
// src/lib/api.js
export async function fetchProgress() {
  const url = import.meta.env.VITE_METABASE_PROGRESS_URL
  if (!url) return []
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Metabase returned ${res.status}`)
    const json = await res.json()
    const rows = parseMetabase(json)
    // Returns: [{ teacher_id, course_id, completion_pct, last_attempt_at }, ...]
    // Adjust column names to match your Metabase question output
    return rows.map(r => ({
      teacherId: r.teacher_id,
      courseId: r.course_id,
      pct: Math.round(r.completion_pct || 0),
      lastAttemptAt: r.last_attempt_at,
    }))
  } catch (err) {
    console.error('[api] fetchProgress failed:', err)
    return []
  }
}
```

---

### Step 2.5 — Wire Pull Action in App.jsx

Replace the simulated pull timeout with real fetches:

```jsx
// App.jsx — pull handler
async function handlePull() {
  setSyncStatus('pulling')
  try {
    const [teachers, progress] = await Promise.all([
      fetchTeachers(),
      fetchProgress(),
    ])

    // Merge progress into assignments
    // progress is [{ teacherId, courseId, pct, lastAttemptAt }]
    // For each existing assignment, find matching progress and update pct
    setTeachers(teachers)
    setAssignments(prev =>
      prev.map(a => {
        const p = progress.find(
          pr => pr.teacherId === a.teacherId && pr.courseId === a.courseId
        )
        return p ? { ...a, pct: p.pct, _pending: false } : { ...a, _pending: false }
      })
    )
    setLastSynced(new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true
    }))
    setSyncStatus('done')
  } catch (err) {
    console.error('Pull failed:', err)
    setSyncStatus('idle')
  } finally {
    setTimeout(() => setSyncStatus('idle'), 2500)
  }
}
```

---

### Step 2.6 — Supabase Client Init

```js
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && key ? createClient(url, key) : null
export const SUPABASE_READY = !!(url && key)
```

---

### Step 2.7 — Supabase Assignments Table

Create this in Supabase dashboard (SQL editor):

```sql
create table assignments (
  id            bigserial primary key,
  teacher_id    integer not null,
  course_id     text not null,
  deadline      date not null,
  pct           integer default 0,
  status        text default 'Not Started'
                  check (status in ('Not Started', 'In Progress', 'Completed')),
  assigned_by   text,
  assigned_at   timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Index for common query pattern
create index on assignments(teacher_id);
create index on assignments(course_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger assignments_updated_at
  before update on assignments
  for each row execute procedure update_updated_at();

-- Enable RLS (Row Level Security)
alter table assignments enable row level security;

-- Allow anon read (internal tool, acceptable risk)
create policy "Allow read" on assignments for select using (true);

-- Allow anon write (lock down in Phase 4 with auth)
create policy "Allow write" on assignments for all using (true);
```

---

### Step 2.8 — Implement Push Action

```js
// src/lib/api.js
export async function pushAssignments(assignments) {
  if (!supabase) {
    console.warn('[api] Supabase not configured — push skipped')
    return { ok: false, reason: 'not_configured' }
  }
  const payload = assignments.map(a => ({
    id: typeof a.id === 'number' && a.id > 100000 ? undefined : a.id, // new records have no DB id yet
    teacher_id: a.teacherId,
    course_id: a.courseId,
    deadline: a.deadline,
    pct: a.pct,
    status: a.status,
  }))
  const { error } = await supabase.from('assignments').upsert(payload)
  if (error) {
    console.error('[api] pushAssignments error:', error)
    return { ok: false, reason: error.message }
  }
  return { ok: true }
}
```

---

### Step 2.9 — Phase 2 Verification Checklist

```
[ ] .env file created with real Metabase URLs (or placeholder if schema not received yet)
[ ] Pull button fetches from Metabase (or gracefully falls back to seed data)
[ ] Console shows "[api]" log lines, not errors
[ ] After Pull, teacher count matches Metabase row count
[ ] Module progress pct values update on assignments after Pull
[ ] Supabase project exists and assignments table is created
[ ] Push button writes pending assignments to Supabase
[ ] After Push, verify rows in Supabase dashboard
[ ] Pull → Push → Pull round-trip works without data corruption
[ ] Zero console errors in normal flow
```

---

## Phase 3 — Polish, Error States, Loading

**Goal:** Production-quality UX — no blank states, no silent failures, proper loading indicators.  
**Exit criteria:** App is usable by the training team with zero support needed.  
**Estimated time:** 1 day

---

### Step 3.1 — Loading State on Pull

App.jsx `syncStatus === 'pulling'` should disable interactive elements and show subtle
feedback. SyncBar already handles the button state. Additionally:

- Dim the main content area with `opacity: 0.6, pointerEvents: 'none'` while pulling
- Add a subtle loading bar at top of content (CSS keyframe animation, 3px height, brand orange)

---

### Step 3.2 — Error Toast System

Extend Toast component to support error type:

```jsx
// In App.jsx, add toast state:
const [toast, setToast] = useState(null)

function showToast(msg, type = 'success') {
  setToast({ msg, type })
  setTimeout(() => setToast(null), 3000)
}

// Types: 'success' (green), 'warn' (amber), 'error' (red)
```

Use in pull/push handlers:
```js
showToast('✉ Reminder sent to Priya, Arjun')
showToast('Push failed — check connection', 'error')
showToast('3 teachers assigned to Foundation Math', 'success')
```

---

### Step 3.3 — Empty States

Every table/list needs a proper empty state. Verify EmptyState component is used in:
- Assignment table when no rows match filters
- Roster table when search returns nothing
- Teacher profile when no assignments exist
- Analytics when no module data for selected course

---

### Step 3.4 — Form Validation

AddTeacherModal and AssignModal need client-side validation:
- Required fields show inline red error text
- Submit button disabled until required fields filled
- Email format validation
- Deadline must be future date

These should already exist in the v5 implementation — verify they still work.

---

### Step 3.5 — Mobile Responsiveness (Minimum)

TrainOS is a desktop tool. Mobile is not the target. But it should not completely break on laptop screens at 1280px wide. Verify:
- Sidebar doesn't overflow at 1280px
- Tables scroll horizontally, not clip
- Modals are usable at 1280px

---

## Phase 4 — Authentication

**Goal:** Only BrightChamps admins can access TrainOS.  
**Implementation:** Supabase Auth + Google OAuth  
**Estimated time:** 2–3 hours

---

### Step 4.1 — Supabase Auth Setup

In Supabase dashboard:
1. Authentication → Providers → Google → Enable
2. Add OAuth credentials from Google Cloud Console (service: `brightchamps.com`)
3. Add redirect URL: `https://trainos.netlify.app/auth/callback`
4. Also add `http://localhost:5173/auth/callback` for local dev

---

### Step 4.2 — Auth Route

```jsx
// src/components/Login.jsx
import { supabase } from '@lib/supabase'

export default function Login() {
  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' }
    })
  }

  return (
    <div style={{ /* center on screen, dark bg */ }}>
      <div style={{ /* card */ }}>
        <div style={{ fontFamily: F.d, fontSize: 18, fontWeight: 800, color: C.tx }}>
          TrainOS
        </div>
        <p style={{ color: C.t3, fontSize: 12 }}>BrightChamps Training Admin</p>
        <button onClick={handleGoogleLogin} style={mkBtn('p')}>
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
```

---

### Step 4.3 — Auth Guard in App.jsx

```jsx
// App.jsx additions
const [session, setSession] = useState(null)
const [authLoading, setAuthLoading] = useState(true)

useEffect(() => {
  supabase?.auth.getSession().then(({ data: { session } }) => {
    setSession(session)
    setAuthLoading(false)
  })
  supabase?.auth.onAuthStateChange((_event, session) => {
    setSession(session)
  })
}, [])

if (authLoading) return <div style={{ background: C.bg, height: '100vh' }} />
if (!session) return <Login />
// ... rest of app
```

---

### Step 4.4 — Lock Down Supabase RLS

After auth is working, tighten the RLS policies:

```sql
-- Replace permissive policies with auth-based ones
drop policy "Allow write" on assignments;

create policy "Authenticated write"
  on assignments for all
  using (auth.role() = 'authenticated');
```

---

## Phase 5 — Deploy to Netlify

**Goal:** TrainOS is live at an internal URL.  
**Estimated time:** 30 minutes

---

### Step 5.1 — Build

```bash
pnpm build
# Outputs to dist/
# Verify: ls dist/ should show index.html + assets/
```

### Step 5.2 — Deploy Options

**Option A: Manual drag-drop (fastest for first deploy)**
1. Go to netlify.com → "Add new site" → "Deploy manually"
2. Drag `dist/` folder into the browser
3. Get URL like `https://amazing-name-123.netlify.app`

**Option B: GitHub CI (recommended for ongoing)**
1. Push repo to GitHub
2. Netlify → "Import from Git" → connect repo
3. Build command: `pnpm build`
4. Publish directory: `dist`
5. Every push to `main` auto-deploys

### Step 5.3 — Environment Variables on Netlify

Netlify → Site settings → Environment variables → Add each `.env` variable.
Do not commit `.env` to Git.

### Step 5.4 — Site Settings

```
Site name: trainos-brightchamps (or similar)
Access: Netlify free tier — share URL internally
Domain: Use Netlify subdomain for now
        (custom domain: trainos.brightchamps.com — requires DNS change from IT)
```

### Step 5.5 — Verify Live Deploy

```
[ ] Login page appears (not the app)
[ ] Google login works with a BrightChamps Google account
[ ] Dashboard renders with real data
[ ] Pull works against Metabase URLs
[ ] Push writes to Supabase
[ ] No console errors on production build
```

---

## Data Architecture Reference

### What Reads From Where

```
TEACHERS
  Phase 1: INIT_TEACHERS (seed, 20 records)
  Phase 2: Metabase → Adhyayan DB teachers table
           fetchTeachers() → maps Metabase JSON → Teacher shape

MODULE PROGRESS (pct on assignments)
  Phase 1: Hardcoded pct values in INIT_ASSIGNMENTS()
  Phase 2: Metabase → Adhyayan DB module_attempts table
           fetchProgress() → merged into assignments on Pull

ASSIGNMENTS (who is assigned what course + deadline)
  Phase 1: INIT_ASSIGNMENTS() factory (40 seed records)
  Phase 2-3: Supabase assignments table
             Pull reads from Supabase
             Push writes to Supabase

COURSES
  All phases: Hardcoded in src/data/courses.js
  Rationale: Course catalogue changes infrequently — update file manually
```

### Metabase Query Design

When building the Metabase questions, these are the exact output columns TrainOS expects:

**Teachers question output:**
```
teacher_id    integer   PK
name          text
email         text
phone         text      (nullable)
batch_id      text      "b1", "b2", "b3" — map from cohort/batch name
join_date     date      ISO format
is_active     boolean
```

**Module Progress question output:**
```
teacher_id      integer
course_id       text    "c1"..."c13" — must match TrainOS COURSES ids
completion_pct  integer 0–100
last_attempt_at timestamp (nullable)
```

**Critical:** The `course_id` from Adhyayan DB must be mappable to TrainOS course IDs (c1–c13).
You will need to build a mapping in the Metabase SQL or in `api.js`. Clarify this mapping
with tech team when you get the schema.

---

## Tech Team Asks (Send This)

> Forward this section as a message or Jira ticket.

---

**TrainOS — 2 schema questions, 1 future ask**

Building an internal training admin tool. Need 2 things to connect live data:

**Ask 1: Teacher table schema in Metabase**

I need to build a Metabase public question for active teacher records. Which table/view
should I query? I need these columns (or their equivalents):
- Teacher ID (integer)
- Full name
- Email
- Phone (optional)
- Batch / cohort identifier
- Join date
- Active status flag

I'll write the SQL and set up the Metabase question myself — just need the table name
and column names.

**Ask 2: Adhyayan module completion schema (most critical)**

I need to show each teacher's completion % per training course module. This data lives
in the Adhyayan DB. I need to understand:

1. Which table tracks teacher progress/attempts through course modules?
2. What columns does it have? (teacher_id, module_id, completion status, etc.)
3. Is completion a boolean flag, or do we derive it from score/attempts?
4. How does module_id map to course_id? (Is there a join table?)
5. Do teacher IDs in Adhyayan match teacher IDs in the teachers table?
6. Our TrainOS has 13 courses (c1–c13). What is the mapping from Adhyayan
   course/module IDs to these? (I'll build this mapping in SQL)

A 15-minute screen share or a quick Loom of the relevant tables would be enough.

**Ask 3 (later — Phase 2 only):**
Once I have a Supabase table set up, can you add a nightly cron job to sync active
teacher records from our DB into it? Just 6 columns, upsert pattern. ~30 min setup.
I'll provide the Supabase table schema when ready.

No new APIs needed. No backend code from your side for the first phase.

---

## Common Problems & Solutions

**`Module not found` errors after copying files**
→ Check all import paths. Switch from relative (`../../data/theme`) to aliases (`@data/theme`).

**Recharts shows blank / broken chart**
→ ResponsiveContainer needs a parent with explicit height. Wrap in a div with `height: 300`.

**React Router routes work on first load but 404 on refresh**
→ Netlify: add `_redirects` file in `public/` with: `/* /index.html 200`
→ Vite preview: add `--base /` flag

**Metabase CORS error on fetch**
→ Metabase public questions support CORS by default. If blocked, check with tech team if
   the Metabase instance has a custom CORS config. Workaround: Netlify serverless function
   as proxy.

**Supabase RLS blocking writes**
→ In dev, temporarily set permissive policy. Tighten in Phase 4 after auth.

**Google Fonts not loading (blank text)**
→ Check network tab. If blocked by CSP, add `<meta http-equiv="Content-Security-Policy">`
   or move fonts to self-hosted via `@fontsource` packages.

**HMR breaks styles after editing theme.js**
→ Normal Vite behaviour — full reload happens on data file changes. Not a bug.

---

## Git Workflow

```bash
# Initial commit after Phase 1
git init
git add .
git commit -m "Phase 1: scaffold, routing, seed data wired"

# Branch strategy (simple, internal tool)
main          → production (Netlify auto-deploys)
dev           → active development
feature/xxx   → feature branches, PR into dev, merge dev → main

# Commit message format
git commit -m "Phase 2: wire Metabase teacher fetch"
git commit -m "feat: add inline deadline edit"
git commit -m "fix: assignment filter not clearing on tab switch"
```

---

## Phase Summary & Timeline

| Phase | What | Time | Gate |
|---|---|---|---|
| Setup | Vite scaffold, deps, folder structure | 1 hour | `pnpm dev` runs |
| Phase 1 | Copy components, wire routing | 2–3 hours | 22-item checklist passes |
| Phase 2 | Metabase + Supabase live data | 3–5 hours | After tech team schema |
| Phase 3 | Loading states, errors, polish | 1 day | Team can use without help |
| Phase 4 | Auth (Google login via Supabase) | 2–3 hours | Login wall works |
| Phase 5 | Netlify deploy | 30 min | Live URL shared with team |

**Total to usable internal tool: ~3 working days of build time**  
**Blocker:** Tech team responding with Adhyayan schema (usually 1–2 days async)

---

## Appendix A — Full Design Token Reference

All tokens in `src/data/theme.js`. Never hardcode anywhere else.

```
C.bg   #0B0B0F   canvas
C.su   #111116   surface
C.s2   #18181F   elevated surface
C.s3   #202028   hover/active
C.bd   #1E1E28   border
C.b2   #2A2A38   border secondary
C.tx   #ECEAF2   text primary
C.t2   #8E8EA8   text secondary
C.t3   #525268   text muted

C.br   #F97316   brand orange — primary CTA
C.bL   rgba(249,115,22,.14)
C.bX   rgba(249,115,22,.06)

C.gr   #34D399   success
C.re   #F87171   error/overdue
C.am   #FBBF24   warning
C.bl   #60A5FA   coding subject
C.pu   #A78BFA   robotics subject

F.d    'Syne', sans-serif         display
F.b    'Epilogue', sans-serif     body
F.m    'JetBrains Mono', mono     all data/numbers/labels

mkBtn('p')  → primary (orange bg, black text)
mkBtn('s')  → secondary (dark bg, muted text)
mkBtn('g')  → ghost (transparent)
mkBtn('d')  → danger (red tint)
mkBtn('w')  → warning (amber tint)
```

---

## Appendix B — Component Props Quick Reference

```jsx
<Av name="Priya Sharma" sz={28} />
<Tag label="Completed" color={C.gr} dot />
<StatusTag status="In Progress" />
<PBar v={65} c={C.br} h={3} />
<Kpi label="Overdue" val={4} sub="past deadline" ac={C.re} onClick={fn} />
<SectionHeader title="Teachers" sub="20 total" action={<button />} />
<EmptyState icon="◈" title="No Results" sub="Adjust filters." />
<Toast toast={{ msg: "Done", tp: "s" }} />
<Modal title="..." sub="..." onClose={fn} footer={<>...</>} w={500}>{children}</Modal>
<SyncBar syncStatus="idle" lastSynced="10:42 AM" pendingTeachers={2}
         pendingAssignments={5} onPull={fn} onPush={fn} />
```

---

*End of project plan. Start with environment setup, then execute phases in order.*
*Re-read this document at the start of each new Claude Code session.*
