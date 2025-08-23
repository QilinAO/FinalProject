import React, { useState, useEffect } from "react";
import QualityEvaluationHistory from "./QualityEvaluationHistory";
import CompetitionHistory from "./CompetitionHistory";
import { ClipboardCheck, Trophy } from "lucide-react";

const GAP_BELOW_NAV = 8; // เว้นห่างนิดเดียวใต้แถบเมนู

const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState("quality");
  const [topPad, setTopPad] = useState(64 + GAP_BELOW_NAV); // fallback

  // วัด “แถบนำทางที่ fixed และชิดบน” เท่านั้น แล้ว clamp ค่าให้ไม่พลาด
  useEffect(() => {
    const measure = () => {
      const all = Array.from(
        document.querySelectorAll("[data-nav-fixed], nav, header[role='banner'], header")
      );

      // เลือกเฉพาะตัวที่ fixed และอยู่ top:0 (เป็น navbar จริง)
      const fixedTop0 = all.filter((el) => {
        const cs = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return cs.position === "fixed" && Math.round(rect.top) === 0 && rect.height > 0;
      });

      let h;
      if (fixedTop0.length) {
        h = Math.min(...fixedTop0.map((el) => el.getBoundingClientRect().height));
      } else {
        // ถ้าไม่เจอ ให้ลองตัวที่สูงน้อยสุดจาก candidate ทั้งหมด
        const heights = all.map((el) => el.getBoundingClientRect().height).filter((n) => n > 0);
        h = heights.length ? Math.min(...heights) : 64;
      }

      // กันพลาด: จำกัดให้ไม่ต่ำกว่า 40 และไม่เกิน 80 px
      const clamped = Math.max(40, Math.min(h, 80));
      setTopPad(clamped + GAP_BELOW_NAV);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const TabButton = ({ tabName, label, icon: Icon }) => (
    <button
      type="button"
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
    <>
      {/* พื้นหลังเต็มจอ แยกเป็น sibling และไม่รับคลิก */}
      <div
        className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-200 via-pink-200 to-red-200 pointer-events-none"
        aria-hidden="true"
      />

      <main className="relative min-h-screen">
        {/* ใช้ paddingTop ที่คำนวณจาก navbar จริง */}
        <div className="max-w-7xl mx-auto px-4 pb-6" style={{ paddingTop: topPad }}>
          <h1 className="text-3xl font-bold text-center mb-3 text-purple-700">
            ประวัติการใช้งาน
          </h1>

          {/* ปุ่มสลับแท็บ */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-4">
            <TabButton tabName="quality" label="ประวัติการประเมินคุณภาพ" icon={ClipboardCheck} />
            <TabButton tabName="competition" label="ประวัติการแข่งขัน" icon={Trophy} />
          </div>

          {/* เนื้อหาแท็บ */}
          <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg">
            {activeTab === "quality" ? <QualityEvaluationHistory /> : <CompetitionHistory />}
          </div>
        </div>
      </main>
    </>
  );
};

export default HistoryPage;
