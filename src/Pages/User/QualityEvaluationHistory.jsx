// my-project/src/Pages/User/QualityEvaluationHistory.jsx (ฉบับแก้ไขสมบูรณ์ที่สุด)

import React, { useState, useEffect } from "react";
import { Loader, AlertCircle, Frown } from "lucide-react";
import { getMyEvaluationHistory } from "../../services/userService"; 
import DetailModal from "./DetailModal"; 

const QualityEvaluationHistory = () => {
  // [แก้ไข] ให้ค่าเริ่มต้นเป็น null เพื่อให้แยกแยะระหว่าง "กำลังโหลด" กับ "ไม่มีข้อมูล" ได้อย่างชัดเจน
  const [evaluations, setEvaluations] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  useEffect(() => {
    const fetchEvaluations = () => {
      setLoading(true);
      setError(null);
      
      // [แก้ไข] เรียกใช้ service แล้วจัดการด้วย .then() และ .catch()
      // ซึ่งเป็นวิธีจัดการ Promise ที่ปลอดภัยและชัดเจน
      getMyEvaluationHistory()
        .then(response => {
          // API ของเราส่งข้อมูลกลับมาใน key 'data'
          // ถ้าไม่มี data หรือ data ไม่ใช่ Array ให้ใช้ Array ว่างแทน
          setEvaluations(Array.isArray(response.data) ? response.data : []);
        })
        .catch(err => {
          setError(err.message || "ไม่สามารถโหลดข้อมูลได้ กรุณาลองอีกครั้ง");
          console.error("Error fetching evaluations:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    fetchEvaluations();
  }, []); // ทำงานครั้งเดียวเมื่อ Component โหลด

  const openModal = (evaluation) => setSelectedEvaluation(evaluation);
  const closeModal = () => setSelectedEvaluation(null);

  // Component ย่อยสำหรับแสดง Badge ของสถานะ
  const StatusBadge = ({ status }) => {
    const statusStyles = {
      'รอการตรวจสอบ': 'bg-gray-200 text-gray-800',
      'รอการมอบหมาย': 'bg-gray-200 text-gray-800',
      'รอผู้เชี่ยวชาญตอบรับ': 'bg-yellow-200 text-yellow-800',
      'กำลังประเมิน': 'bg-blue-200 text-blue-800',
      'ประเมินเสร็จสิ้น': 'bg-green-200 text-green-800',
      'ถูกปฏิเสธ': 'bg-red-200 text-red-800',
    };
    return (
      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || 'bg-gray-200'}`}>
        {status}
      </span>
    );
  };

  // --- ส่วนการแสดงผล (Render) ---

  // [ปรับปรุง] แสดงหน้า Loading ก่อนเป็นอันดับแรก
  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader className="animate-spin text-purple-600" size={40} />
      </div>
    );
  }

  // ถ้ามี Error ให้แสดงกล่องข้อความ Error
  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
        <p className="font-bold flex items-center"><AlertCircle className="mr-2" />เกิดข้อผิดพลาด</p>
        <p>{error}</p>
      </div>
    );
  }

  // [ปรับปรุง] เพิ่มการตรวจสอบ evaluations ก่อนใช้งาน เพื่อความปลอดภัยสูงสุด
  if (!evaluations) {
    return <p className="text-center text-gray-500">ไม่สามารถแสดงข้อมูลได้</p>;
  }

  return (
    <div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อปลากัด</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่ส่ง</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คะแนน</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รายละเอียด</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {evaluations.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500">
                  <Frown className="mx-auto mb-2" size={48} />
                  ยังไม่มีประวัติการประเมินคุณภาพ
                </td>
              </tr>
            ) : (
              evaluations.map((evalItem) => (
                <tr key={evalItem.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">{evalItem.betta_name}</td>
                  <td className="py-4 px-6 text-sm text-gray-500">{new Date(evalItem.evaluationDate).toLocaleDateString("th-TH")}</td>
                  <td className="py-4 px-6"><StatusBadge status={evalItem.status} /></td>
                  <td className="py-4 px-6 text-sm text-gray-900">
                    {evalItem.assignees?.[0]?.total_score ? (
                      <span className="font-bold text-green-600">{evalItem.assignees[0].total_score} คะแนน</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => openModal(evalItem)}
                      className="text-purple-600 hover:text-purple-900 font-medium text-sm"
                    >
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedEvaluation && (
        <DetailModal
          data={selectedEvaluation}
          onClose={closeModal}
          type="quality"
        />
      )}
    </div>
  );
};

export default QualityEvaluationHistory;