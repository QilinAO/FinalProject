// D:\ProJectFinal\Lasts\my-project\src\Component\Navbar.jsx
// (ฉบับสมบูรณ์: รองรับแจ้งเตือน, จัดการ 401 → logout อัตโนมัติ, polling เป็นช่วง ๆ, ปิดเมนูเมื่อคลิคนอก)

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";
import { Bell, CheckCircle } from "lucide-react";

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

  const NavLink = ({ to, children, className = "" }) => (
    <Link
      to={to}
      className={`relative block text-gray-200 px-3 py-2 rounded-md hover:text-white hover:bg-purple-700/30 transition-all duration-200 ease-in-out text-sm md:text-base font-medium ${className}`}
      onClick={() => setIsMenuOpen(false)}
    >
      {children}
    </Link>
  );

  // ---------- RENDER ----------
  return (
    <nav className="bg-purple-800 shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group" onClick={closeAllDropdowns}>
            <span className="text-white text-lg sm:text-xl md:text-2xl font-bold tracking-wider">
              BettaFish
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={toggleMenu}
            className="md:hidden text-white hover:text-purple-200 transition-colors duration-200 p-2 rounded-lg hover:bg-purple-700/30"
            aria-label="Toggle menu"
          >
            <GiHamburgerMenu className="h-6 w-6" />
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/">แนะนำ</NavLink>
            <NavLink to="/news">ข่าวสาร</NavLink>
            <NavLink to="/evaluate">ส่งปลากัด</NavLink>
            <NavLink to="/contest">การประกวด</NavLink>
            {isAuthenticated && <NavLink to="/history">ประวัติ</NavLink>}

            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-4">
                {/* Notification Bell */}
                <div className="relative" ref={notifMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsNotifOpen((v) => !v)}
                    className="p-2 text-white rounded-full hover:bg-purple-700/50 transition-colors relative"
                    aria-label="Open notifications"
                  >
                    <Bell />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center border-2 border-purple-800">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto">
                      <div className="p-3 flex items-center justify-between border-b">
                        <div className="font-bold text-gray-800">การแจ้งเตือน</div>
                        <button
                          type="button"
                          disabled={loadingNotif || notifications.length === 0}
                          onClick={handleMarkAllRead}
                          className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:opacity-50"
                        >
                          ทำทั้งหมดเป็นอ่านแล้ว
                        </button>
                      </div>

                      {loadingNotif && (
                        <div className="p-4 text-center text-gray-500">กำลังโหลด...</div>
                      )}

                      {!loadingNotif && notifications.length > 0 ? (
                        <div>
                          {notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-3 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer ${
                                !notif.is_read ? "bg-purple-50" : ""
                              }`}
                            >
                              <p className="text-sm text-gray-700">{notif.message}</p>
                              {notif.created_at && (
                                <p className="text-xs text-gray-400 mt-1 text-right">
                                  {formatThaiDateTime(notif.created_at)}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        !loadingNotif && (
                          <div className="p-4 text-center text-gray-500">
                            <CheckCircle className="mx-auto mb-2 text-gray-300" />
                            ไม่มีการแจ้งเตือนใหม่
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
                    className="px-4 py-2 bg-purple-700 text-white rounded-lg text-sm md:text-base font-medium shadow-lg hover:bg-purple-600 transition-all duration-200"
                  >
                    {user?.username || `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "โปรไฟล์"}
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-10">
                      <button
                        type="button"
                        onClick={handleDashboardRedirect}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-800"
                      >
                        แดชบอร์ด/โปรไฟล์
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-800"
                      >
                        ออกจากระบบ
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-4 px-4 py-2 bg-green-500 text-white rounded-lg text-sm md:text-base font-medium hover:bg-green-600 transition-all duration-200"
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
            } w-72 bg-purple-800 shadow-2xl transition-transform duration-300 ease-in-out md:hidden backdrop-blur-lg bg-opacity-95`}
          >
            <div className="flex justify-end p-4">
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="text-white hover:text-purple-200 p-2 rounded-lg hover:bg-purple-700/30"
                aria-label="Close menu"
              >
                <IoMdClose className="h-6 w-6" />
              </button>
            </div>
            <div className="px-4 py-4 text-center space-y-2">
              <NavLink to="/">แนะนำ</NavLink>
              <NavLink to="/news">ข่าวสาร</NavLink>
              <NavLink to="/evaluate">ส่งปลากัด</NavLink>
              <NavLink to="/contest">การประกวด</NavLink>
              <hr className="border-purple-600 my-2" />
              {isAuthenticated ? (
                <>
                  <NavLink to="/history">ประวัติ</NavLink>
                  <NavLink to="/profile">ข้อมูลส่วนตัว</NavLink>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left relative block text-gray-100 px-3 py-2 rounded-md hover:text-white hover:bg-purple-700/30 transition-all duration-200 ease-in-out text-sm md:text-base font-medium"
                  >
                    ออกจากระบบ
                  </button>
                </>
              ) : (
                <NavLink to="/login">เข้าสู่ระบบ</NavLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
