import React, { useState, useEffect } from "react";
import { 
  FiCalendar, 
  FiUsers, 
  FiTrophy, 
  FiEye, 
  FiDownload,
  FiSearch,
  FiFilter,
  FiClock
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ActivityHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadHistoryData();
  }, []);

  useEffect(() => {
    filterHistoryData();
  }, [historyData, searchTerm, filterType, filterYear]);

  const loadHistoryData = async () => {
    try {
      setLoading(true);
      // TODO: เรียก API เพื่อดึงประวัติกิจกรรม
      // Dummy data
      const dummyHistory = [
        {
          id: 1,
          title: "ประกวดปลากัดพื้นบ้านภาคกลาง ครั้งที่ 1",
          description: "การประกวดปลากัดพื้นบ้านภาคกลางและเหนือ ประจำปี 2023",
          type: "contest",
          contestType: "ปลากัดพื้นบ้านภาคกลางและเหนือ",
          status: "completed",
          startDate: "2023-11-01",
          endDate: "2023-11-15",
          totalParticipants: 45,
          winner: {
            first: "นายสมชาย ใจดี",
            second: "นางสาวสมหญิง รักปลา", 
            third: "นายวิชาญ ปลาดี"
          },
          experts: ["ดร.สมชาย ใจดี", "อ.สมหญิง รักปลา", "คุณสมศักดิ์ ปลาดี"],
          createdAt: "2023-10-15",
          completedAt: "2023-11-16",
          views: 234,
          poster: "https://dummyimage.com/400x600/7c3aed/ffffff&text=History+1"
        },
        {
          id: 2,
          title: "ข่าวประชาสัมพันธ์การแข่งขันระดับภาค",
          description: "ข่าวประชาสัมพันธ์การแข่งขันปลากัดระดับภาคเหนือ",
          type: "news",
          status: "completed",
          createdAt: "2023-09-20",
          completedAt: "2023-10-20",
          views: 156,
          poster: "https://dummyimage.com/400x600/059669/ffffff&text=News+1"
        },
        {
          id: 3,
          title: "ประกวดปลากัดป่ารุ่นจิ๋ว ครั้งที่ 2",
          description: "การประกวดปลากัดป่ารุ่นจิ๋ว ความยาวไม่เกิน 1.2 นิ้ว",
          type: "contest",
          contestType: "ปลากัดป่ารุ่นจิ๋ว(รวมทุกประเภท ความยาวไม่เกิน 1.2 นิ้ว)",
          status: "completed",
          startDate: "2023-08-01",
          endDate: "2023-08-15",
          totalParticipants: 32,
          winner: {
            first: "นายประยุทธ์ ปลาเก่ง",
            second: "นางวิมล สวยงาม",
            third: "นายสุรชัย เก่งกาจ"
          },
          experts: ["ดร.วิชัย เก่งปลา", "อ.สุชาติ ปลาใหญ่", "คุณปรีชา ปลาดี"],
          createdAt: "2023-07-10",
          completedAt: "2023-08-16",
          views: 189,
          poster: "https://dummyimage.com/400x600/dc2626/ffffff&text=History+2"
        },
        {
          id: 4,
          title: "ประกวดปลากัดพื้นบ้านภาคอีสาน",
          description: "การประกวดปลากัดพื้นบ้านภาคอีสาน ประจำปี 2022",
          type: "contest",
          contestType: "ปลากัดพื้นบ้านภาคอีสาน",
          status: "completed",
          startDate: "2022-12-01",
          endDate: "2022-12-15",
          totalParticipants: 38,
          winner: {
            first: "นายสมปอง อีสานดี",
            second: "นางสาวมาลี ปลาสวย",
            third: "นายบุญมี ใจดี"
          },
          experts: ["อ.สมหญิง รักปลา", "ดร.สมชาย ใจดี", "คุณสมศักดิ์ ปลาดี"],
          createdAt: "2022-11-10",
          completedAt: "2022-12-16",
          views: 167,
          poster: "https://dummyimage.com/400x600/f59e0b/ffffff&text=History+3"
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 1000));
      setHistoryData(dummyHistory);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดประวัติกิจกรรม");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterHistoryData = () => {
    let filtered = historyData;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(activity => activity.type === filterType);
    }

    // Filter by year
    if (filterYear !== "all") {
      filtered = filtered.filter(activity => 
        new Date(activity.createdAt).getFullYear().toString() === filterYear
      );
    }

    setFilteredData(filtered);
  };

  const getAvailableYears = () => {
    const years = historyData.map(activity => 
      new Date(activity.createdAt).getFullYear()
    );
    return [...new Set(years)].sort((a, b) => b - a);
  };

  const handleViewDetail = (activity) => {
    setSelectedActivity(activity);
    setShowDetailModal(true);
  };

  const handleExportReport = async (activityId) => {
    try {
      // TODO: เรียก API เพื่อส่งออกรายงาน
      toast.info("กำลังสร้างรายงาน...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("ส่งออกรายงานสำเร็จ");
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการส่งออกรายงาน");
      console.error(error);
    }
  };

  const HistoryCard = ({ activity }) => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex">
        {/* รูปภาพ */}
        <div className="w-32 h-32 flex-shrink-0">
          <img
            src={activity.poster}
            alt={activity.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* ข้อมูล */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                {activity.title}
              </h3>
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  activity.type === "contest" 
                    ? "bg-orange-100 text-orange-800" 
                    : "bg-cyan-100 text-cyan-800"
                }`}>
                  {activity.type === "contest" ? "การประกวด" : "ข่าวสาร"}
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  เสร็จสิ้น
                </span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => handleViewDetail(activity)}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                title="ดูรายละเอียด"
              >
                <FiEye size={16} />
              </button>
              {activity.type === "contest" && (
                <button
                  onClick={() => handleExportReport(activity.id)}
                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors"
                  title="ส่งออกรายงาน"
                >
                  <FiDownload size={16} />
                </button>
              )}
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {activity.description}
          </p>

          {/* ข้อมูลสถิติ */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              {activity.type === "contest" && (
                <>
                  <span className="flex items-center">
                    <FiUsers className="mr-1" size={12} />
                    {activity.totalParticipants} คน
                  </span>
                  <span className="flex items-center">
                    <FiCalendar className="mr-1" size={12} />
                    {new Date(activity.startDate).toLocaleDateString('th-TH')}
                  </span>
                  {activity.winner && (
                    <span className="flex items-center">
                      <FiTrophy className="mr-1" size={12} />
                      ประกาศผลแล้ว
                    </span>
                  )}
                </>
              )}
              <span className="flex items-center">
                <FiEye className="mr-1" size={12} />
                {activity.views} ครั้ง
              </span>
            </div>
            <span className="flex items-center">
              <FiClock className="mr-1" size={12} />
              เสร็จสิ้น {new Date(activity.completedAt).toLocaleDateString('th-TH')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const DetailModal = () => {
    if (!selectedActivity || !showDetailModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">ประวัติกิจกรรม</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* รูปภาพ */}
              <div className="lg:col-span-1">
                <img
                  src={selectedActivity.poster}
                  alt={selectedActivity.title}
                  className="w-full rounded-lg shadow-md"
                />
              </div>

              {/* ข้อมูล */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedActivity.title}
                  </h3>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      selectedActivity.type === "contest" 
                        ? "bg-orange-100 text-orange-800" 
                        : "bg-cyan-100 text-cyan-800"
                    }`}>
                      {selectedActivity.type === "contest" ? "การประกวด" : "ข่าวสาร"}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      เสร็จสิ้น
                    </span>
                  </div>
                  <p className="text-gray-600">{selectedActivity.description}</p>
                </div>

                {selectedActivity.type === "contest" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ประเภทการประกวด
                        </label>
                        <p className="text-gray-900">{selectedActivity.contestType}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ผู้เข้าร่วมทั้งหมด
                        </label>
                        <p className="text-gray-900">{selectedActivity.totalParticipants} คน</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          วันที่เริ่ม
                        </label>
                        <p className="text-gray-900">
                          {new Date(selectedActivity.startDate).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          วันที่สิ้นสุด
                        </label>
                        <p className="text-gray-900">
                          {new Date(selectedActivity.endDate).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                    </div>

                    {/* ผู้ชนะ */}
                    {selectedActivity.winner && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ผู้ชนะการประกวด
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <span className="font-medium">🥇 อันดับ 1</span>
                            <span>{selectedActivity.winner.first}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <span className="font-medium">🥈 อันดับ 2</span>
                            <span>{selectedActivity.winner.second}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <span className="font-medium">🥉 อันดับ 3</span>
                            <span>{selectedActivity.winner.third}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ผู้เชี่ยวชาญ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ผู้เชี่ยวชาญ/กรรมการ
                      </label>
                      <div className="space-y-2">
                        {selectedActivity.experts?.map((expert, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <p className="font-medium">{expert}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      วันที่สร้าง
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedActivity.createdAt).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      วันที่เสร็จสิ้น
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedActivity.completedAt).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      จำนวนการดู
                    </label>
                    <p className="text-gray-900">{selectedActivity.views} ครั้ง</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                ปิด
              </button>
              {selectedActivity.type === "contest" && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleExportReport(selectedActivity.id);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <FiDownload className="mr-2" size={16} />
                  ส่งออกรายงาน
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <ToastContainer />
      
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ประวัติจัดกิจกรรม</h1>
        <p className="text-gray-600">ดูประวัติและข้อมูลสถิติของกิจกรรมที่เคยจัดทั้งหมด</p>
      </div>

      {/* สถิติรวม */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">กิจกรรมทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{historyData.length}</p>
            </div>
            <FiCalendar className="text-blue-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">การประกวด</p>
              <p className="text-2xl font-bold text-gray-900">
                {historyData.filter(a => a.type === "contest").length}
              </p>
            </div>
            <FiTrophy className="text-green-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ผู้เข้าร่วมรวม</p>
              <p className="text-2xl font-bold text-gray-900">
                {historyData.reduce((sum, a) => sum + (a.totalParticipants || 0), 0)}
              </p>
            </div>
            <FiUsers className="text-purple-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">การดูรวม</p>
              <p className="text-2xl font-bold text-gray-900">
                {historyData.reduce((sum, a) => sum + (a.views || 0), 0)}
              </p>
            </div>
            <FiEye className="text-orange-600" size={24} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* ค้นหา */}
          <div className="md:col-span-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="ค้นหาประวัติกิจกรรม..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* ประเภท */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">ทุกประเภท</option>
              <option value="contest">การประกวด</option>
              <option value="news">ข่าวสาร</option>
            </select>
          </div>

          {/* ปี */}
          <div>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">ทุกปี</option>
              {getAvailableYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              ประวัติกิจกรรม ({filteredData.length})
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FiFilter size={16} />
              <span>กรองแล้ว</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-2 text-gray-600">กำลังโหลด...</span>
            </div>
          ) : filteredData.length > 0 ? (
            <div className="space-y-4">
              {filteredData.map(activity => (
                <HistoryCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">ไม่พบประวัติกิจกรรมที่ตรงกับเงื่อนไข</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <DetailModal />
    </div>
  );
};

export default ActivityHistory;