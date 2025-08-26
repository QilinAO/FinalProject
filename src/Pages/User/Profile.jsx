// ======================================================================
// File: src/Pages/User/Profile.jsx
// หน้าที่: จัดการข้อมูลโปรไฟล์ส่วนตัวของผู้ใช้
// ======================================================================

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiCamera, FiEdit, FiSave, FiXCircle, FiLoader } from "react-icons/fi";
import { fetchProfile, updateProfile, uploadProfilePicture } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";

const defaultProfileImage = "https://via.placeholder.com/150/E9D5FF/3730A3?text=User";

/**
 * Component สำหรับแสดงรูปโปรไฟล์และปุ่มอัปโหลด
 */
const ProfileImage = ({ avatarUrl, isUploading, onClick }) => (
  <div className="relative w-32 h-32 mb-4 group">
    <img
      src={avatarUrl}
      alt="Profile"
      className="w-full h-full rounded-full object-cover border-4 border-purple-400 shadow-lg"
    />
    <button
      onClick={onClick}
      disabled={isUploading}
      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-all duration-300"
      title="เปลี่ยนรูปโปรไฟล์"
    >
      {isUploading ? (
        <FiLoader className="animate-spin text-white text-3xl" />
      ) : (
        <FiCamera className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  </div>
);

/**
 * Component สำหรับฟอร์มแก้ไขข้อมูลโปรไฟล์
 */
const ProfileForm = ({ user, formData, isEditing, onChange }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">อีเมล</label>
      <input type='email' value={user.email} disabled className="w-full p-3 bg-gray-200 rounded-lg border cursor-not-allowed" />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">ชื่อผู้ใช้</label>
      <input type='text' name='username' value={formData.username} onChange={onChange} disabled={!isEditing}
        className="w-full p-3 bg-gray-100 rounded-lg border focus:ring-2 focus:ring-purple-400 transition disabled:bg-gray-200" />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">ชื่อจริง</label>
      <input type='text' name='first_name' value={formData.first_name} onChange={onChange} disabled={!isEditing}
        className="w-full p-3 bg-gray-100 rounded-lg border focus:ring-2 focus:ring-purple-400 transition disabled:bg-gray-200" />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">นามสกุล</label>
      <input type='text' name='last_name' value={formData.last_name} onChange={onChange} disabled={!isEditing}
        className="w-full p-3 bg-gray-100 rounded-lg border focus:ring-2 focus:ring-purple-400 transition disabled:bg-gray-200" />
    </div>
  </div>
);

/**
 * Component สำหรับปุ่มควบคุม (แก้ไข, บันทึก, ยกเลิก)
 */
const ActionButtons = ({ isEditing, isSaving, onEdit, onSave, onCancel }) => {
  if (isEditing) {
    return (
      <div className="flex justify-end gap-4 pt-4 border-t">
        <button onClick={onCancel} className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
          <FiXCircle /> ยกเลิก
        </button>
        <button onClick={onSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300">
          {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />}
          {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
        </button>
      </div>
    );
  }
  return (
    <div className="flex justify-between items-center border-b pb-4">
      <h2 className="text-2xl font-bold text-gray-800">ข้อมูลส่วนตัว</h2>
      <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
        <FiEdit /> แก้ไข
      </button>
    </div>
  );
};

/**
 * Component หลักสำหรับหน้าโปรไฟล์
 */
const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, setUser: setAuthUser } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({ username: "", first_name: "", last_name: "" });
  const fileInputRef = useRef(null);

  const loadInitialProfile = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetchProfile();
      const userProfile = response.profile || response.data || response;
      setProfileData(userProfile);
      setFormData({
        username: userProfile.username || "",
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
      });
    } catch (error) {
      toast.error(`ไม่สามารถโหลดข้อมูลโปรไฟล์ได้: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadInitialProfile();
    }
  }, [authLoading, loadInitialProfile]);

  // [สำคัญ] Cleanup Object URL เพื่อป้องกัน Memory Leak
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await updateProfile(formData);
      const updatedProfile = response.data || response;
      setProfileData(updatedProfile);
      setAuthUser(updatedProfile); // [สำคัญ] อัปเดตข้อมูลใน Global State
      toast.success("บันทึกข้อมูลสำเร็จ!");
      setIsEditing(false);
    } catch (error) {
      toast.error(`บันทึกข้อมูลล้มเหลว: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      username: profileData.username || "",
      first_name: profileData.first_name || "",
      last_name: profileData.last_name || "",
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
    }
    setImagePreview(URL.createObjectURL(file));
    handleUpload(file);
  };

  const handleUpload = async (fileToUpload) => {
    setUploading(true);
    try {
      const response = await uploadProfilePicture(fileToUpload);
      const updatedProfile = response.data || response;
      setProfileData(updatedProfile);
      setAuthUser(updatedProfile); // [สำคัญ] อัปเดตข้อมูลใน Global State
      toast.success("อัปโหลดรูปสำเร็จ!");
      setImagePreview(null);
    } catch (error) {
      toast.error(`อัปโหลดล้มเหลว: ${error.message}`);
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <main className="page-container">
        <div className="page-hero">
          <div className="page-hero-content">
            <div className="text-center">
              <FiLoader className="animate-spin text-white text-6xl mx-auto mb-6" />
              <p className="text-2xl text-white/95 font-medium">กำลังโหลดข้อมูลโปรไฟล์...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!profileData) {
    return (
      <main className="page-container">
        <div className="page-hero">
          <div className="page-hero-content">
            <div className="text-center">
              <FiXCircle className="text-red-300 text-6xl mx-auto mb-6" />
              <p className="text-2xl text-white/95 font-medium mb-8">ไม่พบข้อมูลโปรไฟล์ หรือเซสชันหมดอายุ</p>
              <button onClick={() => navigate('/login')} className="px-8 py-4 bg-white text-purple-700 rounded-2xl hover:bg-gray-100 font-bold text-lg transition-all duration-300">
                ไปหน้าเข้าสู่ระบบ
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              👤 โปรไฟล์ของฉัน
            </h1>
            <p className="text-2xl md:text-3xl text-white/95 font-medium leading-relaxed">
              จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชี
            </p>
          </div>
        </div>
      </section>

      <div className="page-main">
        <section className="page-section">
          <div className="container-responsive">
            <div className="content-card max-w-4xl mx-auto">
        <div className="flex flex-col items-center">
          <ProfileImage
            avatarUrl={imagePreview || profileData?.avatar_url || defaultProfileImage}
            isUploading={isUploading}
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
          />
        </div>

        <div className="space-y-4">
          <ActionButtons
            isEditing={isEditing}
            isSaving={isSaving}
            onEdit={() => setIsEditing(true)}
            onSave={handleSave}
            onCancel={handleCancelEdit}
          />
          <ProfileForm
            user={user}
            formData={formData}
            isEditing={isEditing}
            onChange={handleChange}
          />
        </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Profile;