# TrainOS — Memory (Build Log)

## Bugs Fixed

### parseSheetJson — col.label empty for numeric-first-column sheets
Google Sheets gviz API returns empty col.label when column A contains numbers. Fixed by detecting if all labels are empty and falling back to first-row-as-headers mode.

### CATEGORIES[undefined].color crash
After fetchCourses(), some courses had cat values that didn't match CATEGORIES keys (casing, empty string). Fixed with `CATEGORIES[x] || CATEGORIES['coding']` guard everywhere.

### Temporal Dead Zone — const courses = courses.filter(...)
Bulk replacing COURSES to courses in .map() callbacks also renamed local variables to self-reference. Fixed by renaming local vars to catCourses.

### Date format — Google Sheets returns Date(2026,2,28) not YYYY-MM-DD
Google Sheets internal date format is Date(Y,M,D) where M is 0-indexed. parseJoinDate() handles this, YYYY-MM-DD strings, and "Month D YYYY" human-readable strings.

### Supabase 409 FK violation on assignment upsert
assignments.teacher_id FK references teachers table which was empty. Fixed by downgrading upsert errors to warnings (non-blocking) with onConflict option.

### Duplicate assignment guard type mismatch
Sheet teacherId is a number, UI tid is a string. Strict === comparison always failed. Fixed with String() normalization on both sides.

### Auto-push race condition
setTimeout(handlePush, 100) fired before React state updated. handlePush read stale pending state (empty array), did nothing. Fixed with useEffect watching assignments array, 500ms delay after state settles.

### Profile "Assigned Courses (0)" count mismatch
Count used raw assignments array, list used mergedAssignments. Different arrays, different lengths. Fixed by using String() comparison for teacherId matching on both count and list.

### Analytics crash on undefined course
courses.find(x=>x.id===cid) returned undefined when cid didn't match any course after Pull. Added fallback chain: find by cid, then first active, then courses[0], then empty state message.

### dLeft() returned NaN on empty/invalid dates
new Date('') produces Invalid Date. Math.ceil(NaN) = NaN. Rendered as "NaNd left". Fixed by returning null on empty/invalid dates, rendering "—" instead.

### Assignment status showed assignment status instead of progress status
The status column used a.status (from assignment = "Not Started" always for new assignments). Should use a.completionStatus (from progress merge = "In Progress" when teacher has started). Fixed by computing displayStatus = completionStatus || status.

## Patterns That Work

- Always normalize to String() before comparing IDs from different sources (sheet vs UI vs Supabase)
- parseSheetJson: check col.label presence before deciding header mode
- mergeData: flatten all joined fields onto the assignment row. Never do joins inside components.
- ErrorBoundary: always wrap Routes — prevents blank screen from any render crash
- CATEGORIES[x] || CATEGORIES['coding']: safe fallback pattern for any enum lookup
- parseJoinDate: handle 3 formats (YYYY-MM-DD, Date(Y,M,D), "Month D YYYY")
- dLeft(): return null not NaN, check for null in display logic

## What NOT to Do

- Don't use new Date("March 28, 2026") — locale dependent, breaks in Safari. Use parseJoinDate() instead.
- Don't use setTimeout for state-dependent operations. Use useEffect with the state as a dependency.
- Don't store pct on the assignments object. Progress is separate from assignment. Merge at display time only.
- Don't join via teacher name. Names have casing/whitespace issues. Use teacherId where possible, email as fallback.
- Don't bulk replace a prop name that shadows local variables in .map() callbacks. Check for self-referencing const declarations.
- Don't assume strict === works across data sources. Sheet returns numbers, UI may pass strings. Always String() normalize IDs.
- Don't use .find() inside .map() for large arrays. Use Map() lookups built once before the loop. mergeData went from O(n²) to O(n) with this change.
- Don't ship with hardcoded "last synced" timestamps. Always derive sync state from actual operations. LAST_PULL was "Today, 10:42 AM" for months.
- Don't use envelope icon (✉) on buttons that don't send. Icon implies action — only use when action is wired. The Remind button misled ops users.
- Don't show "✓ Synced" without validating data arrived. Check array lengths after fetch before marking sync complete.
