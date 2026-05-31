import { Router } from 'express';
import { servicesDb } from '../database.js';

const router = Router();

router.get('/', async (req, res) => {
  await servicesDb.read();
  res.json(servicesDb.data.services || []);
});

export default router;
