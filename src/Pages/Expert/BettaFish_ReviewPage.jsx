// D:\ProJectFinal\Lasts\my-project\src\Pages\Expert\BettaFish_ReviewPage.jsx (ฉบับสมบูรณ์)

// --- ส่วนที่ 1: การนำเข้า (Imports) ---
import React, { useState, useEffect, useMemo } from "react";
import { Search, Eye, X, LoaderCircle, Frown } from "lucide-react";
import Modal from 'react-modal';
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// [อัปเดต] นำเข้า apiService กลางของโปรเจกต์ และลบ axios ออก
import apiService from "../../services/api";

// --- ส่วนที่ 2: เกณฑ์การให้คะแนน (Scoring Schemas) ---
// (ส่วนนี้ไม่มีการเปลี่ยนแปลง)
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
function getBettaScoringSchema(betta) {
  if (betta.betta_type === "ฮาร์ฟมูน") return shortFinSingleTailSchema;
  if (betta.betta_type === "คราวน์เทล") return shortFinCrowntailSchema;
  return longFinSchema;
}

// --- ส่วนที่ 3: Main Component ---
const BettaReviewPage = () => {
  // --- State Management ---
  const [bettaData, setBettaData] = useState([]);
  const [loading, setLoading] = useState(true); // [เพิ่ม] State สำหรับจัดการสถานะการโหลดข้อมูล
  const [isSubmitting, setIsSubmitting] = useState(false); // [เพิ่ม] State สำหรับจัดการสถานะการส่งฟอร์ม

  // State สำหรับ Filter และ Sort
  const [searchTerm, setSearchTerm] = useState("");
  const [bettaTypeFilter, setBettaTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // State สำหรับ Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBetta, setSelectedBetta] = useState(null);
  const [scores, setScores] = useState({});

  // --- Data Fetching ---
  useEffect(() => {
    // [อัปเดต] ตั้งค่า Modal root element เพื่อ accessibility
    Modal.setAppElement('#root');
    fetchAllBettas();
  }, []);

  const fetchAllBettas = async () => {
    setLoading(true);
    try {
      // [อัปเดต] เปลี่ยนมาใช้ apiService และใช้แค่ endpoint
      const response = await apiService.get("/bettaReviews/all");
      // [อัปเดต] apiService จะคืนค่า data มาโดยตรง และป้องกันค่า null
      setBettaData(response || []);
    } catch (error) {
      toast.error("ไม่สามารถโหลดข้อมูลปลากัดได้: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Modal and Form Logic ---
  const openModal = (betta) => {
    setSelectedBetta(betta);
    const schema = getBettaScoringSchema(betta);
    const initialScores = schema.reduce((acc, cat) => {
      acc[cat.key] = 0;
      return acc;
    }, {});
    setScores(initialScores);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedBetta(null);
  };

  const handleScoreChange = (key, value) => {
    const numericVal = parseInt(value, 10);
    setScores((prev) => ({
      ...prev,
      [key]: isNaN(numericVal) ? 0 : numericVal,
    }));
  };

  const calculateTotalScore = useMemo(() => {
    if (!selectedBetta) return 0;
    const schema = getBettaScoringSchema(selectedBetta);
    return schema.reduce((sum, cat) => {
      const val = scores[cat.key] || 0;
      return sum + (val > cat.max ? cat.max : val);
    }, 0);
  }, [scores, selectedBetta]);

  const submitEvaluation = async () => {
    if (!selectedBetta) return;

    const schema = getBettaScoringSchema(selectedBetta);
    for (let cat of schema) {
      const val = scores[cat.key];
      if (val === undefined || val <= 0) {
        toast.error(`กรุณากรอกคะแนน (มากกว่า 0) ในหมวด "${cat.label}"`);
        return;
      }
      if (val > cat.max) {
        toast.error(`คะแนนหมวด "${cat.label}" เกิน ${cat.max} ซึ่งเป็นค่าสูงสุด`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const body = {
        bettaId: selectedBetta.id,
        scores: scores,
        totalScore: calculateTotalScore,
      };
      // [อัปเดต] ใช้ apiService.post
      await apiService.post("/evaluations", body);

      // [อัปเดต] ใช้ apiService.patch
      await apiService.patch("/bettaReviews/updateStatus", {
        bettaId: selectedBetta.id,
        newStatus: "กำลังดำเนินการ",
      });

      toast.success("การประเมินสำเร็จและอัปเดตสถานะเรียบร้อย!");
      closeModal();
      // อัปเดตข้อมูลใน State ทันทีเพื่อ UX ที่ดี
      setBettaData((prev) =>
        prev.map((b) =>
          b.id === selectedBetta.id
            ? { ...b, totalScore: calculateTotalScore, status: "กำลังดำเนินการ" }
            : b
        )
      );
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Filtering and Sorting ---
  // [อัปเดต] ใช้ useMemo เพื่อประสิทธิภาพ ป้องกันการคำนวณที่ไม่จำเป็น
  const filteredAndSortedBettas = useMemo(() => {
    let result = [...bettaData];

    result = result.filter((b) => {
      const matchType = !bettaTypeFilter || b.betta_type === bettaTypeFilter;
      const matchSearch = !searchTerm.trim() ||
        `${b.betta_name} ${b.betta_kind} ${b.betta_type} ${b.username}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });

    result.sort((a, b) => {
      const dateA = new Date(a.evaluationDate);
      const dateB = new Date(b.evaluationDate);
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [bettaData, searchTerm, bettaTypeFilter, sortBy]);

  // --- UI Rendering ---
  const renderBettaStatus = (status) => {
    const statusStyles = {
      "รอการประเมิน": "bg-yellow-100 text-yellow-800",
      "อนุมัติ": "bg-green-100 text-green-800",
      "ปฏิเสธ": "bg-red-100 text-red-800",
      "กำลังดำเนินการ": "bg-cyan-100 text-cyan-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || "bg-gray-100"}`}>
        {status}
      </span>
    );
  };

  // --- Main JSX ---
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="pt-20 p-4 sm:p-6 w-full space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-800">ตรวจสอบข้อมูลปลากัด</h1>
        </header>

        <section className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <input type="text" placeholder="ค้นหา..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <select value={bettaTypeFilter} onChange={(e) => setBettaTypeFilter(e.target.value)} className="w-full py-2 px-4 border rounded-lg">
              <option value="">ทุกประเภทปลากัด</option>
              <option value="ฮาร์ฟมูน">ฮาร์ฟมูน</option>
              <option value="คราวน์เทล">คราวน์เทล</option>
              <option value="ปลากัดยักษ์">ปลากัดยักษ์</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full py-2 px-4 border rounded-lg">
              <option value="newest">ใหม่สุด</option>
              <option value="oldest">เก่าสุด</option>
            </select>
            <input type="date" className="w-full py-2 px-4 border rounded-lg" />
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-10">
              <LoaderCircle className="animate-spin text-blue-500" size={40} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4 text-sm font-medium text-gray-700">ชื่อปลากัด</th>
                    <th className="p-4 text-sm font-medium text-gray-700">วันที่ส่ง</th>
                    <th className="p-4 text-sm font-medium text-gray-700">สถานะ</th>
                    <th className="p-4 text-sm font-medium text-gray-700">เจ้าของ</th>
                    <th className="p-4 text-sm font-medium text-gray-700">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedBettas.length > 0 ? (
                    filteredAndSortedBettas.map((betta) => (
                      <tr key={betta.id} className="border-t hover:bg-gray-50">
                        <td className="p-4 text-gray-800 font-medium">{betta.betta_name}</td>
                        <td className="p-4 text-gray-600">{new Date(betta.evaluationDate).toLocaleDateString('th-TH')}</td>
                        <td className="p-4">{renderBettaStatus(betta.status)}</td>
                        <td className="p-4 text-gray-600">{betta.username || "N/A"}</td>
                        <td className="p-4">
                          <button onClick={() => openModal(betta)} className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100">
                            <Eye />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-16 text-gray-500">
                        <Frown className="mx-auto mb-2" size={48} />
                        ไม่พบข้อมูลปลากัดที่ตรงกับเงื่อนไข
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <Modal isOpen={modalOpen} onRequestClose={closeModal} style={{ overlay: { zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.75)' } }} className="fixed inset-0 flex items-center justify-center p-4">
          {selectedBetta && (
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
              <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X size={24} /></button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold mb-4">สื่อและข้อมูลปลากัด</h3>
                  <div className="space-y-2 mb-4 text-sm">
                    <p><strong>ชื่อ:</strong> {selectedBetta.betta_name}</p>
                    <p><strong>ประเภท:</strong> {selectedBetta.betta_type}</p>
                    <p><strong>ชนิด:</strong> {selectedBetta.betta_kind}</p>
                    <p><strong>อายุ:</strong> {selectedBetta.betta_age}</p>
                    <p><strong>เจ้าของ:</strong> {selectedBetta.username}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {selectedBetta.images?.map((url, i) => <img key={i} src={url} alt={`img-${i}`} className="w-full h-40 object-cover rounded shadow" />)}
                  </div>
                  {selectedBetta.video && <video controls src={selectedBetta.video} className="w-full rounded shadow" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">แบบประเมิน</h2>
                  <div className="space-y-3">
                    {getBettaScoringSchema(selectedBetta).map((cat) => (
                      <ScoreInput key={cat.key} category={cat} value={scores[cat.key] || 0} onChange={(val) => handleScoreChange(cat.key, val)} />
                    ))}
                  </div>
                  <div className="mt-6 border-t pt-4">
                    <div className="flex justify-between items-center">
                      <strong className="text-lg">คะแนนรวม:</strong>
                      <span className="text-2xl font-bold text-blue-600">{calculateTotalScore} / 100</span>
                    </div>
                    <button onClick={submitEvaluation} disabled={isSubmitting} className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:bg-blue-300">
                      {isSubmitting && <LoaderCircle className="animate-spin mr-2" />}
                      {isSubmitting ? "กำลังส่งผล..." : "ส่งผลการประเมิน"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>

        <Tooltip />
        <ToastContainer position="bottom-right" autoClose={4000} />
      </div>
    </div>
  );
};

// --- ส่วนที่ 4: Sub-component ---
function ScoreInput({ category, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="font-medium text-gray-700 text-sm">{category.label} (สูงสุด {category.max})</label>
      <input type="number" min="0" max={category.max} value={value} onChange={(e) => onChange(e.target.value)} className="w-24 px-2 py-1 border rounded text-center" />
    </div>
  );
}

export default BettaReviewPage;