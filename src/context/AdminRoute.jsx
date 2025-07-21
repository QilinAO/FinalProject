import React from "react";
import { Navigate } from "react-router-dom";
// ใช้ jwt-decode ด้วยวิธี import * เป็นการดึงโมดูลทั้งหมด
import * as jwt_decode from "jwt-decode";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("jwtToken");  // ดึง JWT จาก localStorage
  
  if (!token) {
    return <Navigate to="/unauthorized" />;  // ถ้าไม่มี JWT ให้ redirect ไป Unauthorized
  }

  try {
    // Decode token เพื่อดึงข้อมูล role
    const decodedToken = jwt_decode.default(token);  // ใช้ jwt_decode.default เพื่อเรียกฟังก์ชัน decode
    const userRole = decodedToken.role;  // ดึง role จาก JWT payload

    // ตรวจสอบบทบาทว่าเป็น admin หรือไม่
    if (userRole !== "admin") {
      return <Navigate to="/unauthorized" />;  // ถ้าไม่ใช่ admin ให้ redirect ไป Unauthorized
    }
  } catch (error) {
    return <Navigate to="/unauthorized" />;  // หากเกิดข้อผิดพลาดในการ decode token ก็ให้ redirect
  }

  // หากผ่านการตรวจสอบให้แสดง children (หน้าที่ต้องการเข้าถึง)
  return children;
};

export default AdminRoute;
