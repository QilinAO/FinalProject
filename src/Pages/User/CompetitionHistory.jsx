import React, { useState, useEffect } from "react";
import { getMyCompetitionHistory } from "../../services/userService";
import { toast } from "react-toastify";
import { Frown } from "lucide-react";

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
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white bg-opacity-90 rounded-lg shadow-md">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">ชื่อการประกวด</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">ชื่อปลากัด</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">วันที่ส่ง</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">สถานะการประกวด</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">คะแนนสุดท้าย</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {competitions.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-16 text-gray-500">
                  <Frown className="mx-auto mb-2" size={48} />
                  ยังไม่มีประวัติการเข้าร่วมการแข่งขัน
                </td>
              </tr>
            ) : (
              competitions.map((comp) => (
                <tr key={comp.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium text-gray-800">{comp.contest.name}</td>
                  <td className="py-4 px-6 text-gray-700">{comp.fish_name}</td>
                  <td className="py-4 px-6 text-sm text-gray-500">{new Date(comp.submitted_at).toLocaleDateString("th-TH")}</td>
                  <td className="py-4 px-6">
                    <StatusBadge status={comp.contest.status} />
                  </td>
                  <td className="py-4 px-6 font-bold text-lg text-purple-700">
                    {comp.final_score || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* หมายเหตุ: Modal ยังไม่ได้ถูกนำมาใช้ในเวอร์ชันนี้ แต่โค้ดถูกเตรียมไว้แล้ว */}
    </div>
  );
};

export default CompetitionHistory;