import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar } from 'lucide-react';
import { getBlogPost } from '../api/client.js';
import PageTransition from '../components/PageTransition.jsx';

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogPost(id)
      .then(r => setPost(r.data))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <PageTransition>
      <div style={{ paddingTop: 120, textAlign: 'center', color: '#C8A96E', fontFamily: 'Cinzel,serif' }}>Yüklənir...</div>
    </PageTransition>
  );

  if (!post) return (
    <PageTransition>
      <div style={{ paddingTop: 120, textAlign: 'center' }}>
        <p style={{ color: '#6A6B75' }}>Post tapılmadı.</p>
        <Link to="/blog" className="btn btn-outline" style={{ marginTop: 20, display: 'inline-flex' }}>Bloga qayıt</Link>
      </div>
    </PageTransition>
  );

  const date = new Date(post.createdAt).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <PageTransition>
      <div style={{ paddingTop: 100 }}>
        <div style={{ background: 'linear-gradient(180deg,rgba(18,19,24,0.88) 0%,transparent 100%)', padding: '60px 24px 48px', textAlign: 'center', borderBottom: '1px solid rgba(200,169,110,0.12)' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'rgba(244,244,248,0.5)', fontSize: '0.8rem', marginBottom: 16 }}>
              <Calendar size={13} /> {date}
            </div>
            <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(1.4rem,4vw,2.2rem)', color: '#F4F4F8', maxWidth: 700, margin: '0 auto 16px', lineHeight: 1.3 }}>{post.title}</h1>
            <div style={{ width: 50, height: 2, background: 'linear-gradient(90deg,#C8A96E,#DCC08A)', margin: '0 auto', borderRadius: 1 }} />
          </motion.div>
        </div>

        <section className="section">
          <div className="container" style={{ maxWidth: 720 }}>
            <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6A6B75', textDecoration: 'none', fontSize: '0.85rem', marginBottom: 32 }}>
              <ArrowLeft size={15} /> Bloga qayıt
            </Link>
            <div className="card" style={{ padding: '36px 40px' }}>
              <p style={{ fontSize: '1rem', lineHeight: 1.9, color: '#3C3D47', whiteSpace: 'pre-wrap' }}>{post.content}</p>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
