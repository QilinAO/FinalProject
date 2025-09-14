// D:\ProJectFinal\Lasts\my-project\src\Pages\Admin\Report.jsx (ฉบับสมบูรณ์ แก้ไขแล้ว)

import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { LoaderCircle, Users, Shield, UserCheck, UserCog, FileText, Clock, CheckSquare, CircleDot } from 'lucide-react';
import PageHeader from "../../ui/PageHeader";

// [แก้ไข] 1. Import service ที่ถูกต้อง
import { getAllUsers } from "../../services/adminService"; // ใช้ service สำหรับ Admin
import { getMyContests } from "../../services/managerService"; // สมมติ Admin ดึงข้อมูลทั้งหมดจาก service นี้ได้

const Report = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        // [แก้ไข] 2. ดึงข้อมูลจาก API พร้อมกันเพื่อประสิทธิภาพ
        const [usersRes, contestsRes] = await Promise.all([
          getAllUsers(),
          getMyContests(),
        ]);

        const users = usersRes.data || [];
        const contests = contestsRes || [];

        // ประมวลผลข้อมูล Users
        const roleCounts = users.reduce((acc, u) => {
          acc[u.role] = (acc[u.role] || 0) + 1;
          return acc;
        }, { admin: 0, user: 0, manager: 0, expert: 0 });

        // ประมวลผลข้อมูล Contests และ News
        const contentCounts = contests.reduce((acc, c) => {
          if (c.category === 'การประกวด') {
            acc.totalContests = (acc.totalContests || 0) + 1;
            acc[c.status] = (acc[c.status] || 0) + 1; // นับตาม status
          } else {
            acc.totalNews = (acc.totalNews || 0) + 1;
          }
          return acc;
        }, { totalContests: 0, totalNews: 0 });

        setReportData({
          totalUsers: users.length,
          ...roleCounts,
          ...contentCounts
        });

      } catch (error) {
        toast.error("ไม่สามารถโหลดข้อมูลสำหรับรายงานได้: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []); // Dependency array ว่างเปล่าเพื่อให้ทำงานแค่ครั้งเดียว

  // [แก้ไข] 3. ลบการเช็ค Role และ Loading ที่ไม่จำเป็นออก เพราะ Layout จัดการให้แล้ว

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoaderCircle className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (!reportData) {
    return <div className="text-center p-8 bg-red-50 text-red-700 rounded-lg">ไม่สามารถแสดงข้อมูลรายงานได้</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader title="รายงานสรุปผลระบบ" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Reports */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4 flex items-center gap-2"><Users size={20} /> รายงานผู้ใช้งาน</h2>
          <div className="space-y-3">
            <StatRow label="ผู้ใช้ทั้งหมดในระบบ" value={reportData.totalUsers} isTotal={true} />
            <hr className="my-2"/>
            <StatRow label="ผู้ดูแลระบบ (Admin)" value={reportData.admin} icon={<Shield size={16} className="text-red-500" />} />
            <StatRow label="ผู้จัดการ (Manager)" value={reportData.manager} icon={<UserCog size={16} className="text-amber-500" />} />
            <StatRow label="ผู้เชี่ยวชาญ (Expert)" value={reportData.expert} icon={<UserCheck size={16} className="text-green-500" />} />
            <StatRow label="ผู้ใช้ทั่วไป (User)" value={reportData.user} icon={<Users size={16} className="text-blue-500" />} />
          </div>
        </div>

        {/* Content Reports */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4 flex items-center gap-2"><FileText size={20} /> รายงานเนื้อหา</h2>
          <div className="space-y-3">
            <StatRow label="การประกวดทั้งหมด" value={reportData.totalContests} isTotal={true} />
            <StatRow label="ข่าวสารทั้งหมด" value={reportData.totalNews || 0} isTotal={true} />
            <hr className="my-2"/>
            <p className="text-sm font-semibold text-gray-500">สถานะการประกวด:</p>
            <StatRow label="แบบร่าง" value={reportData.draft || 0} icon={<CircleDot size={16} className="text-gray-500"/>} />
            <StatRow label="กำลังดำเนินการ" value={reportData['กำลังดำเนินการ'] || 0} icon={<Clock size={16} className="text-blue-500"/>} />
            <StatRow label="ประกาศผลแล้ว" value={reportData['ประกาศผล'] || 0} icon={<CheckSquare size={16} className="text-green-500"/>} />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatRow = ({ label, value, isTotal = false, icon = null }) => (
  <div className="flex justify-between items-center text-sm">
    <span className={`flex items-center gap-2 ${isTotal ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
      {icon}
      {label}
    </span>
    <span className={`font-bold text-lg ${isTotal ? 'text-blue-600' : 'text-gray-800'}`}>{value}</span>
  </div>
);

export default Report;
