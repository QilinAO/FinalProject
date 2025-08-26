// D:\ProJectFinal\Lasts\my-project\src\Pages\User\SingleNewsPage.jsx (ฉบับสมบูรณ์)

// --- ส่วนที่ 1: การนำเข้า (Imports) ---

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiService from "../../services/api";
import { useAuth } from "../../context/AuthContext";
// [อัปเดต] นำเข้า Component กลางสำหรับฟอร์มที่เราสร้างขึ้น
import SubmissionFormModal from "../../Component/SubmissionFormModal";


// --- ส่วนที่ 2: Main Component ---

const SingleNewsPage = () => {
  // --- State Management ---
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // [อัปเดต] State ใหม่สำหรับควบคุมการเปิด/ปิด Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Hooks ---
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // --- Effects ---
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.get(`/public/content/${id}`);
        setContent(response.data);
      } catch (err) {
        const errorMessage = err.message || "ไม่พบข้อมูลที่คุณค้นหา";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchContent();
    }
  }, [id]);

  // --- Event Handlers ---

  // [อัปเดต] เปลี่ยน Logic ของฟังก์ชันนี้ใหม่ทั้งหมด
  const handleJoinContestClick = () => {
    if (isAuthenticated) {
      // ถ้าผู้ใช้ Login แล้ว ให้เปิด Modal ขึ้นมา
      setIsModalOpen(true);
    } else {
      // ถ้ายังไม่ Login ให้พาไปหน้า Login ก่อน และจำหน้าที่กำลังจะเข้าไว้
      navigate('/login', { state: { from: `/contest/${id}` } });
    }
  };

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">เกิดข้อผิดพลาด</h2>
        <p className="text-gray-700 mb-6">{error || "ไม่พบข้อมูลที่คุณค้นหา"}</p>
        <Link to="/news" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          ← กลับไปหน้าข่าวสารทั้งหมด
        </Link>
      </div>
    );
  }

  const isContest = content.category === 'การประกวด';
  const backLink = isContest ? '/contest' : '/news';
  const backLinkText = isContest ? 'กลับไปหน้ารายการประกวด' : 'กลับไปหน้าข่าวสารทั้งหมด';

  return (
    // ใช้ Fragment (<>) เพื่อให้สามารถ Render Modal นอก <main> ได้
    <>
      <main className="bg-gray-50 min-h-screen py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <img
              src={content.poster_url}
              alt={content.name}
              className="w-full h-auto max-h-[500px] object-contain bg-gray-100"
            />
            <div className="p-6 sm:p-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
                {content.name}
              </h1>
              <div className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>
                  <strong>เผยแพร่เมื่อ:</strong> {new Date(content.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="hidden sm:inline">|</span>
                <span>
                  <strong>ประเภท:</strong> <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">{content.category}</span>
                </span>
              </div>
              
              <div className="prose max-w-none text-gray-700">
                <p className="text-lg font-semibold">{content.short_description}</p>
                <p>{content.full_description}</p>
              </div>

              {isContest && (
                <div className="mt-8 pt-6 border-t">
                  <button
                    onClick={handleJoinContestClick} // ปุ่มนี้จะเรียกใช้ฟังก์ชันที่เปิด Modal
                    className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 shadow-lg"
                  >
                    เข้าร่วมการประกวดนี้
                  </button>
                </div>
              )}

              <div className="mt-8 pt-4 border-t">
                <Link to={backLink} className="text-purple-600 hover:underline">
                  ← {backLinkText}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal คงอยู่เสมอเพื่อหลีกเลี่ยงการเปิดซ้อน */}
      <SubmissionFormModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contest={content}
      />
    </>
  );
};

export default SingleNewsPage;