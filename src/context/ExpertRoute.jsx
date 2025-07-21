import React from "react";
import { Navigate } from "react-router-dom";
import * as jwt_decode from "jwt-decode";


const ExpertRoute = ({ children }) => {
  const token = localStorage.getItem("jwtToken");  // ดึง JWT จาก localStorage
  
  if (!token) {
    return <Navigate to="/unauthorized" />;  // ถ้าไม่มี JWT ให้ redirect ไป Unauthorized
  }

  try {
    // Decode token เพื่อดึงข้อมูล role
    const decodedToken = jwt_decode(token);
    const userRole = decodedToken.role;  // ดึง role จาก JWT payload

    // ตรวจสอบบทบาทว่าเป็น expert หรือไม่
    if (userRole !== "expert") {
      return <Navigate to="/unauthorized" />;  // ถ้าไม่ใช่ expert ให้ redirect ไป Unauthorized
    }
  } catch (error) {
    return <Navigate to="/unauthorized" />;  // หากเกิดข้อผิดพลาดในการ decode token ก็ให้ redirect
  }

  // หากผ่านการตรวจสอบให้แสดง children (หน้าที่ต้องการเข้าถึง)
  return children;
};

export default ExpertRoute;
