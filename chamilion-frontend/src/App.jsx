import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Services from './pages/Services.jsx';
import Blog from './pages/Blog.jsx';
import BlogPost from './pages/BlogPost.jsx';
import Reservation from './pages/Reservation.jsx';
import Admin from './pages/Admin.jsx';

function AnimatedRoutes() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/gizli-panel');

  return (
    <>
      {!isAdmin && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"              element={<Home />} />
          <Route path="/xidmetler"     element={<Services />} />
          <Route path="/blog"          element={<Blog />} />
          <Route path="/blog/:id"      element={<BlogPost />} />
          <Route path="/rezervasiya"   element={<Reservation />} />
          <Route path="/gizli-panel/*" element={<Admin />} />
        </Routes>
      </AnimatePresence>
      {!isAdmin && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(30,31,38,0.95)',
            color: '#F4F4F8',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(200,169,110,0.3)',
            fontFamily: "'Raleway', sans-serif",
            borderRadius: '10px',
          },
          success: { iconTheme: { primary: '#C8A96E', secondary: '#18181E' } },
          error:   { iconTheme: { primary: '#c05050', secondary: '#fff' } },
        }}
      />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
