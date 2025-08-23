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
      {/* พื้นหลังเต็มหน้าจอ */}
      <div
        className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-200 via-pink-200 to-red-200"
        aria-hidden="true"
      />

      <main className="relative min-h-screen w-screen overflow-x-hidden">
        {/* กันทับเมนู fixed; ปรับ pt-* ให้ตรงความสูง navbar ของคุณ */}
        <section className="w-full pt-24 sm:pt-28 lg:pt-32 pb-10 px-3 sm:px-6 lg:px-10">
          {/* หัวข้อเต็มกว้าง ไม่จัดกึ่งกลาง */}
          <div className="w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-700 mb-4 sm:mb-6">
              การประกวดที่กำลังเปิดรับสมัคร
            </h1>
          </div>

          {/* Loading / Error */}
          {loading && (
            <div className="w-full bg-white/90 backdrop-blur rounded-xl shadow p-8 text-center text-gray-600">
              กำลังโหลด...
            </div>
          )}
          {!loading && error && (
            <div className="w-full bg-red-50 rounded-xl shadow p-8 text-center text-red-600">
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
                      className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow"
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
        </section>
      </main>

      {/* Modal ส่งผลงาน */}
      {selectedContest && (
        <SubmissionFormModal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          contest={selectedContest}
        />
      )}
    </>
  );
};

export default ContestPage;
