import { useEffect, useRef } from 'react';

/**
 * Logout อัตโนมัติเมื่อไม่มีการเคลื่อนไหวครบ durationMs (ค่าเริ่มต้น 3 ชั่วโมง)
 * onTimeout: ฟังก์ชันที่จะถูกเรียกเมื่อครบเวลา (ให้ไปเคลียร์ token + redirect)
 */
export default function useIdleLogout(onTimeout, durationMs = 3 * 60 * 60 * 1000) {
  const timerRef = useRef(null);

  useEffect(() => {
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        try { onTimeout?.(); } catch {}
      }, durationMs);
    };

    const events = ['mousemove','mousedown','keypress','scroll','touchstart','wheel','click'];
    events.forEach(ev => window.addEventListener(ev, resetTimer, { passive: true }));

    resetTimer(); // เริ่มนับครั้งแรก

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(ev => window.removeEventListener(ev, resetTimer));
    };
  }, [onTimeout, durationMs]);
}
