import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { adminDb } from '../database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Şifrə tələb olunur' });

  await adminDb.read();
  const { admin } = adminDb.data;

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Şifrə yanlışdır' });

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

router.post('/change-password', requireAdmin, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Cari və yeni şifrə tələb olunur' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Yeni şifrə ən az 6 simvol olmalıdır' });
  }

  await adminDb.read();
  const { admin } = adminDb.data;

  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Cari şifrə yanlışdır' });

  adminDb.data.admin.passwordHash = await bcrypt.hash(newPassword, 10);
  await adminDb.write();

  res.json({ message: 'Şifrə uğurla dəyişdirildi' });
});

export default router;
