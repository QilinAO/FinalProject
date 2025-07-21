import React, { useState, useEffect } from "react";
import { 
  FiActivity, 
  FiUsers, 
  FiTrophy, 
  FiCalendar,
  FiTrendingUp,
  FiEye,
  FiBarChart3
} from "react-icons/fi";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalActivities: 0,
    activeContests: 0,
    totalParticipants: 0,
    completedContests: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    // TODO: เรียก API เพื่อดึงข้อมูลสถิติ
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Dummy data - จะเปลี่ยนเป็น API call จริงภายหลัง
      setStats({
        totalActivities: 15,
        activeContests: 3,
        totalParticipants: 127,
        completedContests: 12
      });

      setRecentActivities([
        {
          id: 1,
          title: "ประกวดปลากัดพื้นบ้านภาคกลาง",
          type: "contest",
          participants: 25,
          status: "active",
          createdAt: "2024-01-15"
        },
        {
          id: 2,
          title: "ข่าวการแข่งขันปลากัดระดับชาติ",
          type: "news",
          views: 150,
          status: "published",
          createdAt: "2024-01-14"
        }
      ]);

      setUpcomingEvents([
        {
          id: 1,
          title: "ประกวดปลากัดป่าพัฒนาสีสัน",
          startDate: "2024-02-01",
          endDate: "2024-02-15",
          participants: 8
        }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "purple" }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`text-${color}-600`} size={24} />
        </div>
      </div>
    </div>
  );

  const ActivityCard = ({ activity }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900 truncate">{activity.title}</h4>
        <span className={`px-2 py-1 text-xs rounded-full ${
          activity.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : activity.status === 'published'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {activity.status === 'active' ? 'ดำเนินการ' : 
           activity.status === 'published' ? 'เผยแพร่' : 'เสร็จสิ้น'}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span className="flex items-center">
          {activity.type === 'contest' ? (
            <>
              <FiUsers className="mr-1" size={14} />
              {activity.participants} คน
            </>
          ) : (
            <>
              <FiEye className="mr-1" size={14} />
              {activity.views} ครั้ง
            </>
          )}
        </span>
        <span>{new Date(activity.createdAt).toLocaleDateString('th-TH')}</span>
      </div>
    </div>
  );

  const EventCard = ({ event }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h4 className="font-medium text-gray-900 mb-2">{event.title}</h4>
      <div className="space-y-1 text-sm text-gray-600">
        <div className="flex items-center">
          <FiCalendar className="mr-2" size={14} />
          <span>
            {new Date(event.startDate).toLocaleDateString('th-TH')} - {' '}
            {new Date(event.endDate).toLocaleDateString('th-TH')}
          </span>
        </div>
        <div className="flex items-center">
          <FiUsers className="mr-2" size={14} />
          <span>{event.participants} คนสมัครแล้ว</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">แดชบอร์ดผู้จัดการประกวด</h1>
        <p className="text-gray-600">ภาพรวมการจัดการกิจกรรมและการประกวดปลากัด</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FiActivity}
          title="กิจกรรมทั้งหมด"
          value={stats.totalActivities}
          subtitle="กิจกรรมที่จัดทั้งหมด"
        />
        <StatCard
          icon={FiTrophy}
          title="การประกวดที่ดำเนินการ"
          value={stats.activeContests}
          subtitle="กำลังรับสมัครหรือแข่งขัน"
          color="green"
        />
        <StatCard
          icon={FiUsers}
          title="ผู้เข้าร่วมทั้งหมด"
          value={stats.totalParticipants}
          subtitle="ในการประกวดทั้งหมด"
          color="blue"
        />
        <StatCard
          icon={FiBarChart3}
          title="การประกวดที่เสร็จสิ้น"
          value={stats.completedContests}
          subtitle="ได้ประกาศผลแล้ว"
          color="orange"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* รายงานการจัดกิจกรรม */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">รายงานการจัดกิจกรรม</h2>
              <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                ดูทั้งหมด
              </button>
            </div>
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map(activity => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">ยังไม่มีกิจกรรม</p>
              )}
            </div>
          </div>
        </div>

        {/* รายงานการประกวดเบื้องต้น & รายงานบุคคล */}
        <div className="space-y-6">
          {/* รายงานการประกวดเบื้องต้น */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">รายงานการประกวดเบื้องต้น</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ประกวดพื้นบ้านภาคกลาง</span>
                <span className="font-medium">15 คน</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ประกวดป่าพัฒนาสีสัน</span>
                <span className="font-medium">8 คน</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ประกวดรุ่นจิ๋ว</span>
                <span className="font-medium">12 คน</span>
              </div>
            </div>
          </div>

          {/* กิจกรรมที่จะมาถึง */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">กิจกรรมที่จะมาถึง</h2>
            <div className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">ไม่มีกิจกรรมที่จะมาถึง</p>
              )}
            </div>
          </div>

          {/* รายงานบุคคลในการเข้าประกวดเบื้องต้น */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">สรุปผู้เข้าร่วม</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ผู้เข้าร่วมใหม่วันนี้</span>
                <span className="font-medium text-green-600">+5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ผู้เข้าร่วมสัปดาห์นี้</span>
                <span className="font-medium text-blue-600">23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">อัตราการเข้าร่วม</span>
                <span className="font-medium text-purple-600">85%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;