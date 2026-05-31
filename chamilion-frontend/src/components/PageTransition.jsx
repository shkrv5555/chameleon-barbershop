import { motion } from 'framer-motion';

const variants = {
  initial: { opacity: 0, y: 24, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.52, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -16, filter: 'blur(4px)', transition: { duration: 0.32, ease: [0.4, 0, 1, 1] } },
};

export default function PageTransition({ children, style }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ minHeight: '100vh', ...style }}
    >
      {children}
    </motion.div>
  );
}
