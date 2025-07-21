// D:\ProJectFinal\Lasts\my-project\src\Component\ManagerLayout.jsx (ฉบับสมบูรณ์)

import React from 'react';
import { Outlet } from 'react-router-dom';
import ManagerMenu from './ManagerMenu';

/**
 * ManagerLayout เป็น Component ที่ทำหน้าที่เป็น "โครงสร้างหลัก" (Layout)
 * สำหรับทุกๆ หน้าที่อยู่ภายใต้เส้นทาง /manager/*
 *
 * การทำงานของมันถูกควบคุมโดย <Route> ในไฟล์ App.jsx ดังนี้:
 * <Route path="/manager" element={<ProtectedRoute requiredRole="manager"><ManagerLayout /></ProtectedRoute>}>
 *   ... ManagerRoutes ทั้งหมดจะถูกแสดงผลที่นี่ ...
 * </Route>
 */
const ManagerLayout = () => {
  return (
    // สร้าง div หลักที่กำหนดพื้นหลังและให้มีความสูงเต็มหน้าจอ
    <div className="bg-gray-100 min-h-screen">

      {/* 1. แสดง Component ManagerMenu (เมนูด้านข้าง) */}
      {/* Component นี้จะถูกแสดงผลเสมอในทุกๆ หน้าของ Manager */}
      <ManagerMenu />

      {/* 2. สร้างส่วน <main> สำหรับเนื้อหาหลักของแต่ละหน้า */}
      {/*
        - `md:pl-64`: บนจอขนาดกลาง (md) ขึ้นไป ให้เว้นระยะห่างด้านซ้าย 64 หน่วย (เท่ากับความกว้างของ Sidebar)
                      เพื่อไม่ให้เนื้อหาถูกเมนูด้านข้างทับ
        - `pt-16`: เว้นระยะห่างด้านบน 16 หน่วย เพื่อไม่ให้เนื้อหาถูก Navbar (ถ้ามี) ทับ
                     (เป็นการป้องกันเผื่อไว้ แม้ว่าใน Layout นี้จะไม่มี Navbar ก็ตาม)
      */}
      <main className="md:pl-64 pt-16">

        {/* 3. กำหนด Padding ให้กับเนื้อหาภายใน */}
        <div className="p-4 sm:p-6 lg:p-8">
            
            {/*
              <Outlet /> คือหัวใจสำคัญของ Layout-based Routing
              มันทำหน้าที่เป็น "ตัวแทนที่" (Placeholder)
              ที่ซึ่ง React Router จะนำ Component ของ "หน้าย่อย" ที่ตรงกับ URL ปัจจุบันมาแสดงผล
              
              ตัวอย่าง:
              - ถ้าผู้ใช้เข้าไปที่ /manager/dashboard, React Router จะนำ <ManagerDashboard /> มาแสดงที่ตำแหน่ง <Outlet /> นี้
              - ถ้าผู้ใช้เข้าไปที่ /manager/contest-list, React Router จะนำ <ContestList /> มาแสดงที่ตำแหน่ง <Outlet /> นี้
            */}
            <Outlet /> 

        </div>
      </main>
    </div>
  );
};

export default ManagerLayout;