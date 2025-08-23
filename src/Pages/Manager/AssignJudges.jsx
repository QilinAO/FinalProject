// D:\ProJectFinal\Lasts\my-project\src\Pages\Manager\AssignJudges.jsx (ฉบับแก้ไขสมบูรณ์)

import React, { useState, useEffect } from "react";
import ManagerMenu from "../../Component/ManagerMenu";
import { toast } from "react-toastify";
import { LoaderCircle, Search, Users } from "lucide-react";
import { getMyContests, getExpertList, assignJudgeToContest } from "../../services/managerService";

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
      const [contestsData, expertsData] = await Promise.all([
        getMyContests(),
        getExpertList(),
      ]);
      // ✅ เอาเฉพาะ "การประกวด" และสถานะที่ยังอนุญาตให้มอบหมาย
      const eligible = (contestsData || []).filter(
        (c) =>
          c.category === "การประกวด" &&
          !["ประกาศผล", "ยกเลิก", "ตัดสิน"].includes(c.status)
      );
      setContests(eligible);
      setExperts(expertsData || []);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล: " + (error?.message || "ไม่ทราบสาเหตุ"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Reset เมื่อเปลี่ยนการประกวด
  useEffect(() => {
    setSelectedExpertIds([]);
    setExpertSearch("");
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

  // รายชื่อผู้เชี่ยวชาญที่ยังว่าง + ตรงคำค้น
  const availableExperts = (experts || [])
    .filter((expert) => {
      if (!selectedContest) return true;
      return !isExpertAlreadyAssigned(expert.id);
    })
    .filter((expert) => {
      const fullName = `${expert.first_name || ""} ${expert.last_name || ""}`
        .trim()
        .toLowerCase();
      return fullName.includes(expertSearch.toLowerCase());
    });

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
                  <div className="bg-purple-50 text-purple-800 p-3 rounded-lg mb-4 flex items-center">
                    <Users size={20} className="mr-3 flex-shrink-0" />
                    <div>
                      <span className="font-semibold">กรรมการปัจจุบัน:</span>{" "}
                      {currentJudgeCount} / {MAX_JUDGES} คน
                    </div>
                  </div>

                  <label
                    htmlFor="expert-search"
                    className="block mb-2 text-md font-medium text-gray-700"
                  >
                    2. ค้นหาและเลือกผู้เชี่ยวชาญเพิ่มเติม:
                  </label>
                  <div className="relative mb-3">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      id="expert-search"
                      type="text"
                      placeholder="ค้นหาชื่อผู้เชี่ยวชาญ..."
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg"
                      value={expertSearch}
                      onChange={(e) => setExpertSearch(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 max-h-60 overflow-y-auto p-3 border rounded-lg bg-gray-50">
                    {availableExperts.length > 0 ? (
                      availableExperts.map((expert) => {
                        const eid = String(expert.id);
                        const checked = selectedExpertIds.some(
                          (id) => String(id) === eid
                        );
                        return (
                          <label
                            key={eid}
                            className="flex items-center p-2 rounded-md hover:bg-gray-200 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="mr-3 h-5 w-5 rounded text-purple-600 focus:ring-purple-500"
                              checked={checked}
                              onChange={(e) =>
                                handleExpertSelection(eid, e.target.checked)
                              }
                            />
                            <span className="text-gray-800">
                              {expert.first_name} {expert.last_name}
                            </span>
                          </label>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 col-span-2 text-center py-4">
                        ไม่พบผู้เชี่ยวชาญที่ว่างหรือตรงกับคำค้นหา
                      </p>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  isSubmitting || !selectedContestId || selectedExpertIds.length === 0
                }
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
