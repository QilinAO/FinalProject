// src/Pages/Expert/FishEvaluationList.jsx

import React from "react";

const FishEvaluationList = () => {
  const fishList = [
    { id: 1, name: "Betta A", owner: "John Doe" },
    { id: 2, name: "Betta B", owner: "Jane Smith" },
  ];

  return (
    // ใช้ min-h-screen + bg-gray-50 เพื่อให้เต็มหน้าจอ
    <div className="min-h-screen bg-gray-50">
      {/* เลื่อนเนื้อหาให้พ้น Navbar ด้วย pt-20 แทน ml-64 */}
      <div className="pt-20 p-4">
        <h1 className="text-2xl font-bold mb-4">รายการปลากัดรอการประเมิน</h1>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">ชื่อปลากัด</th>
              <th className="border p-2">เจ้าของ</th>
              <th className="border p-2">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {fishList.map((fish) => (
              <tr key={fish.id}>
                <td className="border p-2">{fish.id}</td>
                <td className="border p-2">{fish.name}</td>
                <td className="border p-2">{fish.owner}</td>
                <td className="border p-2">
                  <button className="bg-blue-500 text-white px-4 py-2 rounded">
                    ดูรายละเอียด
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FishEvaluationList;
