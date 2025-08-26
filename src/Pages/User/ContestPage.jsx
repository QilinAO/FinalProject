// D:\ProJectFinal\Lasts\my-project\src\Pages\User\ContestPage.jsx

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

  // --- Main Render (JSX) ---
  return (
    <>
      <main className="page-container">
        <section className="page-hero">
          <div className="page-hero-content">
            <div className="text-center max-w-5xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold mb-8">
                🏆 การประกวดปลากัด
              </h1>
              <p className="text-2xl md:text-3xl text-white/95 font-medium leading-relaxed">
                ร่วมแข่งขันการประกวดปลากัดระดับมืออาชีพ
              </p>
            </div>
          </div>
        </section>

        <div className="page-main">
          <section className="page-section">
            <div className="container-responsive">

          {/* Loading / Error */}
          {loading && (
            <div className="w-full betta-card backdrop-blur text-center text-muted">
              กำลังโหลด...
            </div>
          )}
          {!loading && error && (
            <div className="w-full betta-card bg-error-50 text-center text-error-600">
              {error}
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            contests.length > 0 ? (
              <>
                {/* มือถือ: 1 คอลัมน์ / แท็บเล็ต: 2 / เดสก์ท็อป: 3 / ใหญ่มาก: 4–5 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                  {contests.map((contest) => (
                    <article
                      key={contest.id}
                      className="betta-card-interactive overflow-hidden flex flex-col"
                    >
                      {/* โปสเตอร์: สูงแปรผันตามจอ, ปรับให้ครอบดี */}
                      <div className="h-44 sm:h-52 md:h-56 xl:h-60 overflow-hidden">
                        <img
                          src={contest.poster_url || PLACEHOLDER}
                          alt={contest.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                        />
                      </div>

                      <div className="p-4 sm:p-5 flex flex-col flex-1">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                          {contest.name}
                        </h2>

                        <p className="text-gray-600 mb-3 sm:mb-4 flex-1 line-clamp-3">
                          {contest.short_description}
                        </p>

                        <div className="space-y-1.5 text-xs sm:text-sm text-gray-500 mb-4">
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
                            className="w-full xs:w-1/2 text-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
                          >
                            ดูรายละเอียด
                          </Link>
                          <button
                            onClick={() => handleJoinClick(contest)}
                            className="w-full xs:w-1/2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                          >
                            เข้าร่วมประกวด
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full bg-white/90 backdrop-blur rounded-xl shadow p-12 text-center text-gray-500">
                ไม่พบการประกวดที่กำลังเปิดรับสมัครในขณะนี้
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
