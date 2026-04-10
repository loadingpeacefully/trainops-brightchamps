# TrainOS — Troubleshooting

Common issues and how to fix them. Read this before opening DevTools.

---

## 1. Live site shows a blank page

**Symptoms:** https://trainops-brightchamps.pages.dev loads but you see only the background colour, no UI. DevTools Console shows `net::ERR_NAME_NOT_RESOLVED` for `*.supabase.co` or `TypeError: Failed to fetch` in a refresh-token loop.

**Cause:** **Supabase free-tier project is paused.** Free projects auto-pause after ~7 days of inactivity. Once paused, the URL stops resolving in DNS. The app tries to refresh a stored session token, the request fails, and (until commit `3a8269d`) the auth flow hung forever.

**Fix:**

1. Log in to https://supabase.com/dashboard
2. Open project `shdofgxhdtppedjoprfm`
3. If status shows **"Paused"** → click **Restore project** (~1 min to wake)
4. Verify the URL responds: open `https://shdofgxhdtppedjoprfm.supabase.co` in a browser tab. You should see JSON like `{"message":"no Route matched..."}` (200 or 404, but **NOT** a DNS error)
5. Hard-refresh the live site (Cmd+Shift+R)

**Prevent:** Either upgrade Supabase to a paid plan (no auto-pause), or set up a weekly cron that pings the Supabase REST endpoint to keep it active. See [HANDOVER.md § 8](./HANDOVER.md#8-known-gaps-and-pending-work).

---

## 2. Login button does nothing / Google OAuth screen never opens

**Symptoms:** Click "Sign in with Google" → nothing happens, or popup opens then closes immediately.

**Possible causes:**

| Cause | Check | Fix |
|---|---|---|
| Supabase project paused | DevTools Console for `ERR_NAME_NOT_RESOLVED` | See issue #1 above |
| OAuth client misconfigured | Supabase Dashboard → Authentication → Providers → Google | Confirm Client ID + Secret are filled |
| Authorized redirect URI missing | Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 client | Ensure `https://shdofgxhdtppedjoprfm.supabase.co/auth/v1/callback` is in Authorized redirect URIs |
| Domain restriction blocking you | Login.jsx checks email ends with `@brightchamps.com` | Use a brightchamps.com Google account |

---

## 3. Pull button shows "Synced" but Teachers/Courses/Assignments are empty

**Symptoms:** Click Pull → SyncBar says "Just now" → but tables are empty.

**Cause:** Cloudflare env vars not set, OR Google Sheet became private, OR sheet structure changed.

**Fix:**

1. Open DevTools → Console. Look for `[api]` log lines:
   - `fetchTeachers: 0 from sheet` → sheet is reachable but empty
   - `fetchTeachers: sheet failed, trying Supabase` → sheet URL broken
   - Nothing logged → env var missing
2. Verify Cloudflare Pages env vars are set: Cloudflare Dashboard → `trainops-brightchamps` → Settings → Environment variables. All 7 `VITE_*` vars must be present.
3. Test the sheet URL directly: paste `VITE_SHEET_TEACHERS_URL` into a browser tab. Should return JSON wrapped in `google.visualization.Query.setResponse(...)`. If you see "You need access" or 404, sheet permissions changed — set sheet sharing to "Anyone with the link can view".

---

## 4. Teacher progress shows 0% for everyone

**Symptoms:** Roster loads, assignments load, but every teacher's progress bar is at 0%.

**Possible causes:**

| Cause | Check | Fix |
|---|---|---|
| Progress sheet is empty | Console: `fetchProgress: 0 with valid teacherId` | Refresh Progress sheet from Adhyayan (see [HANDOVER.md § 9.2](./HANDOVER.md#2-how-to-refresh-progress-data-adhyayan--sheet)) |
| Progress sheet has wrong column headers | Console: `fetchProgress: N total rows, 0 with valid teacherId` | Check sheet headers match exactly: `teacherId`, `courseId`, `pct`, `completionStatus`, `kc1Score`, `kc2Score`, `avgScore`, `lastUpdated`, `adhyayanUserId`, `name` |
| Teachers missing `adhyayanUserId` | 244 teachers will always show 0% | Tech team must backfill `adhyayanUserId` in Teachers sheet for `tt_*` accounts |
| Join key mismatch | Some teachers show real progress, others don't | This is expected — see [HANDOVER.md § 3 join chain](./HANDOVER.md#join-chain) |

---

## 5. Assignment created but disappears after page refresh

**Symptoms:** Click Assign → row appears with orange ● → refresh page → row is gone.

**Cause:** Auto-push hasn't completed before refresh, OR Supabase write failed.

**Fix:**

1. After assigning, wait for the orange ● dot to disappear (means push succeeded)
2. If the dot stays, click Push manually
3. Check DevTools Console for `[api] pushAssignments: Supabase failed:` errors
4. If Supabase is the issue, check if the project is paused (issue #1)

**Architectural note:** Supabase is the source of truth for assignments. The Sheet is a best-effort mirror via no-cors POST. If both fail, the assignment exists only in client memory and is lost on refresh.

---

## 6. Build fails locally (`pnpm build`)

**Symptoms:** `pnpm build` errors out before producing `dist/`.

**Common causes:**

| Error | Cause | Fix |
|---|---|---|
| `Cannot find module '@data/...'` | Wrong Node version or path alias broken | `nvm use` (reads `.nvmrc`), then `pnpm install` |
| `Module not found: '@supabase/...'` | Missing dependency | `pnpm install` |
| `vite: command not found` | Node modules missing | `pnpm install` |
| Type errors | We don't use TypeScript — should never happen | Check you didn't accidentally introduce `.ts` files |

---

## 7. Cloudflare Pages deploy fails

**Symptoms:** Push to `main` → Cloudflare Pages dashboard shows red "Failed" deployment.

**Fix:**

1. Cloudflare Dashboard → Pages → `trainops-brightchamps` → Deployments → click the failed one → "View build log"
2. Common issues:
   - **`pnpm: command not found`** → Cloudflare auto-detects pnpm from `pnpm-lock.yaml`. If it doesn't, set Build command to `npx pnpm install && npx pnpm build`
   - **Env var missing** → app builds but errors at runtime. Add the missing var in Settings → Environment variables, then "Retry deployment"
   - **Node version mismatch** → Set `NODE_VERSION=20` in env vars

---

## 8. Send Reminder button does nothing

**Symptoms:** Click "Remind" → toast appears → no email is sent.

**This is intentional.** Email reminders are not yet wired. The toast says "email reminders coming soon" to be honest about the state. Wiring this requires Supabase Edge Function + Resend API. See [HANDOVER.md § 8](./HANDOVER.md#8-known-gaps-and-pending-work).

---

## 9. Stuck "Loading TrainOS data..." screen forever

**Symptoms:** Sign in → see the 🎓 + "Loading TrainOS data..." → never goes away.

**Cause:** First Pull is failing silently. This could be:
- Network issue (you're offline)
- All 4 sheet URLs returning empty/erroring
- Supabase paused (the assignments fetch is failing)

**Fix:**

1. DevTools → Console. Look for `[sync] Pull returned no data` or `[sync] Pull failed`
2. DevTools → Network. Check if requests to `docs.google.com/spreadsheets/...` succeed
3. If everything is failing, check internet connection and Supabase status (issue #1)

---

## 10. New code change isn't showing up on the live site

**Symptoms:** Pushed to `main` → can't see the change at https://trainops-brightchamps.pages.dev.

**Fix:**

1. Cloudflare Dashboard → `trainops-brightchamps` → Deployments. Verify the latest commit hash matches your push.
2. If the deploy is still building, wait ~1-2 min
3. Once green, **hard-refresh** the live site: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows). Cloudflare's CDN caches aggressively.
4. If still not showing, try an incognito window to bypass all local cache.
5. If still not showing, the deploy may have succeeded but with old code — check the JS bundle filename in DevTools → Network. The hash should change between deploys.

---

## When in doubt

1. Check Cloudflare Pages → Deployments — is the latest deploy green?
2. Check Supabase Dashboard — is the project active (not paused)?
3. Check Google Sheet — are all 4 tabs accessible and have data?
4. Check DevTools Console for `[api]` and `[sync]` log lines

If none of the above helps, read the audit folder (`/audit/*.md`) — it documents every bug we hit during development and how each was fixed.
