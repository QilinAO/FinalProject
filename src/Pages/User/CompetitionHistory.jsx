import React, { useState, useEffect } from "react";
import { getMyCompetitionHistory } from "../../services/userService";
import { toast } from "react-toastify";
import { Frown, Eye } from "lucide-react";
import PageHeader from "../../ui/PageHeader";
import { Table, THead, TH, TD, TRow } from "../../ui/Table";
import DetailModal from "./DetailModal";

const CompetitionHistory = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

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
  const ContestStatusBadge = ({ status }) => {
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

  const formatSubmissionStatus = (status) => ({
    pending: "รอตรวจสอบ",
    approved: "ผ่านการคัดเลือก",
    evaluated: "ประกาศผล",
    rejected: "ถูกปฏิเสธ",
  }[status] || status);

  const SubmissionStatusBadge = ({ status }) => {
    const display = formatSubmissionStatus(status);

    const statusStyles = {
      pending: 'bg-amber-100 text-amber-700',
      approved: 'bg-blue-100 text-blue-700',
      evaluated: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };

    return (
      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || 'bg-gray-200 text-gray-700'}`}>
        {display}
      </span>
    );
  };

  const openDetail = (submission) => {
    if (!submission) return;
    setSelectedSubmission(submission);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedSubmission(null);
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
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {competitions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
            <Frown size={56} className="text-gray-300" />
            <div>
              <p className="text-lg font-semibold text-gray-700">ยังไม่มีประวัติการเข้าร่วมการแข่งขัน</p>
              <p className="text-sm text-gray-500">เมื่อคุณเข้าร่วมการแข่งขัน ผลจะปรากฏที่นี่</p>
            </div>
          </div>
        ) : (
          <Table>
            <THead>
              <TRow>
                <TH>ชื่อการประกวด</TH>
                <TH>ชื่อปลากัด</TH>
                <TH>วันที่ส่ง</TH>
                <TH>สถานะการแข่งขัน</TH>
                <TH>สถานะการสมัคร</TH>
                <TH>คะแนน</TH>
                <TH className="text-center">รายละเอียด</TH>
              </TRow>
            </THead>
            <tbody>
              {competitions.map((comp) => (
                <TRow key={comp.id}>
                  <TD className="font-medium text-gray-800">{comp.contest.name}</TD>
                  <TD className="text-gray-700">{comp.fish_name}</TD>
                  <TD className="text-sm text-gray-500">{new Date(comp.submitted_at).toLocaleDateString("th-TH")}</TD>
                  <TD><ContestStatusBadge status={comp.contest.status} /></TD>
                  <TD><SubmissionStatusBadge status={comp.status} /></TD>
                  <TD className="font-bold text-purple-700">{comp.final_score != null ? Number(comp.final_score).toFixed(2) : '-'}</TD>
                  <TD className="text-center">
                    <button
                      type="button"
                      onClick={() => openDetail(comp)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm text-purple-600 hover:text-purple-800"
                    >
                      <Eye size={16} /> ดูรายละเอียด
                    </button>
                  </TD>
                </TRow>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {detailOpen && selectedSubmission && (
        <DetailModal
          data={{
            ...selectedSubmission,
            betta_name: selectedSubmission.fish_name,
            fish_type: selectedSubmission.fish_type,
            images: selectedSubmission.fish_image_urls || [],
            video: selectedSubmission.fish_video_url || null,
            status: formatSubmissionStatus(selectedSubmission.status),
            submission_status: selectedSubmission.status,
            contest_status: selectedSubmission.contest?.status,
            contest_name: selectedSubmission.contest?.name,
            reject_reason: selectedSubmission.reject_reason,
            final_score: selectedSubmission.final_score,
            raw_assignments: selectedSubmission.raw_assignments || [],
          }}
          type="competition"
          onClose={closeDetail}
        />
      )}
    </div>
  );
};

export default CompetitionHistory;
