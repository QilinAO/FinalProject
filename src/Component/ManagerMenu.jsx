// D:\ProJectFinal\Lasts\my-project\src\Component\ManagerMenu.jsx (ฉบับแก้ไข)

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import {
  User, LogOut, Clipboard, Users, Star, FileText,
  Menu as MenuIcon, X as CloseIcon, BarChart, HardDrive, Tv
} from "lucide-react";
import { useAuth } from "../context/AuthContext"; // 1. เปลี่ยนมาใช้ useAuth
import { toast } from "react-toastify";

const ManagerMenu = () => {
  // 2. ดึง user และฟังก์ชัน signout จาก useAuth
  const { user, signout } = useAuth();
  const navigate = useNavigate(); // สร้าง instance ของ navigate

  const [isOpen, setIsOpen] = useState(false);

  // เราไม่จำเป็นต้องเช็ค role ที่นี่แล้ว เพราะ ProtectedRoute จัดการให้
  // if (!user || user.profile.role !== "manager") {
  //   return <Navigate to="/login" replace />;
  // }

  const handleLogout = async () => {
    try {
      await signout(); // 3. เรียกใช้ฟังก์ชัน signout จาก Context
      toast.success("ออกจากระบบสำเร็จ");
      // ไม่ต้องใช้ window.location.href, ให้ใช้ navigate แทน
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("เกิดข้อผิดพลาดในการออกจากระบบ");
    }
  };

  return (
    // เปลี่ยนจาก <nav> เป็น <aside> สำหรับ Sidebar
    <aside className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col transition-transform duration-300 ease-in-out z-40">
      <div className="p-4 border-b border-blue-700">
        <h2 className="text-xl font-bold">ผู้จัดการประกวด</h2>
        <p className="text-sm text-blue-200">{user?.username}</p>
      </div>
      <nav className="flex-grow p-2 space-y-2">
        {/* เปลี่ยน Link ทั้งหมดเป็น Component ย่อย */}
        <NavLink to="/manager/dashboard" icon={BarChart} label="Dashboard" />
        <NavLink to="/manager/contest-management" icon={FileText} label="สร้างกิจกรรม" />
        <NavLink to="/manager/contest-list" icon={Clipboard} label="รายการกิจกรรม" />
        <NavLink to="/manager/assign-judges" icon={Users} label="มอบหมายกรรมการ" />
        <NavLink to="/manager/live-room" icon={Tv} label="ห้องแข่งขัน" />
        <NavLink to="/manager/contest-history" icon={HardDrive} label="ประวัติการประกวด" />
        <NavLink to="/manager/competition-results" icon={Star} label="คลังผลคะแนน" />
      </nav>
      {/* ส่วนของ Profile และ Logout */}
      <div className="p-2 border-t border-blue-700">
        <NavLink to="/manager/profile" icon={User} label="โปรไฟล์" />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-blue-100 rounded-md hover:bg-red-500 hover:text-white transition-colors duration-200"
        >
          <LogOut size={20} />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
};

// Component ย่อยสำหรับ Link ในเมนู
const NavLink = ({ to, icon: Icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-3 py-2 text-blue-100 rounded-md hover:bg-blue-700 transition-colors duration-200"
  >
    <Icon size={20} />
    <span>{label}</span>
  </Link>
);


export default ManagerMenu;