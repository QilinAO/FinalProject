// ======================================================================
// File: src/Pages/Admin/AdminDashboard.jsx
// หน้าที่: แสดงผลหน้า Dashboard สรุปข้อมูลภาพรวมสำหรับผู้ดูแลระบบ
// ======================================================================

import React, { useEffect, useState, useMemo } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Users, UserPlus, Newspaper, LoaderCircle, Shield, UserCog, UserCheck } from "lucide-react";
import { toast } from 'react-toastify';
import { useAuth } from "../../context/AuthContext";
import { getDashboardStats } from "../../services/adminService";

// --- Sub-components for UI Sections ---

const DashboardHeader = ({ name }) => (
  <h1 className="text-3xl font-bold text-gray-800">
    ยินดีต้อนรับ, แอดมิน {name}!
  </h1>
);

const StatCard = ({ icon, title, value, color }) => (
  <div className={`bg-white rounded-lg shadow p-5 border-l-4 border-${color}-500`}>
    <div className="flex items-center">
      <div className={`p-3 rounded-full bg-${color}-100 text-${color}-500`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value ?? 0}</h3>
      </div>
    </div>
  </div>
);

const StatCardsGrid = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <StatCard icon={<Users size={24} />} title="ผู้ใช้ทั้งหมด" value={stats.totalUsers} color="blue" />
    <StatCard icon={<Shield size={24} />} title="Admins" value={stats.admin} color="red" />
    <StatCard icon={<UserCog size={24} />} title="Managers" value={stats.manager} color="amber" />
    <StatCard icon={<UserCheck size={24} />} title="Experts" value={stats.expert} color="green" />
  </div>
);

const UserRolePieChart = ({ data }) => {
  const PIE_COLORS = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6"];
  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">สัดส่วนผู้ใช้ตามบทบาท</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const ContentBarChart = ({ data }) => (
  <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">ภาพรวมเนื้อหา</h2>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" name="จำนวน" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const RecentUsersTable = ({ users }) => {
  const roleColors = {
    admin: 'red',
    manager: 'amber',
    expert: 'green',
    user: 'blue'
  };

  return (
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
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{u.first_name} {u.last_name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-${roleColors[u.role]}-100 text-${roleColors[u.role]}-800`}>
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LoadingScreen = () => (
  <div className="flex justify-center items-center h-96">
    <LoaderCircle className="animate-spin text-blue-500" size={48} />
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="text-center p-8 bg-red-50 text-red-700 rounded-lg">{message}</div>
);

// --- Main Component ---

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getDashboardStats();
        setStats(response.data);
      } catch (err) {
        const errorMessage = "ไม่สามารถโหลดข้อมูลแดชบอร์ดได้: " + err.message;
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const chartData = useMemo(() => {
    if (!stats) return { pieData: [], barData: [] };
    
    const pieData = [
      { name: "Admin", value: stats.admin },
      { name: "Manager", value: stats.manager },
      { name: "Expert", value: stats.expert },
      { name: "User", value: stats.user },
    ].filter(d => d.value > 0);

    const barData = [
       { name: 'การประกวด', count: stats.totalContests },
       { name: 'ข่าวสาร', count: stats.totalNews },
    ];

    return { pieData, barData };
  }, [stats]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!stats) {
    return <ErrorDisplay message="ไม่พบข้อมูลสถิติ" />;
  }

  return (
    <div className="space-y-8">
      <DashboardHeader name={user?.profile?.first_name || user?.username} />
      <StatCardsGrid stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <UserRolePieChart data={chartData.pieData} />
        <ContentBarChart data={chartData.barData} />
      </div>
      <RecentUsersTable users={stats.recentUsers} />
    </div>
  );
};

export default AdminDashboard;