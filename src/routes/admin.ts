import { Router } from 'express';
import { listJobs } from '../db/db';

const router = Router();

router.get('/jobs', (_req, res) => {
  res.json({ data: listJobs() });
});

export { router as adminRouter };
