import React, { useState, useEffect } from "react";
import { getMyCompetitionHistory } from "../../services/userService";
import { toast } from "react-toastify";
import { Frown } from "lucide-react";
import PageHeader from "../../ui/PageHeader";
import { Table, THead, TH, TD, TRow } from "../../ui/Table";
import EmptyState from "../../ui/EmptyState";

const CompetitionHistory = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect สำหรับดึงข้อมูลจาก API เมื่อ Component โหลด
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getMyCompetitionHistory();
        setCompetitions(response.data || []);
      } catch (err) {
        const errorMessage = err.message || "ไม่สามารถโหลดประวัติการแข่งขันได้";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []); // Dependency array ว่างเปล่า หมายถึงให้ทำงานแค่ครั้งเดียว

  // ฟังก์ชันสำหรับแสดง Badge ของสถานะ
  const StatusBadge = ({ status }) => {
    const statusStyles = {
      'draft': 'bg-gray-200 text-gray-800',
      'กำลังดำเนินการ': 'bg-blue-200 text-blue-800',
      'ปิดรับสมัคร': 'bg-yellow-200 text-yellow-800',
      'ตัดสิน': 'bg-indigo-200 text-indigo-800',
      'ประกาศผล': 'bg-green-200 text-green-800',
      'ยกเลิก': 'bg-red-200 text-red-800',
    };
    return (
      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || 'bg-gray-200'}`}>
        {status}
      </span>
    );
  };

  // --- Render Logic ---

  // แสดงสถานะ Loading
  if (loading) {
    return <div className="text-center p-8 text-gray-600">กำลังโหลดประวัติการแข่งขัน...</div>;
  }

  // แสดงข้อความ Error
  if (error) {
    return <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">{error}</div>;
  }

  return (
    <div>
      <PageHeader title="ประวัติการเข้าร่วมการแข่งขัน" />
      <div className="bg-white rounded-lg shadow">
        <Table>
          <THead>
            <TRow>
              <TH>ชื่อการประกวด</TH>
              <TH>ชื่อปลากัด</TH>
              <TH>วันที่ส่ง</TH>
              <TH>สถานะการประกวด</TH>
              <TH>คะแนนสุดท้าย</TH>
            </TRow>
          </THead>
          <tbody>
            {competitions.length === 0 ? (
              <TRow>
                <TD colSpan={5}>
                  <EmptyState icon={<Frown size={48} className="mx-auto mb-2 text-gray-400"/>} title="ยังไม่มีประวัติการเข้าร่วมการแข่งขัน" subtitle="เมื่อคุณเข้าร่วมการแข่งขัน ผลจะปรากฏที่นี่" />
                </TD>
              </TRow>
            ) : (
              competitions.map((comp) => (
                <TRow key={comp.id}>
                  <TD className="font-medium text-gray-800">{comp.contest.name}</TD>
                  <TD className="text-gray-700">{comp.fish_name}</TD>
                  <TD className="text-sm text-gray-500">{new Date(comp.submitted_at).toLocaleDateString("th-TH")}</TD>
                  <TD><StatusBadge status={comp.contest.status} /></TD>
                  <TD className="font-bold text-purple-700">{comp.final_score || '-'}</TD>
                </TRow>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default CompetitionHistory;
