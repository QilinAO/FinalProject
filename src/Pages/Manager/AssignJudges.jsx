// D:\\ProJectFinal\\Lasts\\my-project\\src\\Pages\\Manager\\AssignJudges.jsx (ฉบับแก้ไขสมบูรณ์)

import React, { useState, useEffect } from "react";
import ManagerMenu from "../../Component/ManagerMenu";
import { toast } from "react-toastify";
import { LoaderCircle, Search, Users, Calendar } from "lucide-react";
import { getMyContests, getExpertList, assignJudgeToContest } from "../../services/managerService";

const MAX_JUDGES = 3; // โควตากรรมการสูงสุด

// Poster 占位
const POSTER_PLACEHOLDER =
  'data:image/svg+xml;utf8,\
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">\
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">\
<stop offset="0%" stop-color="#eef2ff"/><stop offset="100%" stop-color="#fce7f3"/>\
</linearGradient></defs>\
<rect width="640" height="360" fill="url(#g)"/>\
<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#9ca3af" font-family="Arial" font-size="24">No poster</text>\
</svg>';

// Map 子类别 ID -> 标签（与创建页一致）
const SUBCAT_LABELS_BY_ID = {
  A: "ปลากัดพื้นบ้านภาคกลางและเหนือ",
  B: "ปลากัดพื้นบ้านภาคอีสาน",
  C: "ปลากัดพื้นภาคใต้",
  D: "ปลากัดพื้นบ้านมหาชัย",
  E: "ปลากัดพื้นบ้านภาคตะวันออก",
  F: "ปลากัดพื้นบ้านอีสานหางลาย",
  G: "ปลากัดป่าพัฒนาสีสัน(รวมทุกประเภท)",
  H: "ปลากัดป่ารุ่นจิ๋ว(รวมทุกประเภท ความยาวไม่เกิน 1.2 นิ้ว)",
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return String(dateString);
  }
};

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
          ["draft", "กำลังดำเนินการ", "ปิดรับสมัคร"].includes(c.status)
      );
      setContests(eligible);
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
  // นับเฉพาะที่ยัง active (ไม่นับ declined) 用于配额
  const activeAssigned = assignedJudges.filter((j) => j.status !== "declined");
  const currentJudgeCount = activeAssigned.length;

  // 显示卡片用（包含状态）
  const currentJudgeCards = assignedJudges
    .map((a) => {
      const judge = a.judge || a.profiles || {};
      return {
        id: judge.id || a.judge_id || String(judge.id || ""),
        first_name: judge.first_name || "",
        last_name: judge.last_name || "",
        username: judge.username || "",
        specialities: Array.isArray(judge.specialities) ? judge.specialities : [],
        status: a.status || 'pending',
      };
    })
    .filter((j) => j.id);

  const isExpertAlreadyAssigned = (expertId) => {
    const eid = String(expertId);
    return assignedJudges.some(
      (a) => String(a.judge_id ?? a.profiles?.id ?? a.judge?.id ?? "") === eid
    );
  };

  // 计算比赛允许的标签集合（若配置了 allowed_subcategories）
  const allowedLabels = Array.isArray(selectedContest?.allowed_subcategories)
    ? selectedContest.allowed_subcategories
        .map((id) => SUBCAT_LABELS_BY_ID[id])
        .filter(Boolean)
    : [];

  // รายชื่อผู้เชี่ยวชาญที่ยังว่าง + 搜索 + 严格匹配比赛领域
  const availableExperts = (experts || [])
    .filter((expert) => {
      if (!selectedContest) return true;
      return !isExpertAlreadyAssigned(expert.id);
    })
    .filter((expert) => {
      const specs = Array.isArray(expert.specialities) ? expert.specialities : [];
      // 优先：若存在 fish_type，则严格按 fish_type 过滤
      if (selectedContest?.fish_type) {
        return specs.includes(selectedContest.fish_type);
      }
      // 否则：若配置了 allowed_subcategories，则与其标签集合有交集才显示
      if (allowedLabels.length > 0) {
        return specs.some((s) => allowedLabels.includes(s));
      }
      // 若未配置任何领域限制，则不过滤
      return true;
    })
    .filter((expert) => {
      const fullName = `${expert.first_name || ""} ${expert.last_name || ""}`
        .trim()
        .toLowerCase();
      return fullName.includes(expertSearch.toLowerCase());
    });

  const filteredExpertCount = availableExperts.length;
  const totalExpertCount = experts.length;

  const handleExpertSelection = (expertId, isChecked) => {
    const eid = String(expertId);
    if (isChecked) {
      const willLen = selectedExpertIds.length + 1 + currentJudgeCount;
      if (willLen > MAX_JUDGES) {
        toast.warn(`สามารถเลือกกรรมการได้สูงสุด ${MAX_JUDGES} คน (มีอยู่แล้ว ${currentJudgeCount} คน)`);
        return; // 不更新 state，避免超过上限
      }
      setSelectedExpertIds([...selectedExpertIds, eid]);
    } else {
      setSelectedExpertIds(selectedExpertIds.filter((id) => String(id) !== eid));
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedContestId) return toast.error("กรุณาเลือกการประกวด");
    if (selectedExpertIds.length === 0) return toast.error("กรุณาเลือกกรรมการอย่างน้อย 1 คน");
    setIsSubmitting(true);
    try {
      const promises = selectedExpertIds.map((eid) => assignJudgeToContest(selectedContestId, eid));
      await Promise.all(promises);
      toast.success(`มอบหมายกรรมการ ${selectedExpertIds.length} คนสำเร็จ!`);
      await fetchInitialData();
      setSelectedContestId("");
      setSelectedExpertIds([]);
    } catch (error) {
      toast.error(error?.message || "เกิดข้อผิดพลาดในการมอบหมาย");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveJudge = async (contestId, judgeId, nameLabel) => {
    if (!contestId || !judgeId) return;
    if (!window.confirm(`ต้องการลบ ${nameLabel} ออกจากคณะกรรมการหรือไม่?`)) return;
    try {
      const resp = await fetch(`/api/manager/contests/${contestId}/judges/${judgeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!resp.ok) throw new Error('ลบกรรมการไม่สำเร็จ');
      toast.success('ลบกรรมการสำเร็จ');
      await fetchInitialData();
      setSelectedContestId(String(contestId));
    } catch (e) {
      toast.error(e.message || 'เกิดข้อผิดพลาดในการลบกรรมการ');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <ManagerMenu />
      <div className="flex-1 p-4 sm:p-8 flex items-start justify-center">
        <div className="max-w-6xl w-full mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">มอบหมายกรรมการ</h1>

          {loading ? (
            <div className="text-center p-8 bg-white rounded-2xl shadow">
              <LoaderCircle className="animate-spin inline-block text-purple-600" size={32} />
              <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <form onSubmit={handleAssign} className="space-y-8">
              {/* 1. เลือกการประกวด (卡片) */}
              <div>
                <label className="block mb-3 text-md font-semibold text-gray-700">1. เลือกการประกวด:</label>
                {contests.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center text-gray-500 border">ยังไม่มีการประกวดที่สามารถมอบหมายได้</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {contests.map((c) => {
                      const isSelected = String(selectedContestId) === String(c.id);
                      const statusColor = c.status === 'draft'
                        ? 'bg-gray-100 text-gray-700 border-gray-200'
                        : c.status === 'กำลังดำเนินการ'
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : c.status === 'ปิดรับสมัคร'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200';
                      const activeCount = (c.contest_judges || []).filter(j => j.status !== 'declined').length;
                      return (
                        <div
                          key={c.id}
                          className={`group bg-white rounded-2xl overflow-hidden border-2 shadow-sm hover:shadow-md transition-all cursor-pointer ${isSelected ? 'border-purple-500 shadow-purple-200' : 'border-gray-200 hover:border-purple-300'}`}
                          onClick={() => setSelectedContestId(String(c.id))}
                        >
                          <div className="relative aspect-[16/9] overflow-hidden">
                            <img
                              src={c.poster_url || POSTER_PLACEHOLDER}
                              alt={c.name}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.01] transition-transform"
                              loading="lazy"
                              decoding="async"
                              onError={(e) => { e.currentTarget.src = POSTER_PLACEHOLDER; }}
                            />
                            <div className={`absolute left-3 top-3 px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColor}`}>{c.status}</div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-1">{c.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar size={16} />
                              <span>{formatDate(c.start_date)} - {formatDate(c.end_date)}</span>
                            </div>
                            <div className="mt-3 text-xs text-gray-500">กรรมการปัจจุบัน: {activeCount} / {MAX_JUDGES}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. กรรมการปัจจุบัน + 3. เลือกผู้เชี่ยวชาญ */}
              {selectedContestId && (
                <>
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-2 rounded-lg mr-3"><Users size={24} className="text-purple-600" /></div>
                        <div>
                          <h3 className="text-lg font-semibold text-purple-800">กรรมการปัจจุบัน</h3>
                          <p className="text-sm text-purple-600">{currentJudgeCount} / {MAX_JUDGES} คน (ไม่นับผู้ที่ปฏิเสธ)</p>
                        </div>
                      </div>
                    </div>

                    {currentJudgeCards.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {currentJudgeCards.map((judge) => {
                          const status = (judge.status || '').toLowerCase();
                          const chip = status === 'accepted'
                            ? { text: 'ยอมรับแล้ว', cls: 'bg-green-100 text-green-800 border border-green-200' }
                            : status === 'declined'
                            ? { text: 'ปฏิเสธแล้ว', cls: 'bg-red-100 text-red-700 border border-red-200' }
                            : { text: 'รอดำเนินการ', cls: 'bg-amber-100 text-amber-800 border border-amber-200' };
                          const nameLabel = `${judge.first_name} ${judge.last_name}`.trim() || (judge.username ? `@${judge.username}` : 'กรรมการ');
                          return (
                            <div key={judge.id} className="bg-white rounded-lg p-3 border border-purple-200 shadow-sm">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-800">{judge.first_name} {judge.last_name}</h4>
                                  {judge.username && (
                                    <p className="text-xs text-gray-500">@{judge.username}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${chip.cls}`}>{chip.text}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveJudge(selectedContestId, judge.id, nameLabel)}
                                    className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                                  >
                                    🗑️ ลบ
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-purple-600 text-sm">ยังไม่มีกรรมการที่มอบหมาย</div>
                    )}
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3"><Users size={24} className="text-blue-600" /></div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">เลือกผู้เชี่ยวชาญเพิ่มเติม</h3>
                        <p className="text-sm text-gray-600">ระบบจะแสดงเฉพาะผู้เชี่ยวชาญที่ตรงกับประเภทการประกวด</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                      {selectedContest?.fish_type ? (
                        <div className="text-blue-700 text-sm">🎯 ตัวกรองหลัก: <span className="ml-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">{selectedContest.fish_type}</span></div>
                      ) : allowedLabels.length > 0 ? (
                        <div className="text-blue-700 text-sm flex flex-wrap items-center gap-2">
                          🎯 ตัวกรองตามประเภทที่เปิดรับ:
                          {allowedLabels.map((lb) => (
                            <span key={lb} className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">{lb}</span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-amber-700 text-sm">⚠️ ไม่กำหนดประเภท — จะแสดงผู้เชี่ยวชาญทั้งหมด</div>
                      )}
                      <div className="mt-2 text-sm text-blue-600">📊 แสดง {filteredExpertCount} คน จากทั้งหมด {totalExpertCount} คน</div>
                    </div>

                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
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
                          const checked = selectedExpertIds.some((id) => String(id) === eid);
                          const isSpecialityMatch = selectedContest?.fish_type
                            ? (Array.isArray(expert.specialities) && expert.specialities.includes(selectedContest.fish_type))
                            : (allowedLabels.length > 0 && Array.isArray(expert.specialities) && expert.specialities.some((s) => allowedLabels.includes(s)));
                          return (
                            <div
                              key={eid}
                              className={`relative bg-white rounded-xl shadow-md border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${checked ? 'border-purple-500 bg-purple-50 shadow-purple-200' : 'border-gray-200 hover:border-purple-300'} ${isSpecialityMatch ? 'ring-2 ring-green-200' : ''}`}
                              onClick={() => handleExpertSelection(eid, !checked)}
                            >
                              <div className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{expert.first_name} {expert.last_name}</h3>
                                    <p className="text-sm text-gray-600">@{expert.username}</p>
                                  </div>
                                  <div className="ml-3">
                                    <input
                                      type="checkbox"
                                      className="h-5 w-5 rounded text-purple-600 focus:ring-purple-500 border-2 border-gray-300"
                                      checked={checked}
                                      onChange={(e) => { e.stopPropagation(); handleExpertSelection(eid, e.target.checked); }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="px-4 py-3 bg-gray-50 rounded-b-xl border-t border-gray-100">
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>{checked ? '✅ เลือกแล้ว' : '👤 เลือกเป็นกรรมการ'}</span>
                                  {isSpecialityMatch && <span className="text-green-600 font-medium">🎯 ตรงความเชี่ยวชาญ</span>}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-full text-center py-12">
                          <div className="text-gray-400 mb-3"><Users size={48} className="mx-auto" /></div>
                          <p className="text-gray-500 text-lg font-medium mb-2">ไม่พบผู้เชี่ยวชาญที่ตรงกับประเภทที่เลือก</p>
                          <p className="text-gray-400 text-sm">ลองปรับประเภทที่เปิดรับในหน้าจัดการการประกวด</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* 控制按钮 */}
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
                  disabled={isSubmitting || !selectedContestId || selectedExpertIds.length === 0}
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
