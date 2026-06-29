'use client';

import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * 通用入场动画：进入视口时淡入上移。
 */
export default function Reveal({
  children,
  delay = 0,
  y = 24,
  duration = 1.1,
  once = true,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  once?: boolean;
  className?: string;
}) {
  const variants: Variants = {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: [0.22, 1, 0.36, 1], delay },
    },
  };
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.35 }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
