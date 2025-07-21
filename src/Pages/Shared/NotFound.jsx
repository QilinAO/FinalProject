import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-4">
        <h1 className="text-6xl font-bold text-purple-600">404</h1>
        <h2 className="text-2xl font-semibold mt-4 mb-2 text-gray-800">Page Not Found</h2>
        <p className="text-gray-600 mb-6">ขออภัย, เราไม่พบหน้าที่คุณกำลังมองหา</p>
        <Link to="/" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            กลับสู่หน้าหลัก
        </Link>
    </div>
);
export default NotFound;