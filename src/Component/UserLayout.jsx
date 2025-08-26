// ======================================================================
// File: src/Component/UserLayout.jsx
// หน้าที่: จัดการโครงสร้าง Layout หลักสำหรับผู้ใช้ทั่วไป (User)
// ======================================================================

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { AlertTriangle } from 'lucide-react';
import Navbar from './Navbar';

/**
 * Component ที่จะแสดงผลแทนส่วนที่เกิด Error ภายใน Layout นี้
 */
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div role="alert" className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500 text-red-800 shadow-md">
    <div className="flex items-center mb-4">
      <AlertTriangle className="w-8 h-8 mr-3" />
      <h2 className="text-2xl font-bold">เกิดข้อผิดพลาด</h2>
    </div>
    <p className="mb-2">ขออภัย, ไม่สามารถแสดงผลส่วนนี้ของหน้าเว็บได้</p>
    <pre className="text-sm bg-red-100 p-2 rounded overflow-x-auto mb-4">
      {error.message}
    </pre>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
    >
      ลองอีกครั้ง
    </button>
  </div>
);

/**
 * Layout หลักสำหรับหน้าทั้งหมดในส่วนของผู้ใช้
 * ประกอบด้วย Navbar และพื้นที่สำหรับแสดงเนื้อหาของแต่ละหน้า (Outlet)
 */
const UserLayout = () => {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <main>
        {/*
          ErrorBoundary ทำหน้าที่ดักจับ Error ที่เกิดจากการ Render ใน <Outlet />
          - resetKeys: บอกให้ ErrorBoundary พยายาม Render ใหม่เมื่อ URL เปลี่ยน
        */}
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          resetKeys={[location.pathname]}
        >
          <Outlet />
        </ErrorBoundary>
      </main>
    </>
  );
};

export default UserLayout;