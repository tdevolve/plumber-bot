# Plumber Bot

Plumber Bot is an SMS-driven intake, triage, and dispatch helper for service businesses (starting with plumbing).

## High-level flow

1. **Intake**  
   - Customer texts a Twilio number describing the plumbing issue.  
   - `/twilio` route receives the webhook, normalizes fields, and writes a `jobs` row to SQLite.

2. **Triage**  
   - `src/services/triage.ts` scores the job based on issue text + urgency.  
   - It outputs a `triage_risk_score`, `triage_priority_band` (LOW/NORMAL/HIGH/CRITICAL), and `triage_action` like `call_now` or `schedule_today`.

3. **Dispatch suggestion**  
   - A simple dispatcher uses address + triage output to pick a recommended tech + slot.  
   - The suggestion is stored on the job as `recommended_tech_id` and `recommended_slot`.

4. **Dashboard**  
   - `/dashboard` serves `public/admin.html`.  
   - Frontend calls `/admin/jobs` to show live jobs with risk, priority badge, action, and recommended dispatch.

## Key endpoints

- `POST /twilio` – Twilio SMS webhook intake.
- `GET /admin/jobs` – JSON feed of jobs for the dashboard.
- `GET /dashboard` – Operator dashboard UI.
- `GET /test/seed` (if present) – Helper route to seed or test data.

## Tech stack

- Node.js + TypeScript + Express.
- SQLite for persistence (file: `plumber-bot.db`).
- Simple HTML/JS dashboard (no frontend framework).

## Running locally

### Development

- Start the TypeScript server with automatic reload:

```bash
pnpm dev
```

This runs `tsx src/server.ts` and serves the app on port 3000 by default.

### Production-style test (compiled)

- Build TypeScript to JavaScript and run from `dist`:

```bash
npx pnpm build
npx pnpm start
```

This runs `tsc` to emit `dist/` and then `node dist/server.js`, matching how the app will run in production.

### Database

- Currently using a local SQLite file: `plumber-bot.db`.
- Driver is in flux while testing deployment options (`sqlite3` vs `better-sqlite3`) so DB access code may change; for now it assumes a single local file DB in the project root.

## Workflow overview

This bot follows a simple pipeline that can be reused for other verticals (dental, wound care, etc.):

1. **Intake (SMS or chat)**
   - Twilio (or another channel) sends a webhook to `POST /twilio`.
   - The request is normalized into a `job` record and saved in SQLite (`plumber-bot.db`).

2. **Triage**
   - `src/services/triage.ts` inspects the free-text issue plus urgency.
   - It calculates:
     - `triage_risk_score` (numeric)
     - `triage_priority_band` (LOW / NORMAL / HIGH / CRITICAL)
     - `triage_action` (e.g. `call_now`, `schedule_today`, `schedule_later`)

3. **Dispatch suggestion**
   - A simple dispatcher looks at address + triage output.
   - It chooses a `recommended_tech_id` and `recommended_slot` and stores them back on the job row.

4. **Operator dashboard**
   - `GET /dashboard` serves `public/admin.html`.
   - Frontend calls `GET /admin/jobs` to render:
     - customer + issue
     - urgency + priority badge
     - risk score + triage action
     - recommended tech + time slot
