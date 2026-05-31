import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { BookOpen, ArrowRight, Calendar } from 'lucide-react';
import { getBlogPosts } from '../api/client.js';
import PageTransition from '../components/PageTransition.jsx';

function PostCard({ post, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const date = new Date(post.createdAt).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: (index % 3) * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.22 } }}
    >
      <Link to={`/blog/${post.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div className="card emboss" style={{ padding: '32px 28px', height: '100%', cursor: 'pointer' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 10,
            background: 'linear-gradient(135deg,#2A2B35,#4A4B57)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
          }}>
            <BookOpen size={20} color="#C8A96E" />
          </div>
          <h3 style={{ fontFamily: 'Cinzel,serif', fontSize: '1rem', color: '#18181E', marginBottom: 10, lineHeight: 1.4 }}>{post.title}</h3>
          <p style={{ color: '#6A6B75', fontSize: '0.85rem', lineHeight: 1.65, marginBottom: 20 }}>{post.excerpt}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9A9BA3', fontSize: '0.75rem' }}>
              <Calendar size={12} /> {date}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#C8A96E', fontSize: '0.8rem', fontWeight: 600 }}>
              Oxu <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogPosts()
      .then(r => setPosts(r.data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <div style={{
        paddingTop: 120, paddingBottom: 60, textAlign: 'center',
        background: 'linear-gradient(180deg,rgba(18,19,24,0.88) 0%,transparent 100%)',
        borderBottom: '1px solid rgba(200,169,110,0.12)',
      }}>
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic', color: '#C8A96E', fontSize: '1rem', marginBottom: 12 }}
        >
          Məqalələr & Tövsiyələr
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(1.8rem,5vw,3rem)', color: '#F4F4F8', marginBottom: 16 }}
        >
          Blog
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.35, duration: 0.5 }}
          style={{ width: 60, height: 2, background: 'linear-gradient(90deg,#C8A96E,#DCC08A)', margin: '0 auto', borderRadius: 1 }}
        />
      </div>

      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <BookOpen size={32} color="#C8A96E" />
              </motion.div>
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#6A6B75' }}>Hələ heç bir post yoxdur.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
              {posts.map((p, i) => <PostCard key={p.id} post={p} index={i} />)}
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
