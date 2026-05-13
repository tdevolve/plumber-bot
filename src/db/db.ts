import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'plumber-bot.db');

sqlite3.verbose();
export const db = new sqlite3.Database(dbPath);

// Simple helper to run schema + seed on startup
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT,
      phone TEXT,
      issue TEXT,
      urgency TEXT,
      triage_risk_score INTEGER,
      triage_priority_band TEXT,
      triage_action TEXT,
      recommended_tech_id INTEGER,
      recommended_slot TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});
