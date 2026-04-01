# TrainOS — Brutal Honest Audit

**Date:** 2026-04-01

---

## SECTION 1: DATA CONSISTENCY

| Field | Where displayed | Source | Updates when? | Stale risk |
|-------|----------------|--------|---------------|-----------|
| teacher name | Roster, profile, assignment rows | Sheet Teachers tab | On Pull only | LOW — names rarely change |
| teacher vertical | Roster, profile, assignment sub-label | Sheet Teachers tab | On Pull only | LOW |
| teacher teamLead | Profile header | Sheet Teachers tab | On Pull only | LOW |
| teacher region | Profile header | Sheet Teachers tab | On Pull only | LOW |
| teacher status (Active/Inactive) | Roster badge, profile badge | Sheet Teachers tab | On Pull only | MEDIUM — ops may change status in sheet, app won't see until Pull |
| assignment status | Assignment row badge, filters | Supabase assignments table | On Pull (from Supabase) | LOW — Supabase is primary write target |
| assignment deadline | Assignment row, inline edit | Supabase (via push) | On Push after inline edit | MEDIUM — edit is local until Push fires |
| assignment pct | Progress bar in assignment row | Progress sheet via mergeData join | On Pull only | **HIGH** — progress updates in Adhyayan continuously, app only sees it on Pull |
| completionStatus | Assignment row badge (via displayStatus) | Progress sheet via mergeData join | On Pull only | **HIGH** — same as pct |
| kc1Score, kc2Score, avgScore | Profile assignment cards | Progress sheet | On Pull only | MEDIUM — scores update after KC test completion |
| days left | Assignment row "Xd left" column | Computed: `deadline - today` | Every render (client-side) | NONE — computed live |
| enrolled count on course cards | Course card "Enrolled" stat | Hardcoded in courses.js | NEVER (requires code deploy) | **CRITICAL** — always shows seed data (2498 for c1) not real count |
| avg completion on course cards | Course card progress bar | Hardcoded in courses.js | NEVER (requires code deploy) | **CRITICAL** — always shows seed data (25.2% for c1) not real count |
| module funnel data (Analytics) | BarChart + health table | Hardcoded MODULES in courses.js | NEVER (requires code deploy) | **CRITICAL** — entirely fake data for all courses |
| "In Training" KPI | Dashboard card | `progress.filter(p => p.pct > 0)` | On Pull | MEDIUM — counts unique teacherIds from progress |
| "Not Started" KPI | Dashboard card | `progress.filter(p => p.pct === 0)` | On Pull | **HIGH** — counts ALL progress rows with pct=0, not assignment-scoped. A teacher with no assignment but pct=0 progress row still counts. |
| "Overdue" KPI | Dashboard card | `assignments.filter(a => a.status !== "Completed" && deadline < now)` | On Pull | MEDIUM — uses assignment status, not completionStatus |

---

## SECTION 2: STATUS LABEL INCONSISTENCY

### The core problem: two independent status systems are conflated

| Location | Source field | Possible values | What user sees |
|----------|-------------|-----------------|----------------|
| Assignment row badge (Teachers.jsx:268) | `r.completionStatus \|\| r.status` | "Not Started" / "In Progress" / "Completed" | StatusTag with merged label |
| Teacher row badge in Roster (Teachers.jsx:162) | `t.status` | "Active" / "Inactive" / "Offboarding" | Green/grey/yellow badge |
| Profile header badge (Teachers.jsx:91) | `t.status` | "Active" / "Inactive" / "Offboarding" | Green/grey/yellow badge |
| Profile assignment card badge (Teachers.jsx:127) | `a.status` | "Not Started" / "In Progress" / "Completed" | Assignment-level status |
| Dashboard "In Training" click filter | Navigates with `status:"In Progress"` | "In Progress" | Filters assignment rows |
| Data Audit "status" column | Computed: complete/no-assignment/no-progress/ghost | Internal labels | Audit-specific badge |
| AssignModal teacher list badge (AssignModal.jsx:51) | `t.status` | "Active" / "Inactive" / "Offboarding" | Teacher status in selection |

### Can the same teacher show different statuses?

**YES.** A teacher can simultaneously show:
- **Roster:** "Active" (teacher-level status from sheet)
- **Assignment row:** "In Progress" (completionStatus from progress merge)
- **Profile header:** "Active" (teacher-level)
- **Profile assignment card:** "Not Started" (assignment.status — the raw assignment status, NOT progress)
- **Data Audit:** "No Assignment" (audit-specific)

This is **fundamentally confusing**. The ops user sees "Active" in roster, "Not Started" on the assignment, but the progress bar shows 85%. The statuses contradict.

### Root cause (Teachers.jsx:252)
```js
const displayStatus = r.completionStatus || r.status || 'Not Started'
```
- `r.completionStatus` = from progress sheet (e.g., "In Progress" if they've started)
- `r.status` = from assignment (always "Not Started" for newly created assignments)
- The OR chain means: if progress says anything, show that; otherwise show assignment status
- **Problem:** Assignment status is NEVER updated from progress. Once you create an assignment as "Not Started", it stays that way in Supabase forever.

### Impact
An ops user assigns a course to a teacher. The teacher completes 85% in Adhyayan. The app shows:
- Progress bar: 85% (correct — from progress sheet)
- Status badge: "In Progress" (from completionStatus — correct)
- But Supabase still has `status: "Not Started"` — never synced
- If Supabase-first fetch loads before progress merge, the badge flickers to "Not Started"

---

## SECTION 3: DEAD UPDATES

| Action | Local state | Supabase | Sheet | UI re-renders | Survives refresh |
|--------|-----------|----------|-------|--------------|------------------|
| 1. Assign course | ✅ adds to assignments with _pending | ✅ auto-push fires after 500ms | ⚠️ no-cors, unverifiable | ✅ assignment row appears | ✅ if Supabase write succeeded |
| 2. Edit deadline | ✅ updates assignment, _pending=true | ✅ auto-push fires | ⚠️ no-cors | ✅ date updates inline | ✅ if Supabase write succeeded |
| 3. Send Reminder | ❌ toast only | ❌ no write | ❌ no write | ✅ toast appears | ❌ no persistence, no email sent |
| 4. Add teacher | ✅ adds to teachers with _pending | ❌ not written to Supabase | ⚠️ no-cors sheet write | ✅ teacher appears in roster | ❌ LOST on refresh unless sheet write worked |
| 5. Pull | ✅ replaces state (preserves pending) | ❌ reads only | ❌ reads only | ✅ full re-render | N/A — Pull IS the refresh |
| 6. Push | ✅ clears _pending on success | ✅ assignments written | ⚠️ no-cors for assignments | ✅ pending dots clear | ✅ for assignments; ❌ for teachers |
| 7. Teacher completes module (Adhyayan) | ❌ no real-time update | ❌ not synced | ❌ Progress sheet manual | ❌ stale until Pull | N/A — external action |
| 8. Ops edits Sheet row | ❌ no push notification | ❌ not synced | ✅ Sheet updated | ❌ stale until Pull | N/A — external action |

### Critical dead update: "Send Reminder" (Action 3)
The button says "✉ Remind" and shows a toast "Reminder sent to {name}". **But no email is sent.** No API call is made. No record is kept. The user believes they reminded the teacher, but nothing happened.

### Critical dead update: "Add Teacher" (Action 4)
New teachers are written to Sheet via no-cors Apps Script. If that fails (and it can't be verified), the teacher exists in local state only. On next Pull, they disappear.

---

## SECTION 4: RED FLAGS

| # | Finding | Location | Impact | Category |
|---|---------|----------|--------|----------|
| R1 | **Enrolled/avg/completed on course cards are hardcoded seed data** | courses.js lines 11-23 | Ops sees fake enrollment numbers. c1 shows "2498 enrolled" which is invented. | CRITICAL |
| R2 | **Module funnel in Analytics is entirely hardcoded** | courses.js MODULES object | The funnel chart shows fake reached/completed percentages. None of it is real. | CRITICAL |
| R3 | **"Not Started" KPI counts progress rows, not assignments** | Dashboard.jsx line 8: `progress.filter(p=>p.pct===0).length` | Counts ~1200 progress rows with pct=0. This is NOT "teachers who haven't started" — it's "progress records with 0%". A teacher with no assignment also has a 0% progress row. The number is misleading. | CRITICAL |
| R4 | **Send Reminder is fake** | Teachers.jsx doRemind: shows toast only | Ops user thinks reminder was sent. Nothing happened. | HIGH |
| R5 | **Assignment status never updates from progress** | Supabase assignments.status stays "Not Started" forever | If ops queries Supabase directly, all assignments show "Not Started" even if teacher completed 85% | HIGH |
| R6 | **Teacher writes are unverifiable** | sheetsWriter.js no-cors mode | New teacher may or may not persist. No feedback to user. | HIGH |
| R7 | **Overdue count uses wrong status field** | Teachers.jsx line 65: `r.status !== "Completed"` | Uses assignment status, not completionStatus. A teacher who completed in Adhyayan still shows as "overdue" if assignment status wasn't synced. | MEDIUM |
| R8 | **Data shown is always stale with no indicator** | No "last updated" timestamp on progress data | Ops has no way to know if progress is from today or last week. | MEDIUM |
| R9 | **KC score string comparison** | Teachers.jsx line 125: `a.kc1Score !== 'Not Completed'` | Compares Number against String. Condition always passes for any number. Not a visible bug but dead code. | LOW |
| R10 | **"In Training" counts all progress, not just assigned teachers** | Dashboard.jsx line 7 | Includes teachers who have Adhyayan progress but no assignment in the app. Number is higher than expected. | MEDIUM |

---

## SECTION 5: PRODUCT EXPERIENCE WALKTHROUGH

### Scenario: Ops manager assigns DIY Training to 10 teachers on Monday

**Step 1: Open app on Monday**
- App loads with "Loading TrainOS data..." → auto-pull fires
- After pull: 847 teachers in roster, 0 assignments (if no prior assignments)
- ✅ This works

**Step 2: Assign DIY Training to 10 teachers**
- Open AssignModal → select "Intro to Python" → select 10 teachers → set deadline → confirm
- Assignment rows appear in Assignments tab with "Not Started" status, 0% progress
- Auto-push fires → Supabase write → Sheet write (unverifiable)
- ✅ This works (assignment creation is reliable)

**Step 3: Come back Tuesday, want to see who started**
- Open app → auto-pull fires
- **Problem 1:** Progress data is from whenever the Progress sheet was last refreshed. If Adhyayan data wasn't exported to the sheet since Monday, progress is stale. **Ops has no way to know this.**
- **Problem 2:** Even if progress IS fresh, the progress join depends on `adhyayanUserId`. If any of the 10 teachers don't have `adhyayanUserId` filled in the Teachers sheet, their progress shows as 0% even if they've completed 85%.
- **Problem 3:** The "In Training" KPI on Dashboard counts ALL teachers with pct>0, not just the 10 you assigned. It shows a large number that doesn't match your expectation.
- ❌ **Experience broken: Ops cannot reliably see who started their assigned course.**

**Step 4: Remind the ones who haven't started**
- Go to Assignments tab → filter by "Not Started"
- Select the 5 who show 0% → click "Send Reminder (5)"
- Toast says "✉ Reminder sent to Priya, Rohit +3 more"
- **Problem:** No email was sent. No API call made. No record anywhere. The button is a lie.
- ❌ **Experience broken: Ops believes they reminded 5 teachers. They didn't.**

**Step 5: Check if any are past deadline**
- Look at "Overdue" KPI → shows N overdue
- **Problem:** Overdue calculation uses `assignment.status !== "Completed"`. Even if a teacher completed 85% in Adhyayan (and completionStatus = "In Progress"), the assignment in Supabase still says "Not Started". If the deadline passed, they show as "overdue" even though they're actively progressing.
- The Days Left column shows "5d over" in red for teachers who are actually at 85%.
- ❌ **Experience broken: Ops sees "overdue" for teachers who are actually doing the work.**

### Overall verdict
The app looks operational but **gives unreliable information at every decision point**:
- "Who started?" → answer depends on stale progress data + adhyayanUserId matching
- "Who needs a reminder?" → answer is correct but the reminder doesn't work
- "Who is overdue?" → answer uses wrong status field, shows false positives

---

## ORDERED FIX LIST

### CRITICAL — Wrong data shown to user

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| C1 | Enrolled/avg/completed counts are fake seed data on course cards | courses.js, Courses.jsx, Dashboard.jsx | Derive from real assignment+progress data, or remove until real data is available. Show "—" instead of fake numbers. |
| C2 | Module funnel in Analytics is entirely fake | courses.js MODULES, Analytics.jsx | Show empty state "Module data not yet connected" instead of fake chart. Or hide Analytics until Phase 2. |
| C3 | "Not Started" KPI counts wrong thing | Dashboard.jsx line 8 | Change to: count teachers who have assignments but completionStatus = "Not Started". Not raw progress rows. |
| C4 | Overdue count uses assignment status, not completion status | Teachers.jsx line 65, Dashboard.jsx line 9 | Use `(r.completionStatus \|\| r.status) !== "Completed"` for overdue calculation. |

### HIGH — Data not persisting or updating

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| H1 | Send Reminder is fake | Teachers.jsx doRemind | Either remove the button, or add `(Coming soon)` label. Do NOT show "sent" toast. |
| H2 | Assignment status never syncs from progress | Supabase assignments.status | Either: (a) update assignment status from progress on Pull, or (b) stop showing assignment status entirely — only show completionStatus. |
| H3 | Teacher add is unverifiable | sheetsWriter.js no-cors | Add a "Pending — verify in sheet" warning instead of success toast. |
| H4 | No staleness indicator on progress data | Dashboard, Teachers | Show "Progress last updated: {lastUpdated from progress}" somewhere visible. |

### MEDIUM — Inconsistent labels or counts

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| M1 | "In Training" counts all progress, not just assigned | Dashboard.jsx line 7 | Intersect: count teachers who have BOTH an assignment AND pct > 0. |
| M2 | Same teacher shows different statuses in different views | Teachers.jsx, roster vs assignment row vs profile | Document clearly: roster shows TEACHER status, assignment row shows PROGRESS status. Add labels. |
| M3 | Filter by status uses assignment.status, display uses completionStatus | Teachers.jsx lines 44 vs 252 | Make filter also use `completionStatus \|\| status`. |

### LOW — Cosmetic or nice-to-have

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| L1 | KC score string comparison always passes | Teachers.jsx line 125 | Remove the `!== 'Not Completed'` check — kc1Score is always Number or null. |
| L2 | No "last synced" timestamp for progress specifically | SyncBar | Add progress freshness indicator. |
