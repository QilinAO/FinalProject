import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-red-600 mb-4">403</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-2">Unauthorized</h2>
        <p className="text-gray-600 mb-6">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        <Link to="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
          กลับไปหน้าแรก
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
