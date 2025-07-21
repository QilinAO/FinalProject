// src/Component/ExpertLayout.jsx (New File)

import React from 'react';
import ExpertMenu from './ExpertMenu';
import { Outlet } from 'react-router-dom';

const ExpertLayout = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <ExpertMenu />
      {/* สำหรับ Sidebar ที่อยู่ข้างๆ ต้องใช้ padding-left บน desktop */}
      <main className="md:pl-64"> 
        <div className="p-4 sm:p-6 lg:p-8">
            <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default ExpertLayout;