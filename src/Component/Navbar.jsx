// D:\ProJectFinal\Lasts\my-project\src\Component\Navbar.jsx (ฉบับสมบูรณ์)

// --- ส่วนที่ 1: การนำเข้า (Imports) ---

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { Bell, CheckCircle } from "lucide-react"; 
import { getNotifications, markNotificationAsRead } from "../services/notificationService"; 

const Navbar = () => {
  // --- ส่วนที่ 2: State Management ---

  // State สำหรับควบคุมการเปิด/ปิดเมนูบนมือถือ
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // State สำหรับควบคุมการเปิด/ปิดเมนูโปรไฟล์ (Dropdown)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  // State สำหรับเก็บข้อมูลการแจ้งเตือนที่ดึงมาจาก API
  const [notifications, setNotifications] = useState([]);
  // State สำหรับควบคุมการเปิด/ปิดเมนูการแจ้งเตือน (Dropdown)
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // --- ส่วนที่ 3: Hooks ---

  const { user, isAuthenticated, signout } = useAuth();
  const navigate = useNavigate();
  // `useRef` ใช้เพื่ออ้างอิงถึง DOM element โดยตรง
  const profileMenuRef = useRef(null);
  const navMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  // --- ส่วนที่ 4: Effects ---

  // useEffect นี้ใช้สำหรับจัดการการคลิกนอกเมนูเพื่อปิดเมนูต่างๆ อัตโนมัติ
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && navMenuRef.current && !navMenuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (isProfileMenuOpen && profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (isNotifOpen && notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    // เพิ่ม Event Listener เมื่อ Component ถูกสร้าง
    document.addEventListener("mousedown", handleClickOutside);
    // Cleanup: ลบ Event Listener ออกเมื่อ Component ถูกทำลาย
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, isProfileMenuOpen, isNotifOpen]);

  // useEffect นี้ใช้สำหรับดึงข้อมูลการแจ้งเตือน
  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifications = async () => {
        const data = await getNotifications();
        setNotifications(data);
      };
      fetchNotifications(); // ดึงข้อมูลครั้งแรก
      
      const interval = setInterval(fetchNotifications, 60000); // ตั้งเวลาดึงข้อมูลใหม่ทุก 1 นาที
      return () => clearInterval(interval); // Cleanup interval
    } else {
      setNotifications([]); // เคลียร์ข้อมูลเมื่อ Logout
    }
  }, [isAuthenticated]);

  // --- ส่วนที่ 5: Event Handlers ---

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await signout();
      setIsProfileMenuOpen(false);
      setIsMenuOpen(false);
      toast.success("ออกจากระบบสำเร็จ");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("เกิดข้อผิดพลาดในการออกจากระบบ");
    }
  };

  const handleDashboardRedirect = () => {
    const roleRedirects = {
      admin: '/admin/dashboard',
      manager: '/manager/dashboard',
      expert: '/expert/dashboard',
    };
    const redirectTo = roleRedirects[user?.role];
    if (redirectTo) {
      navigate(redirectTo);
    } else {
      navigate('/profile');
    }
    setIsProfileMenuOpen(false);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
    if (notification.link_to) {
      navigate(notification.link_to);
    }
    setIsNotifOpen(false);
  };

  // --- ส่วนที่ 6: Sub-components & Calculated Values ---

  const NavLink = ({ to, children, className = "" }) => (
    <Link
      to={to}
      className={`relative block text-gray-200 px-3 py-2 rounded-md hover:text-white 
        hover:bg-purple-700/30 transition-all duration-200 ease-in-out text-sm md:text-base font-medium ${className}`}
      onClick={() => setIsMenuOpen(false)}
    >
      {children}
    </Link>
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // --- ส่วนที่ 7: Main Render (JSX) ---
  return (
    <nav className="bg-purple-800 shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-white text-lg sm:text-xl md:text-2xl font-bold tracking-wider">
              BettaFish
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white hover:text-purple-200 transition-colors duration-200 p-2 rounded-lg hover:bg-purple-700/30"
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
                  <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2 text-white rounded-full hover:bg-purple-700/50 transition-colors">
                    <Bell />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center border-2 border-purple-800">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto">
                      <div className="p-3 font-bold text-gray-800 border-b">การแจ้งเตือน</div>
                      {notifications.length > 0 ? (
                        <div>
                          {notifications.map(notif => (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-3 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer ${!notif.is_read ? 'bg-purple-50' : ''}`}
                            >
                              <p className="text-sm text-gray-700">{notif.message}</p>
                              <p className="text-xs text-gray-400 mt-1 text-right">{new Date(notif.created_at).toLocaleString('th-TH')}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          <CheckCircle className="mx-auto mb-2 text-gray-300" />
                          ไม่มีการแจ้งเตือนใหม่
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="px-4 py-2 bg-purple-700 text-white rounded-lg text-sm md:text-base font-medium shadow-lg hover:bg-purple-600 transition-all duration-200"
                  >
                    {user?.username || 'โปรไฟล์'}
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-10">
                      <button
                        onClick={handleDashboardRedirect}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-800"
                      >
                        แดชบอร์ด/โปรไฟล์
                      </button>
                      <button
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
              // Login Button
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
            className={`fixed inset-y-0 right-0 transform ${isMenuOpen ? "translate-x-0" : "translate-x-full"
              } w-72 bg-purple-800 shadow-2xl transition-transform duration-300 ease-in-out md:hidden backdrop-blur-lg bg-opacity-95`}
          >
            <div className="flex justify-end p-4">
              <button onClick={() => setIsMenuOpen(false)} className="text-white hover:text-purple-200 p-2 rounded-lg hover:bg-purple-700/30">
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