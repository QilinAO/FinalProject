// ======================================================================
// File: src/Component/ProtectedRoute.jsx
// หน้าที่: ตรวจสอบสิทธิ์การเข้าถึงเส้นทาง (Route) ต่างๆ ในแอปพลิเคชัน
// ======================================================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * คอมโพเนนท์สำหรับป้องกันเส้นทาง (Route) ที่ต้องการการยืนยันตัวตนและสิทธิ์การเข้าถึง
 * @param {object} props
 * @param {React.ReactNode} props.children - Component ที่จะแสดงผลหากผู้ใช้มีสิทธิ์เข้าถึง
 * @param {string} [props.requiredRole] - Role ที่จำเป็นต้องมีเพื่อเข้าถึง (เช่น 'admin')
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // 1. ขณะกำลังตรวจสอบสถานะ Login (loading) ให้แสดงหน้า Loading
  // เพื่อป้องกันการ Redirect ผู้ใช้โดยไม่จำเป็น (Flickering)
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
        <LoaderCircle className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  // 2. หากตรวจสอบเสร็จแล้ว แต่ผู้ใช้ยังไม่ได้ Login (isNotAuthenticated)
  // ให้ Redirect ไปยังหน้า Login พร้อมจำหน้าปัจจุบันไว้ใน state
  // เพื่อให้หลังจาก Login สำเร็จ สามารถกลับมายังหน้านี้ได้
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. หากมีการระบุ Role ที่ต้องการ (requiredRole) แต่ Role ของผู้ใช้ไม่ตรงกัน
  // ให้ Redirect ไปยังหน้า Unauthorized (ไม่มีสิทธิ์เข้าถึง)
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. หากผ่านการตรวจสอบทั้งหมด แสดงว่าผู้ใช้มีสิทธิ์เข้าถึง
  // ให้แสดง Component ที่ต้องการ (children) ได้เลย
  return children;
};

export default ProtectedRoute;