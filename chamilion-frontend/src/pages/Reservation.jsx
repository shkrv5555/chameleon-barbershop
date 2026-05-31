import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Scissors, Calendar, Clock, User, Phone, CheckCircle, AlertCircle, Trash2, ChevronRight } from 'lucide-react';
import { getSlots, createReservation, getMyReservation, cancelReservation } from '../api/client.js';
import { useSocket } from '../hooks/useSocket.js';
import PageTransition from '../components/PageTransition.jsx';

const TOKEN_KEY = 'chamilion_res_token';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('az-AZ', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

function requestBrowserNotification(title, body) {
  if (!('Notification' in window)) return;
  const show = () => new Notification(title, { body, icon: '/favicon.ico' });
  if (Notification.permission === 'granted') { show(); return; }
  if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(p => { if (p === 'granted') show(); });
  }
}

// Step indicator
function Steps({ current }) {
  const steps = ['Tarix', 'Saat', 'Məlumat'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 40 }}>
      {steps.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: current > i ? 'linear-gradient(135deg,#C8A96E,#DCC08A)'
                : current === i ? 'linear-gradient(135deg,#2A2B35,#4A4B57)'
                : 'rgba(100,101,110,0.15)',
              border: current >= i ? 'none' : '1.5px solid rgba(100,101,110,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.4s ease',
              boxShadow: current === i ? '0 4px 12px rgba(42,43,53,0.3)' : 'none',
            }}>
              {current > i
                ? <CheckCircle size={16} color="#18181E" />
                : <span style={{ fontSize: '0.72rem', fontWeight: 700, color: current === i ? '#C8A96E' : '#9A9BA3', fontFamily: 'Raleway,sans-serif' }}>{i + 1}</span>
              }
            </div>
            <span style={{
              fontSize: '0.68rem', fontFamily: 'Raleway,sans-serif', fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: current >= i ? '#18181E' : '#9A9BA3',
              transition: 'color 0.4s',
            }}>{label}</span>
          </div>
          {i < 2 && (
            <div style={{
              width: 48, height: 1.5, margin: '0 4px',
              background: current > i
                ? 'linear-gradient(90deg,#C8A96E,#DCC08A)'
                : 'rgba(100,101,110,0.2)',
              marginBottom: 22,
              transition: 'background 0.4s',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Reservation() {
  const [date, setDate] = useState(today());
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [myRes, setMyRes] = useState(null);
  const [myResLoading, setMyResLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const savedToken = localStorage.getItem(TOKEN_KEY);

  // Only available slots
  const availableSlots = slots.filter(s => s.available);

  // Step tracking
  const step = selectedSlot ? 2 : date ? 1 : 0;

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

  // Real-time slot updates
  useSocket(({ date: updDate, timeSlot, available }) => {
    if (updDate !== date) return;
    setSlots(prev => prev.map(s => s.time === timeSlot ? { ...s, available } : s));
    if (!available && selectedSlot === timeSlot) {
      setSelectedSlot('');
      toast.error('Seçdiyiniz saat tutuldu, yenidən seçin');
    }
  });

  // Load existing reservation
  useEffect(() => {
    if (!savedToken) return;
    setMyResLoading(true);
    getMyReservation(savedToken)
      .then(r => setMyRes(r.data))
      .catch(() => { localStorage.removeItem(TOKEN_KEY); setMyRes(null); })
      .finally(() => setMyResLoading(false));
  }, [savedToken]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedSlot) return toast.error('Saat seçin');
    if (!name.trim()) return toast.error('Adınızı daxil edin');
    if (!phone.trim()) return toast.error('Telefon nömrəsini daxil edin');

    setSubmitting(true);
    try {
      const { data } = await createReservation({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        date,
        timeSlot: selectedSlot
      });
      localStorage.setItem(TOKEN_KEY, data.reservation.token);
      setMyRes({ ...data.reservation, customerPhone: phone.trim() });
      toast.success('Rezervasiya uğurla yaradıldı!');
      requestBrowserNotification(
        'Chameleon Barbershop',
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
      <div style={{
        paddingTop: 120, paddingBottom: 60, textAlign: 'center',
        background: 'linear-gradient(180deg,rgba(18,19,24,0.88) 0%,transparent 100%)',
        borderBottom: '1px solid rgba(200,169,110,0.12)',
      }}>
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic', color: '#C8A96E', fontSize: '1rem', marginBottom: 12 }}
        >
          Online rezervasiya
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ fontFamily: 'Cormorant Garamond,serif', fontWeight: 700, fontSize: 'clamp(1.8rem,5vw,3rem)', color: '#F4F4F8', marginBottom: 16 }}
        >
          Rezervasiya
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.35, duration: 0.5 }}
          style={{ width: 60, height: 2, background: 'linear-gradient(90deg,#C8A96E,#DCC08A)', margin: '0 auto', borderRadius: 1 }}
        />
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: 880 }}>

          {/* Loading */}
          {myResLoading && (
            <div style={{ textAlign: 'center', color: '#C8A96E', marginBottom: 32, fontFamily: 'Raleway,sans-serif' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ display: 'inline-block' }}>
                <Scissors size={22} color="#C8A96E" />
              </motion.div>
            </div>
          )}

          {/* Active reservation card */}
          <AnimatePresence>
            {myRes && !myResLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -16 }}
                transition={{ duration: 0.4 }}
                className="card"
                style={{ marginBottom: 40, padding: '32px', border: '1px solid rgba(100,180,100,0.3)', background: 'rgba(220,235,220,0.55)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <CheckCircle size={22} color="#2d6e2d" />
                  <h3 style={{ fontFamily: 'Raleway,sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1a401a' }}>
                    Aktiv Rezervasiyanız
                  </h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 20 }}>
                  {[
                    [User, 'Ad', myRes.customerName],
                    [Calendar, 'Tarix', formatDate(myRes.date)],
                    [Clock, 'Saat', myRes.timeSlot],
                  ].map(([Icon, label, val]) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.55)', borderRadius: 8, padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#2d6e2d', fontSize: '0.72rem', fontWeight: 700, marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Raleway,sans-serif' }}>
                        <Icon size={11} /> {label}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#1a401a', fontWeight: 600, fontFamily: 'Raleway,sans-serif' }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <button onClick={() => setShowConfirm(true)} className="btn btn-danger" style={{ fontSize: '0.78rem', padding: '9px 18px' }}>
                    <Trash2 size={13} /> Ləğv et
                  </button>
                  <span style={{ fontSize: '0.78rem', color: '#4a6e4a', fontFamily: 'Raleway,sans-serif' }}>
                    Vaxtı dəyişmək üçün ləğv edib yenidən rezerv edin.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cancel confirm modal */}
          <AnimatePresence>
            {showConfirm && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 24 }}
                onClick={() => setShowConfirm(false)}
              >
                <motion.div
                  initial={{ scale: 0.88, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.88, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="card"
                  style={{ padding: '32px', maxWidth: 400, width: '100%' }}
                  onClick={e => e.stopPropagation()}
                >
                  <AlertCircle size={36} color="#c05050" style={{ marginBottom: 16 }} />
                  <h3 style={{ fontFamily: 'Raleway,sans-serif', fontWeight: 700, fontSize: '1.05rem', marginBottom: 10, color: '#18181E' }}>
                    Rezervasiyanı ləğv etmək istəyirsiniz?
                  </h3>
                  <p style={{ color: '#6A6B75', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 24, fontFamily: 'Raleway,sans-serif' }}>
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

          {/* New reservation form */}
          {!myRes && (
            <>
              <Steps current={step} />

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 28 }}>

                  {/* Left: Date + available slots only */}
                  <div className="card emboss" style={{ padding: '28px' }}>

                    {/* Date */}
                    <div style={{ marginBottom: 24 }}>
                      <h3 style={{ fontFamily: 'Raleway,sans-serif', fontWeight: 700, color: '#18181E', fontSize: '0.88rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        <Calendar size={15} color="#C8A96E" /> Tarix seçin
                      </h3>
                      <input
                        type="date"
                        className="input"
                        value={date}
                        min={today()}
                        onChange={e => setDate(e.target.value)}
                        required
                        style={{ width: '100%' }}
                      />
                    </div>

                    {/* Available slots */}
                    <div>
                      <h3 style={{ fontFamily: 'Raleway,sans-serif', fontWeight: 700, color: '#18181E', fontSize: '0.88rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        <Clock size={15} color="#C8A96E" /> Boş saatlar
                      </h3>

                      {slotsLoading ? (
                        <div style={{ textAlign: 'center', padding: '28px 0' }}>
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ display: 'inline-block' }}>
                            <Scissors size={24} color="#C8A96E" />
                          </motion.div>
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          style={{ textAlign: 'center', padding: '28px 16px', background: 'rgba(100,101,110,0.06)', borderRadius: 8, border: '1px dashed rgba(100,101,110,0.25)' }}
                        >
                          <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>📅</div>
                          <p style={{ fontFamily: 'Raleway,sans-serif', fontWeight: 600, color: '#3C3D47', fontSize: '0.88rem', marginBottom: 6 }}>
                            Bu tarix üçün boş yer yoxdur
                          </p>
                          <p style={{ fontFamily: 'Raleway,sans-serif', color: '#6A6B75', fontSize: '0.8rem' }}>
                            Başqa tarix seçin
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
                        >
                          {availableSlots.map((slot, idx) => (
                            <motion.button
                              key={slot.time}
                              type="button"
                              initial={{ opacity: 0, scale: 0.85 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.04 }}
                              whileHover={{ scale: 1.06, y: -2 }}
                              whileTap={{ scale: 0.96 }}
                              onClick={() => setSelectedSlot(slot.time)}
                              style={{
                                padding: '11px 18px',
                                borderRadius: 8,
                                border: selectedSlot === slot.time
                                  ? '2px solid #C8A96E'
                                  : '1.5px solid rgba(100,101,110,0.22)',
                                background: selectedSlot === slot.time
                                  ? 'linear-gradient(135deg,#2A2B35,#4A4B57)'
                                  : 'rgba(240,241,248,0.75)',
                                color: selectedSlot === slot.time ? '#C8A96E' : '#18181E',
                                fontSize: '0.88rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: 'Raleway,sans-serif',
                                letterSpacing: '0.04em',
                                transition: 'all 0.2s',
                                boxShadow: selectedSlot === slot.time
                                  ? '0 4px 12px rgba(0,0,0,0.2)'
                                  : '2px 2px 6px rgba(0,0,0,0.08), -1px -1px 3px rgba(255,255,255,0.5)',
                                minWidth: 72,
                              }}
                            >
                              {slot.time}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Right: Customer info */}
                  <div className="card emboss" style={{ padding: '28px' }}>
                    <h3 style={{ fontFamily: 'Raleway,sans-serif', fontWeight: 700, color: '#18181E', fontSize: '0.88rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      <User size={15} color="#C8A96E" /> Məlumatlarınız
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      <div className="form-group">
                        <label>Ad Soyad</label>
                        <input
                          type="text"
                          className="input"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Adınızı daxil edin"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Telefon nömrəsi</label>
                        <input
                          type="tel"
                          className="input"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+994 XX XXX XX XX"
                          required
                        />
                      </div>

                      {/* Summary */}
                      <AnimatePresence>
                        {selectedSlot && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ background: 'linear-gradient(135deg,rgba(200,169,110,0.08),rgba(200,169,110,0.04))', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(200,169,110,0.2)' }}>
                              <p style={{ fontFamily: 'Raleway,sans-serif', fontWeight: 700, fontSize: '0.7rem', color: '#C8A96E', marginBottom: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                Seçiminiiz
                              </p>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(200,169,110,0.12)', border: '1px solid rgba(200,169,110,0.25)', borderRadius: 6, padding: '5px 10px', fontSize: '0.8rem', color: '#3C3D47', fontFamily: 'Raleway,sans-serif', fontWeight: 600 }}>
                                  <Calendar size={12} color="#C8A96E" /> {formatDate(date)}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(200,169,110,0.12)', border: '1px solid rgba(200,169,110,0.25)', borderRadius: 6, padding: '5px 10px', fontSize: '0.8rem', color: '#3C3D47', fontFamily: 'Raleway,sans-serif', fontWeight: 600 }}>
                                  <Clock size={12} color="#C8A96E" /> {selectedSlot}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.button
                        type="submit"
                        className="btn btn-primary"
                        whileHover={selectedSlot ? { scale: 1.02 } : {}}
                        whileTap={selectedSlot ? { scale: 0.98 } : {}}
                        disabled={submitting || !selectedSlot}
                        style={{ width: '100%', justifyContent: 'center', opacity: (!selectedSlot || submitting) ? 0.55 : 1 }}
                      >
                        {submitting ? (
                          <>
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
                              <Scissors size={15} />
                            </motion.div>
                            Göndərilir...
                          </>
                        ) : (
                          <><Scissors size={15} /> Rezervasiya Et <ChevronRight size={14} /></>
                        )}
                      </motion.button>

                      {!selectedSlot && (
                        <p style={{ fontSize: '0.76rem', color: '#9A9BA3', textAlign: 'center', fontFamily: 'Raleway,sans-serif' }}>
                          Əvvəlcə sol tərəfdən saat seçin
                        </p>
                      )}

                      <p style={{ fontSize: '0.74rem', color: '#9A9BA3', lineHeight: 1.6, textAlign: 'center', fontFamily: 'Raleway,sans-serif' }}>
                        Vaxtı dəyişmək üçün mövcud rezervasiyanı ləğv edib yenidən qeydiyyat aparın.
                      </p>
                    </div>
                  </div>

                </div>
              </form>
            </>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
