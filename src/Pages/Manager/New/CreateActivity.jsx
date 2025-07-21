import React, { useState, useRef } from "react";
import { FiUpload, FiCalendar, FiUsers, FiSave, FiX } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateActivity = () => {
  const [activityType, setActivityType] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contestType: "",
    startDate: "",
    endDate: "",
    maxParticipants: "",
    selectedExperts: []
  });
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // ประเภทปลากัด 8 ประเภทตามที่ระบุ
  const fishTypes = [
    "ปลากัดพื้นบ้านภาคกลางและเหนือ",
    "ปลากัดพื้นบ้านภาคอีสาน", 
    "ปลากัดพื้นบ้านภาคใต้",
    "ปลากัดพื้นบ้านมหาชัย",
    "ปลากัดพื้นบ้านภาคตะวันออก",
    "ปลากัดพื้นบ้านอีสานหางลาย",
    "ปลากัดป่าพัฒนาสีสัน(รวมทุกประเภท)",
    "ปลากัดป่ารุ่นจิ๋ว(รวมทุกประเภท ความยาวไม่เกิน 1.2 นิ้ว)"
  ];

  // ข้อมูลผู้เชี่ยวชาญ (ตัวอย่าง - จะดึงจาก API จริง)
  const experts = [
    { id: 1, name: "ดร.สมชาย ใจดี", specialty: "ปลากัดพื้นบ้านภาคกลางและเหนือ" },
    { id: 2, name: "อ.สมหญิง รักปลา", specialty: "ปลากัดพื้นบ้านภาคอีสาน" },
    { id: 3, name: "คุณสมศักดิ์ ปลาดี", specialty: "ปลากัดป่าพัฒนาสีสัน(รวมทุกประเภท)" },
    { id: 4, name: "ดร.วิชัย เก่งปลา", specialty: "ปลากัดพื้นบ้านภาคใต้" },
    { id: 5, name: "อ.สุชาติ ปลาใหญ่", specialty: "ปลากัดป่ารุ่นจิ๋ว(รวมทุกประเภท ความยาวไม่เกิน 1.2 นิ้ว)" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePosterUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        toast.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPEG, PNG)");
        return;
      }

      if (file.size > maxSize) {
        toast.error("ขนาดไฟล์เกิน 5MB");
        return;
      }

      setPosterFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPosterPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExpertSelection = (expertId) => {
    const expert = experts.find(e => e.id === expertId);
    
    // ตรวจสอบว่าผู้เชี่ยวชาญมีความถนัดตรงกับประเภทการประกวดหรือไม่
    if (formData.contestType && expert.specialty !== formData.contestType) {
      toast.warning(`${expert.name} ไม่มีความถนัดในประเภท ${formData.contestType}`);
      return;
    }

    setFormData(prev => {
      const currentExperts = prev.selectedExperts;
      const isAlreadySelected = currentExperts.some(e => e.id === expertId);
      
      if (isAlreadySelected) {
        // Remove expert
        return {
          ...prev,
          selectedExperts: currentExperts.filter(e => e.id !== expertId)
        };
      } else {
        // Add expert (max 3)
        if (currentExperts.length >= 3) {
          toast.warning("สามารถเลือกผู้เชี่ยวชาญได้สูงสุด 3 คน");
          return prev;
        }
        return {
          ...prev,
          selectedExperts: [...currentExperts, expert]
        };
      }
    });
  };

  const getAvailableExperts = () => {
    if (!formData.contestType) return [];
    return experts.filter(expert => expert.specialty === formData.contestType);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!activityType) {
      toast.error("กรุณาเลือกประเภทกิจกรรม");
      return;
    }

    if (!formData.title || !formData.description) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (!posterFile) {
      toast.error("กรุณาอัพโหลดรูปภาพโปสเตอร์");
      return;
    }

    if (activityType === "contest") {
      if (!formData.contestType || !formData.startDate || !formData.endDate) {
        toast.error("กรุณากรอกข้อมูลการประกวดให้ครบถ้วน");
        return;
      }

      if (formData.selectedExperts.length !== 3) {
        toast.error("กรุณาเลือกผู้เชี่ยวชาญ 3 คน");
        return;
      }

      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        toast.error("วันที่เริ่มต้องน้อยกว่าวันที่สิ้นสุด");
        return;
      }
    }

    setLoading(true);
    try {
      // TODO: ส่งข้อมูลไป API
      const activityData = {
        type: activityType,
        title: formData.title,
        description: formData.description,
        poster: posterFile,
        ...(activityType === "contest" && {
          contestType: formData.contestType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          maxParticipants: formData.maxParticipants || null,
          experts: formData.selectedExperts
        })
      };

      console.log("Activity Data:", activityData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("บันทึกกิจกรรมสำเร็จ!");
      
      // Reset form
      setActivityType("");
      setFormData({
        title: "",
        description: "",
        contestType: "",
        startDate: "",
        endDate: "",
        maxParticipants: "",
        selectedExperts: []
      });
      setPosterFile(null);
      setPosterPreview(null);
      
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการบันทึกกิจกรรม");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setActivityType("");
    setFormData({
      title: "",
      description: "",
      contestType: "",
      startDate: "",
      endDate: "",
      maxParticipants: "",
      selectedExperts: []
    });
    setPosterFile(null);
    setPosterPreview(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ToastContainer />
      
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">จัดการกิจกรรม</h1>
        <p className="text-gray-600">สร้างกิจกรรมข่าวสารหรือการประกวดปลากัด</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* เลือกประเภทกิจกรรม */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">เลือกประเภทกิจกรรม</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setActivityType("news")}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                activityType === "news"
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-300 hover:border-purple-300"
              }`}
            >
              <h3 className="font-medium">กิจกรรมข่าวสาร</h3>
              <p className="text-sm text-gray-600 mt-1">เผยแพร่ข่าวสารและข้อมูลเกี่ยวกับปลากัด</p>
            </button>
            
            <button
              type="button"
              onClick={() => setActivityType("contest")}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                activityType === "contest"
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-300 hover:border-purple-300"
              }`}
            >
              <h3 className="font-medium">กิจกรรมการประกวด</h3>
              <p className="text-sm text-gray-600 mt-1">จัดการประกวดปลากัดต่างๆ</p>
            </button>
          </div>
        </div>

        {/* ข้อมูลพื้นฐาน */}
        {activityType && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลพื้นฐาน</h2>
            
            {/* อัพโหลดโปสเตอร์ */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รูปภาพโปสเตอร์ *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {posterPreview ? (
                  <div className="text-center">
                    <img
                      src={posterPreview}
                      alt="Preview"
                      className="mx-auto h-48 w-auto rounded-lg shadow-md mb-4"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPosterFile(null);
                        setPosterPreview(null);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      ลบรูปภาพ
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                    >
                      เลือกไฟล์รูปภาพ
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePosterUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* ชื่อโครงการ */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อโครงการ *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="กรอกชื่อโครงการ"
                required
              />
            </div>

            {/* รายละเอียดโครงการ */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รายละเอียดโครงการ *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="กรอกรายละเอียดโครงการ"
                required
              />
            </div>
          </div>
        )}

        {/* ข้อมูลเฉพาะการประกวด */}
        {activityType === "contest" && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลการประกวด</h2>
            
            {/* ประเภทการประกวด */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ประเภทการประกวด *
              </label>
              <select
                name="contestType"
                value={formData.contestType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">เลือกประเภทการประกวด</option>
                {fishTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* วันที่ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วันที่เริ่มการประกวด *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วันที่สิ้นสุดการประกวด *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            {/* จำนวนผู้เข้าร่วมสูงสุด */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                จำนวนผู้เข้าร่วมสูงสุด (ไม่ระบุ = ไม่จำกัด)
              </label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="เช่น 50"
                min="1"
              />
            </div>

            {/* เลือกผู้เชี่ยวชาญ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เลือกผู้เชี่ยวชาญเป็นกรรมการ (เลือก 3 คน) *
              </label>
              
              {formData.contestType ? (
                <div className="space-y-2">
                  {getAvailableExperts().length > 0 ? (
                    getAvailableExperts().map(expert => (
                      <div
                        key={expert.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.selectedExperts.some(e => e.id === expert.id)
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-300 hover:border-purple-300"
                        }`}
                        onClick={() => handleExpertSelection(expert.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{expert.name}</h4>
                            <p className="text-sm text-gray-600">{expert.specialty}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            formData.selectedExperts.some(e => e.id === expert.id)
                              ? "border-purple-500 bg-purple-500"
                              : "border-gray-300"
                          }`}>
                            {formData.selectedExperts.some(e => e.id === expert.id) && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      ไม่มีผู้เชี่ยวชาญสำหรับประเภทนี้
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  กรุณาเลือกประเภทการประกวดก่อน
                </p>
              )}

              {/* แสดงผู้เชี่ยวชาญที่เลือก */}
              {formData.selectedExperts.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    ผู้เชี่ยวชาญที่เลือก ({formData.selectedExperts.length}/3):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedExperts.map(expert => (
                      <span
                        key={expert.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                      >
                        {expert.name}
                        <button
                          type="button"
                          onClick={() => handleExpertSelection(expert.id)}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          <FiX size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ปุ่มบันทึก */}
        {activityType && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" size={16} />
                    บันทึกกิจกรรม
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateActivity;