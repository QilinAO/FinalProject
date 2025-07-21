// D:\ProJectFinal\Lasts\my-project\src\Component\ProtectedRoute.jsx (ฉบับสมบูรณ์)

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoaderCircle } from 'lucide-react';

/**
 * Component ทำหน้าที่เป็น "ผู้รักษาประตู" สำหรับเส้นทาง (Route) ที่ต้องการการยืนยันตัวตน
 * @param {object} props
 * @param {React.ReactNode} props.children - Component ลูกที่ต้องการจะแสดงผลหากผ่านเงื่อนไขทั้งหมด
 * @param {string} [props.requiredRole] - Role ที่จำเป็นสำหรับการเข้าถึงหน้านี้ (ถ้ามี)
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  // 1. ดึงข้อมูลและสถานะล่าสุดจาก AuthContext
  //    - user: ข้อมูล profile ของผู้ใช้ (หรือ null ถ้ายังไม่ login)
  //    - isAuthenticated: boolean บอกว่า login แล้วหรือยัง (true/false)
  //    - loading: boolean บอกว่า Context กำลังตรวจสอบ session เริ่มต้นอยู่หรือไม่
  const { user, isAuthenticated, loading } = useAuth();

  // 2. ดึงข้อมูล location ปัจจุบัน เพื่อใช้ในการ redirect กลับมาหลังจาก login สำเร็จ
  const location = useLocation();

  // --- Logic การป้องกันเส้นทาง (เรียงตามลำดับความสำคัญ) ---

  // ด่านที่ 1: ตรวจสอบสถานะ "กำลังโหลด"
  // ถ้า AuthContext ยังไม่พร้อม (กำลังเช็ค token ตอนเปิดแอป) ให้แสดงหน้า loading ก่อนเสมอ
  // เพื่อป้องกันการ redirect ที่ผิดพลาด และสร้างประสบการณ์ใช้งานที่ราบรื่น
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
        <LoaderCircle className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  // ด่านที่ 2: ตรวจสอบการ "ยืนยันตัวตน" (Authentication)
  // ถ้าโหลดเสร็จแล้ว และพบว่าผู้ใช้ยังไม่ได้ล็อกอิน (isAuthenticated เป็น false)
  if (!isAuthenticated) {
    // ให้ส่งผู้ใช้ไปที่หน้า /login
    // - `replace`: บอก react-router ว่าไม่ต้องเก็บประวัติหน้านี้ไว้ (เมื่อกด back จะไม่ย้อนกลับมาที่หน้านี้อีก)
    // - `state={{ from: location }}`: "จำ" หน้าที่ผู้ใช้พยายามจะเข้าไปเก็บไว้ใน state
    //   เพื่อให้หน้า Login สามารถดึงค่านี้ไปใช้ และส่งผู้ใช้กลับมาที่นี่หลัง login สำเร็จได้
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ด่านที่ 3: ตรวจสอบ "สิทธิ์การเข้าถึง" (Authorization)
  // ทำงานก็ต่อเมื่อมีการส่ง prop `requiredRole` เข้ามาเท่านั้น
  if (requiredRole && user?.role !== requiredRole) {
    // `user?.role` คือการเข้าถึงข้อมูล role อย่างปลอดภัย (ถ้า user เป็น null จะไม่เกิด error)
    // ถ้า role ของผู้ใช้ ไม่ตรงกับ role ที่หน้านี้ต้องการ
    // ให้ส่งไปที่หน้า /unauthorized เพราะผู้ใช้ "ล็อกอินแล้ว" แต่ "ไม่มีสิทธิ์"
    return <Navigate to="/unauthorized" replace />;
  }
  
  // ด่านสุดท้าย: ผ่านทุกเงื่อนไข
  // ถ้าผู้ใช้ล็อกอินแล้ว และมีสิทธิ์ถูกต้อง (ถ้ามีการเช็ค role)
  // ให้แสดง Component ลูก (`children`) ที่ถูกห่อหุ้มไว้ได้เลย
  return children;
};

export default ProtectedRoute;