import React, { useState, useEffect } from "react";
import { FiEdit, FiEye, FiTrash2, FiUsers, FiCalendar, FiSearch, FiFilter } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditActivity = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, searchTerm, filterType, filterStatus]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      // TODO: เรียก API เพื่อดึงข้อมูลกิจกรรม
      // Dummy data
      const dummyActivities = [
        {
          id: 1,
          title: "ประกวดปลากัดพื้นบ้านภาคกลางและเหนือ",
          description: "การประกวดปลากัดพื้นบ้านประจำปี 2024",
          type: "contest",
          contestType: "ปลากัดพื้นบ้านภาคกลางและเหนือ",
          status: "active",
          startDate: "2024-02-01",
          endDate: "2024-02-15",
          maxParticipants: 50,
          currentParticipants: 25,
          poster: "https://dummyimage.com/400x600/7c3aed/ffffff&text=Contest+1",
          experts: [
            { id: 1, name: "ดร.สมชาย ใจดี", specialty: "ปลากัดพื้นบ้านภาคกลางและเหนือ", confirmed: true },
            { id: 2, name: "อ.สมหญิง รักปลา", specialty: "ปลากัดพื้นบ้านภาคกลางและเหนือ", confirmed: true },
            { id: 3, name: "คุณสมศักดิ์ ปลาดี", specialty: "ปลากัดพื้นบ้านภาคกลางและเหนือ", confirmed: false }
          ],
          createdAt: "2024-01-15",
          views: 150
        },
        {
          id: 2,
          title: "ข่าวการแข่งขันปลากัดระดับชาติ",
          description: "ข่าวประชาสัมพันธ์การแข่งขันปลากัดระดับชาติ ประจำปี 2024",
          type: "news",
          status: "published",
          poster: "https://dummyimage.com/400x600/059669/ffffff&text=News+1",
          createdAt: "2024-01-14",
          views: 89
        },
        {
          id: 3,
          title: "ประกวดปลากัดป่ารุ่นจิ๋ว",
          description: "การประกวดปลากัดป่ารุ่นจิ๋ว ความยาวไม่เกิน 1.2 นิ้ว",
          type: "contest",
          contestType: "ปลากัดป่ารุ่นจิ๋ว(รวมทุกประเภท ความยาวไม่เกิน 1.2 นิ้ว)",
          status: "draft",
          startDate: "2024-03-01",
          endDate: "2024-03-15",
          maxParticipants: 30,
          currentParticipants: 0,
          poster: "https://dummyimage.com/400x600/dc2626/ffffff&text=Contest+2",
          experts: [],
          createdAt: "2024-01-20",
          views: 45
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 1000));
      setActivities(dummyActivities);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = activities;

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

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(activity => activity.status === filterStatus);
    }

    setFilteredActivities(filtered);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", text: "ดำเนินการ" },
      published: { color: "bg-blue-100 text-blue-800", text: "เผยแพร่" },
      draft: { color: "bg-gray-100 text-gray-800", text: "แบบร่าง" },
      completed: { color: "bg-purple-100 text-purple-800", text: "เสร็จสิ้น" },
      cancelled: { color: "bg-red-100 text-red-800", text: "ยกเลิก" }
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${
        type === "contest" 
          ? "bg-orange-100 text-orange-800" 
          : "bg-cyan-100 text-cyan-800"
      }`}>
        {type === "contest" ? "การประกวด" : "ข่าวสาร"}
      </span>
    );
  };

  const handleViewDetail = (activity) => {
    setSelectedActivity(activity);
    setShowDetailModal(true);
  };

  const handleEdit = (activityId) => {
    // TODO: Navigate to edit form or open edit modal
    toast.info(`แก้ไขกิจกรรม ID: ${activityId}`);
  };

  const handleDelete = async (activityId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะลบกิจกรรมนี้?")) {
      try {
        // TODO: เรียก API ลบกิจกรรม
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setActivities(prev => prev.filter(activity => activity.id !== activityId));
        toast.success("ลบกิจกรรมสำเร็จ");
      } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการลบกิจกรรม");
        console.error(error);
      }
    }
  };

  const handleExpertAction = async (activityId, expertId, action) => {
    try {
      // TODO: เรียก API เพื่อจัดการกรรมการ
      if (action === "remove") {
        // ตรวจสอบว่ากรรมการยืนยันแล้วหรือไม่
        const activity = activities.find(a => a.id === activityId);
        const expert = activity.experts.find(e => e.id === expertId);
        
        if (expert.confirmed) {
          toast.warning("ต้องให้กรรมการยืนยันการปลดตำแหน่งก่อน");
          return;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("ดำเนินการสำเร็จ");
      
      // อัพเดทข้อมูล
      loadActivities();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการดำเนินการ");
      console.error(error);
    }
  };

  const ActivityCard = ({ activity }) => (
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
                {getTypeBadge(activity.type)}
                {getStatusBadge(activity.status)}
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
              <button
                onClick={() => handleEdit(activity.id)}
                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors"
                title="แก้ไข"
              >
                <FiEdit size={16} />
              </button>
              <button
                onClick={() => handleDelete(activity.id)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                title="ลบ"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {activity.description}
          </p>

          {/* ข้อมูลเพิ่มเติม */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              {activity.type === "contest" && (
                <>
                  <span className="flex items-center">
                    <FiUsers className="mr-1" size={12} />
                    {activity.currentParticipants}/{activity.maxParticipants || "∞"} คน
                  </span>
                  <span className="flex items-center">
                    <FiCalendar className="mr-1" size={12} />
                    {new Date(activity.startDate).toLocaleDateString('th-TH')}
                  </span>
                </>
              )}
              {activity.type === "news" && (
                <span className="flex items-center">
                  <FiEye className="mr-1" size={12} />
                  {activity.views} ครั้ง
                </span>
              )}
            </div>
            <span>
              สร้างเมื่อ {new Date(activity.createdAt).toLocaleDateString('th-TH')}
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
              <h2 className="text-xl font-bold text-gray-900">รายละเอียดกิจกรรม</h2>
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
                    {getTypeBadge(selectedActivity.type)}
                    {getStatusBadge(selectedActivity.status)}
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
                          ผู้เข้าร่วม
                        </label>
                        <p className="text-gray-900">
                          {selectedActivity.currentParticipants}/{selectedActivity.maxParticipants || "ไม่จำกัด"} คน
                        </p>
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

                    {/* ผู้เชี่ยวชาญ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ผู้เชี่ยวชาญ/กรรมการ
                      </label>
                      <div className="space-y-2">
                        {selectedActivity.experts?.map(expert => (
                          <div key={expert.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{expert.name}</p>
                              <p className="text-sm text-gray-600">{expert.specialty}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                expert.confirmed 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {expert.confirmed ? "ยืนยันแล้ว" : "รอการยืนยัน"}
                              </span>
                              <button
                                onClick={() => handleExpertAction(selectedActivity.id, expert.id, "remove")}
                                className="text-red-600 hover:text-red-800 text-sm"
                                disabled={expert.confirmed}
                              >
                                ปลด
                              </button>
                            </div>
                          </div>
                        )) || <p className="text-gray-500">ยังไม่มีผู้เชี่ยวชาญ</p>}
                      </div>
                    </div>
                  </>
                )}

                {selectedActivity.type === "news" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      จำนวนการดู
                    </label>
                    <p className="text-gray-900">{selectedActivity.views} ครั้ง</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    วันที่สร้าง
                  </label>
                  <p className="text-gray-900">
                    {new Date(selectedActivity.createdAt).toLocaleDateString('th-TH')}
                  </p>
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
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEdit(selectedActivity.id);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                แก้ไข
              </button>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">แก้ไขข้อมูลกิจกรรม</h1>
        <p className="text-gray-600">จัดการและแก้ไขข้อมูลกิจกรรมทั้งหมด</p>
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
                placeholder="ค้นหากิจกรรม..."
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

          {/* สถานะ */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="active">ดำเนินการ</option>
              <option value="published">เผยแพร่</option>
              <option value="draft">แบบร่าง</option>
              <option value="completed">เสร็จสิ้น</option>
              <option value="cancelled">ยกเลิก</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              กิจกรรมทั้งหมด ({filteredActivities.length})
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
          ) : filteredActivities.length > 0 ? (
            <div className="space-y-4">
              {filteredActivities.map(activity => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">ไม่พบกิจกรรมที่ตรงกับเงื่อนไข</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <DetailModal />
    </div>
  );
};

export default EditActivity;