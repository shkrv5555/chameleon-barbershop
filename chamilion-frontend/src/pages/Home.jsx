import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Scissors, Award, Clock, Users, ArrowRight, Star, ChevronDown } from 'lucide-react';
import PageTransition from '../components/PageTransition.jsx';

function CombIcon({ size = 24, color = 'currentColor', strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="5" rx="1.5" />
      <line x1="5"  y1="11" x2="5"  y2="20" />
      <line x1="9"  y1="11" x2="9"  y2="20" />
      <line x1="13" y1="11" x2="13" y2="20" />
      <line x1="17" y1="11" x2="17" y2="20" />
      <line x1="21" y1="11" x2="21" y2="18" />
    </svg>
  );
}

function FadeIn({ children, delay = 0, direction = 'up' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const from = direction === 'up' ? { y: 40 } : direction === 'left' ? { x: -40 } : { x: 40 };
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...from }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

const stats = [
  { icon: Users,   value: '1500+', label: 'Məmnun müştəri' },
  { icon: Award,   value: '5+',    label: 'İl təcrübə'     },
  { icon: Scissors,value: '6000+', label: 'Uğurlu kəsim'   },
  { icon: Star,    value: '4.9',   label: 'Orta reytinq'   },
];

const services = [
  { icon: Scissors, name: 'Saç kəsimi',  desc: 'Klassik kişi kəsimi' },
  { icon: Scissors, name: 'Saqqal',      desc: 'Dəqiq dizayn'        },
  { icon: Award,    name: 'Tam paket',   desc: 'Saç + saqqal'        },
];

export default function Home() {
  return (
    <PageTransition>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '100px 24px 60px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        {[
          { size: 500, opacity: 0.07, top: '-10%', left: '-10%' },
          { size: 350, opacity: 0.06, bottom: '5%', right: '-5%' },
          { size: 200, opacity: 0.08, top: '20%', right: '15%' },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: c.size, height: c.size,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(42,43,53,1) 0%, transparent 70%)',
            opacity: c.opacity,
            top: c.top, bottom: c.bottom,
            left: c.left, right: c.right,
            pointerEvents: 'none',
          }} />
        ))}

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover="hovered"
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            width: 100, height: 100, borderRadius: '50%',
            background: 'linear-gradient(135deg, #2A2B35, #4A4B57)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            marginBottom: 28,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.1)',
            cursor: 'default',
          }}
        >
          <motion.span
            variants={{ rest: { rotate: 0, x: 0 }, hovered: { rotate: -22, x: -4 } }}
            transition={{ type: 'spring', stiffness: 350, damping: 14 }}
            style={{ display: 'flex' }}
          >
            <Scissors size={30} color="#C8A96E" strokeWidth={1.6} />
          </motion.span>
          <motion.span
            variants={{ rest: { rotate: 0, x: 0 }, hovered: { rotate: 20, x: 4 } }}
            transition={{ type: 'spring', stiffness: 350, damping: 14, delay: 0.04 }}
            style={{ display: 'flex' }}
          >
            <CombIcon size={28} color="#C8A96E" strokeWidth={1.6} />
          </motion.span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic', fontSize: '1rem', color: '#C8A96E', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}
        >
          Gəncə · 2020-dən bəri
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            fontFamily: 'Cinzel,serif',
            fontSize: 'clamp(2.4rem, 8vw, 5rem)',
            fontWeight: 700,
            color: '#18181E',
            letterSpacing: '0.04em',
            lineHeight: 1.1,
            marginBottom: 24,
            textShadow: '2px 2px 0 rgba(255,255,255,0.4), -1px -1px 0 rgba(0,0,0,0.08)',
          }}
        >
          CHAMELEON<br />
          <span style={{ color: '#C8A96E' }}>BARBERSHOP</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.55 }}
          style={{ fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic', fontSize: 'clamp(1.1rem,3vw,1.4rem)', color: 'rgba(24,24,30,0.7)', maxWidth: 520, lineHeight: 1.6, marginBottom: 40 }}
        >
          Hər kəsim bir sənət əsəridir. Peşəkar əllərlə, müasir texnikalarla — siz ən yaxşısına layiqsiniz.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Link to="/rezervasiya" className="btn btn-primary" style={{ fontSize: '0.82rem' }}>
            <Scissors size={15} /> Rezervasiya Et
          </Link>
          <Link to="/xidmetler" className="btn btn-outline" style={{ fontSize: '0.82rem' }}>
            Xidmətlər <ArrowRight size={15} />
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ position: 'absolute', bottom: 32, color: 'rgba(24,24,30,0.4)' }}
        >
          <ChevronDown size={28} />
        </motion.div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section className="section-sm" style={{ background: 'rgba(18,19,24,0.85)', backdropFilter: 'blur(10px)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 24 }}>
          {stats.map((s, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                <s.icon size={28} color="#C8A96E" style={{ marginBottom: 12 }} />
                <div style={{ fontFamily: 'Cinzel,serif', fontSize: '2rem', fontWeight: 700, color: '#F4F4F8', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: 'Raleway,sans-serif', fontSize: '0.8rem', color: 'rgba(244,244,248,0.55)', marginTop: 6, letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────── */}
      <section className="section">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 56, alignItems: 'center' }}>
          <FadeIn direction="left">
            <div>
              <p style={{ fontFamily: 'Raleway,sans-serif', fontWeight: 700, fontSize: '0.75rem', color: '#C8A96E', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>Haqqımızda</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 700, color: '#18181E', marginBottom: 20, lineHeight: 1.2 }}>
                Gəncənin Ən Etibarlı<br />Bərbər Salonu
              </h2>
              <div style={{ width: 50, height: 2, background: 'linear-gradient(90deg,#C8A96E,#DCC08A)', marginBottom: 24, borderRadius: 1 }} />
              <p style={{ color: '#3C3D47', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: 16 }}>
                2020-ci ildə Gəncədə fəaliyyətə başlayan Chameleon Barbershop, qısa müddətdə şəhərin ən sevimli bərbər salonu oldu. Master Azər Quliyev müştəri məmnuniyyəti və keyfiyyəti həmişə ön plana çəkir.
              </p>
              <p style={{ color: '#3C3D47', fontSize: '0.95rem', lineHeight: 1.8 }}>
                Hər müştəriyə fərdi yanaşma, müasir texnikalar və ən yüksək gigiyena standartları bizimlə görüşü xüsusi edir.
              </p>
            </div>
          </FadeIn>

          <FadeIn direction="right">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                ['Peşəkar usta', 'Sertifikatlı bərbərlər'],
                ['Premium məhsul', 'Ən yaxşı brendlər'],
                ['Gigiyena', 'Steril alətlər'],
                ['Rahat mühit', 'Xoş atmosfer'],
              ].map(([title, desc], i) => (
                <div key={i} className="card emboss" style={{ padding: '20px 16px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Raleway,sans-serif', fontWeight: 700, fontSize: '0.78rem', color: '#C8A96E', marginBottom: 6, letterSpacing: '0.06em' }}>{title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6A6B75' }}>{desc}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Master ───────────────────────────────────────────── */}
      <section className="section" style={{ background: 'rgba(18,19,24,0.88)', backdropFilter: 'blur(10px)' }}>
        <div className="container">
          <div className="section-title" style={{ marginBottom: 40 }}>
            <h2 style={{ color: '#F4F4F8' }}>Ustamız</h2>
            <p className="subtitle" style={{ color: 'rgba(244,244,248,0.5)' }}>Chameleon Barbershop-un tək ustası</p>
            <div className="gold-line" />
          </div>
          <FadeIn>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', maxWidth: 340 }}>
                {/* Avatar */}
                <div style={{
                  width: 140, height: 140, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#2A2B35,#4A4B57)',
                  margin: '0 auto 24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '3px solid rgba(200,169,110,0.35)',
                  boxShadow: '0 0 40px rgba(200,169,110,0.15), 0 8px 32px rgba(0,0,0,0.4)',
                  position: 'relative',
                }}>
                  <Scissors size={48} color="#C8A96E" strokeWidth={1.4} />
                  {/* Gold ring */}
                  <div style={{
                    position: 'absolute', inset: -6, borderRadius: '50%',
                    border: '1px solid rgba(200,169,110,0.2)',
                  }} />
                </div>
                <h3 style={{ fontFamily: 'Raleway,sans-serif', fontWeight: 700, fontSize: '1.4rem', color: '#F4F4F8', marginBottom: 6, letterSpacing: '0.04em' }}>
                  Azər Quliyev
                </h3>
                <p style={{ fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic', color: '#C8A96E', fontSize: '1rem', marginBottom: 18, letterSpacing: '0.1em' }}>
                  Master Bərbər
                </p>
                <div style={{ width: 40, height: 1.5, background: 'linear-gradient(90deg,#C8A96E,#DCC08A)', margin: '0 auto 20px', borderRadius: 1 }} />
                <p style={{ color: 'rgba(244,244,248,0.55)', fontSize: '0.88rem', lineHeight: 1.75 }}>
                  2020-ci ildən bəri peşəkar bərbər olan Azər Quliyev, hər saç kəsimini sənət əsərinə çevirir. Müasir texnika və klassik üslubun birləşməsi onun imzasıdır.
                </p>
                <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {['Fade kəsim', 'Saqqal dizaynı', 'Klassik kəsim', 'Tam paket'].map(skill => (
                    <span key={skill} style={{
                      padding: '5px 14px', borderRadius: 99,
                      background: 'rgba(200,169,110,0.1)',
                      border: '1px solid rgba(200,169,110,0.25)',
                      color: '#C8A96E', fontSize: '0.74rem',
                      fontFamily: 'Raleway,sans-serif', fontWeight: 600, letterSpacing: '0.06em',
                    }}>{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Popular services preview ─────────────────────────── */}
      <section className="section" style={{ background: 'rgba(200,201,208,0.3)' }}>
        <div className="container">
          <div className="section-title">
            <h2>Populyar Xidmətlər</h2>
            <p className="subtitle">Ən çox seçilən xidmətlərimiz</p>
            <div className="gold-line" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 24 }}>
            {services.map((s, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="card emboss" style={{ padding: '32px 24px', textAlign: 'center' }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#2A2B35,#4A4B57)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 18px',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  }}>
                    <s.icon size={24} color="#C8A96E" />
                  </div>
                  <div style={{ fontFamily: 'Raleway,sans-serif', fontWeight: 700, fontSize: '1rem', color: '#18181E', marginBottom: 8 }}>{s.name}</div>
                  <div style={{ color: '#6A6B75', fontSize: '0.85rem' }}>{s.desc}</div>
                </div>
              </FadeIn>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Link to="/xidmetler" className="btn btn-outline">Bütün xidmətlər <ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="section" style={{ textAlign: 'center', background: 'rgba(18,19,24,0.88)', backdropFilter: 'blur(12px)' }}>
        <FadeIn>
          <div className="container" style={{ maxWidth: 600 }}>
            <p style={{ fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic', color: '#C8A96E', fontSize: '1.1rem', marginBottom: 12 }}>
              Yaxşı görünüş, böyük inam
            </p>
            <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontWeight: 700, color: '#F4F4F8', fontSize: 'clamp(1.6rem,4vw,2.2rem)', marginBottom: 20 }}>
              Bu gün rezervasiya et
            </h2>
            <p style={{ color: 'rgba(244,244,248,0.6)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 32 }}>
              Hər gün saat 10:00 – 20:00 arasında xidmətinizdəyik. Gəncədə online rezervasiya ilə növbə gözləmədən gəlin — Azər Quliyev sizi gözləyir.
            </p>
            <Link to="/rezervasiya" className="btn btn-gold" style={{ fontSize: '0.82rem' }}>
              <Clock size={15} /> İndi Rezervasiya Et
            </Link>
          </div>
        </FadeIn>
      </section>
    </PageTransition>
  );
}
