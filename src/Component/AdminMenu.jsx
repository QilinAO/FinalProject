// ======================================================================
// File: src/Component/AdminMenu.jsx
// หน้าที่: แสดงผลเมนูนำทางสำหรับส่วนของผู้ดูแลระบบ (Admin)
// ======================================================================

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  User,
  LogOut,
  FileText,
  BarChart,
  HardDrive,
  Menu as MenuIcon,
  X as CloseIcon,
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
 * Component หลักสำหรับเมนูนำทางของ Admin
 */
const AdminMenu = () => {
  const { signout } = useAuth();
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

  return (
    <header className="fixed top-0 w-full z-50 bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link to="/admin/dashboard" className="text-white text-xl font-bold tracking-wide">
              ADMIN PANEL
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            <NavLink to="/admin/dashboard" icon={BarChart} label="สรุปข้อมูล" currentPath={location.pathname} />
            <NavLink to="/admin/users" icon={User} label="จัดการผู้ใช้" currentPath={location.pathname} />
            <NavLink to="/admin/reports" icon={FileText} label="รายงาน" currentPath={location.pathname} />
            <NavLink to="/admin/database" icon={HardDrive} label="ฐานข้อมูล" currentPath={location.pathname} />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-md hover:bg-red-600 transition duration-200 ml-2"
            >
              <LogOut size={20} />
              <span>ออกจากระบบ</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-gray-300 p-2 rounded-md transition duration-200"
            >
              {isMobileMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-blue-800 shadow-inner">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <NavLink to="/admin/dashboard" icon={BarChart} label="สรุปข้อมูล" currentPath={location.pathname} closeMenu={() => setIsMobileMenuOpen(false)} />
              <NavLink to="/admin/users" icon={User} label="จัดการผู้ใช้" currentPath={location.pathname} closeMenu={() => setIsMobileMenuOpen(false)} />
              <NavLink to="/admin/reports" icon={FileText} label="รายงาน" currentPath={location.pathname} closeMenu={() => setIsMobileMenuOpen(false)} />
              <NavLink to="/admin/database" icon={HardDrive} label="ฐานข้อมูล" currentPath={location.pathname} closeMenu={() => setIsMobileMenuOpen(false)} />
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-white rounded-md hover:bg-red-600 transition duration-200"
              >
                <LogOut size={20} />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminMenu;