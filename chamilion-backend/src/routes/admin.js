import { Router } from 'express';
import { reservationsDb, servicesDb, blogDb } from '../database.js';
import { requireAdmin } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
router.use(requireAdmin);

// ── Rezervasiyalar ──────────────────────────────────────────────
router.get('/reservations', async (req, res) => {
  await reservationsDb.read();
  let list = reservationsDb.data.reservations || [];
  if (req.query.date) list = list.filter(r => r.date === req.query.date);
  if (req.query.status) list = list.filter(r => r.status === req.query.status);
  list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list);
});

// Admin başqa müştəri əlavə edir (ləğv edilmiş slota)
router.post('/reservations/add', async (req, res) => {
  const { customerName, customerPhone, date, timeSlot } = req.body;
  if (!customerName || !customerPhone || !date || !timeSlot) {
    return res.status(400).json({ error: 'Bütün sahələr tələb olunur' });
  }

  await reservationsDb.read();
  const reservations = reservationsDb.data.reservations;
  const conflict = reservations.find(
    r => r.date === date && r.timeSlot === timeSlot && r.status === 'active'
  );
  if (conflict) return res.status(409).json({ error: 'Bu saat artıq tutulub' });

  const newRes = {
    id: uuidv4(),
    customerName,
    customerPhone,
    date,
    timeSlot,
    customerToken: uuidv4(),
    status: 'active',
    addedByAdmin: true,
    createdAt: new Date().toISOString()
  };
  reservations.push(newRes);
  await reservationsDb.write();

  const io = req.app.get('io');
  if (io) io.emit('slot-update', { date, timeSlot, available: false });

  res.status(201).json({ message: 'Müştəri əlavə edildi', reservation: newRes });
});

// Admin rezervasiya ləğv edir
router.delete('/reservations/:id', async (req, res) => {
  await reservationsDb.read();
  const reservations = reservationsDb.data.reservations;
  const idx = reservations.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Tapılmadı' });

  const { date, timeSlot } = reservations[idx];
  reservations[idx].status = 'cancelled';
  reservations[idx].cancelledAt = new Date().toISOString();
  await reservationsDb.write();

  const io = req.app.get('io');
  if (io) io.emit('slot-update', { date, timeSlot, available: true });

  res.json({ message: 'Rezervasiya ləğv edildi' });
});

// ── Xidmətlər ──────────────────────────────────────────────────
router.get('/services', async (req, res) => {
  await servicesDb.read();
  res.json(servicesDb.data.services || []);
});

router.post('/services', async (req, res) => {
  const { name, description, price, duration, icon } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Ad və qiymət tələb olunur' });

  await servicesDb.read();
  const services = servicesDb.data.services;
  const id = services.length ? Math.max(...services.map(s => s.id)) + 1 : 1;
  const newService = { id, name, description: description || '', price: Number(price), duration: Number(duration) || 60, icon: icon || 'Scissors' };
  services.push(newService);
  await servicesDb.write();
  res.status(201).json(newService);
});

router.put('/services/:id', async (req, res) => {
  await servicesDb.read();
  const services = servicesDb.data.services;
  const idx = services.findIndex(s => s.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Tapılmadı' });

  const { name, description, price, duration, icon } = req.body;
  if (name) services[idx].name = name;
  if (description !== undefined) services[idx].description = description;
  if (price) services[idx].price = Number(price);
  if (duration) services[idx].duration = Number(duration);
  if (icon) services[idx].icon = icon;
  await servicesDb.write();
  res.json(services[idx]);
});

router.delete('/services/:id', async (req, res) => {
  await servicesDb.read();
  const before = servicesDb.data.services.length;
  servicesDb.data.services = servicesDb.data.services.filter(s => s.id !== Number(req.params.id));
  if (servicesDb.data.services.length === before) return res.status(404).json({ error: 'Tapılmadı' });
  await servicesDb.write();
  res.json({ message: 'Silindi' });
});

// ── Blog ────────────────────────────────────────────────────────
router.get('/blog', async (req, res) => {
  await blogDb.read();
  res.json(blogDb.data.posts || []);
});

router.post('/blog', async (req, res) => {
  const { title, content, excerpt } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Başlıq və məzmun tələb olunur' });

  await blogDb.read();
  const posts = blogDb.data.posts;
  const id = posts.length ? Math.max(...posts.map(p => p.id)) + 1 : 1;
  const post = { id, title, content, excerpt: excerpt || content.slice(0, 120) + '...', createdAt: new Date().toISOString() };
  posts.push(post);
  await blogDb.write();
  res.status(201).json(post);
});

router.put('/blog/:id', async (req, res) => {
  await blogDb.read();
  const posts = blogDb.data.posts;
  const idx = posts.findIndex(p => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Tapılmadı' });

  const { title, content, excerpt } = req.body;
  if (title) posts[idx].title = title;
  if (content) { posts[idx].content = content; posts[idx].excerpt = excerpt || content.slice(0, 120) + '...'; }
  await blogDb.write();
  res.json(posts[idx]);
});

router.delete('/blog/:id', async (req, res) => {
  await blogDb.read();
  const before = blogDb.data.posts.length;
  blogDb.data.posts = blogDb.data.posts.filter(p => p.id !== Number(req.params.id));
  if (blogDb.data.posts.length === before) return res.status(404).json({ error: 'Tapılmadı' });
  await blogDb.write();
  res.json({ message: 'Silindi' });
});

export default router;
