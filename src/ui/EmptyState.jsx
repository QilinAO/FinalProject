import React from 'react';

export default function EmptyState({ title = 'ไม่พบข้อมูล', subtitle = 'ลองเปลี่ยนเงื่อนไขการค้นหา หรือเพิ่มข้อมูลใหม่', icon = null, className = '' }) {
  return (
    <div className={`text-center py-16 bg-gray-50 rounded-lg ${className}`}>
      {icon}
      <h3 className="text-gray-700 font-semibold mt-2">{title}</h3>
      <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
    </div>
  );
}

