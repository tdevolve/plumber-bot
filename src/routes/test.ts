import { Router } from 'express';
import { handleSmsIntake } from '../services/intake';
import { listJobs } from '../db/db';

const router = Router();

router.post('/intake', async (req, res) => {
  const from = String(req.body.from || '');
  const body = String(req.body.body || '');

  if (!from || !body) {
    return res.status(400).json({ error: 'from and body are required' });
  }

  try {
    const reply = await handleSmsIntake({ from, body });
    const jobs = listJobs();

    res.json({
      reply,
      jobs
    });
  } catch (err: any) {
    console.error('Error in /test/intake:', err);
    res.status(500).json({ error: 'internal_error', detail: String(err?.message || err) });
  }
});

export { router as testRouter };
