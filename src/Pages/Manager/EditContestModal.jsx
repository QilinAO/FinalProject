import React, { useState, useEffect, useMemo } from "react";
import Modal from "react-modal";
import { toast } from 'react-toastify';
import { XCircle, LoaderCircle, Save } from 'lucide-react';
import { updateMyContest } from '../../services/managerService';
import { BETTA_TYPES_ID } from '../../utils/bettaTypes';

const EditContestModal = ({ isOpen, onRequestClose, contestData }) => {
  // --- States ---
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Helper Functions ---
  const formatIsoToDateInput = (isoString) => isoString ? isoString.split("T")[0] : "";

  // --- Effects ---
  useEffect(() => {
    // ตั้งค่า formData เมื่อ modal เปิด หรือ contestData เปลี่ยนแปลง
    if (isOpen && contestData) {
      setFormData({
        ...contestData,
        start_date: formatIsoToDateInput(contestData.start_date),
        end_date: formatIsoToDateInput(contestData.end_date),
        allowed_subcategories: Array.isArray(contestData.allowed_subcategories)
          ? [...new Set(contestData.allowed_subcategories)]
          : [],
      });
    } else {
      // Reset form data เมื่อ modal ปิด
      setFormData(null);
    }
  }, [isOpen, contestData]);

  // --- Memoized Values (Hooks ต้องอยู่บนสุดเสมอ) ---
  const judges = useMemo(() => {
    if (!formData || !Array.isArray(formData.contest_judges)) {
      return [];
    }
    // แปลงข้อมูลกรรมการที่ได้จาก API ให้อยู่ในรูปแบบที่ใช้งานง่าย
    return formData.contest_judges.map(j => {
      const profile = j.judge || {}; // 'judge' คือ alias ที่ตั้งไว้ใน API service
      return {
        id: profile.id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        status: j.status || 'pending'
      };
    });
  }, [formData]);

  // --- Conditional Render Guard (ต้องอยู่หลัง Hooks ทั้งหมด) ---
  if (!isOpen || !formData) {
    return null;
  }

  // --- Event Handlers ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubcatChange = (subcatId, checked) => {
    setFormData(prev => {
      const currentArray = Array.isArray(prev.allowed_subcategories) ? prev.allowed_subcategories : [];
      const set = new Set(currentArray);
      if (checked) {
        set.add(subcatId);
      } else {
        set.delete(subcatId);
      }
      return { ...prev, allowed_subcategories: Array.from(set) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // คัดแยกเฉพาะข้อมูลที่ต้องการส่งไปอัปเดต
      const {
        id, created_at, created_by, poster_url,
        contest_judges, // ไม่ส่ง field นี้กลับไป
        ...dataToSend
      } = formData;

      await updateMyContest(id, dataToSend);
      toast.success("บันทึกการแก้ไขสำเร็จ!");
      onRequestClose(true); // ส่ง true เพื่อบอกให้หน้า List โหลดข้อมูลใหม่
    } catch (error) {
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render JSX ---
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => onRequestClose(false)}
      style={{ overlay: { zIndex: 1051 } }}
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 bg-black bg-opacity-70"
    >
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
        <div className="flex justify-between items-center pb-4 border-b mb-6">
          <h2 className="text-2xl font-bold text-gray-800">แก้ไขข้อมูลกิจกรรม</h2>
          <button onClick={() => onRequestClose(false)} className="text-gray-400 hover:text-gray-800">
            <XCircle size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">ชื่อกิจกรรม:</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">คำอธิบายย่อ:</label>
            <textarea
              name="short_description"
              value={formData.short_description || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">วันที่เริ่ม:</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">วันที่สิ้นสุด:</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">สถานะ:</label>
            <select
              name="status"
              value={formData.status || 'draft'}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1 bg-white"
            >
              <option value="draft">ร่าง</option>
              <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
              <option value="ปิดรับสมัคร">ปิดรับสมัคร</option>
              <option value="ตัดสิน">ตัดสิน</option>
              <option value="ประกาศผล">ประกาศผล</option>
              <option value="ยกเลิก">ยกเลิก</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">ประเภทปลากัดที่อนุญาต:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 p-3 border rounded bg-gray-50 max-h-48 overflow-y-auto">
              {BETTA_TYPES_ID.map(sub => (
                <label key={sub.value} className="flex items-center space-x-2 p-1 rounded hover:bg-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    onChange={e => handleSubcatChange(sub.value, e.target.checked)}
                    checked={formData.allowed_subcategories?.includes(sub.value) || false}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{sub.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="p-4 border rounded-md bg-gray-50">
            <h4 className="font-bold mb-2 text-gray-800">
              คณะกรรมการ ({judges.length} คน)
            </h4>
            <div className="space-y-2">
              {judges.length > 0 ? (
                judges.map((j) => (
                  <div key={j.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                    <span className="text-sm text-gray-700">{j.name}</span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        j.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        j.status === 'declined' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {j.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">ยังไม่มีการมอบหมายกรรมการ</p>
              )}
            </div>
            <p className="mt-4 text-center text-xs text-gray-500">
              การเพิ่มหรือลบกรรมการ กรุณาไปที่หน้า "มอบหมายกรรมการ"
            </p>
          </div>

          <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={() => onRequestClose(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center font-semibold"
            >
              {isSubmitting ? <LoaderCircle className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditContestModal;