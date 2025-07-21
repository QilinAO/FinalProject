import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ roleRequired, children }) => {
  // ดึง JWT และ role จาก localStorage
  const token = localStorage.getItem('jwtToken');
  const userRole = localStorage.getItem('userRole'); // สมมุติว่าเก็บ role ใน localStorage

  // ถ้าไม่มี token หรือ userRole ไม่ตรงกับ roleRequired
  if (!token || userRole !== roleRequired) {
    // ถ้าไม่มี token หรือบทบาทไม่ตรงกัน ให้ redirect ไปหน้า Unauthorized
    return <Navigate to="/unauthorized" />;
  }

  // หาก token และ role ตรง ให้แสดง children (หน้าที่ต้องการเข้าถึง)
  return children;
};

export default ProtectedRoute;
