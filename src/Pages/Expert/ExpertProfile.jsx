// D:\ProJectFinal\Lasts\my-project\src\Pages\Expert\ExpertProfile.jsx (ฉบับสมบูรณ์)

// --- ส่วนที่ 1: การนำเข้า (Imports) ---

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchProfile, updateProfile, uploadProfilePicture } from '../../services/userService';
import { toast } from 'react-toastify';
import { LoaderCircle, Camera, Save, Edit3, X, Check } from 'lucide-react';

// --- ส่วนที่ 2: ค่าคงที่ (Constants) ---

// รูปโปรไฟล์เริ่มต้น ในกรณีที่ผู้ใช้ยังไม่มีรูป
const defaultAvatar = 'https://placehold.co/150x150/A78BFA/FFFFFF?text=Expert';

// รายการความถนัดทั้งหมดที่ Expert สามารถเลือกได้
const BETTA_SPECIALITIES = [
  "ปลากัดพื้นบ้านภาคกลางและเหนือ", "ปลากัดพื้นบ้านภาคอีสาน", "ปลากัดพื้นภาคใต้",
  "ปลากัดพื้นบ้านมหาชัย", "ปลากัดพื้นบ้านภาคตะวันออก", "ปลากัดพื้นบ้านอีสานหางลาย"
];


// --- ส่วนที่ 3: Main Component ---

const ExpertProfile = () => {
    // --- State Management ---
    const { user, loading: authLoading } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        specialities: []
    });
    const fileInputRef = useRef(null);

    // --- Effects ---
    useEffect(() => {
        if (!authLoading && user) {
            loadProfile();
        }
    }, [user, authLoading]);

    // --- Data Fetching ---
    const loadProfile = async () => {
        setLoading(true);
        try {
            const response = await fetchProfile();
            // [แก้ไข] ดึงข้อมูลโปรไฟล์ที่แท้จริงจาก response.profile
            const userProfile = response.profile;

            setProfileData(userProfile);
            setFormData({
                first_name: userProfile.first_name || '',
                last_name: userProfile.last_name || '',
                specialities: userProfile.specialities || []
            });
        } catch (error) {
            toast.error("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
        } finally {
            setLoading(false);
        }
    };

    // --- Event Handlers ---
    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSpecialityChange = (speciality) => {
        setFormData(prev => {
            const currentSpecialities = prev.specialities || [];
            const isSelected = currentSpecialities.includes(speciality);
            let newSpecialities = isSelected
                ? currentSpecialities.filter(s => s !== speciality)
                : [...currentSpecialities, speciality];

            if (newSpecialities.length > 2) {
                toast.warn("สามารถเลือกความถนัดได้สูงสุด 2 อย่าง");
                return prev; // คืนค่าเดิม ไม่เปลี่ยนแปลง
            }
            return { ...prev, specialities: newSpecialities };
        });
    };

    const handleSave = async () => {
        try {
            const response = await updateProfile(formData);
            setProfileData(response.data);
            setIsEditing(false);
            toast.success("บันทึกข้อมูลสำเร็จ!");
        } catch (error) {
            toast.error("เกิดข้อผิดพลาด: " + error.message);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        toast.info("กำลังอัปโหลดรูปภาพ...");
        try {
            const response = await uploadProfilePicture(file);
            setProfileData(response.data);
            toast.success("อัปโหลดรูปสำเร็จ!");
        } catch (error) {
            toast.error("อัปโหลดรูปล้มเหลว: " + error.message);
        }
    };

    // --- Render Logic ---
    if (authLoading || loading) {
        return <div className="flex justify-center p-10"><LoaderCircle className="animate-spin text-teal-600" size={40} /></div>;
    }

    if (!profileData) {
        return <div className="text-center p-10">ไม่พบข้อมูลโปรไฟล์</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">โปรไฟล์ผู้เชี่ยวชาญ</h1>
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                        <img src={profileData.avatar_url || defaultAvatar} alt="Profile" className="w-40 h-40 object-cover rounded-full border-4 border-teal-200 shadow-md"/>
                        <button onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={32} className="text-white" />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-gray-800">{profileData.first_name} {profileData.last_name}</h2>
                        <p className="text-gray-500">@{profileData.username}</p>
                        <p className="text-teal-600 font-semibold">{user?.email}</p>
                    </div>
                </div>

                <div className="mt-8 border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-700">ข้อมูลส่วนตัวและความถนัด</h3>
                        {!isEditing && <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"><Edit3 /> แก้ไข</button>}
                    </div>
                    {isEditing ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="font-semibold">ชื่อจริง:</label><input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full p-2 border rounded-md mt-1" /></div>
                                <div><label className="font-semibold">นามสกุล:</label><input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full p-2 border rounded-md mt-1" /></div>
                            </div>
                            <div>
                                <label className="font-semibold block mb-2">ความถนัด (เลือกได้สูงสุด 2 อย่าง):</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {BETTA_SPECIALITIES.map(spec => (
                                        <button key={spec} type="button" onClick={() => handleSpecialityChange(spec)} className={`p-2 rounded-md text-sm border-2 transition ${formData.specialities.includes(spec) ? 'bg-teal-500 text-white border-teal-500' : 'bg-gray-100 border-gray-200 hover:border-teal-400'}`}>
                                            {formData.specialities.includes(spec) && <Check className="inline mr-1" size={16}/>} {spec}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center"><X /> ยกเลิก</button>
                                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"><Save /> บันทึก</button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p><strong>ความถนัด:</strong></p>
                            {profileData.specialities && profileData.specialities.length > 0 ? (
                                <ul className="flex flex-wrap gap-2">
                                    {profileData.specialities.map(spec => <li key={spec} className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm">{spec}</li>)}
                                </ul>
                            ) : <p className="text-gray-500">ยังไม่ได้กำหนดความถนัด</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpertProfile;