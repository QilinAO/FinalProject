import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, Award, Star, ArrowRight, Play, FileText } from "lucide-react";
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
    <main className="page-container">
      {/* Hero Section */}
      <section className="page-hero">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="page-hero-content">
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8">
              ยินดีต้อนรับสู่
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent mt-2">
                BettaFish Platform
              </span>
            </h1>
            <p className="text-2xl md:text-3xl leading-relaxed mb-12 text-white/95 font-medium">
              ระบบจัดการปลากัดที่ครบครันที่สุด
              <br className="hidden sm:block" />
              พร้อมผู้เชี่ยวชาญมืออาชีพ
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/evaluate" className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-white to-gray-100 text-purple-700 font-bold text-xl rounded-2xl shadow-2xl hover:scale-105 transition-all duration-300">
                <Award className="h-6 w-6" />
                ส่งปลากัดเข้าประกวด
              </Link>
              <Link to="/contest" className="inline-flex items-center gap-3 px-10 py-5 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-bold text-xl rounded-2xl hover:bg-white/30 transition-all duration-300">
                <Play className="h-6 w-6" />
                ดูการประกวด
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-60 h-60 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </section>

      <div className="page-main">
        {/* Section 1: Carousel กิจกรรม/การประกวด */}
        <section className="page-section">
          <div className="container-responsive">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                🎯 กิจกรรมที่กำลังดำเนินอยู่
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                ติดตามกิจกรรมการประกวดปลากัดล่าสุด และร่วมเป็นส่วนหนึ่งของชุมชนคนรักปลากัด
              </p>
            </div>

          {loadingCarousel && (
            <div className="loading-container">
              <div className="loading-spinner-primary"></div>
              <span className="ml-4 text-lg text-muted">กำลังโหลดกิจกรรม...</span>
            </div>
          )}

          {errorCarousel && (
            <div className="empty-state">
              <div className="betta-card max-w-md mx-auto">
                <p className="text-error-600 text-lg">{errorCarousel}</p>
              </div>
            </div>
          )}

          {!loadingCarousel && !errorCarousel && (
            <div className="relative">
              <div className="relative flex items-center justify-center">
                {/* Navigation Buttons */}
                {carouselItems.length > 1 && (
                  <>
                    <button 
                      onClick={prevPoster} 
                      className="absolute left-4 lg:left-8 z-20 btn-ghost bg-white/90 hover:bg-white p-3 rounded-full shadow-large hover:scale-110 transition-all duration-200"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button 
                      onClick={nextPoster} 
                      className="absolute right-4 lg:right-8 z-20 btn-ghost bg-white/90 hover:bg-white p-3 rounded-full shadow-large hover:scale-110 transition-all duration-200"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Carousel Container */}
                <div className="w-full max-w-5xl relative overflow-hidden rounded-3xl shadow-large">
                  {carouselItems.length > 0 ? (
                    <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentPosterIndex * 100}%)` }}>
                      {carouselItems.map((item) => (
                        <div key={item.id} className="w-full flex-shrink-0 relative group">
                          <Link to={`/contest/${item.id}`} className="block">
                            <img 
                              src={item.poster_url} 
                              alt={item.name} 
                              className="w-full h-auto object-contain bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-3xl" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                                <div className="flex items-center gap-4 mb-3">
                                  <div className="badge-primary">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    กิจกรรม
                                  </div>
                                  <div className="badge-secondary">
                                    <Clock className="h-4 w-4 mr-1" />
                                    กำลังดำเนินการ
                                  </div>
                                </div>
                                <h3 className="text-white text-2xl lg:text-3xl font-bold mb-2">{item.name}</h3>
                                {item.short_description && (
                                  <p className="text-white/90 text-lg leading-relaxed line-clamp-2">
                                    {item.short_description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-4 text-white/80">
                                  <ArrowRight className="h-4 w-4" />
                                  <span className="text-sm font-medium">คลิกเพื่อดูรายละเอียด</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center bg-neutral-100 w-full h-full rounded-3xl">
                      <div className="text-center">
                        <Award className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                        <p className="text-neutral-600 text-lg">ไม่พบกิจกรรมที่กำลังดำเนินอยู่</p>
                        <p className="text-neutral-500 text-sm mt-2">กรุณาตรวจสอบอีกครั้งในภายหลัง</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dots Indicator */}
              {carouselItems.length > 1 && (
                <div className="flex justify-center mt-8">
                  {carouselItems.map((_, index) => (
                    <button 
                      key={index} 
                      onClick={() => { setCurrentPosterIndex(index); handleUserInteraction(); }} 
                      className={`w-3 h-3 mx-1.5 rounded-full transition-all duration-300 ${
                        index === currentPosterIndex 
                          ? "bg-primary-600 w-8 shadow-medium" 
                          : "bg-neutral-300 hover:bg-neutral-400"
                      }`} 
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          </div>
        </section>

        {/* Section 2: Grid ข่าวสารแนะนำ */}
        <section className="page-section">
          <div className="container-responsive">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                📰 ข่าวสารแนะนำ
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                อัพเดทข่าวสารและความรู้เกี่ยวกับปลากัดล่าสุด
              </p>
            </div>

          {loadingNews && (
            <div className="flex justify-center items-center py-20">
              <div className="loading-spinner w-12 h-12"></div>
              <span className="ml-4 text-lg text-neutral-600">กำลังโหลดข่าวสาร...</span>
            </div>
          )}

          {errorNews && (
            <div className="text-center py-20">
              <div className="card max-w-md mx-auto">
                <p className="text-error-600 text-lg">{errorNews}</p>
              </div>
            </div>
          )}

          {!loadingNews && !errorNews && (
            newsItems.length > 0 ? (
              <div className="grid-responsive grid-cols-responsive">
                {newsItems.map((news) => (
                  <article key={news.id} className="card-hover group overflow-hidden">
                    <Link to={`/news/${news.id}`} className="block">
                      <div className="overflow-hidden aspect-[4/3] rounded-xl mb-4">
                        <img 
                          src={news.poster_url} 
                          alt={news.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="badge-primary">
                            <Star className="h-3 w-3 mr-1" />
                            ข่าวสาร
                          </div>
                          <time className="text-xs text-neutral-500">
                            {new Date(news.created_at).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </time>
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
                          {news.name}
                        </h3>
                        {news.short_description && (
                          <p className="text-neutral-600 leading-relaxed line-clamp-3">
                            {news.short_description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-primary-600 font-medium text-sm group-hover:gap-3 transition-all duration-200">
                          <span>อ่านเพิ่มเติม</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="card max-w-md mx-auto">
                  <FileText className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 text-lg">ไม่พบข่าวสารแนะนำ</p>
                  <p className="text-neutral-500 text-sm mt-2">กรุณาตรวจสอบอีกครั้งในภายหลัง</p>
                </div>
              </div>
            )
          )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default HomePage;