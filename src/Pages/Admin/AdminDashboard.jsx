// D:\ProJectFinal\Lasts\my-project\src\Pages\Admin\AdminDashboard.jsx (ฉบับสมบูรณ์)

// --- ส่วนที่ 1: การนำเข้า (Imports) ---

import React, { useEffect, useState, useMemo } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Users, UserPlus, Newspaper, LoaderCircle } from "lucide-react";
import { toast } from 'react-toastify';
import { useAuth } from "../../context/AuthContext";
// [อัปเดต] Import ฟังก์ชัน getDashboardStats ที่เราสร้างขึ้นใหม่ใน adminService
import { getDashboardStats } from "../../services/adminService"; 


// --- ส่วนที่ 2: Main Component ---

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // [อัปเดต] ยกเครื่อง useEffect ใหม่ทั้งหมด
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // เรียก API แค่เส้นทางเดียว คือ getDashboardStats()
        const response = await getDashboardStats();
        // ข้อมูลทั้งหมดที่จำเป็น (เช่น จำนวนผู้ใช้, จำนวนกิจกรรม, ผู้ใช้ล่าสุด)
        // จะถูกประมวลผลมาจาก Backend และอยู่ใน response.data แล้ว
        setStats(response.data); 
      } catch (error) {
        toast.error("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Dependency array ว่างเปล่า [] หมายถึงให้ทำงานแค่ครั้งเดียวเมื่อ Component โหลด

  // --- ส่วนที่ 3: การเตรียมข้อมูลสำหรับกราฟ ---

  // ใช้ useMemo เพื่อคำนวณข้อมูลสำหรับกราฟใหม่ก็ต่อเมื่อ `stats` เปลี่ยนแปลงเท่านั้น
  // ช่วยเพิ่มประสิทธิภาพ ป้องกันการคำนวณที่ไม่จำเป็นทุกครั้งที่ re-render
  const chartData = useMemo(() => {
    if (!stats) return { pieData: [], barData: [] };
    
    const pieData = [
      { name: "Admin", value: stats.admin },
      { name: "Manager", value: stats.manager },
      { name: "Expert", value: stats.expert },
      { name: "User", value: stats.user },
    ].filter(d => d.value > 0); // กรอง Role ที่ไม่มีผู้ใช้ออกไปจากกราฟ

    const barData = [
       { name: 'การประกวด', count: stats.totalContests },
       { name: 'ข่าวสาร', count: stats.totalNews },
    ];

    return { pieData, barData };
  }, [stats]);

  const PIE_COLORS = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6"];

  // --- ส่วนที่ 4: การแสดงผล (Render Logic) ---

  // แสดงหน้า Loading ขณะกำลังดึงข้อมูล
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoaderCircle className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  // แสดงข้อความ Error หากดึงข้อมูลไม่สำเร็จ
  if (!stats) {
    return <div className="text-center p-8 bg-red-50 text-red-700 rounded-lg">ไม่สามารถโหลดข้อมูลสถิติได้</div>;
  }

  // แสดงผล Dashboard เมื่อข้อมูลพร้อม
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">
        ยินดีต้อนรับ, แอดมิน {user?.profile?.first_name || user?.username}!
      </h1>

      {/* ส่วนของการ์ดแสดงข้อมูลสรุป */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users />} title="ผู้ใช้ทั้งหมด" value={stats.totalUsers} color="blue" />
        <StatCard icon={<UserPlus />} title="ผู้จัดการ" value={stats.manager} color="amber" />
        <StatCard icon={<UserPlus />} title="ผู้เชี่ยวชาญ" value={stats.expert} color="green" />
        <StatCard icon={<Newspaper />} title="กิจกรรมทั้งหมด" value={stats.totalContests + stats.totalNews} color="purple" />
      </div>

      {/* ส่วนของกราฟ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">สัดส่วนผู้ใช้ตามบทบาท</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartData.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {chartData.pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">ภาพรวมเนื้อหา</h2>
           <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.barData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="จำนวน" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ส่วนของตารางผู้ใช้ล่าสุด */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">ผู้ใช้ที่เข้าร่วมล่าสุด 5 คน</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ-นามสกุล</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">อีเมล</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">บทบาท</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentUsers.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{u.first_name} {u.last_name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm"><span className={`px-2 py-1 text-xs font-semibold rounded-full bg-${{admin:'red',manager:'amber',expert:'green',user:'blue'}[u.role]}-100 text-${{admin:'red',manager:'amber',expert:'green',user:'blue'}[u.role]}-800`}>{u.role}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- ส่วนที่ 5: Sub-component สำหรับ Stat Card ---
const StatCard = ({ icon, title, value, color }) => (
  <div className={`bg-white rounded-lg shadow p-5 border-l-4 border-${color}-500`}>
    <div className="flex items-center">
      <div className={`p-3 rounded-full bg-${color}-100 text-${color}-500`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  </div>
);

export default AdminDashboard;