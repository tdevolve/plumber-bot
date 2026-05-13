import express from 'express';
import { json, urlencoded } from 'express';
import path from 'path';
import { config } from './lib/config';
import { twilioRouter } from './routes/twilio';
import { adminRouter } from './routes/admin';
import { testRouter } from './routes/test';
import './db/db';

const app = express();

// __dirname works in CJS-compiled output; TS will down-compile this import.
const staticRoot = path.join(__dirname, '../public');

app.use(urlencoded({ extended: false }));
app.use(json());
app.use(express.static(staticRoot));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/dashboard', (_req, res) => {
  res.sendFile(path.join(staticRoot, 'admin.html'));
});

app.use('/twilio', twilioRouter);
app.use('/admin', adminRouter);
app.use('/test', testRouter);

app.listen(config.port, () => {
  console.log(`Plumber bot listening on port ${config.port}`);
});
