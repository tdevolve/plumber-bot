import Database from 'better-sqlite3';

export const db = new Database('plumber-bot.db');

db.exec(`
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  step TEXT NOT NULL,
  name TEXT,
  address TEXT,
  issue TEXT,
  urgency TEXT,
  preferred_window TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  customer_name TEXT,
  address TEXT,
  issue TEXT,
  urgency TEXT,
  preferred_window TEXT,
  source TEXT NOT NULL DEFAULT 'twilio_sms',
  crm_status TEXT NOT NULL DEFAULT 'pending_hcp',
  notes TEXT,
  triage_risk_score INTEGER,
  triage_priority_band TEXT,
  triage_category TEXT,
  triage_action TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

export function getConversation(phone: string) {
  return db.prepare('SELECT * FROM conversations WHERE phone = ? AND status = ? ORDER BY id DESC LIMIT 1')
    .get(phone, 'open') as any;
}

export function createConversation(phone: string) {
  db.prepare('INSERT INTO conversations (phone, step) VALUES (?, ?)').run(phone, 'ask_name');
  return getConversation(phone);
}

export function updateConversation(phone: string, fields: Record<string, unknown>) {
  const keys = Object.keys(fields);
  const assignments = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => fields[k]);
  db.prepare(`UPDATE conversations SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE phone = ? AND status = 'open'`)
    .run(...values, phone);
  return getConversation(phone);
}

export function closeConversation(phone: string) {
  db.prepare(`UPDATE conversations SET status = 'complete', updated_at = CURRENT_TIMESTAMP WHERE phone = ? AND status = 'open'`)
    .run(phone);
}

export function createJob(payload: {
  phone: string;
  customer_name: string;
  address: string;
  issue: string;
  urgency: string;
  preferred_window: string;
  notes?: string;
  triage_risk_score: number;
  triage_priority_band: string;
  triage_category: string;
  triage_action: string;
}) {
  const result = db.prepare(`
    INSERT INTO jobs (
      phone, customer_name, address, issue, urgency, preferred_window,
      source, crm_status, notes,
      triage_risk_score, triage_priority_band, triage_category, triage_action
    )
    VALUES (?, ?, ?, ?, ?, ?, 'twilio_sms', 'pending_hcp', ?, ?, ?, ?, ?)
  `).run(
    payload.phone,
    payload.customer_name,
    payload.address,
    payload.issue,
    payload.urgency,
    payload.preferred_window,
    payload.notes || '',
    payload.triage_risk_score,
    payload.triage_priority_band,
    payload.triage_category,
    payload.triage_action
  );
  return db.prepare('SELECT * FROM jobs WHERE id = ?').get(result.lastInsertRowid) as any;
}

export function listJobs() {
  return db.prepare('SELECT * FROM jobs ORDER BY id DESC LIMIT 100').all();
}
