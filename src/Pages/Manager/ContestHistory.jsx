// D:\ProJectFinal\Lasts\my-project\src\Pages\Manager\ContestHistory.jsx (ฉบับขัดเกลาสมบูรณ์แบบที่สุด)

import React, { useState, useEffect, useMemo } from 'react'; // [เพิ่ม] import useMemo
import { Award, Eye, Calendar, User, XCircle, Search, LoaderCircle, Frown } from 'lucide-react'; // [เพิ่ม] import Frown
import ManagerMenu from '../../Component/ManagerMenu';
import PageHeader from "../../ui/PageHeader";
import Modal from '../../ui/Modal';
import { toast } from 'react-toastify';
import { getContestHistory } from '../../services/managerService';

const ContestHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContest, setSelectedContest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getContestHistory();
        setHistory(data || []);
      } catch (err) {
        setError("ไม่สามารถดึงประวัติการประกวดได้: " + err.message);
        toast.error("ไม่สามารถดึงประวัติการประกวดได้");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper: คำนวณคะแนนสุดท้ายจาก final_score หรือเฉลี่ย assignments
  const getNumericScore = (sub) => {
    if (!sub) return 0;
    const fs = Number(sub.final_score);
    if (Number.isFinite(fs)) return fs;
    const arr = Array.isArray(sub.assignments) ? sub.assignments : [];
    const scores = arr.map(a => Number(a.total_score)).filter(Number.isFinite);
    if (scores.length === 0) return 0;
    return Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 100) / 100;
  };

  // [ปรับปรุง] ใช้ useMemo เพื่อประสิทธิภาพ + จัดเรียง submissions โดยคะแนน
  const filteredHistory = useMemo(() => {
    const base = !searchQuery
      ? history
      : history.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return (base || []).map(item => ({
      ...item,
      submissions: (item.submissions || []).slice().sort((a, b) => getNumericScore(b) - getNumericScore(a))
    }));
  }, [history, searchQuery]);

  const handleShowDetails = (contest) => {
    setSelectedContest(contest);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedContest(null);
  }

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <ManagerMenu />
      <div className="pt-16 p-4 sm:p-8 w-full">
        <PageHeader title="ประวัติและผลการประกวด" />

        <div className="bg-white shadow-lg rounded-xl p-6">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อการประกวดในอดีต..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          {loading && (
            <div className="text-center py-10 flex flex-col items-center justify-center">
              <LoaderCircle className="animate-spin text-purple-600" size={40} />
              <p className="mt-2 text-gray-600">กำลังโหลดประวัติการประกวด...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-10 bg-red-50 text-red-700 rounded-lg"><p>{error}</p></div>
          )}

          {!loading && !error && (
            <div className="grid gap-4">
              {filteredHistory.length > 0 ? filteredHistory.map((item) => {
                const winner = item.submissions?.[0];
                return (
                  <div key={item.id} className="bg-gray-50 border rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:shadow-md transition">
                    <div className="flex items-center space-x-4">
                      <Award className={item.status === 'ประกาศผล' ? "text-yellow-500" : "text-gray-400"} size={30} />
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{item.name}</h3>
                        <div className="text-sm text-gray-500 space-y-1 mt-1">
                          <div className="flex items-center"><Calendar size={14} className="mr-2" /><span>สิ้นสุด: {formatDate(item.end_date)}</span></div>
                          {winner && item.status === 'ประกาศผล' ? (
                            <div className="flex items-center font-medium"><User size={14} className="mr-2 text-green-600" /><span>ผู้ชนะ: {winner.owner?.first_name} {winner.owner?.last_name} ({winner.fish_name})</span></div>
                          ) : (
                            <div className="flex items-center"><XCircle size={14} className="mr-2 text-red-500" /><span>สถานะ: {item.status}</span></div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleShowDetails(item)} className="mt-3 sm:mt-0 text-purple-600 hover:bg-purple-100 p-2 rounded-lg flex items-center font-semibold">
                      <Eye size={20} className="mr-2" />
                      ดูผลสรุป
                    </button>
                  </div>
                )
              }) : (
                <div className="text-center py-10 text-gray-500 flex flex-col items-center">
                  <Frown size={48} className="mb-2" />
                  <p>ไม่พบประวัติการประกวดที่ตรงกับคำค้นหาของคุณ</p>
                </div>
              )}
            </div>
          )}
        </div>

        <Modal isOpen={isModalOpen} onRequestClose={closeModal} title={selectedContest?.name} maxWidth="max-w-2xl">
          {selectedContest && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {(selectedContest.submissions || []).slice(0, 3).map((sub, index) => (
                <div key={sub.id} className="bg-gradient-to-r from-gray-100 to-white rounded-lg p-4 border-l-8 flex items-center" style={{ borderColor: ['#FFBF00', '#C0C0C0', '#CD7F32'][index] }}>
                  <div className="text-5xl font-black mr-4" style={{ color: ['#FFBF00', '#C0C0C0', '#CD7F32'][index] }}>{index + 1}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{sub.fish_name || "ไม่มีชื่อปลา"}</h3>
                    <p className="text-gray-600"><strong>ผู้เลี้ยง:</strong> {sub.owner?.first_name} {sub.owner?.last_name}</p>
                    {(() => { const s = getNumericScore(sub); return (
                      <p className="font-semibold text-purple-700">คะแนนรวม: <span className="text-xl">{Number.isFinite(s) ? s.toFixed(2) : '—'}</span></p>
                    ); })()}
                  </div>
                </div>
              ))}
              {(!selectedContest.submissions || selectedContest.submissions.length === 0) && <p className="text-center py-8 text-gray-500">ยังไม่มีข้อมูลผลการตัดสินสำหรับการประกวดนี้</p>}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ContestHistory;
