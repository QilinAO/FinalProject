import React, { useState, useEffect } from "react";
import QualityEvaluationHistory from "./QualityEvaluationHistory";
import CompetitionHistory from "./CompetitionHistory";
import { ClipboardCheck, Trophy } from "lucide-react";

const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState("quality");

  const TabButton = ({ tabName, label, icon: Icon }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 w-full sm:w-auto justify-center shadow-soft hover:shadow-medium
        ${activeTab === tabName
          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white transform scale-105"
          : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
        }`}
    >
      <Icon size={20} />
      {label}
    </button>
  );

  return (
    <main className="page-container">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              📋 ประวัติการใช้งาน
            </h1>
            <p className="text-2xl md:text-3xl text-white/95 font-medium leading-relaxed">
              ตรวจสอบประวัติการประเมินและการแข่งขัน
            </p>
          </div>
        </div>
      </section>

      <div className="page-main">
        <section className="page-section">
          <div className="container-responsive">

            {/* ปุ่มสลับแท็บ */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-12">
              <TabButton tabName="quality" label="ประวัติการประเมินคุณภาพ" icon={ClipboardCheck} />
              <TabButton tabName="competition" label="ประวัติการแข่งขัน" icon={Trophy} />
            </div>

            {/* เนื้อหาแท็บ */}
            <div className="content-card">
              {activeTab === "quality" ? <QualityEvaluationHistory /> : <CompetitionHistory />}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default HistoryPage;
