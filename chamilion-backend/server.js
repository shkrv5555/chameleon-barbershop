import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import os from 'os';

import { initDb } from './src/database.js';
import authRoutes from './src/routes/auth.js';
import reservationRoutes from './src/routes/reservations.js';
import serviceRoutes from './src/routes/services.js';
import blogRoutes from './src/routes/blog.js';
import adminRoutes from './src/routes/admin.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Railway: frontend built into ./public  |  Local: ../chamilion-frontend/dist
const distPath = existsSync(join(__dirname, 'public'))
  ? join(__dirname, 'public')
  : join(__dirname, '../chamilion-frontend/dist');
const isProd = existsSync(distPath);

const app = express();
const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});
app.set('io', io);

app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'Chameleon Barbershop API' }));

// ── Serve built frontend (production) ───────────────────────────
if (isProd) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
  console.log(`\n🌐 Serving frontend from: ${distPath}`);
}

io.on('connection', socket => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

await initDb();

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';
httpServer.listen(PORT, HOST, () => {
  const networkIP = Object.values(os.networkInterfaces() || {})
    .flat().find(i => i?.family === 'IPv4' && !i.internal)?.address || 'localhost';
  console.log(`\n✂️  Chameleon Barbershop — Running`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://${networkIP}:${PORT}\n`);
});
