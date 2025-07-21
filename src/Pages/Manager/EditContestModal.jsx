// my-project/src/Pages/Manager/EditContestModal.jsx (ฉบับสมบูรณ์ 100%)

import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { toast } from 'react-toastify';
import { XCircle, LoaderCircle, Save } from 'lucide-react';
import { updateMyContest } from '../../services/managerService';

const BETTA_SUBCATEGORIES = [
  { id: "A", label: "ปลากัดพื้นบ้านภาคกลางและเหนือ" },
  { id: "B", label: "ปลากัดพื้นบ้านภาคอีสาน" },
  { id: "C", label: "ปลากัดพื้นภาคใต้" },
  { id: "D", label: "ปลากัดพื้นบ้านมหาชัย" },
  { id: "E", label: "ปลากัดพื้นบ้านภาคตะวันออก" },
  { id: "F", label: "ปลากัดพื้นบ้านอีสานหางลาย" },
];

const EditContestModal = ({ isOpen, onRequestClose, contestData }) => {
  
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatIsoToDateInput = (isoString) => isoString ? isoString.split("T")[0] : "";

  useEffect(() => {
    if (contestData) {
      setFormData({
        ...contestData,
        start_date: formatIsoToDateInput(contestData.start_date),
        end_date: formatIsoToDateInput(contestData.end_date),
        // ทำให้แน่ใจว่า allowed_subcategories เป็น array เสมอ
        allowed_subcategories: contestData.allowed_subcategories || []
      });
    }
  }, [contestData]);

  // ถ้าไม่มีข้อมูล ให้ยังไม่ Render อะไรเลย
  if (!isOpen || !formData) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubcatChange = (subcatId, checked) => {
    setFormData(prev => {
        const currentArray = prev.allowed_subcategories || [];
        const newArray = checked ? [...currentArray, subcatId] : currentArray.filter(id => id !== subcatId);
        return { ...prev, allowed_subcategories: newArray };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // แยกข้อมูลที่ไม่จำเป็นต้องส่งไปอัปเดตออกจาก formData
      const { id, created_at, created_by, poster_url, assignments, contest_judges, ...dataToSend } = formData;
      
      await updateMyContest(id, dataToSend);
      toast.success("บันทึกการแก้ไขสำเร็จ!");
      onRequestClose(true); // ส่ง true กลับไปเพื่อบอกให้ ContestList refresh ข้อมูล
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={() => onRequestClose(false)} style={{ overlay: { zIndex: 1051 } }} className="fixed inset-0 flex items-center justify-center p-4" overlayClassName="fixed inset-0 bg-black bg-opacity-70">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
        <button onClick={() => onRequestClose(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><XCircle /></button>
        <h2 className="text-2xl font-bold mb-4 text-center">แก้ไขข้อมูลกิจกรรม</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-semibold">ชื่อ:</label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full p-2 border rounded mt-1" required />
          </div>
          <div>
            <label className="font-semibold">คำอธิบายย่อ:</label>
            <textarea name="short_description" value={formData.short_description || ''} onChange={handleChange} className="w-full p-2 border rounded mt-1" rows="3"></textarea>
          </div>
          <div>
            <label className="font-semibold">คำอธิบายละเอียด:</label>
            <textarea name="full_description" value={formData.full_description || ''} onChange={handleChange} className="w-full p-2 border rounded mt-1" rows="5"></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="font-semibold">วันที่เริ่ม:</label>
                <input type="date" name="start_date" value={formData.start_date || ''} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
            </div>
            <div>
                <label className="font-semibold">วันที่สิ้นสุด:</label>
                <input type="date" name="end_date" value={formData.end_date || ''} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
            </div>
          </div>
          <div>
            <label className="font-semibold">สถานะ:</label>
            <select name="status" value={formData.status || 'draft'} onChange={handleChange} className="w-full p-2 border rounded mt-1">
              <option value="draft">ร่าง</option>
              <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
              <option value="ปิดรับสมัคร">ปิดรับสมัคร</option>
              <option value="ตัดสิน">ตัดสิน</option>
              <option value="ประกาศผล">ประกาศผล</option>
              <option value="ยกเลิก">ยกเลิก</option>
            </select>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="is_vote_open_edit" name="is_vote_open" checked={formData.is_vote_open || false} onChange={handleChange} className="h-4 w-4" />
            <label htmlFor="is_vote_open_edit" className="ml-2">เปิดโหวตหรือไม่?</label>
          </div>
          <div>
            <label className="font-semibold">ประเภทปลากัดที่อนุญาต:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 p-2 border rounded bg-gray-50">
              {BETTA_SUBCATEGORIES.map(sub => (
                <label key={sub.id} className="flex items-center">
                    <input type="checkbox" onChange={e => handleSubcatChange(sub.id, e.target.checked)} checked={formData.allowed_subcategories?.includes(sub.id) || false} />
                    <span className="ml-2">{sub.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="p-3 border rounded-md">
            <h4 className="font-bold mb-2">จัดการคณะกรรมการ (ดูอย่างเดียว)</h4>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">กรรมการปัจจุบัน:</label>
              {(formData.contest_judges || []).length > 0 ? formData.contest_judges.map(j => (
                <div key={j.profiles.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                  <span>{j.profiles.first_name} {j.profiles.last_name} ({j.status})</span>
                </div>
              )) : <p className="text-sm text-gray-500 text-center py-2">ยังไม่มีการมอบหมายกรรมการ</p>}
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
                <p>การเพิ่มหรือลบกรรมการ กรุณาไปที่หน้า "มอบหมายกรรมการ"</p>
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={() => onRequestClose(false)} className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400">ยกเลิก</button>
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center">
              {isSubmitting && <LoaderCircle className="animate-spin mr-2"/>}
              <Save size={18} className="mr-1"/>
              บันทึกการแก้ไข
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditContestModal;