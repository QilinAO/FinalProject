import React, { useEffect, useState } from 'react';
import { Hourglass } from 'lucide-react';

export default function GlobalLoader() {
  const [count, setCount] = useState(() => {
    if (typeof window === 'undefined') return 0;
    return window.__apiLoadingCount || 0;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e) => {
      const c = e?.detail?.count;
      if (typeof c === 'number') setCount(c);
    };
    window.addEventListener('api:loading', handler);
    return () => window.removeEventListener('api:loading', handler);
  }, []);

  if (count <= 0) return null;

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/25 pointer-events-none">
      <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/90 shadow-xl border border-gray-200 pointer-events-auto">
        <Hourglass className="animate-spin text-purple-600" />
        <span className="text-sm text-gray-700">กำลังทำงาน...</span>
      </div>
    </div>
  );
}

