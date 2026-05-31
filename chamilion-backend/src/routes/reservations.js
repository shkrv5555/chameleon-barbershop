import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { reservationsDb } from '../database.js';

const router = Router();

const TIME_SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

function isFutureSlot(date, timeSlot) {
  const [h, m] = timeSlot.split(':').map(Number);
  const slotDate = new Date(date);
  slotDate.setHours(h, m, 0, 0);
  return slotDate > new Date();
}

// GET /api/reservations/slots?date=YYYY-MM-DD
router.get('/slots', async (req, res) => {
  const { date } = req.query;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Tarix formatı YYYY-MM-DD olmalıdır' });
  }

  await reservationsDb.read();
  const reservations = reservationsDb.data.reservations || [];
  const bookedSlots = reservations
    .filter(r => r.date === date && r.status === 'active')
    .map(r => r.timeSlot);

  const slots = TIME_SLOTS.map(slot => ({
    time: slot,
    available: !bookedSlots.includes(slot) && isFutureSlot(date, slot)
  }));

  res.json({ date, slots });
});

// POST /api/reservations — yeni rezervasiya
router.post('/', async (req, res) => {
  const { customerName, customerPhone, date, timeSlot } = req.body;

  if (!customerName || !customerPhone || !date || !timeSlot) {
    return res.status(400).json({ error: 'Bütün sahələr doldurulmalıdır' });
  }
  if (!TIME_SLOTS.includes(timeSlot)) {
    return res.status(400).json({ error: 'Etibarsız saat' });
  }
  if (!isFutureSlot(date, timeSlot)) {
    return res.status(400).json({ error: 'Keçmiş tarix və ya saat seçilə bilməz' });
  }

  await reservationsDb.read();
  const reservations = reservationsDb.data.reservations;

  const conflict = reservations.find(
    r => r.date === date && r.timeSlot === timeSlot && r.status === 'active'
  );
  if (conflict) {
    return res.status(409).json({ error: 'Bu saat artıq tutulub' });
  }

  const token = uuidv4();
  const id = uuidv4();
  const newReservation = {
    id,
    customerName,
    customerPhone,
    date,
    timeSlot,
    customerToken: token,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  reservations.push(newReservation);
  await reservationsDb.write();

  // Socket.io: bütün müştərilərə slot yeniləməsini bildir
  const io = req.app.get('io');
  if (io) io.emit('slot-update', { date, timeSlot, available: false });

  res.status(201).json({
    message: 'Rezervasiya uğurla yaradıldı',
    reservation: {
      id,
      customerName,
      date,
      timeSlot,
      token,
      createdAt: newReservation.createdAt
    }
  });
});

// GET /api/reservations/my/:token — müştəri öz rezervasiyasını görür
router.get('/my/:token', async (req, res) => {
  await reservationsDb.read();
  const r = reservationsDb.data.reservations.find(
    r => r.customerToken === req.params.token && r.status === 'active'
  );
  if (!r) return res.status(404).json({ error: 'Rezervasiya tapılmadı' });

  res.json({
    id: r.id,
    customerName: r.customerName,
    customerPhone: r.customerPhone,
    date: r.date,
    timeSlot: r.timeSlot,
    createdAt: r.createdAt
  });
});

// DELETE /api/reservations/cancel/:token — müştəri ləğv edir
router.delete('/cancel/:token', async (req, res) => {
  await reservationsDb.read();
  const reservations = reservationsDb.data.reservations;
  const idx = reservations.findIndex(
    r => r.customerToken === req.params.token && r.status === 'active'
  );
  if (idx === -1) return res.status(404).json({ error: 'Aktiv rezervasiya tapılmadı' });

  const { date, timeSlot } = reservations[idx];
  reservations[idx].status = 'cancelled';
  reservations[idx].cancelledAt = new Date().toISOString();
  await reservationsDb.write();

  const io = req.app.get('io');
  if (io) io.emit('slot-update', { date, timeSlot, available: isFutureSlot(date, timeSlot) });

  res.json({ message: 'Rezervasiya ləğv edildi' });
});

export default router;
