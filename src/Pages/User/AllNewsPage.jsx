import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaTag } from 'react-icons/fa';
import apiService from '../../services/api';

const AllNewsPage = () => {
  // State สำหรับเก็บข้อมูล, สถานะการโหลด, และข้อผิดพลาด
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State สำหรับการกรองและการแบ่งหน้า
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // แสดง 12 รายการต่อหน้า

  // useEffect สำหรับดึงข้อมูลข่าวสารจาก API เมื่อ Component โหลด
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        // เรียก API ที่เราสร้างไว้ โดยระบุ category=news ใน query string
        const response = await apiService.get('/public/content/all?category=news');
        setAllNews(response.data || []);
      } catch (err) {
        const errorMessage = err.message || "ไม่สามารถโหลดข้อมูลข่าวสารได้";
        setError(errorMessage);
        console.error("Error fetching news:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []); // Dependency array ว่างเปล่า หมายถึงให้ทำงานแค่ครั้งเดียวเมื่อ Component โหลด

  // ใช้ useMemo เพื่อกรองข้อมูลอย่างมีประสิทธิภาพ
  // ฟังก์ชันนี้จะทำงานใหม่ก็ต่อเมื่อ allNews หรือ searchTerm เปลี่ยนแปลง
  const filteredNews = useMemo(() => {
    return allNews.filter((news) =>
      news.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (news.short_description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allNews, searchTerm]);

  // --- Logic การแบ่งหน้า (Pagination) ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNews = filteredNews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Render Logic ---
  return (
    <main className="bg-gradient-to-r from-purple-200 via-pink-200 to-red-200 min-h-screen py-6 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-purple-700">
          ข่าวสารทั้งหมด
        </h2>

        {/* ส่วนค้นหา */}
        <div className="mb-8 w-full max-w-xl mx-auto relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาหัวข้อข่าว..."
            className="p-3 pl-12 pr-4 rounded-full w-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // กลับไปหน้า 1 เมื่อมีการค้นหาใหม่
            }}
          />
        </div>

        {/* แสดงสถานะ Loading, Error, หรือข้อมูล */}
        {loading ? (
          <div className="text-center text-gray-600 p-10">
            <p>กำลังโหลดข่าวสาร...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 p-10 bg-red-50 rounded-lg">
            <p>เกิดข้อผิดพลาด: {error}</p>
          </div>
        ) : (
          <>
            {filteredNews.length === 0 ? (
              <div className="text-center text-gray-500 p-10">
                <p>ไม่พบข่าวสารที่ตรงกับการค้นหาของคุณ</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentNews.map((news) => (
                  <article
                    key={news.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col group"
                  >
                    <Link to={`/news/${news.id}`} className="block flex-1 flex flex-col">
                      <div className="overflow-hidden h-48">
                        <img
                          src={news.poster_url}
                          alt={news.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-purple-700 transition-colors">
                          {news.name}
                        </h3>
                        <p className="line-clamp-3 text-gray-600 text-sm flex-1">
                          {news.short_description}
                        </p>
                        <div className="mt-4 flex justify-between items-center text-gray-400 text-xs">
                          <span>{new Date(news.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          <span className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            <FaTag size={10} /> {news.category}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  ก่อนหน้า
                </button>
                <span className="text-gray-700 font-semibold">
                  หน้า {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  ถัดไป
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default AllNewsPage;