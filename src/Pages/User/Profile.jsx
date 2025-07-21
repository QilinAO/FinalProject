// D:\ProJectFinal\Lasts\my-project\src\Pages\User\Profile.jsx (ฉบับสมบูรณ์)

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiCamera, FiEdit, FiSave, FiXCircle, FiLoader, FiUploadCloud } from "react-icons/fi";

// Service สำหรับเรียก API
import { fetchProfile, updateProfile, uploadProfilePicture } from "../../services/userService";
// Context สำหรับจัดการสถานะการ Login
import { useAuth } from "../../context/AuthContext";

// URL ของรูปโปรไฟล์เริ่มต้น ในกรณีที่ผู้ใช้ไม่มีรูป
const defaultProfileImage = "https://a.slack-edge.com/80588/img/avatars-teams/ava_0002-512.png";

const Profile = () => {
  const navigate = useNavigate();
  // ดึงข้อมูล user และสถานะ loading จาก AuthContext
  const { user, loading: authLoading } = useAuth();

  // --- State สำหรับการจัดการข้อมูลและการแสดงผลในหน้านี้ ---
  const [profileData, setProfileData] = useState(null);    // State เก็บข้อมูลโปรไฟล์ทั้งหมดที่ได้จาก API
  const [isLoading, setIsLoading] = useState(true);      // State บอกว่าหน้านี้กำลังโหลดข้อมูลโปรไฟล์อยู่หรือไม่
  const [isEditing, setIsEditing] = useState(false);     // State ควบคุมโหมดแก้ไขข้อมูล
  const [isSaving, setIsSaving] = useState(false);       // State ควบคุมสถานะ "กำลังบันทึก"
  const [isUploading, setUploading] = useState(false);   // State ควบคุมสถานะ "กำลังอัปโหลดรูป"

  // State สำหรับเก็บข้อมูลในฟอร์มแก้ไข
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
  });

  // State สำหรับจัดการไฟล์รูปภาพ
  const [imagePreview, setImagePreview] = useState(null); // URL ชั่วคราวสำหรับแสดงภาพตัวอย่างก่อนอัปโหลด
  const fileInputRef = useRef(null); // Reference ไปยัง <input type="file" /> ที่ซ่อนอยู่

  // --- useEffect สำหรับโหลดข้อมูลโปรไฟล์เมื่อเข้าหน้า ---
  useEffect(() => {
    // จะเริ่มโหลดข้อมูลก็ต่อเมื่อ AuthContext โหลดเสร็จแล้ว และมีผู้ใช้ล็อกอินอยู่
    if (!authLoading && user) {
      loadInitialProfile();
    }
  }, [user, authLoading]); // Dependency array: ให้ Effect นี้ทำงานใหม่เมื่อ user หรือ authLoading เปลี่ยนแปลง

  // --- ฟังก์ชันสำหรับดึงข้อมูลโปรไฟล์ ---
  const loadInitialProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetchProfile(); // เรียกใช้ Service
      // [แก้ไข] API ของเราส่งข้อมูลโปรไฟล์กลับมาใน key 'profile'
      const userProfile = response.profile;

      setProfileData(userProfile);
      // ตั้งค่าเริ่มต้นให้ฟอร์มแก้ไขด้วยข้อมูลที่ได้มา
      setFormData({
        username: userProfile.username || "",
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
      });
    } catch (error) {
      toast.error(`ไม่สามารถโหลดข้อมูลโปรไฟล์ได้: ${error.message}`);
    } finally {
      setIsLoading(false); // โหลดข้อมูลหน้านี้เสร็จแล้ว
    }
  };

  // --- Handlers สำหรับฟอร์มแก้ไขข้อมูล ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    toast.info("กำลังบันทึกข้อมูล...");
    try {
      const response = await updateProfile(formData);
      // [แก้ไข] API ของเราส่งข้อมูลที่อัปเดตแล้วกลับมาใน key 'data'
      setProfileData(response.data);
      toast.success("บันทึกข้อมูลสำเร็จ!");
      setIsEditing(false); // ออกจากโหมดแก้ไข
    } catch (error) {
      toast.error(`บันทึกข้อมูลล้มเหลว: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // รีเซ็ตฟอร์มกลับไปเป็นข้อมูลล่าสุดที่บันทึกไว้
    setFormData({
      username: profileData.username || "",
      first_name: profileData.first_name || "",
      last_name: profileData.last_name || "",
    });
  };

  // --- Handlers สำหรับการอัปโหลดรูปภาพ ---
  const handleProfilePicFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
        return;
      }
      // สร้าง URL ชั่วคราวสำหรับแสดงภาพตัวอย่างทันที
      setImagePreview(URL.createObjectURL(file));
      // เรียกฟังก์ชันอัปโหลดทันทีที่เลือกไฟล์
      handleUploadProfilePic(file);
    }
  };

  const handleUploadProfilePic = async (fileToUpload) => {
    if (!fileToUpload) return;
    setUploading(true);
    toast.info("กำลังอัปโหลดรูปภาพ...");
    try {
      const response = await uploadProfilePicture(fileToUpload);
      // [แก้ไข] API ของเราส่งข้อมูลที่อัปเดตแล้วกลับมาใน key 'data'
      setProfileData(response.data);
      toast.success("อัปโหลดรูปสำเร็จ!");
      setImagePreview(null); // เคลียร์ภาพตัวอย่างหลังจากอัปโหลดสำเร็จ
    } catch (error) {
      toast.error(`อัปโหลดล้มเหลว: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleClickEditProfilePic = () => {
    fileInputRef.current?.click();
  };

  // --- Render Logic ---

  // แสดงหน้า Loading ขณะที่ context หรือข้อมูลโปรไฟล์กำลังโหลด
  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
        <FiLoader className="animate-spin text-purple-600 text-5xl" />
        <p className="mt-4 text-lg text-gray-700">กำลังโหลดข้อมูลโปรไฟล์...</p>
      </div>
    );
  }

  // แสดงหน้า Error หากโหลดเสร็จแต่ไม่มีข้อมูลโปรไฟล์ (อาจเกิดจากข้อผิดพลาด)
  if (!profileData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
        <FiXCircle className="text-red-500 text-5xl" />
        <p className="mt-4 text-lg text-gray-700">ไม่พบข้อมูลโปรไฟล์ หรือเซสชันหมดอายุ</p>
        <button onClick={() => navigate('/login')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          ไปหน้าเข้าสู่ระบบ
        </button>
      </div>
    );
  }

  // เมื่อข้อมูลพร้อมแล้ว แสดงหน้าโปรไฟล์ทั้งหมด
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <ToastContainer position="bottom-right" autoClose={4000} hideProgressBar={false} />
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
        <div className="relative flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4 group">
            <img
              src={imagePreview || profileData?.avatar_url || defaultProfileImage}
              alt="Profile"
              className="w-full h-full rounded-full object-cover border-4 border-purple-400 shadow-lg"
            />
            <button
              onClick={handleClickEditProfilePic}
              disabled={isUploading}
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-all duration-300"
              title="เปลี่ยนรูปโปรไฟล์"
            >
              {isUploading ? 
                <FiLoader className="animate-spin text-white text-3xl"/> : 
                <FiCamera className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity"/>
              }
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleProfilePicFileChange}
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">ข้อมูลส่วนตัว</h2>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                <FiEdit /> แก้ไข
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">อีเมล</label>
              <input type='email' value={user.email} disabled className="w-full p-3 bg-gray-200 rounded-lg border border-gray-300 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">ชื่อผู้ใช้</label>
              <input type='text' name='username' value={formData.username} onChange={handleChange} disabled={!isEditing}
                className="w-full p-3 bg-gray-100 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 transition disabled:bg-gray-200 disabled:cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">ชื่อจริง</label>
              <input type='text' name='first_name' value={formData.first_name} onChange={handleChange} disabled={!isEditing}
                className="w-full p-3 bg-gray-100 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 transition disabled:bg-gray-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">นามสกุล</label>
              <input type='text' name='last_name' value={formData.last_name} onChange={handleChange} disabled={!isEditing}
                className="w-full p-3 bg-gray-100 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 transition disabled:bg-gray-200" />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button onClick={handleCancelEdit} className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
              <FiXCircle /> ยกเลิก
            </button>
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300">
              {isSaving ? <FiLoader className="animate-spin mr-2" /> : <FiSave />}
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;