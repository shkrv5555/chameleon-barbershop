import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Scissors, Crown, Clock, ArrowRight } from 'lucide-react';
import { getServices } from '../api/client.js';
import PageTransition from '../components/PageTransition.jsx';

const iconMap = {
  Scissors: Scissors,
  Crown: Crown,
  Clock: Clock,
};

function ServiceCard({ service, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const Icon = iconMap[service.icon] || Scissors;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: (index % 3) * 0.1, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="card emboss"
      style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      <div style={{
        width: 54, height: 54, borderRadius: '50%',
        background: 'linear-gradient(135deg,#2A2B35,#4A4B57)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.22)',
      }}>
        <Icon size={22} color="#C8A96E" />
      </div>
      <div>
        <h3 style={{ fontFamily: 'Cinzel,serif', fontSize: '1.05rem', color: '#18181E', marginBottom: 6 }}>{service.name}</h3>
        <p style={{ color: '#6A6B75', fontSize: '0.85rem', lineHeight: 1.6 }}>{service.description}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(100,101,110,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6A6B75', fontSize: '0.8rem' }}>
          <Clock size={13} />
          <span>{service.duration} dəq</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices()
      .then(r => setServices(r.data))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      {/* Header */}
      <div style={{
        paddingTop: 120, paddingBottom: 60, textAlign: 'center',
        background: 'linear-gradient(180deg,rgba(18,19,24,0.88) 0%,transparent 100%)',
        borderBottom: '1px solid rgba(200,169,110,0.12)',
      }}>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic', color: '#C8A96E', fontSize: '1rem', marginBottom: 12 }}
        >
          Peşəkar xidmət
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(1.8rem,5vw,3rem)', color: '#F4F4F8', marginBottom: 16 }}
        >
          Xidmətlərimiz
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          style={{ width: 60, height: 2, background: 'linear-gradient(90deg,#C8A96E,#DCC08A)', margin: '0 auto', borderRadius: 1 }}
        />
      </div>

      {/* Services grid */}
      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Scissors size={32} color="#C8A96E" />
              </motion.div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 24 }}>
              {services.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 56 }}>
            <div className="card" style={{ display: 'inline-block', padding: '28px 40px' }}>
              <p style={{ fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic', color: '#3C3D47', fontSize: '1.05rem', marginBottom: 20 }}>
                Xidmətlə maraqlananmısınız?
              </p>
              <Link to="/rezervasiya" className="btn btn-primary">
                Rezervasiya Et <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
