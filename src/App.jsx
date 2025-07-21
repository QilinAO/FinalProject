// D:\ProJectFinal\Lasts\my-project\src\App.jsx (ฉบับสมบูรณ์)

// --- ส่วนที่ 1: การนำเข้า (Imports) ---

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Context & Utils ---
// [อัปเดต] เราไม่ต้อง import AuthProvider ที่นี่แล้ว เพราะย้ายไปอยู่ที่ main.jsx
import ProtectedRoute from "./Component/ProtectedRoute";

// --- Layouts (โครงหน้าเว็บของแต่ละส่วน) ---
import PublicLayout from './Component/PublicLayout';   // สำหรับหน้าสาธารณะ
import UserLayout from './Component/UserLayout';     // สำหรับ User ที่ Login แล้ว
import AdminLayout from './Component/AdminLayout';     // สำหรับ Admin
import ManagerLayout from "./Component/ManagerLayout";   // สำหรับ Manager
import ExpertLayout from "./Component/ExpertLayout";     // สำหรับ Expert

// --- Shared Pages (หน้าที่ใช้ร่วมกัน) ---
import Unauthorized from './Pages/Shared/Unauthorized';
import NotFound from './Pages/Shared/NotFound'; // หน้า 404 Not Found

// --- Route Definitions (ไฟล์ที่รวบรวมเส้นทางย่อยของแต่ละส่วน) ---
import PublicRoutes from "./Routes/PublicRoutes";
import ProtectedUserRoutes from './Routes/ProtectedUserRoutes';
import AdminRoutes from "./Routes/AdminRoutes";
import ManagerRoutes from "./Routes/ManagerRoutes";
import ExpertRoutes from "./Routes/ExpertRoutes";


// --- ส่วนที่ 2: Main App Component ---

// [อัปเดต] เอา <AuthProvider> ที่เคยห่อหุ้มทั้งหมดออกไป
// Component นี้จะเริ่มต้นด้วย <BrowserRouter> ทันที
const App = () => (
  <BrowserRouter>
    {/* <Routes> คือ Component หลักที่ทำหน้าที่เลือก Route ที่ตรงกับ URL ปัจจุบัน */}
    <Routes>

      {/* SECTION 1: Public Routes (ทุกคนเข้าได้ ไม่ต้อง Login) */}
      {/* ทุก Route ที่อยู่ข้างใน จะใช้ <PublicLayout /> เป็นโครงหน้าตา (มี Navbar) */}
      <Route element={<PublicLayout />}>
        {PublicRoutes.map(({ path, element }) => <Route key={path} path={path} element={element} />)}
      </Route>

      {/* SECTION 2: Protected User Routes (ต้อง Login แต่เป็น Role ใดก็ได้) */}
      {/* 
        - <ProtectedRoute> จะทำงานก่อนเพื่อตรวจสอบว่า Login หรือยัง
        - ถ้า Login แล้ว, ถึงจะแสดง <UserLayout /> และหน้าย่อยๆ ข้างใน
      */}
      <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
        {ProtectedUserRoutes.map(({ path, element }) => <Route key={path} path={path} element={element} />)}
      </Route>

      {/* SECTION 3: Admin Routes (ต้อง Login และ Role เป็น 'admin') */}
      {/*
        - path="/admin" กำหนดว่าทุก Route ข้างในจะขึ้นต้นด้วย /admin/...
        - <ProtectedRoute> ตรวจสอบทั้งการ Login และเช็ค Role ว่าต้องเป็น 'admin'
        - ถ้าผ่าน, จะแสดง <AdminLayout /> (ซึ่งมีเมนูของ Admin) และหน้าย่อยๆ ข้างใน
      */}
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
        {AdminRoutes.map(({ path, element }) => <Route key={path} path={path} element={element} />)}
        {/* ถ้าเข้า /admin เฉยๆ, ให้ redirect ไปที่ /admin/dashboard โดยอัตโนมัติ */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* SECTION 4: Manager Routes (ต้อง Login และ Role เป็น 'manager') */}
      <Route path="/manager" element={<ProtectedRoute requiredRole="manager"><ManagerLayout /></ProtectedRoute>}>
        {ManagerRoutes.map(({ path, element }) => <Route key={path} path={path} element={element} />)}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* SECTION 5: Expert Routes (ต้อง Login และ Role เป็น 'expert') */}
      <Route path="/expert" element={<ProtectedRoute requiredRole="expert"><ExpertLayout /></ProtectedRoute>}>
        {ExpertRoutes.map(({ path, element }) => <Route key={path} path={path} element={element} />)}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
      
      {/* SECTION 6: Special Routes and Fallback (หน้าที่ไม่มี Layout เฉพาะ หรือหน้าที่ใช้เป็นทางออก) */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      {/* path="*" คือ "Catch-All" Route ถ้าไม่มี path ไหนตรงกับที่กำหนดไว้ข้างบนเลย จะมาแสดงหน้านี้ */}
      <Route path="*" element={<NotFound />} />

    </Routes>

    {/* ToastContainer สำหรับแสดงการแจ้งเตือน (toast) ทั่วทั้งแอป */}
    <ToastContainer position="bottom-right" autoClose={4000} hideProgressBar={false} />
  </BrowserRouter>
);

export default App;