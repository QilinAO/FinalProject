// ======================================================================
// File: src/Pages/Manager/ManagerProfile.jsx (ฉบับแก้ไขสมบูรณ์)
// ======================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { fetchProfile, updateProfile, uploadProfilePicture } from '../../services/userService';
import { getManagerProfileDashboard } from '../../services/managerService';
import { FiCamera, FiSave, FiEdit3, FiX, FiLoader, FiUsers, FiClock, FiCheckSquare, FiArrowRight } from 'react-icons/fi';

// --- Sub-components for UI Sections ---

const StatCard = ({ icon, label, value, color }) => (
  <div className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value ?? 0}</p>
      </div>
      <div className="text-2xl">{icon}</div>
    </div>
  </div>
);

const ProfileHeader = ({ profile, user, isEditing, formData, onFormChange, onSave, onCancelEdit, onUpload, isSaving, isUploading }) => {
  const fileInputRef = useRef(null);

  const handleEditClick = () => {
    // เมื่อกดแก้ไข ให้ reset formData เป็นข้อมูลล่าสุดจาก profileData ก่อน
    onCancelEdit(true); 
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg flex flex-col md:flex-row items-center gap-8">
      <div className="relative w-32 h-32 md:w-40 md:h-40 group flex-shrink-0">
        <img src={profile.avatar_url || 'https://placehold.co/150x150/A78BFA/FFFFFF?text=Manager'} alt="Profile" className="w-full h-full object-cover rounded-full border-4 border-purple-200 shadow-sm" />
        <button onClick={() => fileInputRef.current.click()} disabled={isUploading} className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          {isUploading ? <FiLoader className="animate-spin text-white" /> : <FiCamera size={32} className="text-white" />}
        </button>
        <input type="file" ref={fileInputRef} onChange={onUpload} accept="image/*" className="hidden" />
      </div>
      <div className="flex-1 w-full text-center md:text-left">
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="font-semibold text-sm">ชื่อจริง:</label><input type="text" name="first_name" value={formData.first_name} onChange={onFormChange} className="w-full p-2 border rounded-md" /></div>
              <div><label className="font-semibold text-sm">นามสกุล:</label><input type="text" name="last_name" value={formData.last_name} onChange={onFormChange} className="w-full p-2 border rounded-md" /></div>
            </div>
            <div><label className="font-semibold text-sm">Username:</label><input type="text" name="username" value={formData.username} onChange={onFormChange} className="w-full p-2 border rounded-md" /></div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => onCancelEdit(false)} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center"><FiX className="mr-1" />ยกเลิก</button>
              <button onClick={onSave} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:bg-blue-300">
                {isSaving ? <FiLoader className="animate-spin mr-2" /> : <FiSave className="mr-1" />} บันทึก
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{profile.first_name} {profile.last_name}</h1>
            <p className="text-gray-500">@{profile.username}</p>
            <p className="text-purple-600">{user?.email}</p>
            <div className="pt-4">
              <button onClick={handleEditClick} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center">
                <FiEdit3 className="mr-2" /> แก้ไขข้อมูลส่วนตัว
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ControlCenter = ({ dashboardData, loading }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-700">ศูนย์ควบคุม</h2>
    {loading ? (
      <div className="flex items-center justify-center p-10"><FiLoader className="animate-spin text-purple-600" size={32} /></div>
    ) : dashboardData ? (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard icon={<FiClock className="text-orange-500"/>} label="ประกวดที่ดูแลอยู่" value={dashboardData.stats.activeContests} color="border-orange-500" />
          <StatCard icon={<FiUsers className="text-blue-500"/>} label="ผู้สมัครรออนุมัติ" value={dashboardData.stats.pendingSubmissions} color="border-blue-500" />
          <StatCard icon={<FiCheckSquare className="text-green-500"/>} label="ประกวดที่เสร็จสิ้น" value={dashboardData.stats.finishedContests} color="border-green-500" />
        </div>
        <ActionItemsList items={dashboardData.activeContestList} />
      </>
    ) : (
      <p className="text-center text-gray-500">ไม่สามารถโหลดข้อมูลสถิติได้</p>
    )}
  </div>
);

const ActionItemsList = ({ items }) => (
  <div>
    <h3 className="text-xl font-semibold text-gray-700 mb-4">รายการที่ต้องจัดการ</h3>
    <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
      {items && items.length > 0 ? (
        items.map(contest => (
          <div key={contest.id} className="border-b last:border-b-0 pb-3 last:pb-0 flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-800">{contest.name}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>สถานะ: <span className="font-semibold text-purple-700">{contest.status}</span></span>
                <span>ผู้สมัคร: {contest.submissionCount}</span>
                <span>กรรมการ: {contest.acceptedJudges}</span>
              </div>
            </div>
            <Link to="/manager/live-room" state={{ contestId: contest.id }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg flex items-center transition">
              จัดการ <FiArrowRight className="ml-2"/>
            </Link>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 py-6">ไม่มีรายการที่ต้องจัดการในขณะนี้</p>
      )}
    </div>
  </div>
);

const LoadingIndicator = () => (
  <div className="flex items-center justify-center p-10"><FiLoader className="animate-spin text-purple-600" size={48} /></div>
);

// --- Main Component ---
const ManagerProfile = () => {
  const { user, loading: authLoading, setUser: setAuthUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', first_name: '', last_name: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    try {
      // เรียก API ทั้งสองส่วนพร้อมกัน
      const [profileRes, dashboardRes] = await Promise.all([
        fetchProfile(), // ไม่ต้องส่ง userId เพราะ authMiddleware จัดการให้แล้ว
        getManagerProfileDashboard()
      ]);
      
      const userProfile = profileRes.profile || profileRes.data || profileRes;
      setProfileData(userProfile);
      setFormData({
        username: userProfile.username || '',
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || ''
      });

      // ✅✅✅ [แก้ไข] แก้ไขจุดนี้: นำ if-condition ออก ✅✅✅
      // service unwrap ข้อมูลให้แล้ว ถ้ามีค่ามาคือสำเร็จ
      setDashboardData(dashboardRes);

    } catch (error) {
      toast.error("ไม่สามารถโหลดข้อมูลได้: " + error.message);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, loadData]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await updateProfile(formData);
      const updatedProfile = response.data || response;
      setProfileData(updatedProfile);
      setAuthUser(updatedProfile);
      toast.success("บันทึกข้อมูลสำเร็จ!");
      setIsEditing(false);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการบันทึก: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");

    setIsUploading(true);
    try {
      const response = await uploadProfilePicture(file);
      const updatedProfile = response.data || response;
      setProfileData(updatedProfile);
      setAuthUser(updatedProfile);
      toast.success("อัปเดตรูปโปรไฟล์สำเร็จ");
    } catch (error) {
      toast.error("อัปโหลดรูปโปรไฟล์ล้มเหลว: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelEdit = (startEditing = false) => {
    setIsEditing(startEditing);
    // Reset form data ให้ตรงกับข้อมูลล่าสุดเสมอ
    if (profileData) {
      setFormData({
        username: profileData.username || '',
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || ''
      });
    }
  };

  if (authLoading || !profileData) {
    return <LoadingIndicator />;
  }

  return (
    <div className="space-y-8">
      <ProfileHeader
        profile={profileData}
        user={user}
        isEditing={isEditing}
        formData={formData}
        onFormChange={handleChange}
        onSave={handleSave}
        onCancelEdit={handleCancelEdit}
        onUpload={handleUpload}
        isSaving={isSaving}
        isUploading={isUploading}
      />
      <ControlCenter dashboardData={dashboardData} loading={!dashboardData} />
    </div>
  );
};

export default ManagerProfile;