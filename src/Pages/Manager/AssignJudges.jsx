// D:\ProJectFinal\Lasts\my-project\src\Pages\Manager\AssignJudges.jsx (ฉบับแก้ไขสมบูรณ์)

import React, { useState, useEffect } from "react";
import ManagerMenu from "../../Component/ManagerMenu";
import { toast } from "react-toastify";
import { LoaderCircle, Search, Users } from "lucide-react";
import { getMyContests, getExpertList, assignJudgeToContest, updateMyContest } from "../../services/managerService";

const MAX_JUDGES = 3; // โควตากรรมการสูงสุด

const AssignJudges = () => {
  const [contests, setContests] = useState([]);
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContestId, setSelectedContestId] = useState("");
  const [selectedExpertIds, setSelectedExpertIds] = useState([]); // เก็บเป็น string ทั้งหมดเพื่อกัน type mismatch
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expertSearch, setExpertSearch] = useState("");

  // โหลดข้อมูลเริ่มต้น
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const contestsData = await getMyContests();
      // ✅ เอาเฉพาะ "การประกวด" และสถานะที่ยังอนุญาตให้มอบหมาย
      const eligible = (contestsData || []).filter(
        (c) =>
          c.category === "การประกวด" &&
          !["ประกาศผล", "ยกเลิก", "ตัดสิน"].includes(c.status)
      );
      setContests(eligible);
      // ไม่โหลดผู้เชี่ยวชาญตอนเริ่มต้น รอให้เลือกการแข่งขันก่อน
      setExperts([]);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล: " + (error?.message || "ไม่ทราบสาเหตุ"));
    } finally {
      setLoading(false);
    }
  };

  // โหลดผู้เชี่ยวชาญเมื่อเลือกการแข่งขัน
  const fetchExpertsForContest = async (contestId) => {
    if (!contestId) return;
    
    try {
      const expertsData = await getExpertList(contestId);
      setExperts(expertsData || []);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดรายชื่อผู้เชี่ยวชาญ: " + (error?.message || "ไม่ทราบสาเหตุ"));
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Reset และโหลดผู้เชี่ยวชาญเมื่อเปลี่ยนการประกวด
  useEffect(() => {
    setSelectedExpertIds([]);
    setExpertSearch("");
    if (selectedContestId) {
      fetchExpertsForContest(selectedContestId);
    }
  }, [selectedContestId]);

  // หา contest ที่เลือกแบบเทียบ id เป็น string เสมอ
  const selectedContest = selectedContestId
    ? contests.find((c) => String(c.id) === String(selectedContestId))
    : null;

  // กรรมการที่ถูกมอบหมายปัจจุบัน (กัน null/undefined)
  const assignedJudges = selectedContest?.contest_judges ?? [];
  // นับเฉพาะที่ยัง active (ไม่นับ declined)
  const activeAssigned = assignedJudges.filter((j) => j.status !== "declined");
  const currentJudgeCount = activeAssigned.length;

  // ฟังก์ชันเช็คว่า expert คนนี้ถูกมอบหมายแล้วหรือยัง (รองรับหลายรูปแบบ payload)
  const isExpertAlreadyAssigned = (expertId) => {
    const eid = String(expertId);
    return activeAssigned.some(
      (a) =>
        String(a.judge_id ?? a.profiles?.id ?? a.judge?.id ?? "") === eid
    );
  };

  // รายชื่อผู้เชี่ยวชาญที่ยังว่าง + ตรงคำค้น + กรองตามประเภทปลากัด
  const availableExperts = (experts || [])
    .filter((expert) => {
      if (!selectedContest) return true;
      return !isExpertAlreadyAssigned(expert.id);
    })
    .filter((expert) => {
      // กรองตามประเภทปลากัดของการแข่งขัน
      if (selectedContest?.fish_type) {
        return expert.specialities && 
               Array.isArray(expert.specialities) && 
               expert.specialities.includes(selectedContest.fish_type);
      }
      return true; // ถ้าไม่มี fish_type ให้แสดงทั้งหมด
    })
    .filter((expert) => {
      const fullName = `${expert.first_name || ""} ${expert.last_name || ""}`
        .trim()
        .toLowerCase();
      return fullName.includes(expertSearch.toLowerCase());
    });

  // นับจำนวนผู้เชี่ยวชาญที่กรองแล้ว
  const filteredExpertCount = availableExperts.length;
  const totalExpertCount = experts.length;

  // เลือก/ไม่เลือกกรรมการ
  const handleExpertSelection = (expertId, isChecked) => {
    const eid = String(expertId);
    setSelectedExpertIds((prevIds) => {
      const newIds = isChecked
        ? [...prevIds, eid]
        : prevIds.filter((id) => String(id) !== eid);

      // รวมโควตากับที่มีอยู่แล้วใน contest
      if (newIds.length + currentJudgeCount > MAX_JUDGES) {
        toast.warn(
          `สามารถเลือกกรรมการได้สูงสุด ${MAX_JUDGES} คน (มีอยู่แล้ว ${currentJudgeCount} คน)`
        );
        return prevIds; // ไม่ให้เกินโควตา
      }
      return newIds;
    });
  };

  // Submit มอบหมาย
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedContestId)
      return toast.error("กรุณาเลือกการประกวด");
    if (selectedExpertIds.length === 0)
      return toast.error("กรุณาเลือกกรรมการอย่างน้อย 1 คน");

    setIsSubmitting(true);
    try {
      // ส่งทีละคน (หรือจะใช้ Promise.all เหมือนเดิมก็ได้)
      const promises = selectedExpertIds.map((eid) =>
        assignJudgeToContest(selectedContestId, eid)
      );
      await Promise.all(promises);

      toast.success(`มอบหมายกรรมการ ${selectedExpertIds.length} คนสำเร็จ!`);
      await fetchInitialData(); // โหลดข้อมูลใหม่ให้ครบ 100%
      setSelectedContestId("");
      setSelectedExpertIds([]);
    } catch (error) {
      toast.error(error?.message || "เกิดข้อผิดพลาดในการมอบหมาย");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <ManagerMenu />
      <div className="flex-1 p-4 sm:p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
            มอบหมายกรรมการ
          </h1>

          {loading ? (
            <div className="text-center p-4">
              <LoaderCircle
                className="animate-spin inline-block text-purple-600"
                size={32}
              />
              <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <form onSubmit={handleAssign}>
              <div className="mb-6">
                <label
                  htmlFor="contest-select"
                  className="block mb-2 text-md font-medium text-gray-700"
                >
                  1. เลือกการประกวด:
                </label>
                <select
                  id="contest-select"
                  value={selectedContestId}
                  onChange={(e) => setSelectedContestId(String(e.target.value))}
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                >
                  <option value="" disabled>
                    -- กรุณาเลือก --
                  </option>
                  {contests.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedContestId && (
                <div className="mb-6">
                  {/* กรรมการปัจจุบัน */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-2 rounded-lg mr-3">
                          <Users size={24} className="text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-purple-800">
                            กรรมการปัจจุบัน
                          </h3>
                          <p className="text-sm text-purple-600">
                            {currentJudgeCount} / {MAX_JUDGES} คน
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-purple-700 mb-2">
                          <span className="font-medium">ประเภทปลากัด:</span>
                          <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                            selectedContest?.fish_type 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {selectedContest?.fish_type || 'ยังไม่ได้ระบุ'}
                          </span>
                        </div>
                        
                        {!selectedContest?.fish_type && (
                          <button
                            type="button"
                            onClick={() => {
                              updateMyContest(selectedContest.id, { fish_type: 'ปลากัดพื้นภาคใต้' })
                                .then(() => {
                                  toast.success('อัปเดตประเภทปลากัดสำเร็จ!');
                                  fetchInitialData();
                                })
                                .catch(error => {
                                  toast.error('อัปเดตประเภทปลากัดล้มเหลว: ' + error.message);
                                });
                            }}
                            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                          >
                            🎯 ตั้งค่าเป็น "ปลากัดพื้นภาคใต้"
                          </button>
                        )}
                      </div>
                    </div>

                    {/* แสดงกรรมการปัจจุบันแบบการ์ด */}
                    {currentJudges.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {currentJudges.map((judge) => (
                          <div key={judge.id} className="bg-white rounded-lg p-3 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800">
                                  {judge.first_name} {judge.last_name}
                                </h4>
                                <p className="text-xs text-gray-500">@{judge.username}</p>
                                {judge.specialities && judge.specialities.length > 0 && (
                                  <div className="mt-2">
                                    <div className="flex flex-wrap gap-1">
                                      {judge.specialities.map((speciality, index) => (
                                        <span
                                          key={index}
                                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            speciality === selectedContest?.fish_type
                                              ? 'bg-green-100 text-green-800 border border-green-200'
                                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                                          }`}
                                        >
                                          {speciality}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  ✅ กรรมการ
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`ต้องการลบ ${judge.first_name} ${judge.last_name} ออกจากคณะกรรมการหรือไม่?`)) {
                                      // TODO: เพิ่มฟังก์ชันลบกรรมการ
                                      toast.info('ฟีเจอร์ลบกรรมการจะเปิดใช้งานเร็วๆ นี้');
                                    }
                                  }}
                                  className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                                >
                                  🗑️ ลบ
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-purple-400 mb-2">
                          <Users size={32} className="mx-auto" />
                        </div>
                        <p className="text-purple-600 text-sm">
                          ยังไม่มีกรรมการที่มอบหมาย
                        </p>
                        <p className="text-purple-500 text-xs mt-1">
                          เลือกผู้เชี่ยวชาญด้านล่างเพื่อมอบหมายเป็นกรรมการ
                        </p>
                      </div>
                    )}
                  </div>

                  {/* เลือกผู้เชี่ยวชาญเพิ่มเติม */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <Users size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          เลือกผู้เชี่ยวชาญเพิ่มเติม
                        </h3>
                        <p className="text-sm text-gray-600">
                          เลือกกรรมการเพิ่มเติมสำหรับการแข่งขัน
                        </p>
                      </div>
                    </div>

                    {/* ข้อมูลการกรอง */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                      {selectedContest?.fish_type ? (
                        <div className="flex items-center text-blue-700">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          <span className="font-medium">กรองอัตโนมัติ:</span>
                          <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {selectedContest.fish_type}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center text-amber-700">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                          <span className="font-medium">⚠️ ไม่มีการกรอง:</span>
                          <span className="ml-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                            แสดงผู้เชี่ยวชาญทั้งหมด
                          </span>
                        </div>
                      )}
                      
                      <div className="mt-2 text-sm text-blue-600">
                        📊 แสดง {filteredExpertCount} คน จากทั้งหมด {totalExpertCount} คน
                      </div>
                    </div>

                    {/* ค้นหา */}
                    <div className="relative mb-4">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <input
                        id="expert-search"
                        type="text"
                        placeholder="🔍 ค้นหาชื่อผู้เชี่ยวชาญ..."
                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={expertSearch}
                        onChange={(e) => setExpertSearch(e.target.value)}
                      />
                    </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-200 shadow-inner">
                    {availableExperts.length > 0 ? (
                      availableExperts.map((expert) => {
                        const eid = String(expert.id);
                        const checked = selectedExpertIds.some(
                          (id) => String(id) === eid
                        );
                        const isSpecialityMatch = selectedContest?.fish_type && 
                          expert.specialities && 
                          expert.specialities.includes(selectedContest.fish_type);
                        
                        return (
                          <div
                            key={eid}
                            className={`relative bg-white rounded-xl shadow-md border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                              checked 
                                ? 'border-purple-500 bg-purple-50 shadow-purple-200' 
                                : 'border-gray-200 hover:border-purple-300'
                            } ${isSpecialityMatch ? 'ring-2 ring-green-200' : ''}`}
                            onClick={() => handleExpertSelection(eid, !checked)}
                          >
                            {/* Expert Card Header */}
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                    {expert.first_name} {expert.last_name}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    @{expert.username}
                                  </p>
                                </div>
                                
                                {/* Checkbox */}
                                <div className="ml-3">
                                  <input
                                    type="checkbox"
                                    className="h-5 w-5 rounded text-purple-600 focus:ring-purple-500 border-2 border-gray-300"
                                    checked={checked}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handleExpertSelection(eid, e.target.checked);
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Specialities */}
                              {expert.specialities && expert.specialities.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                                    ความเชี่ยวชาญ:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {expert.specialities.map((speciality, index) => (
                                      <span
                                        key={index}
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                          speciality === selectedContest?.fish_type
                                            ? 'bg-green-100 text-green-800 border border-green-200'
                                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                                        }`}
                                      >
                                        {speciality}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Match Indicator */}
                              {selectedContest?.fish_type && isSpecialityMatch && (
                                <div className="flex items-center text-green-600 text-sm">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                  ตรงกับประเภทปลากัดที่เลือก
                                </div>
                              )}
                            </div>

                            {/* Card Footer */}
                            <div className="px-4 py-3 bg-gray-50 rounded-b-xl border-t border-gray-100">
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>
                                  {checked ? '✅ เลือกแล้ว' : '👤 เลือกเป็นกรรมการ'}
                                </span>
                                {isSpecialityMatch && (
                                  <span className="text-green-600 font-medium">
                                    🎯 แนะนำ
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <div className="text-gray-400 mb-3">
                          <Users size={48} className="mx-auto" />
                        </div>
                        <p className="text-gray-500 text-lg font-medium mb-2">
                          ไม่พบผู้เชี่ยวชาญที่ว่าง
                        </p>
                        <p className="text-gray-400 text-sm">
                          ลองปรับคำค้นหาหรือตรวจสอบประเภทปลากัดที่เลือก
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

              {/* ปุ่มควบคุม */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('ต้องการล้างการเลือกทั้งหมดหรือไม่?')) {
                      setSelectedExpertIds([]);
                      toast.info('ล้างการเลือกทั้งหมดแล้ว');
                    }
                  }}
                  disabled={selectedExpertIds.length === 0}
                  className="flex-1 bg-gray-500 text-white font-bold px-4 py-3 rounded-lg hover:bg-gray-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  🗑️ ล้างการเลือกทั้งหมด
                </button>
                
                <button
                  type="submit"
                  disabled={
                    isSubmitting || !selectedContestId || selectedExpertIds.length === 0
                  }
                  className="flex-1 bg-purple-600 text-white font-bold px-4 py-3 rounded-lg hover:bg-purple-700 transition disabled:bg-purple-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting && <LoaderCircle className="animate-spin mr-2" />}
                  {isSubmitting ? "กำลังมอบหมาย..." : "💾 บันทึกการมอบหมาย"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignJudges;
