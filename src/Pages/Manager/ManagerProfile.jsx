import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { fetchProfile, updateProfile, uploadProfilePicture } from '../../services/userService';
import { getManagerProfileDashboard } from '../../services/managerService'; // [ใหม่] Import service ใหม่
import { 
    FiCamera, FiSave, FiEdit3, FiX, FiLoader, FiUsers, FiClock, FiCheckSquare, FiArrowRight
} from 'react-icons/fi';

// --- Component ย่อยสำหรับการ์ดสถิติ ---
const StatCard = ({ icon, label, value, color }) => (
    <div className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${color}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
            <div className="text-2xl">{icon}</div>
        </div>
    </div>
);

// --- Component หลักของหน้า ---
const ManagerProfile = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // State สำหรับข้อมูลโปรไฟล์
    const [profileData, setProfileData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ username: '', first_name: '', last_name: '' });
    const fileInputRef = useRef(null);

    // [ใหม่] State สำหรับข้อมูล Dashboard
    const [dashboardData, setDashboardData] = useState(null);
    
    // State สำหรับ Loading
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingDashboard, setLoadingDashboard] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // --- Effects ---
    useEffect(() => {
        if (!authLoading && user) {
            loadProfile();
            loadDashboardData();
        }
    }, [user, authLoading]);

    // --- Data Fetching ---
    const loadProfile = async () => {
        setLoadingProfile(true);
        try {
            const data = await fetchProfile();
            setProfileData(data);
            setFormData({
                username: data.username || '',
                first_name: data.first_name || '',
                last_name: data.last_name || ''
            });
        } catch (error) {
            toast.error("ไม่สามารถดึงข้อมูลโปรไฟล์ได้: " + error.message);
        } finally {
            setLoadingProfile(false);
        }
    };

    const loadDashboardData = async () => {
        setLoadingDashboard(true);
        try {
            const response = await getManagerProfileDashboard();
            if (response.success) {
                setDashboardData(response.data);
            }
        } catch (error) {
            toast.error("ไม่สามารถดึงข้อมูลสถิติได้: " + error.message);
        } finally {
            setLoadingDashboard(false);
        }
    };

    // --- Event Handlers ---
    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedData = await updateProfile(formData);
            setProfileData(updatedData);
            toast.success("บันทึกข้อมูลสำเร็จ!");
            setIsEditing(false);
        } catch (error) {
            toast.error("เกิดข้อผิดพลาดในการบันทึก: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        if (profileData) {
            setFormData({
                username: profileData.username || '',
                first_name: profileData.first_name || '',
                last_name: profileData.last_name || ''
            });
        }
        setIsEditing(false);
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) return toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");

        setIsUploading(true);
        try {
            const updatedProfile = await uploadProfilePicture(file);
            setProfileData(updatedProfile);
            toast.success("อัปเดตรูปโปรไฟล์สำเร็จ");
        } catch (error) {
            toast.error("อัปโหลดรูปโปรไฟล์ล้มเหลว: " + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    // --- Render Logic ---
    if (authLoading || loadingProfile) {
        return <div className="flex items-center justify-center p-10"><FiLoader className="animate-spin text-purple-600" size={48} /></div>;
    }

    if (!profileData) {
        return <div className="text-center p-8">ไม่พบข้อมูลโปรไฟล์</div>;
    }

    return (
        <div className="space-y-8">
            {/* ส่วนหัวของหน้า */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-32 h-32 md:w-40 md:h-40 group flex-shrink-0">
                    <img src={profileData.avatar_url || 'https://placehold.co/150x150/E9D5FF/3730A3?text=Profile'} alt="Profile" className="w-full h-full object-cover rounded-full border-4 border-purple-200 shadow-sm" />
                    <button onClick={() => fileInputRef.current.click()} disabled={isUploading} className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        {isUploading ? <FiLoader className="animate-spin text-white" /> : <FiCamera size={32} className="text-white" />}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
                </div>
                <div className="flex-1 w-full text-center md:text-left">
                    {isEditing ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="font-semibold text-sm">ชื่อจริง:</label><input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full p-2 border rounded-md" /></div>
                                <div><label className="font-semibold text-sm">นามสกุล:</label><input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full p-2 border rounded-md" /></div>
                            </div>
                            <div><label className="font-semibold text-sm">Username:</label><input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full p-2 border rounded-md" /></div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={handleCancelEdit} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center"><FiX className="mr-1" />ยกเลิก</button>
                                <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:bg-blue-300">
                                    {isSaving ? <FiLoader className="animate-spin mr-2" /> : <FiSave className="mr-1" />} บันทึก
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">{profileData.first_name} {profileData.last_name}</h1>
                            <p className="text-gray-500">@{profileData.username}</p>
                            <p className="text-purple-600">{user?.email}</p>
                            <div className="pt-4">
                                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center">
                                    <FiEdit3 className="mr-2" /> แก้ไขข้อมูลส่วนตัว
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ส่วน Dashboard และสถิติ */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-700">ศูนย์ควบคุม</h2>
                {loadingDashboard ? (
                    <div className="flex items-center justify-center p-10"><FiLoader className="animate-spin text-purple-600" size={32} /></div>
                ) : dashboardData ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <StatCard icon={<FiClock className="text-orange-500"/>} label="ประกวดที่ดูแลอยู่" value={dashboardData.stats.activeContests} color="border-orange-500" />
                            <StatCard icon={<FiUsers className="text-blue-500"/>} label="ผู้สมัครรออนุมัติ" value={dashboardData.stats.pendingSubmissions} color="border-blue-500" />
                            <StatCard icon={<FiCheckSquare className="text-green-500"/>} label="ประกวดที่เสร็จสิ้น" value={dashboardData.stats.finishedContests} color="border-green-500" />
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-4">รายการที่ต้องจัดการ</h3>
                            <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
                                {dashboardData.activeContestList.length > 0 ? (
                                    dashboardData.activeContestList.map(contest => (
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
                    </>
                ) : (
                    <p className="text-center text-gray-500">ไม่สามารถโหลดข้อมูลสถิติได้</p>
                )}
            </div>
        </div>
    );
};

export default ManagerProfile;