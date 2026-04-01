# TrainOS — Supabase vs Sheet Gap Audit

**Date:** 2026-04-01

---

## Gap 1: Supabase has more assignments than Sheet

**Current state:**
- `pushAssignments()` writes to Supabase (primary) then attempts Sheet write via no-cors Apps Script (best-effort, api.js:286)
- `fetchAssignments()` reads Supabase first (api.js:151), falls back to Sheet only if Supabase returns 0 rows or errors (api.js:168)
- The no-cors sheet write (sheetsWriter.js:16-21) cannot confirm success — opaque response means HTTP 4xx/5xx won't throw
- Every assignment created in the app goes to Supabase reliably. Some may or may not reach the Sheet.

**Which assignments are in Supabase but not Sheet?**
Any assignment where the Apps Script either: (a) didn't receive the POST (network issue), (b) received it but the doPost function errored, (c) received it but wrote to wrong tab/row. Since no-cors gives zero feedback, there's no way to know from the client.

**Does this cause a visible bug right now?**
No. The app reads from Supabase first. Users see all their assignments. The Sheet Assignments tab is stale but irrelevant unless Supabase goes down.

**Minimum fix:**
Accept that Sheet Assignments tab is a best-effort mirror, not source of truth. Add a comment in the code documenting this. No code change needed — the architecture already prefers Supabase.

**Long-term fix:**
Run a server-side cron (Supabase Edge Function or Apps Script time trigger) that reads Supabase `assignments` table and syncs it to the Sheet every N minutes. This keeps the Sheet up to date for ops team viewing without relying on no-cors client writes.

---

## Gap 2: Supabase teachers table has wrong schema + is never read

**Current state:**
- `fetchTeachers()` reads from Google Sheet only (api.js:77-109). Supabase teachers table is never queried.
- `pushTeacher()` writes to Sheet via Apps Script (api.js:253-263). Supabase teachers table is never written to.
- The Supabase `teachers` table likely has the old schema: `id, name, email, phone, batch_id, join_date, pct, status, created_at`
- The app's teacher model now has: `id, name, email, phone, vertical, team_lead, region, join_date, status, adhyayan_user_id, learning_path_link`

**Does this cause a visible bug right now?**
No. The teachers table in Supabase is completely unused — not read, not written. It's dead infrastructure.

**Minimum fix:**
Do nothing. The table is inert. Optionally drop it to avoid confusion:
```sql
DROP TABLE IF EXISTS teachers;
```

**Long-term fix:**
If Supabase is needed as a teachers store later (e.g., for RLS, for direct API access by other tools), recreate with correct schema:
```sql
CREATE TABLE teachers (
  id            BIGINT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  vertical      TEXT,
  team_lead     TEXT,
  region        TEXT,
  join_date     DATE,
  status        TEXT DEFAULT 'Active',
  adhyayan_user_id TEXT,
  learning_path_link TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```
Then wire `fetchTeachers()` to read from Supabase (with Sheet as fallback), similar to how `fetchAssignments()` works today.

---

## Gap 3: Supabase assignments table has `pct` column that's always 0

**Current state:**
- `pushAssignments()` writes: `id, teacher_id, course_id, assigned_date, deadline, status` (api.js:270-277). No `pct` field sent.
- The Supabase `assignments` table likely has a `pct` column from the original schema.
- `pct` is derived from the Progress sheet at display time via `mergeData()` (api.js:235: `prog?.pct ?? 0`).
- The `pct` column in Supabase stays at its default value (0 or NULL) for every row.

**Does this cause a visible bug right now?**
No. The app never reads `pct` from Supabase assignments. When `fetchAssignments()` reads from Supabase (api.js:154-161), it maps `id, teacher_id, course_id, assigned_date, deadline, status` — no `pct`. Progress comes from the Progress sheet via `mergeData()`.

**Minimum fix:**
Leave as-is. The column is harmless — it just always contains 0/NULL.

**Long-term fix:**
Drop the column to keep schema clean:
```sql
ALTER TABLE assignments DROP COLUMN IF EXISTS pct;
```

---

## Gap 4: Supabase assignments schema may have stale columns

**Current state:**
The original `pushAssignments()` sent `pct` as a column. The current version does not. But the table may also have columns from earlier iterations that aren't needed.

**Expected clean schema:**
```sql
CREATE TABLE assignments (
  id            BIGINT PRIMARY KEY,
  teacher_id    BIGINT NOT NULL,
  course_id     TEXT NOT NULL,
  assigned_date DATE,
  deadline      DATE,
  status        TEXT DEFAULT 'Not Started',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

**Minimum fix:**
Verify actual schema in Supabase dashboard. If it has extra columns (`pct`, `batch_id`, etc.), drop them.

---

## DATA CONTRACT (current architecture)

```
Teachers:    READ from Sheet only. WRITE to Sheet via Apps Script.
Courses:     READ from Sheet (merged with hardcoded). No writes.
Assignments: READ from Supabase (primary), Sheet (fallback).
             WRITE to Supabase (primary), Sheet (best-effort).
Progress:    READ from Sheet only. No writes.

Supabase teachers table: UNUSED. Can be dropped.
Supabase assignments table: Primary write target + read source.
Sheet Assignments tab: Best-effort mirror. May be stale.
```

---

## FIX PLAN

### Tier 1: No code changes needed (Supabase console only)

```sql
-- 1. Drop unused teachers table
DROP TABLE IF EXISTS teachers;

-- 2. Clean assignments table schema
ALTER TABLE assignments DROP COLUMN IF EXISTS pct;

-- 3. Verify assignments table matches expected schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'assignments'
ORDER BY ordinal_position;
```

### Tier 2: Code documentation (no logic change)

Add DATA CONTRACT comment block to the top of `src/lib/api.js`.

### Tier 3: Long-term sync (post-handover)

Create a Supabase Edge Function or Apps Script time trigger that runs every 15 minutes:
1. Reads all rows from `supabase.assignments`
2. Overwrites the Assignments sheet tab with the full dataset
3. Logs sync timestamp

This keeps Sheet and Supabase in sync without relying on no-cors client writes.
