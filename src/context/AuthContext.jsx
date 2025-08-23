// D:\ProJectFinal\Lasts\my-project\src\context\AuthContext.jsx
// (ฉบับสมบูรณ์: กู้คืนเซสชัน, ฟัง 401 อัตโนมัติ, ซิงก์หลายแท็บ, พร้อมเมธอด signin/signout)

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from 'react';
import { LoaderCircle } from 'lucide-react';

import apiService from '../services/api';
import {
  // core auth flows
  loginUser,
  signoutUser,
  // storage helpers
  isAuthenticated as hasStoredToken,
  getStoredUserProfile,
  setAuthUser,
  getAccessToken,
} from '../services/authService';

// --------------------------- Context Factory ---------------------------
const AuthContext = createContext(null);
AuthContext.displayName = 'AuthContext';

// ------------------------------ Provider -------------------------------
export const AuthProvider = ({ children }) => {
  // โปรไฟล์ผู้ใช้ (null = ยังไม่ล็อกอิน)
  const [user, setUser] = useState(null);
  // สถานะกำลังกู้คืนเซสชันตอนโหลดแอปครั้งแรก
  const [loading, setLoading] = useState(true);

  // เก็บ AbortController สำหรับงาน async ตอนกู้คืนโปรไฟล์
  const initAbortRef = useRef(null);

  /**
   * กู้คืนเซสชันจาก localStorage:
   * - ถ้ามี token → พยายามอ่าน profile จาก localStorage ก่อน
   * - ถ้าไม่มี profile → ยิง /auth/profile เพื่อดึงของจริง แล้ว cache ลง localStorage
   * - ถ้าไม่มี token → เคลียร์ user ให้เป็น null
   */
  const restoreSession = useCallback(async () => {
    if (!hasStoredToken()) {
      setUser(null);
      return;
    }

    // 1) พยายามอ่านจาก localStorage (เร็วกว่า)
    const cached = getStoredUserProfile();
    if (cached && typeof cached === 'object') {
      setUser(cached);
      return;
    }

    // 2) ไม่มี cache → ลองขอจาก backend (เงียบ ๆ ไม่ต้อง error ดัง)
    try {
      // เผื่อผู้ใช้เปิดหน้าไว้นานแต่ยังมี token ใช้การได้
      const controller = new AbortController();
      initAbortRef.current = controller;

      const res = await apiService.get('/auth/profile', { signal: controller.signal });
      if (res?.success && res?.profile) {
        setAuthUser(res.profile); // cache ไว้
        setUser(res.profile);
      } else {
        // โปรไฟล์ไม่เจอแต่มี token → ถือว่าไม่สมบูรณ์ เคลียร์สถานะ
        setAuthUser(null);
        setUser(null);
      }
    } catch {
      // ถ้า error (เช่น token ใช้ไม่ได้แล้ว) → ถือว่าไม่ได้ล็อกอิน
      setAuthUser(null);
      setUser(null);
    } finally {
      initAbortRef.current = null;
    }
  }, []);

  // ทำงานครั้งแรกเมื่อ mount: กู้คืนเซสชัน
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        await restoreSession();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
      if (initAbortRef.current) {
        try { initAbortRef.current.abort(); } catch {}
      }
    };
  }, [restoreSession]);

  /**
   * ฟัง 401/403 จาก apiService แล้ว logout อัตโนมัติ (เช่น token หมดอายุ)
   * - apiService จะเรียก callback นี้เมื่อเจอ 401/403
   */
  useEffect(() => {
    const handleUnauthorized = async () => {
      try {
        await signoutUser();
      } finally {
        setUser(null);
      }
    };
    apiService.setOnUnauthorized(handleUnauthorized);
    return () => apiService.setOnUnauthorized(null);
  }, []);

  /**
   * ซิงก์ login/logout/แก้โปรไฟล์ ข้ามแท็บด้วย storage event
   * - ถ้า access_token หรือ user_profile เปลี่ยน → เรียก restoreSession()
   * - รองรับคีย์ legacy 'authToken' ด้วย
   */
  useEffect(() => {
    const onStorage = (e) => {
      if (!e) return;
      const keysToWatch = ['access_token', 'user_profile', 'authToken']; // legacy
      if (keysToWatch.includes(e.key)) {
        restoreSession();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [restoreSession]);

  // ---------------------------- API: signin ----------------------------
  /**
   * เข้าสู่ระบบ
   * - เรียก /auth/signin ผ่าน authService
   * - เก็บ token+profile แล้วตั้ง user ใน state
   */
  const signin = async (email, password) => {
    const { profile } = await loginUser(email, password);
    setUser(profile || null);
    return { profile };
  };

  // ---------------------------- API: signout ---------------------------
  /**
   * ออกจากระบบ
   * - ล้าง token+profile ที่ localStorage
   * - เคลียร์ state user
   */
  const signout = async () => {
    try {
      await signoutUser();
    } finally {
      setUser(null);
    }
  };

  // --------------------------- Render Guard ----------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoaderCircle className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  // ----------------------------- Provider ------------------------------
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!getAccessToken(), // มีทั้ง user และ token
        loading,
        signin,
        signout,
        setUser, // เผื่อหน้าโปรไฟล์แก้ไขข้อมูลแล้วอยาก sync state
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ------------------------------ Hook ใช้งาน ---------------------------
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
