import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scissors, Phone, Clock, MapPin, Instagram } from 'lucide-react';

function CombIcon({ size = 16, color = 'currentColor', strokeWidth = 2 }) {
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

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background: 'linear-gradient(180deg, rgba(14,15,22,0.0) 0%, rgba(14,15,22,0.97) 8%)',
      borderTop: '1px solid rgba(200,169,110,0.15)',
      padding: '64px 24px 32px',
      marginTop: 0,
    }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 40 }}>

        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <motion.div
              whileHover="hovered" initial="rest"
              style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#C8A96E,#DCC08A)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexShrink: 0 }}
            >
              <motion.span variants={{ rest: { rotate: 0 }, hovered: { rotate: -18 } }} transition={{ type: 'spring', stiffness: 400, damping: 14 }} style={{ display: 'flex' }}>
                <Scissors size={12} color="#18181E" strokeWidth={2.4} />
              </motion.span>
              <motion.span variants={{ rest: { rotate: 0 }, hovered: { rotate: 16 } }} transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.03 }} style={{ display: 'flex' }}>
                <CombIcon size={12} color="#18181E" strokeWidth={2.2} />
              </motion.span>
            </motion.div>
            <div>
              <div style={{ fontFamily: 'Cinzel,serif', color: '#F4F4F8', fontSize: '0.95rem', fontWeight: 700 }}>CHAMELEON</div>
              <div style={{ fontFamily: 'Raleway,sans-serif', color: '#C8A96E', fontSize: '0.58rem', letterSpacing: '0.18em' }}>BARBERSHOP</div>
            </div>
          </div>
          <p style={{ color: 'rgba(244,244,248,0.55)', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 240 }}>
            2020-ci ildən bəri Gəncənin ən etibarlı bərbər xidməti. Hər kəsim bir sənət əsəridir.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 style={{ fontFamily: 'Raleway,sans-serif', fontWeight: 700, color: '#C8A96E', fontSize: '0.8rem', letterSpacing: '0.12em', marginBottom: 20, textTransform: 'uppercase' }}>Keçidlər</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['/', 'Ana Səhifə'], ['/xidmetler', 'Xidmətlər'], ['/blog', 'Blog'], ['/rezervasiya', 'Rezervasiya']].map(([to, label]) => (
              <li key={to}>
                <Link to={to} style={{ color: 'rgba(244,244,248,0.6)', textDecoration: 'none', fontSize: '0.88rem', transition: 'color 0.25s' }}
                  onMouseEnter={e => e.target.style.color = '#C8A96E'}
                  onMouseLeave={e => e.target.style.color = 'rgba(244,244,248,0.6)'}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ fontFamily: 'Raleway,sans-serif', fontWeight: 700, color: '#C8A96E', fontSize: '0.8rem', letterSpacing: '0.12em', marginBottom: 20, textTransform: 'uppercase' }}>Əlaqə</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              [Phone,     '+994 XX XXX XX XX'         ],
              [Clock,     'Hər gün: 10:00 – 20:00'    ],
              [Instagram, '@chameleon_barbershop'      ],
            ].map(([Icon, text], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={14} color="#C8A96E" />
                <span style={{ color: 'rgba(244,244,248,0.6)', fontSize: '0.85rem' }}>{text}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MapPin size={14} color="#C8A96E" />
              <a
                href="https://www.google.com/maps?q=40.68446695913369,46.35851592546374"
                target="_blank" rel="noopener noreferrer"
                style={{ color: 'rgba(244,244,248,0.6)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#C8A96E'}
                onMouseLeave={e => e.target.style.color = 'rgba(244,244,248,0.6)'}
              >
                Gəncə — Xəritədə göstər ↗
              </a>
            </div>
          </div>
        </div>

      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 48, paddingTop: 24, textAlign: 'center' }}>
        <p style={{ color: 'rgba(244,244,248,0.3)', fontSize: '0.78rem', letterSpacing: '0.06em' }}>
          © {year} Chameleon Barbershop — Gəncə. 2020-dən bəri fəaliyyətdədir.
        </p>
      </div>
    </footer>
  );
}
