// ======================================================================
// File: src/Component/ManagerMenu.jsx
// หน้าที่: แสดงผลเมนูนำทางสำหรับส่วนของผู้จัดการ (Manager)
// ======================================================================

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  User, LogOut, Clipboard, Users, Star, FileText,
  Menu as MenuIcon, X as CloseIcon, BarChart, HardDrive, Tv
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

/**
 * Component ย่อยสำหรับสร้าง Link ในเมนู พร้อมจัดการสถานะ Active
 */
const NavLink = ({ to, icon: Icon, label, currentPath, closeMenu = () => {} }) => {
  const isActive = currentPath.startsWith(to);
  
  const linkClasses = `flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 w-full text-left ${
    isActive
      ? "text-white bg-blue-700"
      : "text-blue-100 hover:bg-blue-700 hover:text-white"
  }`;

  return (
    <Link to={to} className={linkClasses} onClick={closeMenu}>
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

/**
 * Component หลักสำหรับเมนูนำทางของ Manager (Responsive)
 */
const ManagerMenu = () => {
  const { user, signout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signout();
      toast.success("ออกจากระบบสำเร็จ");
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("เกิดข้อผิดพลาดในการออกจากระบบ");
    }
  };

  const menuItems = [
    { to: "/manager/dashboard", icon: BarChart, label: "Dashboard" },
    { to: "/manager/contest-management", icon: FileText, label: "สร้างกิจกรรม" },
    { to: "/manager/contest-list", icon: Clipboard, label: "รายการกิจกรรม" },
    { to: "/manager/assign-judges", icon: Users, label: "มอบหมายกรรมการ" },
    { to: "/manager/live-room", icon: Tv, label: "ห้องแข่งขัน" },
    { to: "/manager/contest-history", icon: HardDrive, label: "ประวัติการประกวด" },
    { to: "/manager/competition-results", icon: Star, label: "คลังผลคะแนน" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex-col transition-transform duration-300 ease-in-out z-40 hidden md:flex">
        <div className="p-4 border-b border-blue-700">
          <h2 className="text-xl font-bold">ผู้จัดการประกวด</h2>
          <p className="text-sm text-blue-200 truncate">{user?.profile?.username || user?.email}</p>
        </div>
        <nav className="flex-grow p-2 space-y-1">
          {menuItems.map(item => (
            <NavLink key={item.to} {...item} currentPath={location.pathname} />
          ))}
        </nav>
        <div className="p-2 border-t border-blue-700">
          <NavLink to="/manager/profile" icon={User} label="โปรไฟล์" currentPath={location.pathname} />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-blue-100 rounded-md hover:bg-red-500 hover:text-white transition-colors duration-200"
          >
            <LogOut size={20} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 w-full z-30 bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg md:hidden">
        <div className="max-w-8xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/manager/dashboard" className="text-white text-lg font-bold">
              Manager Panel
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2 rounded-md"
            >
              {isMobileMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-blue-800 bg-opacity-95 backdrop-blur-sm z-20 md:hidden">
          <nav className="p-4 space-y-2">
            {menuItems.map(item => (
              <NavLink key={item.to} {...item} currentPath={location.pathname} closeMenu={() => setIsMobileMenuOpen(false)} />
            ))}
            <hr className="border-blue-700"/>
            <NavLink to="/manager/profile" icon={User} label="โปรไฟล์" currentPath={location.pathname} closeMenu={() => setIsMobileMenuOpen(false)} />
            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-blue-100 rounded-md hover:bg-red-600 transition-colors duration-200"
            >
              <LogOut size={20} />
              <span>ออกจากระบบ</span>
            </button>
          </nav>
        </div>
      )}
    </>
  );
};

export default ManagerMenu;