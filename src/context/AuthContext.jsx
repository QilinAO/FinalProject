// D:\ProJectFinal\Lasts\my-project\src\context\AuthContext.jsx (ฉบับสมบูรณ์)

import React, { createContext, useState, useEffect, useContext } from 'react';
import { LoaderCircle } from 'lucide-react';
import {
    loginUser,
    signoutUser,
    isAuthenticated as isTokenValid, // ตั้งชื่อใหม่ให้ชัดเจนว่าเป็นการเช็ค token ในเครื่อง
    getStoredUserProfile
} from '../services/authService';

// 1. สร้าง Context object ขึ้นมา
// เปรียบเสมือนการสร้าง "ช่องสัญญาณ" กลางสำหรับข้อมูลการยืนยันตัวตน
const AuthContext = createContext(null);

// 2. สร้าง Provider Component
// Component นี้จะทำหน้าที่เป็น "ผู้ส่งสัญญาณ" หรือผู้จัดการข้อมูลทั้งหมด
// เราจะนำ Component นี้ไปห่อหุ้ม App ทั้งหมดในไฟล์ main.jsx
export const AuthProvider = ({ children }) => {
  // --- State ---

  // user: State สำหรับเก็บข้อมูล profile ของผู้ใช้ที่ login อยู่ (เช่น id, name, email, role)
  // หากไม่มีใคร login ค่าจะเป็น null
  const [user, setUser] = useState(null);

  // loading: State สำหรับบอกว่า Context กำลังตรวจสอบ session เริ่มต้นอยู่หรือไม่
  // สำคัญมาก! เพื่อป้องกันการกระพริบของหน้าจอตอนเปิดแอป
  const [loading, setLoading] = useState(true);

  // --- Effect ---

  // useEffect นี้จะทำงานแค่ "ครั้งเดียว" ตอนที่แอปพลิเคชันเริ่มทำงานครั้งแรก
  // เพื่อตรวจสอบว่ามี session ของผู้ใช้ค้างอยู่ใน localStorage หรือไม่
  useEffect(() => {
    try {
      // เรียกใช้ฟังก์ชันจาก authService เพื่อดูว่ามี 'authToken' ใน localStorage หรือไม่
      if (isTokenValid()) {
        // ถ้ามี token, ให้ดึงข้อมูล profile ที่เคยบันทึกไว้ออกมา
        const storedProfile = getStoredUserProfile();
        if (storedProfile) {
          // ถ้ามีข้อมูล profile, ให้ตั้งค่า user state เพื่อให้แอปเข้าสู่สถานะ "ล็อกอินแล้ว" ทันที
          setUser(storedProfile);
        }
      }
    } catch (error) {
      console.error("Could not restore user session:", error);
      // ถ้าเกิดข้อผิดพลาดในการกู้คืน session (เช่น ข้อมูลใน localStorage เสียหาย)
      // ให้ทำการ logout เพื่อเคลียร์ข้อมูลที่อาจมีปัญหาทิ้งไปเลย
      signoutUser();
    } finally {
      // ไม่ว่าจะสำเร็จหรือล้มเหลว สุดท้ายต้องตั้งค่า loading เป็น false
      // เพื่อบอกให้แอปพลิเคชันเริ่มแสดงผลหน้าเว็บได้
      setLoading(false);
    }
  }, []); // dependency array ว่างเปล่า [] หมายถึงให้ทำงานแค่ครั้งเดียว

  // --- Functions ที่จะส่งต่อให้ Component อื่นๆ ---

  // ฟังก์ชันสำหรับ "เข้าสู่ระบบ"
  const signin = async (email, password) => {
    try {
        // เรียกใช้ service, ซึ่งจะจัดการเรื่องการเรียก API และการเก็บ token/profile ลง localStorage
        const { profile } = await loginUser(email, password);

        // เมื่อสำเร็จ, ให้อัปเดต user state ใน context
        // การทำเช่นนี้จะทำให้ทุก Component ในแอปที่ใช้ useAuth() รับรู้ทันทีว่ามีคน login เข้ามาใหม่
        setUser(profile);

        // คืนค่า profile ให้ Component ที่เรียกใช้ (เช่น หน้า Login) นำไปใช้ต่อได้ทันที (เช่นการ redirect ตาม role)
        return { profile };
    } catch (error) {
        // หากการ login ล้มเหลว ให้เคลียร์ user state เพื่อความปลอดภัย และโยน error ต่อไปให้หน้า Login จัดการ
        setUser(null);
        throw error;
    }
  };

  // ฟังก์ชันสำหรับ "ออกจากระบบ"
  const signout = async () => {
    // เรียกใช้ service เพื่อเคลียร์ token/profile จาก localStorage
    await signoutUser();
    // อัปเดต user state ใน context ให้เป็น null, ทั่วทั้งแอปจะรับรู้และกลับสู่สถานะ "ยังไม่ login"
    setUser(null);
  };

  // --- Render Logic ---

  // ถ้า Context ยังอยู่ในสถานะ loading (กำลังตรวจสอบ session เริ่มต้น)
  // ให้แสดงหน้า loading แบบเต็มจอกลางหน้าจอ
  // นี่คือส่วนที่ช่วยป้องกันการ "กระพริบ" (เช่น แสดงหน้า login แว่บหนึ่งก่อนจะเปลี่ยนเป็นหน้า dashboard)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoaderCircle className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  // เมื่อ loading เสร็จแล้ว, ให้ส่งค่าทั้งหมดที่ Component อื่นๆ จำเป็นต้องใช้ผ่าน Provider
  // โดยค่าที่ส่งไปคือ object ที่มี user, isAuthenticated, loading, signin, และ signout
  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. สร้าง Custom Hook
// เพื่อให้ Component อื่นๆ สามารถดึงข้อมูลจาก Context ไปใช้งานได้ง่ายและปลอดภัย
export const useAuth = () => {
  const context = useContext(AuthContext);
  // ตรวจสอบเพื่อให้แน่ใจว่า Component ที่เรียกใช้ useAuth() อยู่ภายใต้ AuthProvider
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};