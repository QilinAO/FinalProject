import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaTag } from 'react-icons/fa';
import apiService from '../../services/api';

// --- คำนวณจำนวนรายการต่อหน้าแบบ responsive ---
// <640px = 8, 640–1023px = 12, >=1024px = 18
function computeItemsPerPage(width) {
  if (width < 640) return 8;       // mobile
  if (width < 1024) return 12;     // tablet
  return 18;                       // desktop+
}

// (optional) mini tests: ช่วยเช็คใน dev console ว่า mapping ถูกต้อง
(function test_computeItemsPerPage() {
  const cases = [
    { w: 375, expect: 8 },
    { w: 639, expect: 8 },
    { w: 640, expect: 12 },
    { w: 900, expect: 12 },
    { w: 1023, expect: 12 },
    { w: 1024, expect: 18 },
    { w: 1440, expect: 18 },
  ];
  cases.forEach(({ w, expect }) => {
    const got = computeItemsPerPage(w);
    // ไม่ทำให้แอปร่วง แค่เตือนใน console เวลา dev
    // eslint-disable-next-line no-console
    console.assert(got === expect, `computeItemsPerPage(${w}) expected ${expect} but got ${got}`);
  });
})();

const AllNewsPage = () => {
  // State สำหรับเก็บข้อมูล, สถานะการโหลด, และข้อผิดพลาด
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State สำหรับการกรองและการแบ่งหน้า
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  // หมวดหมู่ที่เลือกสำหรับกรอง (ว่าง = แสดงทั้งหมด)
  const [selectedCategories, setSelectedCategories] = useState([]);

  // เปลี่ยนจาก const เป็น state และคำนวณจากขนาดจอ
  const [itemsPerPage, setItemsPerPage] = useState(() =>
    typeof window !== 'undefined' ? computeItemsPerPage(window.innerWidth) : 18
  );

  // อัปเดต itemsPerPage เมื่อมีการปรับขนาดหน้าจอ
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let rAF = null;
    const onResize = () => {
      if (rAF) cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(() => {
        setItemsPerPage(prev => {
          const next = computeItemsPerPage(window.innerWidth);
          return prev === next ? prev : next;
        });
      });
    };
    window.addEventListener('resize', onResize, { passive: true });
    onResize(); // sync ครั้งแรก
    return () => {
      if (rAF) cancelAnimationFrame(rAF);
      window.removeEventListener('resize', onResize);
    };
  }, []);

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
  }, []); // ทำงานครั้งเดียวเมื่อ Component โหลด

  // สร้างชุดหมวดหมู่จากข้อมูลที่โหลดได้
  const categories = useMemo(() => {
    const set = new Set(allNews.map(n => n.category).filter(Boolean));
    return Array.from(set);
  }, [allNews]);

  // ใช้ useMemo เพื่อกรองข้อมูลอย่างมีประสิทธิภาพ
  const filteredNews = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return allNews
      .filter(n => {
        // กรองตามคำค้นหา
        const t = (n.name || '').toLowerCase();
        const d = (n.short_description || '').toLowerCase();
        const okSearch = !term || t.includes(term) || d.includes(term);
        if (!okSearch) return false;
        // กรองตามหมวดหมู่ที่เลือก
        if (selectedCategories.length === 0) return true;
        return selectedCategories.includes(n.category);
      });
  }, [allNews, searchTerm, selectedCategories]);

  // ถ้า itemsPerPage หรือจำนวนข้อมูลเปลี่ยน ให้ clamp หน้าปัจจุบันให้อยู่ในช่วงที่ถูกต้อง
  useEffect(() => {
    const total = Math.max(1, Math.ceil(filteredNews.length / itemsPerPage));
    if (currentPage > total) setCurrentPage(total);
    if (currentPage < 1) setCurrentPage(1);
  }, [itemsPerPage, filteredNews.length, currentPage]);

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
    <main className="page-container">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              📰 ข่าวสารและกิจกรรม
            </h1>
            <p className="text-2xl md:text-3xl text-white/95 font-medium leading-relaxed">
              ติดตามข่าวสารล่าสุดและกิจกรรมน่าสนใจจากโลกปลากัด
            </p>
          </div>
        </div>
      </section>

      <div className="page-main">
        <section className="page-section">
          <div className="container-responsive">

        {/* ส่วนค้นหา */}
        <div className="mb-12 w-full max-w-2xl mx-auto">
          <div className="relative">
            <FaSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-primary-500 z-10" size={20} />
            <input
              type="text"
              placeholder="🔍 ค้นหาข่าวสารที่สนใจ..."
              className="w-full pl-16 pr-6 py-4 text-lg border-2 border-primary-200 rounded-2xl bg-white/80 backdrop-blur-sm shadow-soft focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white transition-all duration-300 placeholder-primary-400"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // กลับไปหน้า 1 เมื่อมีการค้นหาใหม่
              }}
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ส่วนกรองหมวดหมู่ */}
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-2 justify-center">
            <button
              className={`px-4 py-2 rounded-full border text-sm ${selectedCategories.length===0 ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-400'}`}
              onClick={() => { setSelectedCategories([]); setCurrentPage(1); }}
            >ทั้งหมด</button>
            {categories.map(cat => {
              const active = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  className={`px-4 py-2 rounded-full border text-sm flex items-center gap-2 ${active ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-400'}`}
                  onClick={() => {
                    setSelectedCategories(prev => active ? prev.filter(c => c!==cat) : [...prev, cat]);
                    setCurrentPage(1);
                  }}
                >
                  <FaTag size={10}/> {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* แสดงสถานะ Loading, Error, หรือข้อมูล */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="loading-spinner-primary w-16 h-16"></div>
              <div className="absolute inset-0 loading-spinner-primary w-16 h-16 opacity-30"></div>
            </div>
            <span className="mt-6 text-xl text-primary-600 font-medium">กำลังโหลดข่าวสารล่าสุด...</span>
            <span className="mt-2 text-sm text-muted">รอสักครู่นะ ✨</span>
          </div>
        ) : error ? (
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-gradient-to-br from-error-50 to-error-100 border-2 border-error-200 rounded-3xl p-8 shadow-medium">
              <div className="text-6xl mb-4">😓</div>
              <h3 className="text-xl font-semibold text-error-700 mb-2">เกิดข้อผิดพลาด</h3>
              <p className="text-error-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 btn-primary"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          </div>
        ) : (
          <>
            {filteredNews.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-8xl mb-6">📰</div>
                <h3 className="text-2xl font-semibold text-heading mb-3">
                  {searchTerm ? 'ไม่พบข่าวสารที่ค้นหา' : 'ยังไม่มีข่าวสาร'}
                </h3>
                <p className="text-body mb-6">
                  {searchTerm 
                    ? `ลองค้นหาด้วยคำอื่น หรือดูข่าวสารทั้งหมด` 
                    : 'กรุณารอข่าวสารใหม่ ๆ เร็ว ๆ นี้'
                  }
                </p>
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCurrentPage(1);
                    }}
                    className="btn-outline"
                  >
                    ดูข่าวสารทั้งหมด
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* แสดงจำนวนผลลัพธ์ */}
                <div className="flex justify-between items-center mb-8">
                  <div className="text-body">
                    <span className="font-medium text-primary-600">{filteredNews.length}</span> รายการ
                    {searchTerm && <span className="ml-2 text-muted">สำหรับ &quot;{searchTerm}&quot;</span>}
                  </div>
                  <div className="text-sm text-muted">
                    หน้า {currentPage} จาก {totalPages}
                  </div>
                </div>

                {/* กริดข่าวสาร */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {currentNews.map((news, index) => (
                    <article
                      key={news.id}
                      className="group relative bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-300 hover:-translate-y-1 border border-neutral-200/60 animate-stagger-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <Link to={`/news/${news.id}`} className="flex flex-col h-full">
                        {/* รูปภาพ */}
                        <div className="relative overflow-hidden h-48 bg-gradient-to-br from-primary-100 to-secondary-100">
                          <img
                            src={news.poster_url}
                            alt={news.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                          {/* Badge หมวดหมู่ */}
                          <div className="absolute top-4 right-4">
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/95 backdrop-blur-sm text-primary-700 text-xs font-semibold rounded-full shadow-soft">
                              <FaTag size={10} />
                              {news.category}
                            </span>
                          </div>
                        </div>

                        {/* เนื้อหา */}
                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="text-lg font-bold text-heading mb-3 group-hover:text-primary-700 transition-colors duration-300 line-clamp-2">
                            {news.name}
                          </h3>

                          {news.short_description && (
                            <p className="text-body text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                              {news.short_description}
                            </p>
                          )}

                          {/* วันที่ */}
                          <div className="mt-auto flex items-center justify-between text-xs text-muted">
                            <time className="flex items-center gap-1">
                              📅 {new Date(news.created_at).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </time>
                            <span className="text-primary-500 font-medium group-hover:text-primary-700 transition-colors">
                              อ่านต่อ →
                            </span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              </>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary-200 text-primary-700 rounded-xl shadow-soft hover:border-primary-300 hover:shadow-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-primary-200 disabled:hover:shadow-soft transition-all duration-300"
                >
                  ← ก่อนหน้า
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-12 h-12 rounded-xl font-semibold transition-all duration-300 ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-medium'
                            : 'bg-white border-2 border-neutral-200 text-neutral-700 hover:border-primary-300 hover:text-primary-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary-200 text-primary-700 rounded-xl shadow-soft hover:border-primary-300 hover:shadow-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-primary-200 disabled:hover:shadow-soft transition-all duration-300"
                >
                  ถัดไป →
                </button>
              </div>
            )}
          </>
        )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default AllNewsPage;
