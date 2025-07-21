import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import apiService from "../../services/api";

const SLIDE_INTERVAL = 5000;

const HomePage = () => {
  // --- State สำหรับ Carousel (กิจกรรม/การประกวด) ---
  const [carouselItems, setCarouselItems] = useState([]);
  const [loadingCarousel, setLoadingCarousel] = useState(true);
  const [errorCarousel, setErrorCarousel] = useState(null);

  // --- State สำหรับ Grid (ข่าวสารแนะนำ) ---
  const [newsItems, setNewsItems] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [errorNews, setErrorNews] = useState(null);

  // --- Carousel control ---
  const [currentPosterIndex, setCurrentPosterIndex] = useState(0);
  const autoSlideRef = useRef(null);

  // --- useEffect ที่ 1: ดึงข้อมูลสำหรับ Carousel ---
  useEffect(() => {
    const fetchCarouselData = async () => {
      setLoadingCarousel(true);
      try {
        const response = await apiService.get('/public/content/carousel');
        setCarouselItems(response.data || []);
      } catch (err) {
        setErrorCarousel(err.message || "ไม่สามารถโหลดข้อมูลกิจกรรมได้");
      } finally {
        setLoadingCarousel(false);
      }
    };
    fetchCarouselData();
  }, []);

  // --- useEffect ที่ 2: ดึงข้อมูลสำหรับข่าวสารแนะนำ ---
  useEffect(() => {
    const fetchNewsData = async () => {
      setLoadingNews(true);
      try {
        const response = await apiService.get('/public/content/recommended-news');
        setNewsItems(response.data || []);
      } catch (err) {
        setErrorNews(err.message || "ไม่สามารถโหลดข่าวสารได้");
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNewsData();
  }, []);

  // --- Carousel auto slide ---
  useEffect(() => {
    if (!loadingCarousel && carouselItems.length > 1) {
      startAutoSlide();
    }
    return () => clearInterval(autoSlideRef.current);
  }, [loadingCarousel, carouselItems]);

  const startAutoSlide = () => {
    clearInterval(autoSlideRef.current);
    autoSlideRef.current = setInterval(() => {
      setCurrentPosterIndex((prev) => (prev + 1) % carouselItems.length);
    }, SLIDE_INTERVAL);
  };

  const handleUserInteraction = () => {
    startAutoSlide();
  };

  const nextPoster = () => {
    if (carouselItems.length > 0) {
      setCurrentPosterIndex((prev) => (prev + 1) % carouselItems.length);
      handleUserInteraction();
    }
  };

  const prevPoster = () => {
     if (carouselItems.length > 0) {
      setCurrentPosterIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
      handleUserInteraction();
    }
  };

  // --- Render ---
  return (
    <main className="bg-gradient-to-b from-pink-100 via-red-100 to-purple-200 py-12 md:py-14">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section 1: Carousel กิจกรรม/การประกวด */}
        <section className="relative">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-purple-700">
            กิจกรรมที่กำลังดำเนินอยู่
          </h2>
          {loadingCarousel && <p className="text-center">กำลังโหลดกิจกรรม...</p>}
          {errorCarousel && <p className="text-center text-red-500">{errorCarousel}</p>}
          {!loadingCarousel && !errorCarousel && (
            <div className="relative flex items-center justify-center mt-4">
              <button onClick={prevPoster} className="absolute left-3 z-20 bg-white/70 p-3 rounded-full shadow-md hover:scale-110 transition-transform"><ChevronLeft /></button>
              <div className="w-full max-w-screen-xl relative overflow-hidden rounded-xl shadow-lg aspect-video">
                {carouselItems.length > 0 ? (
                  <div className="flex transition-transform duration-700" style={{ transform: `translateX(-${currentPosterIndex * 100}%)` }}>
                    {carouselItems.map((item) => (
                      <div key={item.id} className="w-full flex-shrink-0 relative group">
                        <Link to={`/contest/${item.id}`}>
                          <img src={item.poster_url} alt={item.name} className="w-full h-full object-cover bg-gray-200" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 p-4 flex items-end">
                            <h3 className="text-white text-xl font-bold">{item.name}</h3>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center bg-gray-300 w-full h-full"><p>ไม่พบกิจกรรมที่กำลังดำเนินอยู่</p></div>
                )}
              </div>
              <button onClick={nextPoster} className="absolute right-3 z-20 bg-white/70 p-3 rounded-full shadow-md hover:scale-110 transition-transform"><ChevronRight /></button>
            </div>
          )}
          {carouselItems.length > 1 && (
            <div className="flex justify-center mt-6">
              {carouselItems.map((_, index) => (
                <button key={index} onClick={() => { setCurrentPosterIndex(index); handleUserInteraction(); }} className={`w-3 h-3 mx-1.5 rounded-full transition-all ${index === currentPosterIndex ? "bg-purple-600 w-6" : "bg-gray-300"}`} />
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Grid ข่าวสารแนะนำ */}
        <section className="mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-purple-700">
            ข่าวสารแนะนำ
          </h2>
          {loadingNews && <p className="text-center">กำลังโหลดข่าวสาร...</p>}
          {errorNews && <p className="text-center text-red-500">{errorNews}</p>}
          {!loadingNews && !errorNews && (
            newsItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {newsItems.map((news) => (
                  <article key={news.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl group">
                    <Link to={`/news/${news.id}`}>
                      <div className="overflow-hidden h-48"><img src={news.poster_url} alt={news.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /></div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{news.name}</h3>
                        <p className="line-clamp-3 text-gray-600 text-sm mb-2">{news.short_description}</p>
                        <time className="text-gray-400 text-xs block">{new Date(news.created_at).toLocaleDateString('th-TH')}</time>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600">ไม่พบข่าวสารแนะนำ</p>
            )
          )}
        </section>
      </div>
    </main>
  );
};

export default HomePage;