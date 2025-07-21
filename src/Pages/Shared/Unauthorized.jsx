// D:\ProJectFinal\Lasts\my-project\src\Pages\Shared\Unauthorized.jsx (ไฟล์ใหม่)
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <ShieldAlert className="w-24 h-24 text-red-500 mb-4" />
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Access Denied</h1>
      <p className="text-lg text-gray-600 mb-6 text-center">
        ขออภัย, คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
      >
        กลับสู่หน้าหลัก
      </Link>
    </div>
  );
};

export default Unauthorized;