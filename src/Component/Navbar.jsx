// D:\ProJectFinal\Lasts\my-project\src\Component\Navbar.jsx
// (ฉบับสมบูรณ์: รองรับแจ้งเตือน, จัดการ 401 → logout อัตโนมัติ, polling เป็นช่วง ๆ, ปิดเมนูเมื่อคลิคนอก)

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";
import { Bell, CheckCircle, User, LogOut, Settings, Home, FileText, Award, Clock, Menu } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/notificationService";

/** แปลงวันเป็นรูปแบบไทยอ่านง่าย */
const formatThaiDateTime = (iso) => {
  try {
    return new Date(iso).toLocaleString("th-TH", { hour12: false });
  } catch {
    return "";
  }
};

const Navbar = () => {
  // ---------- STATES ----------
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(false);

  // ---------- HOOKS ----------
  const { user, isAuthenticated, signout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ---------- REFS ----------
  const profileMenuRef = useRef(null);
  const navMenuRef = useRef(null);
  const notifMenuRef = useRef(null);
  const pollTimerRef = useRef(null);
  const fetchAbortRef = useRef(null);

  // ---------- HELPERS ----------
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const closeAllDropdowns = useCallback(() => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsNotifOpen(false);
  }, []);

  /** ดึงแจ้งเตือนพร้อมกัน 401 -> ออกจากระบบอัตโนมัติ */
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    // ยกเลิก request เก่าถ้ายังไม่จบ
    if (fetchAbortRef.current) fetchAbortRef.current.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    setLoadingNotif(true);
    try {
      const data = await getMyNotifications({
        unreadOnly: false,
        limit: 50,
      });
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      // จัดการ 401/403 จากข้อความของ apiService
      const msg = String(err?.message || "");
      const isAuthErr = msg.includes("เซสชันหมดอายุ") || msg.includes("ไม่มีสิทธิ์");
      if (isAuthErr) {
        // ลบ session แล้วพาไปหน้า login
        try {
          await signout();
        } catch {}
        toast.info("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
        navigate("/login", { replace: true });
      } else {
        // error อื่นเก็บเป็น log เฉย ๆ เพื่อกันรบกวนผู้ใช้
        console.error("Failed to fetch notifications:", err);
      }
    } finally {
      setLoadingNotif(false);
      // clear reference
      if (fetchAbortRef.current === controller) fetchAbortRef.current = null;
    }
  }, [isAuthenticated, navigate, signout]);

  // ---------- EFFECTS ----------
  // ปิดเมนูเมื่อคลิคนอก
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMenuOpen && navMenuRef.current && !navMenuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
      if (isProfileMenuOpen && profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
      if (isNotifOpen && notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, isProfileMenuOpen, isNotifOpen]);

  // ปิดเมนูเมื่อเปลี่ยนเส้นทาง
  useEffect(() => {
    closeAllDropdowns();
  }, [location.pathname, closeAllDropdowns]);

  // เริ่ม polling แจ้งเตือนทุก ~60s เฉพาะตอนล็อกอิน
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      return;
    }
    // ดึงทันที
    fetchNotifications();
    // ดึงเรื่อย ๆ
    pollTimerRef.current = setInterval(fetchNotifications, 60_000);

    // ดึงทันทีเมื่อ tab กลับมา visible
    const handleVisible = () => {
      if (document.visibilityState === "visible") fetchNotifications();
    };
    document.addEventListener("visibilitychange", handleVisible);

    return () => {
      document.removeEventListener("visibilitychange", handleVisible);
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      // ยกเลิก fetch ที่ค้างอยู่
      if (fetchAbortRef.current) {
        fetchAbortRef.current.abort();
        fetchAbortRef.current = null;
      }
    };
  }, [isAuthenticated, fetchNotifications]);

  // ---------- HANDLERS ----------
  const toggleMenu = () => setIsMenuOpen((v) => !v);

  const handleDashboardRedirect = () => {
    const roleTo = {
      admin: "/admin/dashboard",
      manager: "/manager/dashboard",
      expert: "/expert/dashboard",
    };
    navigate(roleTo[user?.role] || "/profile");
    setIsProfileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signout();
      toast.success("ออกจากระบบสำเร็จ");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("เกิดข้อผิดพลาดในการออกจากระบบ");
    } finally {
      closeAllDropdowns();
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification?.is_read) {
        await markNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
        );
      }
      if (notification?.link_to) {
        navigate(notification.link_to);
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    } finally {
      setIsNotifOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      toast.error("ไม่สามารถทำทั้งหมดเป็นอ่านแล้วได้");
    }
  };

  const NavLink = ({ to, children, icon: Icon, className = "", isMobile = false }) => {
    const isActive = location.pathname === to;
    
    if (isMobile) {
      return (
        <Link
          to={to}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-gray-700 hover:bg-gray-100 ${
            isActive ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500' : ''
          } ${className}`}
          onClick={() => setIsMenuOpen(false)}
        >
          {Icon && <Icon className="h-5 w-5" />}
          {children}
        </Link>
      );
    }
    
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-white hover:bg-white/10 ${
          isActive ? 'bg-white/20 text-white' : ''
        } ${className}`}
        onClick={() => setIsMenuOpen(false)}
      >
        {Icon && <Icon className="h-5 w-5" />}
        {children}
      </Link>
    );
  };

  // ---------- RENDER ----------
  return (
    <nav className="bg-gradient-to-r from-primary-700 to-primary-800 shadow-large sticky top-0 z-50 border-b border-primary-600">
      <div className="container-responsive">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group" onClick={closeAllDropdowns}>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-2xl flex items-center justify-center shadow-medium group-hover:shadow-large transition-all duration-300">
              <span className="text-primary-600 text-lg lg:text-xl font-bold">🐟</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-lg lg:text-xl font-bold tracking-wide">
                BettaFish
              </span>
              <span className="text-primary-200 text-xs lg:text-sm font-medium">
                ระบบจัดการปลากัด
              </span>
            </div>
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={toggleMenu}
            className="lg:hidden p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all duration-300"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-2">
            <NavLink to="/" icon={Home}>หน้าแรก</NavLink>
            <NavLink to="/news" icon={FileText}>ข่าวสาร</NavLink>
            <NavLink to="/evaluate" icon={Award}>ส่งปลากัด</NavLink>
            <NavLink to="/contest" icon={Award}>การประกวด</NavLink>
            {isAuthenticated && <NavLink to="/history" icon={Clock}>ประวัติ</NavLink>}

            {isAuthenticated ? (
              <div className="flex items-center gap-3 ml-4">
                {/* Notification Bell */}
                <div className="relative" ref={notifMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsNotifOpen((v) => !v)}
                    className="btn-ghost text-white hover:bg-white/10 p-3 rounded-xl relative"
                    aria-label="Open notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-6 min-w-[24px] px-1.5 rounded-full bg-error-500 text-white text-xs flex items-center justify-center border-2 border-primary-700 font-bold animate-bounce-soft">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotifOpen && (
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 card shadow-large z-20 max-h-96 overflow-y-auto animate-slide-up">
                      <div className="p-4 flex items-center justify-between border-b border-neutral-200">
                        <div className="font-bold text-neutral-800 text-lg">การแจ้งเตือน</div>
                        <button
                          type="button"
                          disabled={loadingNotif || notifications.length === 0}
                          onClick={handleMarkAllRead}
                          className="btn-sm btn-outline text-xs"
                        >
                          ทำทั้งหมดเป็นอ่านแล้ว
                        </button>
                      </div>

                      {loadingNotif && (
                        <div className="p-6 text-center text-neutral-500">
                          <div className="loading-spinner w-6 h-6 mx-auto mb-2"></div>
                          กำลังโหลด...
                        </div>
                      )}

                      {!loadingNotif && notifications.length > 0 ? (
                        <div className="divide-y divide-neutral-100">
                          {notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-4 hover:bg-neutral-50 cursor-pointer transition-colors duration-200 ${
                                !notif.is_read ? "bg-primary-50 border-l-4 border-primary-500" : ""
                              }`}
                            >
                              <p className="text-sm text-neutral-700 leading-relaxed">{notif.message}</p>
                              {notif.created_at && (
                                <p className="text-xs text-neutral-400 mt-2 text-right">
                                  {formatThaiDateTime(notif.created_at)}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        !loadingNotif && (
                          <div className="p-8 text-center text-neutral-500">
                            <CheckCircle className="mx-auto mb-3 text-neutral-300 h-12 w-12" />
                            <p className="text-sm">ไม่มีการแจ้งเตือนใหม่</p>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen((v) => !v)}
                    className="btn-primary flex items-center gap-2 px-4 py-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden xl:block">
                      {user && (user.username || `${user.first_name || ""} ${user.last_name || ""}`.trim()) || "โปรไฟล์"}
                    </span>
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 card shadow-large py-2 z-10 animate-slide-up">
                      <div className="px-4 py-3 border-b border-neutral-200">
                        <p className="text-sm font-medium text-neutral-900">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-xs text-neutral-500">{user?.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleDashboardRedirect}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-neutral-700 hover:bg-neutral-50 transition-colors duration-200"
                      >
                        <Settings className="h-4 w-4" />
                        แดชบอร์ด/โปรไฟล์
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-neutral-700 hover:bg-neutral-50 transition-colors duration-200"
                      >
                        <LogOut className="h-4 w-4" />
                        ออกจากระบบ
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary ml-4"
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </div>

          {/* Mobile Menu (Sidebar) */}
          <div
            ref={navMenuRef}
            className={`fixed inset-y-0 right-0 transform ${
              isMenuOpen ? "translate-x-0" : "translate-x-full"
            } w-80 bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden z-50`}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-neutral-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-lg font-bold">🐟</span>
                  </div>
                  <div>
                    <p className="text-neutral-900 font-bold">BettaFish</p>
                    <p className="text-neutral-500 text-sm">ระบบจัดการปลากัด</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn-ghost p-2 rounded-xl"
                  aria-label="Close menu"
                >
                  <IoMdClose className="h-6 w-6" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 p-6 space-y-2">
                <NavLink to="/" icon={Home} isMobile={true}>หน้าแรก</NavLink>
                <NavLink to="/news" icon={FileText} isMobile={true}>ข่าวสาร</NavLink>
                <NavLink to="/evaluate" icon={Award} isMobile={true}>ส่งปลากัด</NavLink>
                <NavLink to="/contest" icon={Award} isMobile={true}>การประกวด</NavLink>
                
                {isAuthenticated && (
                  <>
                    <hr className="border-neutral-200 my-4" />
                    <NavLink to="/history" icon={Clock} isMobile={true}>ประวัติ</NavLink>
                    <NavLink to="/profile" icon={User} isMobile={true}>ข้อมูลส่วนตัว</NavLink>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-neutral-200">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full btn-outline flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    ออกจากระบบ
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    เข้าสู่ระบบ
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          {isMenuOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
