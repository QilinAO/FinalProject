// my-project/src/Pages/User/QualityEvaluationHistory.jsx (ฉบับแก้ไขสมบูรณ์ที่สุด)

import React, { useState, useEffect } from "react";
import { Loader, AlertCircle, Frown } from "lucide-react";
import PageHeader from "../../ui/PageHeader";
import { Table, THead, TH, TD, TRow } from "../../ui/Table";
import EmptyState from "../../ui/EmptyState";
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
      <PageHeader title="ประวัติการประเมินคุณภาพ" />
      <div className="bg-white rounded-lg shadow">
        <Table>
          <THead>
            <TRow>
              <TH>ชื่อปลากัด</TH>
              <TH>วันที่ส่ง</TH>
              <TH>สถานะ</TH>
              <TH>คะแนน</TH>
              <TH>รายละเอียด</TH>
            </TRow>
          </THead>
          <tbody>
            {evaluations.length === 0 ? (
              <TRow>
                <TD colSpan={5}>
                  <EmptyState icon={<Frown size={48} className="mx-auto mb-2 text-gray-400"/>} title="ยังไม่มีประวัติการประเมินคุณภาพ" subtitle="เมื่อมีการประเมินแล้ว ข้อมูลจะแสดงที่นี่" />
                </TD>
              </TRow>
            ) : (
              evaluations.map((evalItem) => (
                <TRow key={evalItem.id}>
                  <TD className="text-sm font-medium text-gray-900">{evalItem.betta_name}</TD>
                  <TD className="text-sm text-gray-500">{new Date(evalItem.evaluationDate).toLocaleDateString("th-TH")}</TD>
                  <TD><StatusBadge status={evalItem.status} /></TD>
                  <TD className="text-sm text-gray-900">{evalItem.assignees?.[0]?.total_score ? (<span className="font-bold text-green-600">{evalItem.assignees[0].total_score} คะแนน</span>) : (<span className="text-gray-400">-</span>)}</TD>
                  <TD>
                    <button onClick={() => openModal(evalItem)} className="text-purple-600 hover:text-purple-900 font-medium text-sm">ดูรายละเอียด</button>
                  </TD>
                </TRow>
              ))
            )}
          </tbody>
        </Table>
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
