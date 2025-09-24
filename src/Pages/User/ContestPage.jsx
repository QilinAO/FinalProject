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
        <section className="page-hero">
          <div className="page-hero-content ">
            <div className="text-center max-w-5xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold mb-8">
                🏆 การประกวดปลากัด
              </h1>
              <p className="text-2xl md:text-3xl text-white/95 font-medium leading-relaxed">
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
                  {contests.map((contest, index) => {
                    const status = getContestStatus(contest);
                    return (
                      <article
                        key={contest.id}
                        className="group relative bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-300 hover:-translate-y-1 border border-neutral-200/60 animate-stagger-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <Link to={`/contest/${contest.id}`} className="flex flex-col h-full">
                          <div className="relative overflow-hidden h-48 bg-gradient-to-br from-primary-100 to-secondary-100">
                            <img
                              src={contest.poster_url || PLACEHOLDER}
                              alt={contest.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                              decoding="async"
                              onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className={`absolute left-4 top-4 px-3 py-1.5 text-xs font-semibold rounded-full backdrop-blur-sm bg-white/95 border ${status.color}`}>
                              {status.label}
                            </div>
                          </div>

                          <div className="p-6 flex flex-col flex-1">
                            <h3 className="text-lg font-bold text-heading mb-3 group-hover:text-primary-700 transition-colors duration-300 line-clamp-2">
                              {contest.name}
                            </h3>

                            {contest.short_description && (
                              <p className="text-body text-sm leading-relaxed line-clamp-3 mb-4 flex-1 text-gray-600">
                                {contest.short_description}
                              </p>
                            )}

                            <div className="mt-auto flex items-center justify-between text-xs text-muted">
                              <time className="flex items-center gap-1">
                                📅 {formatDate(contest.start_date)} - {formatDate(contest.end_date)}
                              </time>
                              <span className="text-primary-500 font-medium group-hover:text-primary-700 transition-colors">
                                ดูรายละเอียด →
                              </span>
                            </div>
                          </div>
                        </Link>
                      </article>
                    );
                  })}
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
