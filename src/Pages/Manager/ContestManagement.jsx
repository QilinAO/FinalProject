// D:\ProJectFinal\Lasts\my-project\src\pages\Manager\ContestManagement.jsx
import React, { useState, useEffect, useMemo } from "react";
import { ImagePlus, Trash2, LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";

import ManagerMenu from "../../Component/ManagerMenu";
import { createContestOrNews, getExpertList } from "../../services/managerService";

const BETTA_SUBCATEGORIES = [
  { id: "A", label: "ปลากัดพื้นบ้านภาคกลางและเหนือ" },
  { id: "B", label: "ปลากัดพื้นบ้านภาคอีสาน" },
  { id: "C", label: "ปลากัดพื้นภาคใต้" },
  { id: "D", label: "ปลากัดพื้นบ้านมหาชัย" },
  { id: "E", label: "ปลากัดพื้นบ้านภาคตะวันออก" },
  { id: "F", label: "ปลากัดพื้นบ้านอีสานหางลาย" },
  { id: "G", label: "ปลากัดป่าพัฒนาสีสัน(รวมทุกประเภท)" },
  { id: "H", label: "ปลากัดป่ารุ่นจิ๋ว(รวมทุกประเภท ความยาวไม่เกิน 1.2 นิ้ว)" },
];

const ContestManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const initialFormState = {
    name: "",
    short_description: "",
    full_description: "",
    category: "การประกวด",
    status: "draft",
    start_date: "",
    end_date: "",
    is_vote_open: false,
    allowed_subcategories: [],
    fish_type: "", // เพิ่ม field fish_type
    judge_ids: [],
    posterFile: null,
    posterPreview: null,
  };
  const [formData, setFormData] = useState(initialFormState);
  const [experts, setExperts] = useState([]);
  const [loadingExperts, setLoadingExperts] = useState(true);

  useEffect(() => {
    const fetchExperts = async () => {
      setLoadingExperts(true);
      try {
        const data = await getExpertList();
        setExperts(Array.isArray(data) ? data : []);
      } catch {
        toast.error("ไม่สามารถดึงรายชื่อผู้เชี่ยวชาญได้");
        setExperts([]);
      } finally {
        setLoadingExperts(false);
      }
    };
    fetchExperts();
  }, []);

  const filteredExperts = useMemo(() => {
    const selectedSubcategoryIds = formData.allowed_subcategories;
    if (selectedSubcategoryIds.length === 0) return experts;

    const selectedLabels = selectedSubcategoryIds
      .map(id => BETTA_SUBCATEGORIES.find(sub => sub.id === id)?.label || null)
      .filter(Boolean);

    return experts.filter(expert =>
      Array.isArray(expert.specialities) &&
      expert.specialities.some(speciality => selectedLabels.includes(speciality))
    );
  }, [experts, formData.allowed_subcategories]);

  useEffect(() => {
    const filteredExpertIds = new Set(filteredExperts.map(e => e.id));
    const newSelectedJudgeIds = formData.judge_ids.filter(id => filteredExpertIds.has(id));
    if (newSelectedJudgeIds.length !== formData.judge_ids.length) {
      setFormData(prev => ({ ...prev, judge_ids: newSelectedJudgeIds }));
    }
  }, [filteredExperts, formData.judge_ids]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
      setFormData(prev => {
        // revoke URL เดิมถ้ามีเพื่อลด memory leak
        if (prev.posterPreview) {
          try { URL.revokeObjectURL(prev.posterPreview); } catch {}
        }
        return { ...prev, posterFile: file, posterPreview: URL.createObjectURL(file) };
      });
    }
  };

  const handleRemoveImage = () => setFormData(prev => {
    if (prev.posterPreview) {
      try { URL.revokeObjectURL(prev.posterPreview); } catch {}
    }
    return { ...prev, posterFile: null, posterPreview: null };
  });

  const handleSubcategoryChange = (subcatId, isChecked) => {
    setFormData(prev => {
      const current = prev.allowed_subcategories;
      const next = isChecked ? [...current, subcatId] : current.filter(id => id !== subcatId);
      return { ...prev, allowed_subcategories: next };
    });
  };

  const handleJudgeSelection = (event, expertId, isChecked) => {
    if (isChecked && formData.judge_ids.length >= 3) {
      event.target.checked = false;
      return toast.warn("สามารถเลือกกรรมการได้สูงสุด 3 คน");
    }
    setFormData(prev => {
      const current = prev.judge_ids;
      const next = isChecked ? [...current, expertId] : current.filter(id => id !== expertId);
      return { ...prev, judge_ids: next };
    });
  };

  const handleConfirmSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.posterFile) return toast.error("กรุณากรอกชื่อกิจกรรมและอัปโหลดโปสเตอร์");
    if (formData.category === 'การประกวด' && (!formData.start_date || !formData.end_date)) {
      return toast.error("กรุณาเลือกวันที่สำหรับการประกวด");
    }

    setIsLoading(true);
    try {
      const apiFormData = new FormData();
      apiFormData.append('poster', formData.posterFile);
      apiFormData.append('name', formData.name);
      apiFormData.append('short_description', formData.short_description);
      apiFormData.append('full_description', formData.full_description);
      apiFormData.append('category', formData.category);

      if (formData.category === 'การประกวด') {
        apiFormData.append('status', formData.status);
        apiFormData.append('start_date', formData.start_date);
        apiFormData.append('end_date', formData.end_date);
        apiFormData.append('is_vote_open', String(formData.is_vote_open));
        apiFormData.append('allowed_subcategories', JSON.stringify(formData.allowed_subcategories));
        apiFormData.append('fish_type', formData.fish_type); // เพิ่มการส่ง fish_type
        apiFormData.append('judge_ids', JSON.stringify(formData.judge_ids));
      } else {
        // ข่าว: ให้สถานะเป็น published ตาม schema
        apiFormData.append('status', 'published');
      }

      await createContestOrNews(apiFormData);
      toast.success("สร้างกิจกรรมสำเร็จ!");
      setFormData(initialFormState);
    } catch (error) {
      toast.error(error?.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <ManagerMenu />
      <div className="pt-16 p-4 sm:p-8 w-full">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">จัดการกิจกรรม (สร้าง)</h1>
        <form onSubmit={handleConfirmSave} className="bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">1. ประเภท:</label>
              <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-3 border rounded-md" required>
                <option value="การประกวด">การประกวด</option>
                <option value="ข่าวสารทั่วไป">ข่าวสารทั่วไป</option>
                <option value="ข่าวสารประชาสัมพันธ์">ข่าวสารประชาสัมพันธ์</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">2. ชื่อโครงการ/หัวข้อข่าว:</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-3 border rounded-md" required />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">3. คำอธิบายโดยย่อ:</label>
            <textarea name="short_description" value={formData.short_description} onChange={handleInputChange} className="w-full p-3 border rounded-md" rows="3" />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">4. รายละเอียดเต็ม:</label>
            <textarea name="full_description" value={formData.full_description} onChange={handleInputChange} className="w-full p-3 border rounded-md" rows="6" />
          </div>

          {formData.category === "การประกวด" && (
            <div className="space-y-6 p-4 border-t-2 border-purple-100">
              <h2 className="text-xl font-semibold text-purple-700">ส่วนของการประกวด</h2>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">5. สถานะเริ่มต้น:</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full p-3 border rounded-md bg-gray-50">
                  <option value="draft">แบบร่าง (Draft)</option>
                  <option value="กำลังดำเนินการ">เริ่มดำเนินการ (Published)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">6. วันที่เริ่มรับสมัคร:</label>
                  <input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} className="w-full p-3 border rounded-md" required />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">7. วันที่สิ้นสุดการประกวด:</label>
                  <input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} className="w-full p-3 border rounded-md" required />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">8. ประเภทปลากัดที่เปิดรับ:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border rounded-md bg-gray-50 max-h-60 overflow-y-auto">
                  {BETTA_SUBCATEGORIES.map((sub) => (
                    <label key={sub.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.allowed_subcategories.includes(sub.id)}
                        onChange={(e) => handleSubcategoryChange(sub.id, e.target.checked)}
                      />
                      <span>{sub.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">8.5. ประเภทปลากัดหลักสำหรับการแข่งขัน:</label>
                <select 
                  name="fish_type" 
                  value={formData.fish_type} 
                  onChange={handleInputChange} 
                  className="w-full p-3 border rounded-md bg-gray-50"
                  required
                >
                  <option value="">-- เลือกประเภทปลากัดหลัก --</option>
                  {BETTA_SUBCATEGORIES.map((sub) => (
                    <option key={sub.id} value={sub.label}>{sub.label}</option>
                  ))}
                </select>
                <p className="text-sm text-gray-600 mt-1">
                  💡 เลือกประเภทปลากัดหลักที่จะใช้ในการกรองผู้เชี่ยวชาญสำหรับมอบหมายกรรมการ
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">9. เลือกคณะกรรมการ (สูงสุด 3 คน):</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-3 border rounded-md bg-gray-50 max-h-72 overflow-y-auto">
                  {loadingExperts ? (
                    <p className="col-span-full text-center">กำลังโหลดผู้เชี่ยวชาญ...</p>
                  ) : (
                    filteredExperts.map(expert => (
                      <label key={expert.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200 cursor-pointer">
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded"
                          checked={formData.judge_ids.includes(expert.id)}
                          onChange={e => handleJudgeSelection(e, expert.id, e.target.checked)}
                          disabled={formData.judge_ids.length >= 3 && !formData.judge_ids.includes(expert.id)}
                        />
                        <div>
                          <span className="font-medium text-gray-800">{expert.first_name} {expert.last_name}</span>
                          <span className="block text-xs text-gray-500">{expert.specialities?.join(', ') || 'ทั่วไป'}</span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-semibold mb-2">โปสเตอร์กิจกรรม:</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input type="file" id="poster-upload" onChange={handleImageChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
              <label htmlFor="poster-upload" className="cursor-pointer">
                {formData.posterPreview ? (
                  <div className="relative inline-block">
                    <img src={formData.posterPreview} alt="Preview" className="max-h-48 rounded-md" />
                    <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-lg hover:scale-110 transition-transform">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-500 hover:text-purple-600 transition-colors">
                    <ImagePlus size={48} className="mx-auto mb-2" />
                    <p>คลิกเพื่ออัปโหลด (ไม่เกิน 5MB)</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition flex items-center justify-center disabled:bg-purple-300"
          >
            {isLoading && <LoaderCircle className="animate-spin mr-2" />}
            {isLoading ? "กำลังสร้างกิจกรรม..." : "บันทึกและสร้างกิจกรรม"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContestManagement;
