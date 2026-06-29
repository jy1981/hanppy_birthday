'use client';

import type { ReactNode } from 'react';

/**
 * 竖排文字组件（右起从上至下）。
 */
export default function VerticalText({
  children,
  className = '',
  gap = '0.2em',
}: {
  children: ReactNode;
  className?: string;
  gap?: string;
}) {
  return (
    <div
      className={className}
      style={{
        writingMode: 'vertical-rl',
        letterSpacing: gap,
      }}
    >
      {children}
    </div>
  );
}
