// D:\ProJectFinal\Lasts\my-project\src\Pages\Manager\LiveContestRoom.jsx (ฉบับสมบูรณ์)

import React, { useState, useEffect, useMemo } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { Check, X, Eye, LoaderCircle, XCircle, PlayCircle, Lock, Trophy, AlertTriangle, ArrowLeft, Users, CheckSquare, Clock } from 'lucide-react';

import ManagerMenu from '../../Component/ManagerMenu';
import { getMyContests, getContestSubmissions, updateSubmissionStatus, updateMyContest, finalizeContest } from '../../services/managerService';
import { getBettaTypeLabel } from '../../utils/bettaTypes';

const StatCard = ({ icon, label, value, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`w-full bg-white p-4 rounded-lg shadow text-left transition-all duration-200 ${isActive ? 'ring-2 ring-purple-500 shadow-lg' : 'hover:shadow-md'}`}
  >
    <div className="flex items-center">
      <div className="p-3 rounded-full bg-gray-100 text-gray-600">{icon}</div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
    </div>
  </button>
);

const LiveContestRoom = () => {
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [finalizeModalOpen, setFinalizeModalOpen] = useState(false);
  const [submissionInModal, setSubmissionInModal] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');

  useEffect(() => {
    Modal.setAppElement('#root');
    fetchContests();
  }, []);

  const fetchContests = async () => {
    setLoading(true);
    try {
      const data = await getMyContests();
      const activeContests = data.filter(c => c.category === 'การประกวด' && !['ประกาศผล', 'ยกเลิก'].includes(c.status));
      setContests(activeContests);
    } catch (error) {
      toast.error("ไม่สามารถดึงรายการประกวดได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (contestId) => {
    setIsProcessing(true);
    try {
      const data = await getContestSubmissions(contestId);
      setSubmissions(data || []);
    } catch (error) {
      toast.error("ไม่สามารถดึงรายชื่อผู้สมัครได้");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectContest = (contest) => {
    setSelectedContest(contest);
    fetchSubmissions(contest.id);
  };

  const handleBackToList = () => {
    setSelectedContest(null);
    setSubmissions([]);
    setSelectedSubmissions([]);
    setFilterStatus('pending');
  };

  const handleSelectSubmission = (submissionId) => {
    setSelectedSubmissions(prev =>
      prev.includes(submissionId) ?
      prev.filter(id => id !== submissionId) :
      [...prev, submissionId]
    );
  };

  const handleSelectAll = (submissionIds) => {
    if (selectedSubmissions.length === submissionIds.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(submissionIds);
    }
  };

  const handleBulkAction = async (newStatus) => {
    if (selectedSubmissions.length === 0) return toast.info("กรุณาเลือกผู้สมัครก่อน");
    setIsProcessing(true);
    try {
      const promises = selectedSubmissions.map(id => updateSubmissionStatus(id, newStatus));
      await Promise.all(promises);
      toast.success(`อัปเดตสถานะ ${selectedSubmissions.length} รายการสำเร็จ!`);
      setSelectedSubmissions([]);
      await fetchSubmissions(selectedContest.id);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContestStatusChange = async (newStatus) => {
    if (!selectedContest || !window.confirm(`คุณต้องการเปลี่ยนสถานะการประกวดเป็น "${newStatus}" ใช่หรือไม่?`)) return;
    setIsProcessing(true);
    try {
      const response = await updateMyContest(selectedContest.id, { status: newStatus });
      setSelectedContest(response);
      toast.success(`เปลี่ยนสถานะเป็น "${newStatus}" สำเร็จ!`);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmFinalize = async () => {
    setFinalizeModalOpen(false);
    setIsProcessing(true);
    try {
      await finalizeContest(selectedContest.id);
      toast.success("ประกาศผลสำเร็จ!");
      await fetchContests();
      handleBackToList();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const ContestCard = ({ contest }) => (
    <div onClick={() => handleSelectContest(contest)} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
      <h3 className="font-bold text-xl text-gray-800 truncate">{contest.name}</h3>
      <p className={`mt-2 text-sm font-semibold px-2 py-1 inline-block rounded-full ${
          {'กำลังดำเนินการ': 'bg-blue-100 text-blue-800', 'ปิดรับสมัคร': 'bg-yellow-100 text-yellow-800', 'ตัดสิน': 'bg-purple-100 text-purple-800'}[contest.status]
      }`}>{contest.status}</p>
      <div className="mt-4 text-gray-500 text-sm flex justify-between">
        <span><Users size={14} className="inline mr-1"/> {contest.submissions?.length || 0} ผู้สมัคร</span>
        <span><Users size={14} className="inline mr-1"/> {contest.contest_judges?.length || 0} กรรมการ</span>
      </div>
    </div>
  );

  const ContestDashboard = () => {
    const stats = useMemo(() => ({
      total: submissions.length,
      pending: submissions.filter(s => s.status === 'pending').length,
      approved: submissions.filter(s => s.status === 'approved').length,
      rejected: submissions.filter(s => s.status === 'rejected').length,
    }), [submissions]);

    const filteredSubmissions = useMemo(() => {
      if (filterStatus === 'all') return submissions;
      return submissions.filter(s => s.status === filterStatus);
    }, [submissions, filterStatus]);

    const getStatusBadge = (status) => {
      const styles = { approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800', pending: 'bg-yellow-100 text-yellow-800' };
      return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
    };

    return (
      <div>
        <button onClick={handleBackToList} className="flex items-center gap-2 text-gray-600 hover:text-black mb-4">
          <ArrowLeft size={18}/> กลับไปหน้ารายการ
        </button>
        <h2 className="text-3xl font-bold text-gray-800">{selectedContest.name}</h2>
        
        <div className="my-6 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
          <div>
            <p className="text-gray-600">สถานะปัจจุบัน:</p>
            <p className="font-bold text-xl text-purple-700">{selectedContest.status}</p>
          </div>
          <div className="flex items-center space-x-2">
            {isProcessing ? <LoaderCircle className="animate-spin"/> : (
              <>
                {selectedContest.status === 'กำลังดำเนินการ' && <button onClick={() => handleContestStatusChange('ปิดรับสมัคร')} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center"><Lock className="mr-2" size={18}/> ปิดรับสมัคร</button>}
                {selectedContest.status === 'ปิดรับสมัคร' && <button onClick={() => handleContestStatusChange('ตัดสิน')} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"><PlayCircle className="mr-2" size={18}/> เริ่มการตัดสิน</button>}
                {selectedContest.status === 'ตัดสิน' && <button onClick={() => setFinalizeModalOpen(true)} className="bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center"><Trophy className="mr-2" size={18}/> คำนวณและประกาศผล</button>}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<Users/>} label="ผู้สมัครทั้งหมด" value={stats.total} onClick={() => setFilterStatus('all')} isActive={filterStatus === 'all'} />
          <StatCard icon={<Clock/>} label="รออนุมัติ" value={stats.pending} onClick={() => setFilterStatus('pending')} isActive={filterStatus === 'pending'} />
          <StatCard icon={<CheckSquare/>} label="อนุมัติแล้ว" value={stats.approved} onClick={() => setFilterStatus('approved')} isActive={filterStatus === 'approved'} />
          <StatCard icon={<XCircle/>} label="ปฏิเสธ" value={stats.rejected} onClick={() => setFilterStatus('rejected')} isActive={filterStatus === 'rejected'} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">รายชื่อผู้สมัคร (สถานะ: {{all: 'ทั้งหมด', pending: 'รออนุมัติ', approved: 'อนุมัติแล้ว', rejected: 'ปฏิเสธ'}[filterStatus]})</h3>
          {filterStatus === 'pending' && stats.pending > 0 && (
            <div className="mb-4 flex gap-2">
              <button onClick={() => handleBulkAction('approved')} className="px-3 py-1 bg-green-500 text-white rounded text-sm">อนุมัติที่เลือก</button>
              <button onClick={() => handleBulkAction('rejected')} className="px-3 py-1 bg-red-500 text-white rounded text-sm">ปฏิเสธที่เลือก</button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {filterStatus === 'pending' && <th className="p-2 text-left w-10"><input type="checkbox" onChange={() => handleSelectAll(submissions.filter(s => s.status === 'pending').map(s => s.id))} checked={selectedSubmissions.length === stats.pending && stats.pending > 0}/></th>}
                  <th className="p-2 text-left">ชื่อปลากัด</th>
                  <th className="p-2 text-left">เจ้าของ</th>
                  <th className="p-2 text-left">สถานะ</th>
                  <th className="p-2 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map(sub => (
                  <tr key={sub.id} className="border-b hover:bg-gray-50">
                    {filterStatus === 'pending' && <td className="p-2"><input type="checkbox" checked={selectedSubmissions.includes(sub.id)} onChange={() => handleSelectSubmission(sub.id)}/></td>}
                    <td className="p-2 font-semibold">{sub.fish_name}</td>
                    <td className="p-2 text-gray-600">{sub.owner.first_name}</td>
                    <td className="p-2">{getStatusBadge(sub.status)}</td>
                    <td className="p-2 text-center">
                      <button onClick={() => { setSubmissionInModal(sub); setDetailModalOpen(true); }} className="p-1 text-blue-600"><Eye size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSubmissions.length === 0 && <p className="text-center text-gray-500 py-6">ไม่พบผู้สมัครในสถานะนี้</p>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <ManagerMenu />
      <div className="pt-16 p-4 sm:p-8 w-full">
        {selectedContest ? <ContestDashboard /> : (
          <>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">ห้องจัดการแข่งขัน</h1>
            {loading ? (
              <div className="flex justify-center p-10"><LoaderCircle className="animate-spin text-purple-500" size={32}/></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contests.map(c => <ContestCard key={c.id} contest={c} />)}
              </div>
            )}
          </>
        )}
      </div>
      
      <Modal isOpen={detailModalOpen} onRequestClose={() => setDetailModalOpen(false)} style={{ overlay: { zIndex: 1050 } }} className="fixed inset-0 flex items-center justify-center p-4">
        {submissionInModal && (
          <div className="bg-white rounded-lg p-6 max-w-lg w-full relative">
            <button onClick={() => setDetailModalOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
              <XCircle />
            </button>
            <h2 className="text-2xl font-bold mb-4">{submissionInModal.fish_name}</h2>
            <div className="space-y-4 mb-4">
              <div>
                <h3 className="font-semibold">รูปภาพ:</h3>
                <div className="flex flex-wrap gap-2 bg-gray-100 p-2 rounded-lg">
                  {submissionInModal.fish_image_urls?.map((url, index) => <img key={index} src={url} alt={`Fish ${index+1}`} className="w-28 h-28 object-cover rounded-md"/>)}
                </div>
              </div>
              {submissionInModal.fish_video_url && (
                <div>
                  <h3 className="font-semibold">วิดีโอ:</h3>
                  <video src={submissionInModal.fish_video_url} controls className="w-full rounded-lg bg-black"/>
                </div>
              )}
            </div>
            <div className="space-y-2 text-gray-700">
               <p><strong>เจ้าของ:</strong> {submissionInModal.owner?.first_name}</p>
               <p><strong>ประเภท:</strong> {getBettaTypeLabel(submissionInModal.fish_type)}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={finalizeModalOpen} onRequestClose={() => setFinalizeModalOpen(false)} style={{ overlay: { zIndex: 1051 } }} className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-auto text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500" />
          <h2 className="text-xl font-bold mt-4">ยืนยันการประกาศผล</h2>
          <p className="text-gray-600 mt-2">คุณแน่ใจหรือไม่ว่าต้องการประกาศผลการประกวด "{selectedContest?.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
          <div className="mt-6 flex justify-center gap-4">
            <button onClick={() => setFinalizeModalOpen(false)} className="px-6 py-2 bg-gray-200 rounded-lg">ยกเลิก</button>
            <button onClick={confirmFinalize} className="px-6 py-2 bg-green-600 text-white rounded-lg">ยืนยัน</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LiveContestRoom;