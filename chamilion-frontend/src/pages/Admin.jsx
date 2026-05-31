import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Lock, LogOut, CalendarDays, Users, Scissors,
  BookOpen, Settings, Plus, Edit2, Trash2, Check, X, UserPlus,
  Eye, EyeOff, RefreshCw, AlertCircle,
} from 'lucide-react';
import {
  adminLogin, adminChangePassword,
  adminGetReservations, adminAddReservation, adminCancelReservation,
  adminGetServices, adminAddService, adminUpdateService, adminDeleteService,
  adminGetBlog, adminAddPost, adminUpdatePost, adminDeletePost,
} from '../api/client.js';

const ADMIN_TOKEN_KEY = 'chamilion_admin_token';

function fmtDate(d) {
  return new Date(d).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' });
}
function fmtDateTime(d) {
  return new Date(d).toLocaleString('az-AZ', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const TIME_SLOTS = ['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];

const adminBg = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg,#0e0f14 0%,#1a1b22 50%,#0e0f14 100%)',
  color: '#F4F4F8',
  fontFamily: "'Raleway',sans-serif",
};

const cardA = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  backdropFilter: 'blur(8px)',
};

function InputA({ label, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(244,244,248,0.5)' }}>{label}</label>}
      <input
        {...props}
        style={{
          padding: '10px 14px', borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.06)',
          color: '#F4F4F8', fontSize: '0.9rem',
          fontFamily: "'Raleway',sans-serif",
          outline: 'none', transition: 'border-color 0.2s', width: '100%', boxSizing: 'border-box',
          ...props.style,
        }}
        onFocus={e => { e.target.style.borderColor = 'rgba(200,169,110,0.6)'; }}
        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
      />
    </div>
  );
}

function TextareaA({ label, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(244,244,248,0.5)' }}>{label}</label>}
      <textarea
        {...props}
        style={{
          padding: '10px 14px', borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.06)',
          color: '#F4F4F8', fontSize: '0.9rem',
          fontFamily: "'Raleway',sans-serif",
          outline: 'none', resize: 'vertical', minHeight: 80,
          transition: 'border-color 0.2s', width: '100%', boxSizing: 'border-box',
          ...props.style,
        }}
        onFocus={e => { e.target.style.borderColor = 'rgba(200,169,110,0.6)'; }}
        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
      />
    </div>
  );
}

function BtnA({ children, variant = 'primary', size = 'md', style: s, ...rest }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    border: 'none', cursor: rest.disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'Raleway',sans-serif", fontWeight: 600,
    borderRadius: 8, transition: 'all 0.2s',
    padding: size === 'sm' ? '7px 14px' : '10px 20px',
    fontSize: size === 'sm' ? '0.78rem' : '0.85rem',
    opacity: rest.disabled ? 0.55 : 1,
  };
  const variants = {
    primary: { background: 'linear-gradient(135deg,#C8A96E,#DCC08A)', color: '#18181E' },
    outline: { background: 'transparent', color: 'rgba(244,244,248,0.8)', border: '1px solid rgba(255,255,255,0.18)' },
    danger:  { background: 'linear-gradient(135deg,#7a2828,#a03333)', color: '#fff' },
    ghost:   { background: 'transparent', color: 'rgba(244,244,248,0.6)', padding: '6px 10px' },
  };
  return <button {...rest} style={{ ...base, ...variants[variant], ...s }}>{children}</button>;
}

function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 20 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            style={{ ...cardA, padding: '28px', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: '1rem', color: '#C8A96E', letterSpacing: '0.06em' }}>{title}</h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(244,244,248,0.5)' }}><X size={18} /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LoginView({ onLogin }) {
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!pw) return;
    setLoading(true);
    try {
      const { data } = await adminLogin(pw);
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      onLogin(data.token);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Şifrə yanlışdır');
    } finally { setLoading(false); }
  }
  return (
    <div style={{ ...adminBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{ ...cardA, padding: '44px 40px', width: '100%', maxWidth: 380, textAlign: 'center' }}
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          style={{ width: 66, height: 66, borderRadius: '50%', background: 'linear-gradient(135deg,#C8A96E,#DCC08A)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 40px rgba(200,169,110,0.25)' }}>
          <Scissors size={28} color="#18181E" strokeWidth={2} />
        </motion.div>
        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: '1.1rem', color: '#F4F4F8', marginBottom: 4, letterSpacing: '0.08em' }}>CHAMELEON</h2>
        <p style={{ color: 'rgba(244,244,248,0.4)', fontSize: '0.75rem', marginBottom: 32, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Admin Panel</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <input type={show ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} placeholder="Şifrəni daxil edin" autoComplete="current-password"
              style={{ width: '100%', padding: '12px 42px 12px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: '#F4F4F8', fontSize: '0.9rem', fontFamily: "'Raleway',sans-serif", outline: 'none', boxSizing: 'border-box' }} />
            <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(244,244,248,0.4)' }}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button type="submit" disabled={loading || !pw}
            style={{ padding: '12px', borderRadius: 8, border: 'none', cursor: loading || !pw ? 'not-allowed' : 'pointer', background: loading || !pw ? 'rgba(200,169,110,0.3)' : 'linear-gradient(135deg,#C8A96E,#DCC08A)', color: '#18181E', fontWeight: 700, fontSize: '0.88rem', fontFamily: "'Cinzel',serif", letterSpacing: '0.08em', transition: 'all 0.2s' }}>
            {loading ? 'Yoxlanılır...' : 'Daxil ol'}
          </button>
        </form>
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(244,244,248,0.25)', fontSize: '0.72rem', justifyContent: 'center' }}>
          <Lock size={11} /> Bu səhifə yalnız idarəçilər üçündür
        </div>
      </motion.div>
    </div>
  );
}

function ReservationsTab() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', phone: '', date: '', timeSlot: '' });
  const [adding, setAdding] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterStatus) params.status = filterStatus;
      const { data } = await adminGetReservations(params);
      setList(data);
    } catch { toast.error('Yüklənmədi'); }
    finally { setLoading(false); }
  }, [filterDate, filterStatus]);
  useEffect(() => { load(); }, [load]);

  async function handleCancel(id) {
    setCancelling(true);
    try {
      await adminCancelReservation(id);
      toast.success('Rezervasiya ləğv edildi');
      setCancelTarget(null); load();
    } catch { toast.error('Xəta baş verdi'); }
    finally { setCancelling(false); }
  }
  async function handleAdd(e) {
    e.preventDefault();
    if (!addForm.name || !addForm.phone || !addForm.date || !addForm.timeSlot) return toast.error('Bütün sahələri doldurun');
    setAdding(true);
    try {
      await adminAddReservation({ customerName: addForm.name, customerPhone: addForm.phone, date: addForm.date, timeSlot: addForm.timeSlot });
      toast.success('Müştəri əlavə edildi');
      setAddModal(false); setAddForm({ name: '', phone: '', date: '', timeSlot: '' }); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Xəta'); }
    finally { setAdding(false); }
  }
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: '1.1rem', color: '#C8A96E' }}>Rezervasiyalar</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#F4F4F8', fontSize: '0.85rem', outline: 'none' }} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(20,21,28,0.95)', color: '#F4F4F8', fontSize: '0.85rem', outline: 'none' }}>
            <option value="">Hamısı</option>
            <option value="active">Aktiv</option>
            <option value="cancelled">Ləğv edilmiş</option>
          </select>
          <BtnA onClick={load} variant="outline" size="sm"><RefreshCw size={13} /></BtnA>
          <BtnA onClick={() => setAddModal(true)} size="sm"><UserPlus size={14} /> Müştəri əlavə et</BtnA>
        </div>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#C8A96E' }}>Yüklənir...</div>
      ) : list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'rgba(244,244,248,0.3)' }}>Nəticə tapılmadı</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Ad', 'Telefon', 'Tarix', 'Saat', 'Status', 'Qeydiyyat', ''].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'rgba(244,244,248,0.4)', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((r, i) => (
                <motion.tr key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '11px 12px', color: '#F4F4F8', fontWeight: 500 }}>{r.customerName}</td>
                  <td style={{ padding: '11px 12px', color: 'rgba(244,244,248,0.6)' }}>{r.customerPhone}</td>
                  <td style={{ padding: '11px 12px', color: 'rgba(244,244,248,0.7)', whiteSpace: 'nowrap' }}>{fmtDate(r.date)}</td>
                  <td style={{ padding: '11px 12px', color: '#C8A96E', fontWeight: 600 }}>{r.timeSlot}</td>
                  <td style={{ padding: '11px 12px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600, background: r.status === 'active' ? 'rgba(100,180,100,0.15)' : 'rgba(180,80,80,0.15)', color: r.status === 'active' ? '#5cb85c' : '#d9534f', border: '1px solid ' + (r.status === 'active' ? 'rgba(100,180,100,0.3)' : 'rgba(180,80,80,0.3)') }}>
                      {r.status === 'active' ? 'Aktiv' : 'Ləğv edilib'}
                    </span>
                    {r.addedByAdmin && <span style={{ marginLeft: 6, fontSize: '0.65rem', color: '#C8A96E' }}>admin</span>}
                  </td>
                  <td style={{ padding: '11px 12px', color: 'rgba(244,244,248,0.35)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{fmtDateTime(r.createdAt)}</td>
                  <td style={{ padding: '11px 12px' }}>
                    {r.status === 'active' && <BtnA variant="danger" size="sm" onClick={() => setCancelTarget(r)}><Trash2 size={12} /> Ləğv et</BtnA>}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Yeni müştəri əlavə et">
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <InputA label="Ad Soyad" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} placeholder="Müştərinin adı" required />
          <InputA label="Telefon" value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} placeholder="+994 XX XXX XX XX" required />
          <InputA label="Tarix" type="date" min={todayStr} value={addForm.date} onChange={e => setAddForm(f => ({ ...f, date: e.target.value }))} required />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(244,244,248,0.5)' }}>Saat</label>
            <select value={addForm.timeSlot} onChange={e => setAddForm(f => ({ ...f, timeSlot: e.target.value }))} required
              style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(20,21,28,0.95)', color: '#F4F4F8', fontSize: '0.9rem', outline: 'none', width: '100%' }}>
              <option value="">Saat seçin</option>
              {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <BtnA type="submit" disabled={adding} style={{ flex: 1, justifyContent: 'center' }}>{adding ? 'Əlavə edilir...' : <><UserPlus size={14} /> Əlavə et</>}</BtnA>
            <BtnA variant="outline" type="button" onClick={() => setAddModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Ləğv et</BtnA>
          </div>
        </form>
      </Modal>
      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Rezervasiyanı ləğv et">
        {cancelTarget && (
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20, padding: '14px', background: 'rgba(180,80,80,0.1)', borderRadius: 8, border: '1px solid rgba(180,80,80,0.2)' }}>
              <AlertCircle size={20} color="#d9534f" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: '0.88rem', color: 'rgba(244,244,248,0.8)', lineHeight: 1.6 }}>
                <strong style={{ color: '#F4F4F8' }}>{cancelTarget.customerName}</strong> adlı müştərinin{' '}
                <strong style={{ color: '#C8A96E' }}>{fmtDate(cancelTarget.date)} — {cancelTarget.timeSlot}</strong> rezervasiyası ləğv edilsin?
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <BtnA variant="danger" onClick={() => handleCancel(cancelTarget.id)} disabled={cancelling} style={{ flex: 1, justifyContent: 'center' }}>{cancelling ? 'Ləğv edilir...' : 'Bəli, ləğv et'}</BtnA>
              <BtnA variant="outline" onClick={() => setCancelTarget(null)} style={{ flex: 1, justifyContent: 'center' }}>Xeyr</BtnA>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function CustomersTab() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    adminGetReservations({})
      .then(({ data }) => {
        const map = new Map();
        data.forEach(r => {
          const key = r.customerPhone;
          if (!map.has(key)) map.set(key, { name: r.customerName, phone: r.customerPhone, count: 0, lastDate: r.date });
          const c = map.get(key); c.count++;
          if (r.date > c.lastDate) c.lastDate = r.date;
        });
        setCustomers([...map.values()].sort((a, b) => b.count - a.count));
      })
      .catch(() => toast.error('Müştərilər yüklənmədi'))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div>
      <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: '1.1rem', color: '#C8A96E', marginBottom: 24 }}>
        Müştərilər <span style={{ fontSize: '0.78rem', color: 'rgba(244,244,248,0.35)', fontFamily: "'Raleway',sans-serif" }}>({customers.length})</span>
      </h2>
      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#C8A96E' }}>Yüklənir...</div>
        : customers.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: 'rgba(244,244,248,0.3)' }}>Hələ müştəri yoxdur</div>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
            {customers.map((c, i) => (
              <motion.div key={c.phone} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{ ...cardA, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#C8A96E,#DCC08A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1rem', fontWeight: 700, color: '#18181E' }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: '#F4F4F8', fontSize: '0.92rem', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                  <div style={{ color: 'rgba(244,244,248,0.5)', fontSize: '0.8rem' }}>{c.phone}</div>
                  <div style={{ color: 'rgba(200,169,110,0.7)', fontSize: '0.74rem', marginTop: 4 }}>{c.count} rezervasiya · Son: {fmtDate(c.lastDate)}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
    </div>
  );
}

function ServicesTab() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', duration: '60' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const load = () => { setLoading(true); adminGetServices().then(({ data }) => setServices(data)).catch(() => toast.error('Xidmətlər yüklənmədi')).finally(() => setLoading(false)); };
  useEffect(load, []);
  function openAdd() { setForm({ name: '', description: '', price: '', duration: '60' }); setModal({ mode: 'add' }); }
  function openEdit(s) { setForm({ name: s.name, description: s.description, price: String(s.price), duration: String(s.duration) }); setModal({ mode: 'edit', data: s }); }
  async function handleSave(e) {
    e.preventDefault();
    if (!form.name || !form.price) return toast.error('Ad və qiymət tələb olunur');
    setSaving(true);
    try {
      const p = { name: form.name, description: form.description, price: form.price, duration: form.duration };
      if (modal.mode === 'add') { await adminAddService(p); toast.success('Xidmət əlavə edildi'); }
      else { await adminUpdateService(modal.data.id, p); toast.success('Xidmət yeniləndi'); }
      setModal(null); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Xəta'); }
    finally { setSaving(false); }
  }
  async function handleDelete(id) {
    setDeleting(true);
    try { await adminDeleteService(id); toast.success('Silindi'); setDeleteTarget(null); load(); }
    catch { toast.error('Xəta'); } finally { setDeleting(false); }
  }
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: '1.1rem', color: '#C8A96E' }}>Xidmətlər</h2>
        <BtnA onClick={openAdd} size="sm"><Plus size={14} /> Yeni xidmət</BtnA>
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#C8A96E' }}>Yüklənir...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
          {services.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ ...cardA, padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.95rem', color: '#F4F4F8', marginBottom: 6 }}>{s.name}</div>
                  <div style={{ color: 'rgba(244,244,248,0.45)', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: 12 }}>{s.description}</div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ color: '#C8A96E', fontWeight: 700, fontSize: '1.1rem' }}>{s.price}₼</span>
                    <span style={{ color: 'rgba(244,244,248,0.35)', fontSize: '0.8rem', alignSelf: 'flex-end' }}>{s.duration} dəq</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <BtnA variant="ghost" size="sm" onClick={() => openEdit(s)}><Edit2 size={14} /></BtnA>
                  <BtnA variant="ghost" size="sm" onClick={() => setDeleteTarget(s)} style={{ color: '#d9534f' }}><Trash2 size={14} /></BtnA>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'add' ? 'Yeni xidmət əlavə et' : 'Xidməti düzəlt'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <InputA label="Xidmət adı" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Məs: Saç kəsimi" required />
          <TextareaA label="Təsvir" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Qısa təsvir" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <InputA label="Qiymət (₼)" type="number" min="1" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="15" required />
            <InputA label="Müddət (dəq)" type="number" min="10" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="60" />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <BtnA type="submit" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>{saving ? 'Saxlanılır...' : <><Check size={14} /> Saxla</>}</BtnA>
            <BtnA variant="outline" type="button" onClick={() => setModal(null)} style={{ flex: 1, justifyContent: 'center' }}>Ləğv et</BtnA>
          </div>
        </form>
      </Modal>
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Xidməti sil">
        {deleteTarget && (
          <div>
            <p style={{ color: 'rgba(244,244,248,0.7)', marginBottom: 20, lineHeight: 1.6 }}><strong style={{ color: '#F4F4F8' }}>"{deleteTarget.name}"</strong> xidməti silinsin?</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <BtnA variant="danger" onClick={() => handleDelete(deleteTarget.id)} disabled={deleting} style={{ flex: 1, justifyContent: 'center' }}>{deleting ? 'Silinir...' : 'Bəli, sil'}</BtnA>
              <BtnA variant="outline" onClick={() => setDeleteTarget(null)} style={{ flex: 1, justifyContent: 'center' }}>Xeyr</BtnA>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function BlogTab() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', excerpt: '' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const load = () => { setLoading(true); adminGetBlog().then(({ data }) => setPosts(data)).catch(() => toast.error('Postlar yüklənmədi')).finally(() => setLoading(false)); };
  useEffect(load, []);
  function openAdd() { setForm({ title: '', content: '', excerpt: '' }); setModal({ mode: 'add' }); }
  function openEdit(p) { setForm({ title: p.title, content: p.content, excerpt: p.excerpt || '' }); setModal({ mode: 'edit', data: p }); }
  async function handleSave(e) {
    e.preventDefault();
    if (!form.title || !form.content) return toast.error('Başlıq və məzmun tələb olunur');
    setSaving(true);
    try {
      const pl = { title: form.title, content: form.content, excerpt: form.excerpt };
      if (modal.mode === 'add') { await adminAddPost(pl); toast.success('Post əlavə edildi'); }
      else { await adminUpdatePost(modal.data.id, pl); toast.success('Post yeniləndi'); }
      setModal(null); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Xəta'); }
    finally { setSaving(false); }
  }
  async function handleDelete(id) {
    setDeleting(true);
    try { await adminDeletePost(id); toast.success('Post silindi'); setDeleteTarget(null); load(); }
    catch { toast.error('Xəta'); } finally { setDeleting(false); }
  }
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: '1.1rem', color: '#C8A96E' }}>Blog Postlar</h2>
        <BtnA onClick={openAdd} size="sm"><Plus size={14} /> Yeni post</BtnA>
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#C8A96E' }}>Yüklənir...</div>
        : posts.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: 'rgba(244,244,248,0.3)' }}>Hələ post yoxdur</div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {posts.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                style={{ ...cardA, padding: '18px 22px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.92rem', color: '#F4F4F8', marginBottom: 5 }}>{p.title}</div>
                  <div style={{ color: 'rgba(244,244,248,0.4)', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: 6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.excerpt}</div>
                  <div style={{ color: 'rgba(200,169,110,0.5)', fontSize: '0.74rem' }}>{fmtDate(p.createdAt)}</div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <BtnA variant="ghost" size="sm" onClick={() => openEdit(p)}><Edit2 size={14} /></BtnA>
                  <BtnA variant="ghost" size="sm" onClick={() => setDeleteTarget(p)} style={{ color: '#d9534f' }}><Trash2 size={14} /></BtnA>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'add' ? 'Yeni post əlavə et' : 'Postu düzəlt'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <InputA label="Başlıq" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Post başlığı" required />
          <TextareaA label="Məzmun" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Post məzmunu..." required style={{ minHeight: 140 }} />
          <TextareaA label="Qısa xülasə (könüllü)" value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Boş qalsa avtomatik yaradılır" style={{ minHeight: 60 }} />
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <BtnA type="submit" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>{saving ? 'Saxlanılır...' : <><Check size={14} /> Saxla</>}</BtnA>
            <BtnA variant="outline" type="button" onClick={() => setModal(null)} style={{ flex: 1, justifyContent: 'center' }}>Ləğv et</BtnA>
          </div>
        </form>
      </Modal>
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Postu sil">
        {deleteTarget && (
          <div>
            <p style={{ color: 'rgba(244,244,248,0.7)', marginBottom: 20, lineHeight: 1.6 }}><strong style={{ color: '#F4F4F8' }}>"{deleteTarget.title}"</strong> postu silinsin?</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <BtnA variant="danger" onClick={() => handleDelete(deleteTarget.id)} disabled={deleting} style={{ flex: 1, justifyContent: 'center' }}>{deleting ? 'Silinir...' : 'Bəli, sil'}</BtnA>
              <BtnA variant="outline" onClick={() => setDeleteTarget(null)} style={{ flex: 1, justifyContent: 'center' }}>Xeyr</BtnA>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function SettingsTab({ onLogout }) {
  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' });
  const [show, setShow] = useState({ c: false, n: false, r: false });
  const [saving, setSaving] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.current || !form.newPw || !form.confirm) return toast.error('Bütün sahələri doldurun');
    if (form.newPw !== form.confirm) return toast.error('Yeni şifrələr uyğun deyil');
    if (form.newPw.length < 6) return toast.error('Yeni şifrə ən az 6 simvol olmalıdır');
    setSaving(true);
    try { await adminChangePassword(form.current, form.newPw); toast.success('Şifrə uğurla dəyişdirildi'); setForm({ current: '', newPw: '', confirm: '' }); }
    catch (err) { toast.error(err.response?.data?.error || 'Xəta'); }
    finally { setSaving(false); }
  }
  function pwField(label, field, key) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(244,244,248,0.5)' }}>{label}</label>
        <div style={{ position: 'relative' }}>
          <input type={show[key] ? 'text' : 'password'} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
            style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#F4F4F8', fontSize: '0.9rem', fontFamily: "'Raleway',sans-serif", outline: 'none', boxSizing: 'border-box' }} />
          <button type="button" onClick={() => setShow(s => ({ ...s, [key]: !s[key] }))} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(244,244,248,0.4)' }}>
            {show[key] ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: '1.1rem', color: '#C8A96E', marginBottom: 28 }}>Tənzimləmə</h2>
      <div style={{ maxWidth: 440 }}>
        <div style={{ ...cardA, padding: '28px' }}>
          <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: '0.9rem', color: 'rgba(244,244,248,0.7)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lock size={15} color="#C8A96E" /> Şifrə dəyişikliyi
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {pwField('Cari şifrə', 'current', 'c')}
            {pwField('Yeni şifrə', 'newPw', 'n')}
            {pwField('Yeni şifrəni təkrarlayın', 'confirm', 'r')}
            <BtnA type="submit" disabled={saving} style={{ marginTop: 6, justifyContent: 'center' }}>{saving ? 'Saxlanılır...' : <><Check size={14} /> Şifrəni dəyiş</>}</BtnA>
          </form>
        </div>
        <div style={{ ...cardA, padding: '22px 28px', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.88rem', color: 'rgba(244,244,248,0.7)', fontWeight: 600 }}>Admin hesabı</div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(244,244,248,0.35)', marginTop: 3 }}>Çıxış etmək üçün</div>
          </div>
          <BtnA variant="danger" size="sm" onClick={onLogout}><LogOut size={14} /> Çıxış</BtnA>
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'reservations', label: 'Rezervasiyalar', icon: CalendarDays },
  { id: 'customers',    label: 'Müştərilər',     icon: Users        },
  { id: 'services',     label: 'Xidmətlər',      icon: Scissors     },
  { id: 'blog',         label: 'Blog',            icon: BookOpen     },
  { id: 'settings',     label: 'Tənzimləmə',     icon: Settings     },
];

function Dashboard({ onLogout }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = TABS.map(t => t.id);
  const initialTab = validTabs.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'reservations';
  const [tab, setTab] = useState(initialTab);

  function changeTab(id) {
    setTab(id);
    setSearchParams({ tab: id });
  }

  const content = {
    reservations: <ReservationsTab />,
    customers:    <CustomersTab />,
    services:     <ServicesTab />,
    blog:         <BlogTab />,
    settings:     <SettingsTab onLogout={onLogout} />,
  };

  return (
    <div style={{ ...adminBg, display: 'flex', minHeight: '100vh' }}>
      <div style={{ width: 230, background: 'rgba(255,255,255,0.04)', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'sticky', top: 0, height: '100vh', flexShrink: 0, overflowY: 'auto' }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#C8A96E,#DCC08A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Scissors size={15} color="#18181E" strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.82rem', color: '#F4F4F8', fontWeight: 700, letterSpacing: '0.05em' }}>CHAMELEON</div>
              <div style={{ fontSize: '0.6rem', color: '#C8A96E', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Admin Panel</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '0 10px' }}>
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <motion.button key={t.id} onClick={() => changeTab(t.id)} whileHover={{ x: 3 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px', borderRadius: 8, background: active ? 'rgba(200,169,110,0.12)' : 'transparent', border: active ? '1px solid rgba(200,169,110,0.2)' : '1px solid transparent', color: active ? '#C8A96E' : 'rgba(244,244,248,0.55)', fontFamily: "'Raleway',sans-serif", fontSize: '0.86rem', fontWeight: active ? 600 : 400, cursor: 'pointer', marginBottom: 3, transition: 'all 0.18s' }}>
                <t.icon size={15} />
                {t.label}
                {active && <motion.div layoutId="si" style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: '#C8A96E' }} />}
              </motion.button>
            );
          })}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(244,244,248,0.3)', fontSize: '0.8rem', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#d9534f'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(244,244,248,0.3)'}
          >
            <LogOut size={14} /> Çıxış
          </button>
        </div>
      </div>
      <main style={{ flex: 1, padding: '32px 28px', minWidth: 0, maxHeight: '100vh', overflowY: 'auto' }}>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}>
            {content[tab]}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY));
  if (!token) return <LoginView onLogin={t => setToken(t)} />;
  return <Dashboard onLogout={() => { localStorage.removeItem(ADMIN_TOKEN_KEY); setToken(null); }} />;
}
