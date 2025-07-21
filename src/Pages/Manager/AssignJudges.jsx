// D:\ProJectFinal\Lasts\my-project\src\Pages\Manager\AssignJudges.jsx (ฉบับแก้ไขสมบูรณ์ 100%)

import React, { useState, useEffect } from "react";
import ManagerMenu from "../../Component/ManagerMenu";
import { toast } from "react-toastify";
import { LoaderCircle, Search, Users } from "lucide-react";
import { getMyContests, getExpertList, assignJudgeToContest } from "../../services/managerService";

const MAX_JUDGES = 3; // กำหนดค่าสูงสุดของกรรมการไว้เป็นค่าคงที่

const AssignJudges = () => {
  const [contests, setContests] = useState([]);
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContestId, setSelectedContestId] = useState('');
  const [selectedExpertIds, setSelectedExpertIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expertSearch, setExpertSearch] = useState('');

  // ฟังก์ชันสำหรับดึงข้อมูลเริ่มต้น
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [contestsData, expertsData] = await Promise.all([getMyContests(), getExpertList()]);
      setContests(contestsData.filter(c => !['ประกาศผล', 'ยกเลิก', 'ตัดสิน'].includes(c.status)) || []);
      setExperts(expertsData || []);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Reset selection เมื่อเปลี่ยนการประกวด
  useEffect(() => {
    setSelectedExpertIds([]);
    setExpertSearch('');
  }, [selectedContestId]);

  // หาข้อมูลการประกวดที่เลือก และจำนวนกรรมการปัจจุบัน
  const selectedContest = selectedContestId ? contests.find(c => c.id == selectedContestId) : null;
  const currentJudgeCount = selectedContest?.contest_judges?.length || 0;

  // กรองผู้เชี่ยวชาญที่ยังว่างอยู่และตรงตามคำค้นหา
  const availableExperts = experts
    .filter(expert => {
      // ถ้ายังไม่เลือกประกวด, ไม่ต้องกรองส่วนนี้
      if (!selectedContest) return true;
      // กรองคนที่ถูกมอบหมายในการประกวดนี้ไปแล้วออก
      return !selectedContest.contest_judges.some(assigned => assigned.profiles?.id === expert.id);
    })
    .filter(expert => {
      // กรองตามชื่อที่ค้นหา
      const fullName = `${expert.first_name || ''} ${expert.last_name || ''}`.toLowerCase();
      return fullName.includes(expertSearch.toLowerCase());
    });

  // จัดการการเลือก/ไม่เลือกกรรมการ
  const handleExpertSelection = (expertId, isChecked) => {
    setSelectedExpertIds(prevIds => {
      const newIds = isChecked 
        ? [...prevIds, expertId] 
        : prevIds.filter(id => id !== expertId);
      
      // ตรวจสอบโควต้ารวมกับกรรมการที่มีอยู่แล้ว
      if (newIds.length + currentJudgeCount > MAX_JUDGES) {
        toast.warn(`สามารถเลือกกรรมการได้สูงสุด ${MAX_JUDGES} คน (มีอยู่แล้ว ${currentJudgeCount} คน)`);
        return prevIds; // คืนค่าเดิม ไม่เปลี่ยนแปลง
      }
      return newIds;
    });
  };

  // จัดการการ submit ฟอร์ม
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedContestId) return toast.error("กรุณาเลือกการประกวด");
    if (selectedExpertIds.length === 0) return toast.error("กรุณาเลือกกรรมการอย่างน้อย 1 คน");

    setIsSubmitting(true);
    try {
      const assignmentPromises = selectedExpertIds.map(expertId =>
        assignJudgeToContest(selectedContestId, expertId)
      );
      await Promise.all(assignmentPromises);

      toast.success(`มอบหมายกรรมการ ${selectedExpertIds.length} คนสำเร็จ!`);
      // ดึงข้อมูลทั้งหมดใหม่เพื่อให้ได้ข้อมูลกรรมการที่ถูกต้อง 100%
      fetchInitialData(); 
      // Reset state หลังจาก submit สำเร็จ
      setSelectedContestId('');
      setSelectedExpertIds([]);
    } catch (error) {
      toast.error(error.message || "เกิดข้อผิดพลาดในการมอบหมาย");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <ManagerMenu />
      <div className="flex-1 p-4 sm:p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">มอบหมายกรรมการ</h1>
          {loading ? (
            <div className="text-center p-4">
              <LoaderCircle className="animate-spin inline-block text-purple-600" size={32} />
              <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <form onSubmit={handleAssign}>
              <div className="mb-6">
                <label htmlFor="contest-select" className="block mb-2 text-md font-medium text-gray-700">1. เลือกการประกวด:</label>
                <select
                  id="contest-select"
                  value={selectedContestId}
                  onChange={(e) => setSelectedContestId(e.target.value)}
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                >
                  <option value="" disabled>-- กรุณาเลือก --</option>
                  {contests.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {selectedContestId && (
                <div className="mb-6">
                   <div className="bg-purple-50 text-purple-800 p-3 rounded-lg mb-4 flex items-center">
                    <Users size={20} className="mr-3 flex-shrink-0"/>
                    <div>
                      <span className="font-semibold">กรรมการปัจจุบัน:</span> {currentJudgeCount} / {MAX_JUDGES} คน
                    </div>
                  </div>

                  <label htmlFor="expert-search" className="block mb-2 text-md font-medium text-gray-700">2. ค้นหาและเลือกผู้เชี่ยวชาญเพิ่มเติม:</label>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="expert-search"
                      type="text"
                      placeholder="ค้นหาชื่อผู้เชี่ยวชาญ..."
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg"
                      value={expertSearch}
                      onChange={e => setExpertSearch(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 max-h-60 overflow-y-auto p-3 border rounded-lg bg-gray-50">
                    {availableExperts.length > 0 ? availableExperts.map((expert) => (
                      <label key={expert.id} className="flex items-center p-2 rounded-md hover:bg-gray-200 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mr-3 h-5 w-5 rounded text-purple-600 focus:ring-purple-500"
                          checked={selectedExpertIds.includes(expert.id)}
                          onChange={(e) => handleExpertSelection(expert.id, e.target.checked)}
                        />
                        <span className="text-gray-800">{expert.first_name} {expert.last_name}</span>
                      </label>
                    )) : (
                      <p className="text-gray-500 col-span-2 text-center py-4">ไม่พบผู้เชี่ยวชาญที่ว่างหรือตรงกับคำค้นหา</p>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !selectedContestId || selectedExpertIds.length === 0}
                className="bg-purple-600 text-white font-bold px-4 py-3 rounded-lg hover:bg-purple-700 transition w-full flex items-center justify-center disabled:bg-purple-300 disabled:cursor-not-allowed"
              >
                {isSubmitting && <LoaderCircle className="animate-spin mr-2" />}
                {isSubmitting ? "กำลังมอบหมาย..." : "บันทึกการมอบหมาย"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignJudges;