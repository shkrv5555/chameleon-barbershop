import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Scissors, Calendar, Clock, User, Phone, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react';
import { getSlots, createReservation, getMyReservation, cancelReservation } from '../api/client.js';
import { useSocket } from '../hooks/useSocket.js';
import PageTransition from '../components/PageTransition.jsx';

const TIME_SLOTS = ['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];
const TOKEN_KEY = 'chamilion_res_token';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('az-AZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function requestBrowserNotification(title, body) {
  if (!('Notification' in window)) return;
  const show = () => new Notification(title, { body, icon: '/favicon.ico' });
  if (Notification.permission === 'granted') { show(); return; }
  if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(p => { if (p === 'granted') show(); });
  }
}

export default function Reservation() {
  const [date, setDate] = useState(today());
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // My reservation
  const [myRes, setMyRes] = useState(null);
  const [myResLoading, setMyResLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Load saved token
  const savedToken = localStorage.getItem(TOKEN_KEY);

  const fetchSlots = useCallback(async (d) => {
    setSlotsLoading(true);
    setSelectedSlot('');
    try {
      const { data } = await getSlots(d);
      setSlots(data.slots);
    } catch { setSlots([]); }
    finally { setSlotsLoading(false); }
  }, []);

  useEffect(() => { fetchSlots(date); }, [date, fetchSlots]);

  // Real-time updates
  useSocket(({ date: updDate, timeSlot, available }) => {
    if (updDate !== date) return;
    setSlots(prev => prev.map(s => s.time === timeSlot ? { ...s, available } : s));
  });

  // Load my reservation
  useEffect(() => {
    if (!savedToken) return;
    setMyResLoading(true);
    getMyReservation(savedToken)
      .then(r => setMyRes(r.data))
      .catch(() => { localStorage.removeItem(TOKEN_KEY); setMyRes(null); })
      .finally(() => setMyResLoading(false));
  }, [savedToken]);

  const minDate = today();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedSlot) return toast.error('Saat seçin');
    if (!name.trim()) return toast.error('Adınızı daxil edin');
    if (!phone.trim()) return toast.error('Telefon nömrəsini daxil edin');

    setSubmitting(true);
    try {
      const { data } = await createReservation({ customerName: name.trim(), customerPhone: phone.trim(), date, timeSlot: selectedSlot });
      localStorage.setItem(TOKEN_KEY, data.reservation.token);
      setMyRes({ ...data.reservation, customerPhone: phone.trim() });
      toast.success('Rezervasiya uğurla yaradıldı!');
      requestBrowserNotification(
        'Chamilion Barbershop',
        `${data.reservation.customerName}, ${formatDate(date)} saat ${selectedSlot} üçün rezervasiyanız təsdiqləndi.`
      );
      setName(''); setPhone(''); setSelectedSlot('');
      fetchSlots(date);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      await cancelReservation(savedToken);
      localStorage.removeItem(TOKEN_KEY);
      setMyRes(null);
      setShowConfirm(false);
      toast.success('Rezervasiya ləğv edildi');
      fetchSlots(date);
    } catch { toast.error('Xəta baş verdi'); }
    finally { setCancelling(false); }
  }

  return (
    <PageTransition>
      {/* Header */}
      <div style={{ paddingTop: 120, paddingBottom: 60, textAlign: 'center', background: 'linear-gradient(180deg,rgba(18,19,24,0.88) 0%,transparent 100%)', borderBottom: '1px solid rgba(200,169,110,0.12)' }}>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic', color: '#C8A96E', fontSize: '1rem', marginBottom: 12 }}>
          Online rezervasiya
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(1.8rem,5vw,3rem)', color: '#F4F4F8', marginBottom: 16 }}>
          Rezervasiya
        </motion.h1>
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.35, duration: 0.5 }}
          style={{ width: 60, height: 2, background: 'linear-gradient(90deg,#C8A96E,#DCC08A)', margin: '0 auto', borderRadius: 1 }} />
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: 860 }}>

          {/* My active reservation */}
          {myResLoading && (
            <div style={{ textAlign: 'center', color: '#C8A96E', marginBottom: 32, fontFamily: 'Raleway,sans-serif' }}>Yüklənir...</div>
          )}

          <AnimatePresence>
            {myRes && !myResLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.4 }}
                className="card"
                style={{ marginBottom: 40, padding: '32px', border: '1px solid rgba(100,180,100,0.3)', background: 'rgba(220,230,220,0.5)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <CheckCircle size={22} color="#2d6e2d" />
                  <h3 style={{ fontFamily: 'Cinzel,serif', fontSize: '1rem', color: '#1a401a' }}>Aktiv Rezervasiyanız</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 20 }}>
                  {[
                    [User, 'Ad', myRes.customerName],
                    [Calendar, 'Tarix', formatDate(myRes.date)],
                    [Clock, 'Saat', myRes.timeSlot],
                  ].map(([Icon, label, val]) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.5)', borderRadius: 8, padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#2d6e2d', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        <Icon size={12} /> {label}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#1a401a', fontWeight: 500 }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => setShowConfirm(true)} className="btn btn-danger" style={{ fontSize: '0.78rem', padding: '9px 18px' }}>
                    <Trash2 size={13} /> Ləğv et
                  </button>
                  <span style={{ fontSize: '0.78rem', color: '#4a6e4a' }}>Rezervasiyanı ləğv etmək istəyirsinizsə bu düyməni basın.</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cancel confirm modal */}
          <AnimatePresence>
            {showConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 24 }}
                onClick={() => setShowConfirm(false)}
              >
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="card"
                  style={{ padding: '32px', maxWidth: 420, width: '100%' }}
                  onClick={e => e.stopPropagation()}
                >
                  <AlertCircle size={36} color="#c05050" style={{ marginBottom: 16 }} />
                  <h3 style={{ fontFamily: 'Cinzel,serif', fontSize: '1.05rem', marginBottom: 10, color: '#18181E' }}>Rezervasiyanı ləğv etmək istəyirsiniz?</h3>
                  <p style={{ color: '#6A6B75', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 24 }}>
                    Bu əməliyyat geri qaytarıla bilməz. Həmin saat digər müştərilər üçün açılacaq.
                  </p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={handleCancel} disabled={cancelling} className="btn btn-danger" style={{ flex: 1 }}>
                      {cancelling ? 'Ləğv edilir...' : 'Bəli, ləğv et'}
                    </button>
                    <button onClick={() => setShowConfirm(false)} className="btn btn-outline" style={{ flex: 1 }}>
                      Xeyr
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* New reservation form (only if no active reservation) */}
          {!myRes && (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 32 }}>

                {/* Left: Date + slots */}
                <div>
                  <div className="card emboss" style={{ padding: '28px' }}>
                    <h3 style={{ fontFamily: 'Cinzel,serif', color: '#18181E', fontSize: '0.95rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Calendar size={16} color="#C8A96E" /> Tarix seçin
                    </h3>
                    <div className="form-group" style={{ marginBottom: 24 }}>
                      <input
                        type="date"
                        className="input"
                        value={date}
                        min={minDate}
                        onChange={e => setDate(e.target.value)}
                        required
                      />
                    </div>

                    <h3 style={{ fontFamily: 'Cinzel,serif', color: '#18181E', fontSize: '0.95rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Clock size={16} color="#C8A96E" /> Saat seçin
                    </h3>

                    {slotsLoading ? (
                      <div style={{ textAlign: 'center', padding: '20px 0', color: '#C8A96E' }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                          <Scissors size={22} color="#C8A96E" />
                        </motion.div>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(80px,1fr))', gap: 8 }}>
                        {slots.map(slot => (
                          <motion.button
                            key={slot.time}
                            type="button"
                            whileHover={slot.available ? { scale: 1.05 } : {}}
                            whileTap={slot.available ? { scale: 0.97 } : {}}
                            onClick={() => slot.available && setSelectedSlot(slot.time)}
                            disabled={!slot.available}
                            style={{
                              padding: '10px 6px',
                              borderRadius: 8,
                              border: selectedSlot === slot.time ? '2px solid #C8A96E' : '1.5px solid rgba(100,101,110,0.25)',
                              background: selectedSlot === slot.time
                                ? 'linear-gradient(135deg,#2A2B35,#4A4B57)'
                                : slot.available
                                  ? 'rgba(240,241,248,0.7)'
                                  : 'rgba(180,100,100,0.1)',
                              color: selectedSlot === slot.time
                                ? '#C8A96E'
                                : slot.available ? '#18181E' : '#a05050',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: slot.available ? 'pointer' : 'not-allowed',
                              fontFamily: 'Raleway,sans-serif',
                              letterSpacing: '0.04em',
                              opacity: slot.available ? 1 : 0.6,
                              transition: 'all 0.2s',
                              position: 'relative',
                            }}
                          >
                            {slot.time}
                            {!slot.available && (
                              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <XCircle size={14} color="#c05050" style={{ position: 'absolute', top: 3, right: 3 }} />
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    )}

                    <div style={{ marginTop: 16, display: 'flex', gap: 16, fontSize: '0.75rem', color: '#6A6B75' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(240,241,248,0.7)', border: '1px solid rgba(100,101,110,0.3)' }} /> Boş
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(180,100,100,0.15)', border: '1px solid rgba(180,100,100,0.3)' }} /> Tutulub
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: 'linear-gradient(135deg,#2A2B35,#4A4B57)', border: '2px solid #C8A96E' }} /> Seçilib
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Customer info */}
                <div>
                  <div className="card emboss" style={{ padding: '28px' }}>
                    <h3 style={{ fontFamily: 'Cinzel,serif', color: '#18181E', fontSize: '0.95rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <User size={16} color="#C8A96E" /> Məlumatlarınız
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      <div className="form-group">
                        <label>Ad Soyad</label>
                        <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Adınızı daxil edin" required />
                      </div>
                      <div className="form-group">
                        <label>Telefon nömrəsi</label>
                        <input type="tel" className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+994 XX XXX XX XX" required />
                      </div>

                      {/* Summary */}
                      {selectedSlot && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          style={{ background: 'rgba(42,43,53,0.06)', borderRadius: 8, padding: '14px 16px', border: '1px solid rgba(42,43,53,0.12)' }}
                        >
                          <p style={{ fontFamily: 'Cinzel,serif', fontSize: '0.75rem', color: '#18181E', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Seçiminiiz</p>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ background: 'rgba(200,169,110,0.15)', border: '1px solid rgba(200,169,110,0.3)', borderRadius: 6, padding: '4px 10px', fontSize: '0.82rem', color: '#18181E' }}>
                              📅 {formatDate(date)}
                            </span>
                            <span style={{ background: 'rgba(200,169,110,0.15)', border: '1px solid rgba(200,169,110,0.3)', borderRadius: 6, padding: '4px 10px', fontSize: '0.82rem', color: '#18181E' }}>
                              🕐 {selectedSlot}
                            </span>
                          </div>
                        </motion.div>
                      )}

                      <motion.button
                        type="submit"
                        className="btn btn-primary"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={submitting || !selectedSlot}
                        style={{ width: '100%', justifyContent: 'center', opacity: (!selectedSlot || submitting) ? 0.6 : 1 }}
                      >
                        {submitting ? (
                          <>
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
                              <Scissors size={15} />
                            </motion.div>
                            Göndərilir...
                          </>
                        ) : (
                          <><Scissors size={15} /> Rezervasiya Et</>
                        )}
                      </motion.button>

                      <p style={{ fontSize: '0.76rem', color: '#9A9BA3', lineHeight: 1.5, textAlign: 'center' }}>
                        Rezervasiya etdikdən sonra ləğv etmə seçiminiz bu səhifədə görünəcək. Rezervasiya vaxtını dəyişmək üçün cari rezervasiyanı ləğv edib yenidən qeydiyyat aparın.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
