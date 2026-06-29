'use client';

import { useEffect, useState } from 'react';

export default function ScrollProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? window.scrollY / max : 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[60] bg-transparent pointer-events-none">
      <div
        className="h-full"
        style={{
          width: `${p * 100}%`,
          background: 'linear-gradient(90deg, #C9A368, #B03A48, #C9A368)',
          boxShadow: '0 0 8px rgba(201,163,104,0.6)',
          transition: 'width 0.12s linear',
        }}
      />
    </div>
  );
}
