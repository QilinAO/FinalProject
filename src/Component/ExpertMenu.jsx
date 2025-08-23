// src/Component/ExpertMenu.jsx (New File)

import React from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  LayoutDashboard, ClipboardCheck, Trophy, History, User, LogOut, Settings
} from "lucide-react";

const ExpertMenu = () => {
  const { user, signout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  const getLinkClass = (path) => {
    return location.pathname.startsWith(path) 
      ? "flex items-center gap-3 px-3 py-2 text-white bg-teal-600 rounded-md transition-colors duration-200"
      : "flex items-center gap-3 px-3 py-2 text-teal-100 rounded-md hover:bg-teal-600 hover:text-white transition-colors duration-200";
  }

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-teal-800 to-teal-700 text-white flex-col transition-transform duration-300 ease-in-out z-40 hidden md:flex">
      <div className="p-4 border-b border-teal-600">
        <h2 className="text-xl font-bold">ผู้เชี่ยวชาญ</h2>
        <p className="text-sm text-teal-200">{user?.profile?.username}</p>
      </div>
      <nav className="flex-grow p-2 space-y-2">
        <NavLink to="/expert/dashboard" icon={LayoutDashboard} label="แดชบอร์ด" currentPath={location.pathname}/>
        <NavLink to="/expert/evaluations" icon={ClipboardCheck} label="ประเมินคุณภาพ" currentPath={location.pathname} />
        <NavLink to="/expert/judging" icon={Trophy} label="การแข่งขัน" currentPath={location.pathname}/>
        <NavLink to="/expert/history" icon={History} label="ประวัติทั้งหมด" currentPath={location.pathname}/>
        <NavLink to="/expert/specialities" icon={Settings} label="จัดการความเชี่ยวชาญ" currentPath={location.pathname}/>
      </nav>
      
      <div className="p-2 border-t border-teal-600">
        <NavLink to="/expert/profile" icon={User} label="โปรไฟล์" currentPath={location.pathname}/>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-teal-100 rounded-md hover:bg-red-500 hover:text-white transition-colors duration-200"
        >
          <LogOut size={20} />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
};

const NavLink = ({ to, icon: Icon, label, currentPath }) => {
    const isActive = currentPath.startsWith(to);
    const activeClass = "bg-teal-600 text-white";
    const inactiveClass = "text-teal-100 hover:bg-teal-600 hover:text-white";

    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 ${isActive ? activeClass : inactiveClass}`}
      >
        <Icon size={20} />
        <span>{label}</span>
      </Link>
    );
}

export default ExpertMenu;