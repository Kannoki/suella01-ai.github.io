import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  type?: 'default' | 'pink' | 'lift';
}

export default function AnimatedCard({
  children,
  className = '',
  delay = 0,
  type = 'default',
}: AnimatedCardProps) {
  const variants = {
    default: {
      rest: { scale: 1, y: 0, boxShadow: '0 4px 30px rgba(0,0,0,0.02)' },
      hover: { scale: 1.02, y: -4, boxShadow: '0 15px 50px rgba(232, 223, 255, 0.35)' },
    },
    pink: {
      rest: { scale: 1, y: 0, boxShadow: '0 4px 30px rgba(255,210,225,0.2)' },
      hover: { scale: 1.03, y: -5, boxShadow: '0 15px 50px rgba(255,210,225,0.5)' },
    },
    lift: {
      rest: { y: 0 },
      hover: { y: -6 },
    },
  };

  const selected = variants[type] || variants.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={selected.hover}
      animate={selected.rest}
      className={className}
    >
      {children}
    </motion.div>
  );
}
