// D:\\ProJectFinal\\Lasts\\my-project\\src\\Pages\\User\\ContestPage.jsx

// --- ส่วนที่ 1: การนำเข้า (Imports) ---
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar } from 'lucide-react';
import SubmissionFormModal from '../../Component/SubmissionFormModal';

// ใช้รูปแทนเมื่อไม่มีโปสเตอร์
const PLACEHOLDER =
  'data:image/svg+xml;utf8,\
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">\
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">\
<stop offset="0%" stop-color="#ede9fe"/><stop offset="100%" stop-color="#fee2e2"/>\
</linearGradient></defs>\
<rect width="640" height="360" fill="url(#g)"/>\
<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#9ca3af" font-family="Arial" font-size="24">No poster</text>\
</svg>';

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
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const getContestStatus = (contest) => {
    const now = new Date();
    const start = contest?.start_date ? new Date(contest.start_date) : null;
    const end = contest?.end_date ? new Date(contest.end_date) : null;
    if (start && now < start) return { label: 'กำลังจะเริ่ม', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    if (end && now > end) return { label: 'สิ้นสุดแล้ว', color: 'bg-gray-100 text-gray-600 border-gray-200' };
    if (start && end && now >= start && now <= end) return { label: 'เปิดรับสมัคร', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    return { label: 'กำลังดำเนินการ', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
  };

  // --- Main Render (JSX) ---
  return (
    <>
      <main className="page-container">
        <section className="page-hero from-indigo-600 via-purple-600 to-pink-500 bg-gradient-to-br">
          <div className="page-hero-content py-12 md:py-20 lg:py-24">
            <div className="text-center mx-auto text-white px-4 sm:px-6 lg:px-8 max-w-5xl lg:max-w-6xl 2xl:max-w-7xl">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 drop-shadow">
                🏆 การประกวดปลากัด
              </h1>
              <p className="text-lg md:text-2xl text-white/95 font-medium leading-relaxed max-w-3xl mx-auto">
                ร่วมแข่งขันการประกวดปลากัดระดับมืออาชีพ เลือกเวทีที่ใช่ และแสดงผลงานที่โดดเด่นของคุณ
              </p>
            </div>
          </div>
        </section>

        <div className="page-main">
          <section className="page-section">
            <div className="container-responsive px-4 sm:px-6 lg:px-8 max-w-6xl xl:max-w-7xl 2xl:max-w-[88rem] mx-auto">

          {/* Loading / Error */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 lg:gap-6 xl:gap-7 2xl:gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-white/70 backdrop-blur border border-gray-200 shadow-sm animate-pulse">
                  <div className="relative aspect-[16/9] bg-gray-200/70" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                    <div className="flex gap-2 pt-2">
                      <div className="h-9 bg-gray-200 rounded w-28" />
                      <div className="h-9 bg-gray-200 rounded w-28" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && error && (
            <div className="w-full betta-card bg-red-50 border border-red-200 text-center text-red-700 p-6 rounded-2xl">
              {error}
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            contests.length > 0 ? (
              <>
                {/* มือถือ: 1 คอลัมน์ / แท็บเล็ต: 2 / เดสก์ท็อป: 3 / ใหญ่มาก: 4–5 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 lg:gap-6 xl:gap-7 2xl:gap-8">
                  {contests.map((contest) => {
                    const status = getContestStatus(contest);
                    return (
                    <article
                      key={contest.id}
                      className="group rounded-2xl overflow-hidden bg-white/90 backdrop-blur border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                    >
                      {/* โปสเตอร์ */}
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img
                          src={contest.poster_url || PLACEHOLDER}
                          alt={contest.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                        />
                        <div className={`absolute left-3 top-3 px-2.5 py-1 text-xs font-semibold rounded-full border ${status.color}`}>
                          {status.label}
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 lg:p-6 flex flex-col flex-1">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 line-clamp-2">
                          {contest.name}
                        </h2>

                        <p className="text-gray-600 mb-3 sm:mb-4 lg:mb-5 flex-1 line-clamp-3">
                          {contest.short_description}
                        </p>

                        <div className="space-y-1.5 text-xs sm:text-sm lg:text-base text-gray-500 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} aria-hidden />
                            <span>
                              {formatDate(contest.start_date)} - {formatDate(contest.end_date)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-auto flex flex-col xs:flex-row gap-2 sm:gap-3">
                          <Link
                            to={`/contest/${contest.id}`}
                            className="w-full xs:w-1/2 text-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors border border-gray-200"
                          >
                            ดูรายละเอียด
                          </Link>
                          <button
                            onClick={() => handleJoinClick(contest)}
                            className="w-full xs:w-1/2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors shadow-sm"
                          >
                            เข้าร่วมประกวด
                          </button>
                        </div>
                      </div>
                    </article>
                  );})}
                </div>
              </>
            ) : (
              <div className="w-full bg-white/90 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-gray-500 max-w-4xl mx-auto">
                <div className="text-6xl mb-3">🐟</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">ยังไม่มีการประกวดที่เปิดรับสมัคร</h3>
                <p className="text-gray-500">โปรดกลับมาตรวจสอบอีกครั้ง หรือกดติดตามข่าวสารจากหน้าแรก</p>
              </div>
            )
          )}
            </div>
          </section>
        </div>
      </main>

      {/* Modal ส่งผลงาน - คงอยู่เสมอเพื่อหลีกเลี่ยงการเปิดซ้อนใน StrictMode */}
      <SubmissionFormModal
        isOpen={isModalOpen}
        onRequestClose={() => { setIsModalOpen(false); setSelectedContest(null); }}
        contest={selectedContest}
      />
    </>
  );
};

export default ContestPage;
