import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Menu, X } from 'lucide-react';

// Custom Comb SVG icon
function CombIcon({ size = 18, color = 'currentColor', strokeWidth = 2 }) {
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

const links = [
  { to: '/',            label: 'Ana Səhifə' },
  { to: '/xidmetler',   label: 'Xidmətlər'  },
  { to: '/blog',        label: 'Blog'        },
  { to: '/rezervasiya', label: 'Rezervasiya' },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        background: scrolled
          ? 'rgba(18,19,24,0.96)'
          : 'rgba(18,19,24,0.75)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: scrolled
          ? '1px solid rgba(200,169,110,0.2)'
          : '1px solid rgba(255,255,255,0.08)',
        transition: 'all 0.4s ease',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 68 }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <motion.div
            whileHover="hovered"
            initial="rest"
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg, #C8A96E, #DCC08A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2,
              boxShadow: '0 2px 14px rgba(200,169,110,0.45)',
              position: 'relative', overflow: 'hidden', cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <motion.span
              variants={{ rest: { rotate: 0, x: 0 }, hovered: { rotate: -20, x: -2 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              style={{ display: 'flex' }}
            >
              <Scissors size={14} color="#18181E" strokeWidth={2.4} />
            </motion.span>
            <motion.span
              variants={{ rest: { rotate: 0, x: 0 }, hovered: { rotate: 18, x: 2 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.03 }}
              style={{ display: 'flex' }}
            >
              <CombIcon size={14} color="#18181E" strokeWidth={2.2} />
            </motion.span>
          </motion.div>
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', fontWeight: 700, color: '#F4F4F8', letterSpacing: '0.06em', lineHeight: 1.1 }}>
              CHAMELEON
            </div>
            <div style={{ fontFamily: 'Raleway, sans-serif', fontSize: '0.62rem', color: '#C8A96E', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              Barbershop
            </div>
          </div>
        </Link>

        {/* Desktop links */}
        <ul style={{ display: 'flex', gap: 8, listStyle: 'none', alignItems: 'center' }} className="nav-desktop">
          {links.map(l => {
            const active = location.pathname === l.to;
            return (
              <li key={l.to}>
                <Link
                  to={l.to}
                  style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: active ? '#C8A96E' : 'rgba(244,244,248,0.8)',
                    textDecoration: 'none',
                    padding: '8px 14px',
                    borderRadius: 6,
                    position: 'relative',
                    transition: 'color 0.25s',
                  }}
                >
                  {l.label}
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      style={{
                        position: 'absolute', bottom: 2, left: 14, right: 14,
                        height: 2, background: 'linear-gradient(90deg,#C8A96E,#DCC08A)',
                        borderRadius: 1,
                      }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
          <li>
            <Link to="/rezervasiya" className="btn btn-gold" style={{ fontFamily: 'Cinzel,serif', fontSize: '0.72rem', padding: '9px 20px' }}>
              Rezerv Et
            </Link>
          </li>
        </ul>

        {/* Mobile burger */}
        <button
          onClick={() => setOpen(o => !o)}
          className="nav-burger"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F4F4F8', display: 'none' }}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden', background: 'rgba(14,15,20,0.98)', borderTop: '1px solid rgba(200,169,110,0.15)' }}
          >
            <ul style={{ listStyle: 'none', padding: '12px 24px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {links.map(l => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    style={{
                      display: 'block', padding: '12px 0',
                      fontFamily: 'Cinzel,serif', fontSize: '0.85rem',
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: location.pathname === l.to ? '#C8A96E' : 'rgba(244,244,248,0.85)',
                      textDecoration: 'none',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-burger  { display: block !important; }
        }
      `}</style>
    </motion.nav>
  );
}
