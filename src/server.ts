import express from 'express';
import { json, urlencoded } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './lib/config';
import { twilioRouter } from './routes/twilio';
import { adminRouter } from './routes/admin';
import { testRouter } from './routes/test';
import './db/db';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(urlencoded({ extended: false }));
app.use(json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/dashboard', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.use('/twilio', twilioRouter);
app.use('/admin', adminRouter);
app.use('/test', testRouter);

app.listen(config.port, () => {
  console.log(`Plumber bot listening on port ${config.port}`);
});
