// D:\ProJectFinal\Lasts\my-project\src\Pages\Manager\ManagerDashboard.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Legend, Tooltip, Title } from "chart.js";
import { toast } from "react-toastify";
import { Bell, CheckSquare, Clock, Edit3, LoaderCircle, Package, Trophy, XSquare, XCircle } from 'lucide-react';
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from "../../context/AuthContext";
import { getDashboardStats } from "../../services/managerService";
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from "../../services/notificationService";

// ลงทะเบียน components ที่จำเป็นสำหรับ ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Legend, Tooltip, Title);

// แก้ปัญหา Tailwind dynamic classes โดยทำเป็น map ตายตัว
const colorClassMap = {
  blue:   { border: "border-blue-500",   text: "text-blue-500",   bg: "bg-blue-100"   },
  gray:   { border: "border-gray-500",   text: "text-gray-500",   bg: "bg-gray-100"   },
  cyan:   { border: "border-cyan-500",   text: "text-cyan-500",   bg: "bg-cyan-100"   },
  red:    { border: "border-red-500",    text: "text-red-500",    bg: "bg-red-100"    },
  purple: { border: "border-purple-500", text: "text-purple-500", bg: "bg-purple-100" },
  green:  { border: "border-green-500",  text: "text-green-500",  bg: "bg-green-100"  },
};

const ManagerDashboard = () => {
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // แจ้งเตือนจริงจากแบ็กเอนด์
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  // โหลดสถิติ dashboard
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDashboardStats(); // service ฝั่ง FE คืน data ตรง ๆ อยู่แล้ว
        setStats(data);
      } catch (err) {
        setError("ไม่สามารถดึงข้อมูลแดชบอร์ดได้: " + (err?.message || "ไม่ทราบสาเหตุ"));
        toast.error("ไม่สามารถดึงข้อมูลแดชบอร์ดได้: " + (err?.message || "ไม่ทราบสาเหตุ"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // โหลดแจ้งเตือนจริง
  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const list = await getMyNotifications({ unreadOnly: false, limit: 50 });
      setNotifications(Array.isArray(list) ? list : []);
    } catch (e) {
      toast.error(e?.message || "โหลดการแจ้งเตือนล้มเหลว");
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ทำเป็นอ่านแล้วรายการเดียว
  const handleDeleteNotification = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      toast.error(e?.message || "อัปเดตการแจ้งเตือนล้มเหลว");
    }
  };

  // ทำเป็นอ่านทั้งหมด
  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      // จะเลือกซ่อนทั้งหมด หรือจะคงไว้แต่ติด is_read ก็ได้
      // ที่นี่เลือก "ซ่อนทั้งหมด" ให้ลิสต์ว่างไปเลย
      setNotifications([]);
      toast.success("ทำเป็นอ่านทั้งหมดแล้ว");
    } catch (e) {
      toast.error(e?.message || "อัปเดตการแจ้งเตือนทั้งหมดล้มเหลว");
    }
  };

  const chartData = useMemo(() => {
    if (!stats) return { barData: { labels: [], datasets: [] } };
    const labels = ["ร่าง", "ดำเนินการ", "ปิดรับสมัคร", "ตัดสิน", "ประกาศผล"];
    const dataPoints = [
      stats.draftContests,
      stats.ongoingContests,
      stats.closedContests,
      stats.judgingContests,
      stats.finishedContests
    ];
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
      { label: "ทั้งหมด",    value: stats.totalContests,    icon: <Package />,  color: "blue"   },
      { label: "ร่าง",       value: stats.draftContests,    icon: <Edit3 />,    color: "gray"   },
      { label: "ดำเนินการ",  value: stats.ongoingContests,  icon: <Clock />,    color: "cyan"   },
      { label: "ปิดรับสมัคร", value: stats.closedContests,   icon: <XSquare />,  color: "red"    },
      { label: "ตัดสิน",     value: stats.judgingContests,  icon: <Trophy />,   color: "purple" },
      { label: "ประกาศผล",   value: stats.finishedContests, icon: <CheckSquare />, color: "green"  },
    ];
  }, [stats]);

  if (authLoading || loading) {
    return (
      <div className="flex w-full items-center justify-center p-10">
        <LoaderCircle className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        ยินดีต้อนรับ, {user?.profile?.first_name || 'ผู้จัดการ'}!
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {statCards.map((stat, index) => {
          const cc = colorClassMap[stat.color] || colorClassMap.blue;
          return (
            <div
              key={index}
              className={`p-4 rounded-lg shadow-md bg-white border-l-4 ${cc.border}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h3 className="text-md font-semibold text-gray-500 uppercase">{stat.label}</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value ?? 0}</p>
                </div>
                <div className={`${cc.text} p-3 rounded-full ${cc.bg}`}>{stat.icon}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">ภาพรวมสถานะการประกวด</h2>
          {stats ? (
            <Bar
              data={chartData.barData}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          ) : (
            <p className="text-center py-10 text-gray-500">ไม่มีข้อมูลสถิติ</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Bell size={20} className="mr-2 text-purple-600" /> การแจ้งเตือน
            </h2>
            <button
              onClick={handleMarkAll}
              className="ml-auto text-sm text-purple-600 hover:underline disabled:text-gray-300"
              disabled={notifLoading || notifications.length === 0}
            >
              ทำเป็นอ่านทั้งหมด
            </button>
          </div>

          <ul className="space-y-2 max-h-80 overflow-y-auto pr-2">
            {notifLoading ? (
              <div className="flex items-center justify-center py-6">
                <LoaderCircle className="animate-spin text-purple-600" size={24} />
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((n) => (
                <li
                  key={n.id}
                  className={`bg-gray-50 p-3 rounded-md border-l-4 border-purple-500 flex justify-between items-center text-sm`}
                >
                  <span className="flex-grow">
                    {n.message}
                    {n.link_to && (
                      <a
                        href={n.link_to}
                        className="ml-2 text-blue-600 hover:underline"
                      >
                        ดูรายละเอียด
                      </a>
                    )}
                  </span>
                  <button
                    className="text-gray-400 hover:text-red-500 ml-2 flex-shrink-0"
                    onClick={() => handleDeleteNotification(n.id)}
                    title="ทำเป็นอ่านแล้ว"
                  >
                    <XCircle size={16} />
                  </button>
                </li>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">ไม่มีการแจ้งเตือนใหม่</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
