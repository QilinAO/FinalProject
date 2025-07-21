import React, { useState } from "react";
import QualityEvaluationHistory from "./QualityEvaluationHistory";
import CompetitionHistory from "./CompetitionHistory";
import { ClipboardCheck, Trophy } from "lucide-react"; // [แนะนำ] เพิ่มไอคอนเพื่อความสวยงาม

const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState("quality");

  // Component ย่อยสำหรับปุ่ม Tab เพื่อลดการเขียนโค้ดซ้ำ
  const TabButton = ({ tabName, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-300 w-full sm:w-auto justify-center
        ${activeTab === tabName 
          ? "bg-purple-600 text-white shadow-md" 
          : "bg-white text-purple-600 hover:bg-purple-100"
        }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-200 via-pink-200 to-red-200 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-purple-700">
          ประวัติการใช้งาน
        </h1>

        {/* ปุ่มสลับแท็บ */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <TabButton tabName="quality" label="ประวัติการประเมินคุณภาพ" icon={ClipboardCheck} />
          <TabButton tabName="competition" label="ประวัติการแข่งขัน" icon={Trophy} />
        </div>

        {/* ส่วนแสดงเนื้อหาตาม Tab ที่เลือก */}
        <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg">
          {activeTab === "quality" ? <QualityEvaluationHistory /> : <CompetitionHistory />}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;