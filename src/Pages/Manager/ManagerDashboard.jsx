// D:\ProJectFinal\Lasts\my-project\src\Pages\Manager\ManagerDashboard.jsx (ฉบับแก้ไขที่สมบูรณ์)

import React, { useState, useEffect, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Legend, Tooltip, Title } from "chart.js";
import { toast } from "react-toastify";
import { Bell, CheckSquare, Clock, Edit3, LoaderCircle, Package, Trophy, XSquare, XCircle } from 'lucide-react';
import "react-toastify/dist/ReactToastify.css";

// 1. [แก้ไข] เปลี่ยนจาก useUserProfile เป็น useAuth
import { useAuth } from "../../context/AuthContext";
import { getDashboardStats } from "../../services/managerService";

// ลงทะเบียน components ที่จำเป็นสำหรับ ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Legend, Tooltip, Title);

const ManagerDashboard = () => {
  // 2. [แก้ไข] ดึงข้อมูล user และสถานะ loading มาจาก useAuth
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // (ข้อมูลจำลอง รอการเชื่อมต่อ API)
  const [notifications, setNotifications] = useState([
    { id: 1, message: "การประกวด 'สุดยอดปลากัด' ได้เริ่มขึ้นแล้ว" },
    { id: 2, message: "กรรมการ 'สมศักดิ์' ตอบรับคำเชิญเข้าร่วมแล้ว" },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError("ไม่สามารถดึงข้อมูลแดชบอร์ดได้: " + err.message);
        toast.error("ไม่สามารถดึงข้อมูลแดชบอร์ดได้: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const chartData = useMemo(() => {
    if (!stats) return { barData: { labels: [], datasets: [] } };
    const labels = ["ร่าง", "ดำเนินการ", "ปิดรับสมัคร", "ตัดสิน", "ประกาศผล"];
    const dataPoints = [stats.draftContests, stats.ongoingContests, stats.closedContests, stats.judgingContests, stats.finishedContests];
    const backgroundColors = ["#A0AEC0", "#4299E1", "#F56565", "#6B46C1", "#48BB78"];
    return {
      barData: {
        labels,
        datasets: [{ label: "จำนวนการประกวด", data: dataPoints, backgroundColor: backgroundColors }]
      }
    };
  }, [stats]);

  const statCards = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "ทั้งหมด", value: stats.totalContests, icon: <Package />, color: "blue" },
      { label: "ร่าง", value: stats.draftContests, icon: <Edit3 />, color: "gray" },
      { label: "ดำเนินการ", value: stats.ongoingContests, icon: <Clock />, color: "cyan" },
      { label: "ปิดรับสมัคร", value: stats.closedContests, icon: <XSquare />, color: "red" },
      { label: "ตัดสิน", value: stats.judgingContests, icon: <Trophy />, color: "purple" },
      { label: "ประกาศผล", value: stats.finishedContests, icon: <CheckSquare />, color: "green" },
    ];
  }, [stats]);


  // 3. [แก้ไข] รวมการเช็ค Loading ของ Auth และของหน้านี้เข้าด้วยกัน
  if (authLoading || loading) {
    return (
      <div className="flex w-full items-center justify-center p-10">
        <LoaderCircle className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  // 4. [ลบ] เงื่อนไขการเช็ค Role และการ Import ManagerMenu ที่ไม่จำเป็นออก
  // เนื่องจาก ProtectedRoute และ ManagerLayout จัดการให้แล้ว

  if (error) {
    return <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg">{error}</div>
  }

  return (
    // 5. [ปรับปรุง] Return เฉพาะเนื้อหาของหน้า Dashboard
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        ยินดีต้อนรับ, {user?.profile?.first_name || 'ผู้จัดการ'}!
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className={`p-4 rounded-lg shadow-md bg-white border-l-4 border-${stat.color}-500`}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-md font-semibold text-gray-500 uppercase">{stat.label}</h3>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value ?? 0}</p>
              </div>
              <div className={`text-${stat.color}-500 p-3 rounded-full bg-${stat.color}-100`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">ภาพรวมสถานะการประกวด</h2>
          {stats ? <Bar data={chartData.barData} options={{ responsive: true, plugins: { legend: { display: false } } }} /> : <p className="text-center py-10 text-gray-500">ไม่มีข้อมูลสถิติ</p>}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center"><Bell size={20} className="mr-2 text-purple-600" /> การแจ้งเตือน</h2>
          <ul className="space-y-2 max-h-80 overflow-y-auto pr-2">
            {notifications.length > 0 ? notifications.map((n) => (
              <li key={n.id} className="bg-gray-50 p-3 rounded-md border-l-4 border-purple-500 flex justify-between items-center text-sm">
                <span className="flex-grow">{n.message}</span>
                <button className="text-gray-400 hover:text-red-500 ml-2 flex-shrink-0" onClick={() => handleDeleteNotification(n.id)}>
                  <XCircle size={16} />
                </button>
              </li>
            )) : <p className="text-center text-gray-500 py-4">ไม่มีการแจ้งเตือนใหม่</p>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;