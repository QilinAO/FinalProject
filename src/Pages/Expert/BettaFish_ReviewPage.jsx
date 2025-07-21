import React, { useState, useEffect } from "react";
import { Search, Eye, X } from "lucide-react";
import axios from "axios";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ------------ (A) Schema คะแนน (ตัวอย่าง) ------------
const shortFinSingleTailSchema = [
  { key: "head_and_eyes", label: "หัวและตา", max: 5 },
  { key: "body_and_scales", label: "ลำตัวและเกล็ด", max: 5 },
  { key: "dorsal_fin", label: "ครีบหลัง (กระโดง)", max: 5 },
  { key: "tail_fin", label: "ครีบหาง (หาง)", max: 20 },
  { key: "pectoral_fin", label: "ครีบก้น (ชายน้ำ)", max: 5 },
  { key: "other_fins", label: "ครีบอื่นๆ (หู, อก, เหงือก)", max: 5 },
  { key: "color_and_pattern", label: "สี และลวดลาย", max: 20 },
  { key: "swimming_and_posture", label: "การทรงตัว และการว่ายน้ำ", max: 5 },
  { key: "fighting_ability", label: "การพองสู้", max: 5 },
  { key: "overall_impression", label: "ภาพรวม", max: 25 },
];

const shortFinCrowntailSchema = [
  { key: "head_and_eyes", label: "หัวและตา", max: 5 },
  { key: "body_and_scales", label: "ลำตัวและเกล็ด", max: 5 },
  { key: "dorsal_fin", label: "ครีบหลัง (กระโดง)", max: 10 },
  { key: "tail_fin", label: "ครีบหาง (หาง)", max: 15 },
  { key: "pectoral_fin", label: "ครีบก้น (ชายน้ำ)", max: 10 },
  { key: "other_fins", label: "ครีบอื่นๆ (หู, อก, เหงือก)", max: 5 },
  { key: "color_and_pattern", label: "สี และลวดลาย", max: 20 },
  { key: "swimming_and_posture", label: "การทรงตัว และการว่ายน้ำ", max: 5 },
  { key: "fighting_ability", label: "การพองสู้", max: 5 },
  { key: "overall_impression", label: "ภาพรวม", max: 20 },
];

const longFinSchema = [
  { key: "head_and_eyes", label: "หัวและตา", max: 5 },
  { key: "body_and_scales", label: "ลำตัวและเกล็ด", max: 5 },
  { key: "dorsal_fin", label: "ครีบหลัง (กระโดง)", max: 10 },
  { key: "tail_fin", label: "ครีบหาง (หาง)", max: 15 },
  { key: "pectoral_fin", label: "ครีบก้น (ชายน้ำ)", max: 10 },
  { key: "other_fins", label: "ครีบอื่นๆ (หู, อก, เหงือก)", max: 5 },
  { key: "color_and_pattern", label: "สี และลวดลาย", max: 20 },
  { key: "swimming_and_posture", label: "การทรงตัว และการว่ายน้ำ", max: 5 },
  { key: "fighting_ability", label: "การพองสู้", max: 5 },
  { key: "overall_impression", label: "ภาพรวม", max: 20 },
];

// ฟังก์ชันเลือก schema ตาม betta_type
function getBettaScoringSchema(betta) {
  if (betta.betta_type === "ฮาร์ฟมูน") {
    return shortFinSingleTailSchema;
  } else if (betta.betta_type === "คราวน์เทล") {
    return shortFinCrowntailSchema;
  } else {
    return longFinSchema;
  }
}

// =====================================================
// ฟอร์ม "รีวิวปลากัด" (หน้าให้ผู้เชี่ยวชาญประเมิน)
// =====================================================
const BettaReviewPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [bettaTypeFilter, setBettaTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [bettaData, setBettaData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBetta, setSelectedBetta] = useState(null);

  // คะแนนแต่ละหมวด
  const [scores, setScores] = useState({});

  // โหลดข้อมูลครั้งแรก
  useEffect(() => {
    fetchAllBettas();
  }, []);

  // (1) โหลดข้อมูลปลากัดจาก backend
  const fetchAllBettas = async () => {
    try {
      const response = await axios.get("http://localhost:3000/bettaReviews/all");
      if (response.data.success) {
        setBettaData(response.data.data);
      } else {
        console.error("Failed to fetch betta data:", response.data.message);
      }
    } catch (error) {
      console.error("Failed to fetch betta data:", error);
    }
  };

  // (2) แสดงสถานะ
  const renderBettaStatus = (status) => {
    const statusColors = {
      "รอการประเมิน": "bg-yellow-100 text-yellow-800",
      "อนุมัติ": "bg-green-100 text-green-800",
      "ปฏิเสธ": "bg-red-100 text-red-800",
      "กำลังดำเนินการ": "bg-cyan-100 text-cyan-800", // เพิ่มสีสำหรับ "กำลังดำเนินการ" ถ้าต้องการ
    };
    return (
      <span
        className={`px-2 py-1 rounded ${
          statusColors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  // (3) เปิด Modal + reset คะแนน
  const openModal = (betta) => {
    setSelectedBetta(betta);
    // กำหนดค่าเริ่มต้นของ scores เป็น 0 ตาม schema
    const schema = getBettaScoringSchema(betta);
    const initialScores = {};
    schema.forEach((cat) => {
      initialScores[cat.key] = 0;
    });
    setScores(initialScores);

    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedBetta(null);
    setModalOpen(false);
  };

  // (4) เปลี่ยนคะแนน
  const handleScoreChange = (key, value) => {
    // แปลงค่า string -> number (เพราะ input type="number" จะส่งมาเป็น string)
    const numericVal = parseInt(value, 10);

    setScores((prev) => ({
      ...prev,
      [key]: isNaN(numericVal) ? 0 : numericVal, // ถ้า parse ไม่ได้ ให้เป็น 0
    }));
  };

  // (5) รวมคะแนน
  const calculateTotalScore = () => {
    if (!selectedBetta) return 0;
    let sum = 0;
    const schema = getBettaScoringSchema(selectedBetta);
    schema.forEach((cat) => {
      const val = scores[cat.key] || 0;
      sum += val > cat.max ? cat.max : val;
    });
    return sum;
  };

  // (6) ส่งผลประเมิน + อัปเดตสถานะ
  const submitEvaluation = async () => {
    if (!selectedBetta) return;

    // ตรวจว่ากรอกครบ
    const schema = getBettaScoringSchema(selectedBetta);
    for (let cat of schema) {
      const val = scores[cat.key] || 0;
      if (val <= 0) {
        toast.error(`กรุณากรอกคะแนน (มากกว่า 0) ในหมวด "${cat.label}"`);
        return;
      } else if (val > cat.max) {
        toast.error(`คะแนนหมวด "${cat.label}" เกิน ${cat.max} ซึ่งเป็นค่าสูงสุด`);
        return;
      }
    }

    const total = calculateTotalScore();

    try {
      // 6.1) เรียก API สร้างเอกสาร Evaluation
      const body = {
        bettaId: selectedBetta.id,
        scores: scores,
        totalScore: total,
      };
      const evalResp = await axios.post("http://localhost:3000/evaluations", body);

      if (!evalResp.data.success) {
        // หากการประเมินไม่สำเร็จ ให้แจ้ง error และหยุด
        toast.error("การประเมินล้มเหลว: " + evalResp.data.message);
        return;
      }

      // 6.2) อัปเดตสถานะของปลากัด => "กำลังดำเนินการ" (ตัวอย่าง)
      // สมมติมี endpoint: PATCH http://localhost:3000/bettaReviews/updateStatus
      const updateResp = await axios.patch("http://localhost:3000/bettaReviews/updateStatus", {
        bettaId: selectedBetta.id,
        newStatus: "กำลังดำเนินการ",
      });

      if (!updateResp.data.success) {
        toast.warning("ส่งคะแนนได้ แต่เปลี่ยนสถานะไม่สำเร็จ: " + updateResp.data.message);
      } else {
        toast.success("การประเมินสำเร็จและอัปเดตสถานะเรียบร้อย!");
      }

      // 6.3) ปิด modal และอัปเดต state
      closeModal();

      setBettaData((prev) =>
        prev.map((b) =>
          b.id === selectedBetta.id
            ? { ...b, totalScore: total, status: "กำลังดำเนินการ" }
            : b
        )
      );
    } catch (err) {
      console.error("Error submitting evaluation or updating status:", err);
      toast.error("เกิดข้อผิดพลาดในการส่งผลประเมินหรืออัปเดตสถานะ");
    }
  };

  // (7) Filter + Sort
  const filteredBetta = bettaData
    .filter((b) => {
      if (!searchTerm.trim()) return true;
      const text =
        (b.betta_name || "") +
        (b.betta_kind || "") +
        (b.betta_type || "") +
        (b.ownerId || "") +
        (b.username || "");
      return text.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .filter((b) => {
      if (!bettaTypeFilter) return true;
      return b.betta_type === bettaTypeFilter;
    });

  if (sortBy === "newest") {
    filteredBetta.sort((a, b) => new Date(b.evaluationDate) - new Date(a.evaluationDate));
  } else {
    filteredBetta.sort((a, b) => new Date(a.evaluationDate) - new Date(b.evaluationDate));
  }

  // (8) Render
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="pt-20 p-6 w-full space-y-6">
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            ตรวจสอบข้อมูลปลากัด
          </h1>
        </header>

        {/* Search & Filter */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-4 gap-4">
            {/* ค้นหา */}
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
              />
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            </div>

            {/* betta_type filter */}
            <select
              value={bettaTypeFilter}
              onChange={(e) => setBettaTypeFilter(e.target.value)}
              className="w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="">ทุกประเภทปลากัด</option>
              <option value="ฮาร์ฟมูน">ฮาร์ฟมูน</option>
              <option value="คราวน์เทล">คราวน์เทล</option>
              <option value="ปลากัดยักษ์">ปลากัดยักษ์</option>
            </select>

            {/* sortBy */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="newest">ใหม่สุด</option>
              <option value="oldest">เก่าสุด</option>
            </select>

            {/* date example */}
            <input
              type="date"
              className="w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
        </section>

        {/* ตารางข้อมูลปลากัด */}
        <section className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-100">
                <th className="p-4 text-sm font-medium text-gray-700">
                  ชื่อปลากัด
                </th>
                <th className="p-4 text-sm font-medium text-gray-700">
                  วันที่ส่งมาประเมิน
                </th>
                <th className="p-4 text-sm font-medium text-gray-700">
                  สถานะ
                </th>
                <th className="p-4 text-sm font-medium text-gray-700">
                  เจ้าของ
                </th>
                <th className="p-4 text-sm font-medium text-gray-700">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBetta.map((betta, idx) => (
                <tr
                  key={betta.id}
                  className={`border-b ${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="p-4 text-gray-700">{betta.betta_name}</td>
                  <td className="p-4 text-gray-700">
                    {betta.evaluationDate
                      ? new Date(betta.evaluationDate).toLocaleString()
                      : "-"}
                  </td>
                  <td className="p-4">{renderBettaStatus(betta.status)}</td>
                  <td className="p-4 text-gray-700">
                    {betta.username || "(NoOwner)"}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => openModal(betta)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Eye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Modal ประเมิน */}
        {modalOpen && selectedBetta && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-5xl overflow-auto p-6 relative shadow-lg">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              >
                <X size={24} />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ซ้าย: ภาพ/วิดีโอ */}
                <div>
                  <h3 className="text-xl font-bold mb-4">สื่อปลากัด</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {selectedBetta.images?.length > 0 ? (
                      selectedBetta.images.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`img-${i}`}
                          className="w-full h-40 object-cover rounded shadow"
                        />
                      ))
                    ) : (
                      <p className="text-gray-500">ไม่มีรูปภาพ</p>
                    )}
                  </div>
                  {selectedBetta.video ? (
                    <video
                      controls
                      src={selectedBetta.video}
                      className="w-full rounded shadow"
                    />
                  ) : (
                    <p className="text-gray-500">ไม่มีวิดีโอ</p>
                  )}
                </div>

                {/* ขวา: ฟอร์มประเมิน + ฟิลด์ปลากัด */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">แบบประเมินปลากัด</h2>
                  <p className="mb-1">
                    <strong>ชื่อปลากัด:</strong> {selectedBetta.betta_name}
                  </p>
                  <p className="mb-1">
                    <strong>ประเภท:</strong> {selectedBetta.betta_type}
                  </p>
                  <p className="mb-1">
                    <strong>ชนิด:</strong> {selectedBetta.betta_kind}
                  </p>
                  <p className="mb-1">
                    <strong>อายุ:</strong> {selectedBetta.betta_age}
                  </p>
                  <p className="mb-1">
                    <strong>ขนาด:</strong> {selectedBetta.betta_size}
                  </p>
                  <p className="mb-1">
                    <strong>เจ้าของ (username):</strong>{" "}
                    {selectedBetta.username}
                  </p>
                  <p className="mb-4">
                    <strong>evaluationDate:</strong>{" "}
                    {selectedBetta.evaluationDate
                      ? new Date(selectedBetta.evaluationDate).toLocaleString()
                      : "-"}
                  </p>

                  {/* หมวดคะแนน (แบบกรอก input[type="number"]) */}
                  {getBettaScoringSchema(selectedBetta).map((cat) => (
                    <ScoreInput
                      key={cat.key}
                      category={cat}
                      value={scores[cat.key] || 0}
                      onChange={(val) => handleScoreChange(cat.key, val)}
                    />
                  ))}

                  <div className="mt-6 border-t pt-4">
                    <div className="flex justify-between items-center">
                      <strong>คะแนนรวม:</strong>
                      <span className="text-xl font-bold">
                        {calculateTotalScore()} / 100
                      </span>
                    </div>
                    <button
                      onClick={submitEvaluation}
                      className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                      ส่งผลการประเมิน
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Tooltip />
        <ToastContainer />
      </div>
    </div>
  );
};

// =======================================================
// Component รับคะแนน (ScoreInput) - ใช้ <input type="number" />
// =======================================================
function ScoreInput({ category, value, onChange }) {
  const handleChange = (e) => {
    onChange(e.target.value); // ส่ง value กลับไป
  };

  return (
    <div className="flex items-center space-x-4 mb-3">
      <label className="w-52 font-medium text-gray-700">
        {category.label} (สูงสุด {category.max})
      </label>
      <input
        type="number"
        min="0"
        max={category.max}
        value={value}
        onChange={handleChange}
        className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
    </div>
  );
}

export default BettaReviewPage;
