import { Router } from 'express';
import { blogDb } from '../database.js';

const router = Router();

router.get('/', async (req, res) => {
  await blogDb.read();
  const posts = (blogDb.data.posts || []).map(p => ({
    id: p.id,
    title: p.title,
    excerpt: p.excerpt,
    createdAt: p.createdAt
  }));
  res.json(posts);
});

router.get('/:id', async (req, res) => {
  await blogDb.read();
  const post = (blogDb.data.posts || []).find(p => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post tapılmadı' });
  res.json(post);
});

export default router;
