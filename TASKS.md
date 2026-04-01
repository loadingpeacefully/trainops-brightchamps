# TrainOS — Tasks

## Done
- [x] React + Vite + Recharts scaffold
- [x] BrightChamps design system (Poppins, Nunito Sans, #4360FD blue)
- [x] 4 pages: Dashboard, Courses, Analytics, Teachers
- [x] Google Sheets Pull (4 tabs: Teachers, Courses, Assignments, Progress)
- [x] Supabase Push (assignments + teachers)
- [x] Google Apps Script sheet writer (doPost)
- [x] Google OAuth login restricted to @brightchamps.com
- [x] mergeData() join layer (teacher + course + progress per assignment)
- [x] parseSheetJson() dual-mode (col.label + first-row fallback)
- [x] parseJoinDate() handles Date(Y,M,D), "Month D YYYY", YYYY-MM-DD
- [x] Duplicate assignment guard (String-normalized teacherId comparison)
- [x] Auto-push via useEffect (500ms after pending change)
- [x] Error boundary (prevents blank screen on crash)
- [x] KC1/KC2/Avg scores in teacher profile
- [x] Vertical filter in teacher roster
- [x] StatusTag handles Active/Inactive/Offboarding
- [x] Learning path link in profile
- [x] VERTICALS centralized in nav.js
- [x] Dynamic deadline (today + 30 days)
- [x] Profile assignment count matches list (String-normalized)
- [x] Dead code cleanup (removed BATCHES, INIT_ASSIGNMENTS, bLbl, debug logs)
- [x] Analytics crash guard (undefined course fallback)
- [x] dLeft() NaN guard (returns null on invalid dates)
- [x] Assignment status uses completionStatus from progress merge
- [x] Remove fake MODULES data from courses.js
- [x] Remove empty teachers.js
- [x] Fix LAST_PULL hardcoded string → "Not synced yet"
- [x] Pull validation — warns on empty data
- [x] mergeData O(1) Map lookups (was O(n²) with .find())
- [x] useMemo for Dashboard KPIs + catSummary
- [x] Remove _reference/ and sheet_data/ from repo (-8K lines)
- [x] Disable source maps in production build
- [x] Profile course card uses completionStatus not stale assignment status
- [x] Loading screen until first pull completes (no flash of empty content)
- [x] Dashboard derives enrolled/avg from real assignments+progress
- [x] Pushed to GitHub + deployed on Cloudflare Pages

## In Progress
- [ ] Wire VITE_SHEET_WRITER_URL in Cloudflare Pages (AppScript doPost)
- [ ] Transfer accounts to BrightChamps-owned Cloudflare/Supabase/Google Cloud

## Backlog (P2)
- [ ] localStorage fallback for pending assignments (survive refresh)
- [ ] Email reminders via Supabase Edge Function + Resend API
- [ ] Module-level analytics Phase 2 (wire Metabase module funnel)
- [ ] Supabase RLS policies
- [ ] Mobile responsive sidebar
- [ ] Add email column to adhyayan.users for tt_ accounts (tech team ask)
