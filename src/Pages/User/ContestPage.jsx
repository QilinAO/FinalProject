// D:\ProJectFinal\Lasts\my-project\src\Pages\User\ContestPage.jsx (ฉบับสมบูรณ์)

// --- ส่วนที่ 1: การนำเข้า (Imports) ---

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar } from 'lucide-react';
// [อัปเดต] Import Component กลางสำหรับฟอร์มที่เราสร้างขึ้นใหม่
import SubmissionFormModal from '../../Component/SubmissionFormModal';


// --- ส่วนที่ 2: Component หลักของหน้า ---

const ContestPage = () => {
  // --- State Management ---
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContest, setSelectedContest] = useState(null);

  // --- Hooks ---
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // --- Effects ---
  useEffect(() => {
    const fetchContests = async () => {
      setLoading(true);
      try {
        const response = await apiService.get('/public/content/all?category=contest');
        setContests(response.data || []);
      } catch (err) {
        setError('ไม่สามารถโหลดข้อมูลการประกวดได้');
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  // --- Event Handlers ---
  const handleJoinClick = (contest) => {
    if (isAuthenticated) {
      setSelectedContest(contest);
      setIsModalOpen(true);
    } else {
      navigate('/login', { state: { from: '/contest' } });
    }
  };

  // --- Helper Functions ---
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // --- Main Render (JSX) ---
  return (
    <main className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">การประกวดที่กำลังเปิดรับสมัคร</h1>

        {loading && <p className="text-center">กำลังโหลด...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          contests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {contests.map((contest) => (
                <div key={contest.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
                  <img src={contest.poster_url} alt={contest.name} className="w-full h-56 object-cover" />
                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">{contest.name}</h2>
                    <p className="text-gray-600 mb-4 flex-grow line-clamp-3">{contest.short_description}</p>
                    <div className="space-y-2 text-sm text-gray-500 mb-6">
                      <div className="flex items-center gap-2"><Calendar size={16} /><span>{formatDate(contest.start_date)} - {formatDate(contest.end_date)}</span></div>
                    </div>
                    <div className="mt-auto flex flex-col sm:flex-row gap-3">
                      <Link to={`/contest/${contest.id}`} className="flex-1 text-center px-4 py-2 bg-gray-200 rounded-lg font-semibold">ดูรายละเอียด</Link>
                      <button onClick={() => handleJoinClick(contest)} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold">เข้าร่วมประกวด</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">ไม่พบการประกวดที่กำลังเปิดรับสมัครในขณะนี้</p>
          )
        )}
      </div>
      
      {/* 
        ส่วนนี้จะยังคงทำงานได้ถูกต้องเหมือนเดิมทุกประการ
        เพราะเราแค่ย้ายโค้ดของ SubmissionFormModal ไปไว้ที่ไฟล์อื่น
        แต่การเรียกใช้งานและ props ที่ส่งไปนั้นเหมือนเดิมทั้งหมด
      */}
      {selectedContest && (
        <SubmissionFormModal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          contest={selectedContest}
        />
      )}
    </main>
  );
};

export default ContestPage;