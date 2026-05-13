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
