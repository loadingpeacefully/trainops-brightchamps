# TrainOS

> Admin platform for managing teacher training at BrightChamps.

**Live:** [trainops-brightchamps.pages.dev](https://trainops-brightchamps.pages.dev) · **Stack:** React 18 · Vite 5 · Supabase · Google Sheets · Cloudflare Pages

---

## What it does

Ops admins use TrainOS to assign training courses to ~847 teachers, track their progress through Adhyayan (the LMS), and identify teachers who haven't started or are past deadline. It replaces the manual spreadsheet cross-referencing that ops did before.

Four pages:
- **Dashboard** — KPIs (In Training / Not Started / Overdue) + per-subject breakdown
- **Courses** — 13 course cards with assign + analytics buttons
- **Teachers** — Assignments table, full roster, profile drill-down with KC scores
- **Analytics** — Per-course completion stats (module-level funnel pending Phase 2)

---

## Quick start

```bash
# 1. Clone
git clone https://github.com/loadingpeacefully/trainops-brightchamps.git
cd trainops-brightchamps

# 2. Install
pnpm install   # Node 20+ required (.nvmrc)

# 3. Configure
cp .env.example .env
# Then fill in real values — get from current owner

# 4. Run
pnpm dev       # http://localhost:5173
```

To build for production: `pnpm build` (output in `dist/`).

---

## Architecture in one diagram

```
┌──────────────┐         ┌─────────────┐         ┌──────────────┐
│ Google Sheet │ ──read──→  TrainOS UI ←──write──→   Supabase   │
│  (4 tabs)    │         │  (React SPA)│         │  assignments │
└──────────────┘         └─────────────┘         └──────────────┘
       ▲                        │                       │
       │                        │ best-effort           │
       └────── Apps Script ←────┘                       │
              (doPost mirror)                           │
                                                        ▼
                                                 ┌──────────────┐
                                                 │  Cloudflare  │
                                                 │    Pages     │
                                                 └──────────────┘
```

- **Read source:** Google Sheets (`Teachers`, `Courses`, `Assignments`, `Progress` tabs) via gviz JSON API
- **Write target:** Supabase (`assignments` table) — primary
- **Sheet mirror:** Google Apps Script `doPost` — best-effort writeback
- **Auth:** Supabase Auth + Google OAuth, restricted to `@brightchamps.com` emails
- **Hosting:** Cloudflare Pages, auto-deploys on push to `main`

---

## Documentation map

For anyone joining the project, read in this order:

| File | Purpose |
|---|---|
| [HANDOVER.md](./HANDOVER.md) | **Start here.** Status of every feature, data flow, accounts to transfer, ops tasks |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues (Supabase auto-pause, blank screen, etc.) |
| [CLAUDE.md](./CLAUDE.md) | Project guide for Claude Code sessions — full data model and gotchas |
| [DECISIONS.md](./DECISIONS.md) | Architecture decisions and why |
| [MEMORY.md](./MEMORY.md) | Bugs fixed and anti-patterns to avoid |
| [TASKS.md](./TASKS.md) | Completed work + backlog |
| [audit/](./audit/) | 6 historical audit reports — read if you hit unexpected behavior |

---

## Tech stack

- **Framework:** React 18 + JSX (no TypeScript)
- **Bundler:** Vite 5
- **Routing:** React Router v6
- **State:** `useState` in `App.jsx` only — no global state library
- **Styling:** Inline style objects, zero CSS files. Design tokens in `src/data/theme.js`
- **Auth:** Supabase Auth (Google OAuth)
- **Read source:** Google Sheets gviz JSON API
- **Write target:** Supabase + Apps Script doPost
- **Package manager:** pnpm

Bundle size: 427 KB (122 KB gzipped). Source maps disabled in production.

---

## Project status

**Live in production.** Used daily by the BrightChamps ops team.

Most features ✅ work. Two are intentionally partial:
- **Send Reminder** — button shows honest "not yet configured" toast (email integration is post-handover)
- **Module-level Analytics** — funnel chart shows "Phase 2" placeholder (waiting on Metabase wiring)

See [HANDOVER.md § 2](./HANDOVER.md#2-what-is-actually-working-right-now) for the full feature status table.

---

## License

Proprietary — BrightChamps internal use only. See [LICENSE](./LICENSE).
