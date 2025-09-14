// D:\\ProJectFinal\\Lasts\\my-project\\src\\Pages\\Manager\\ContestList.jsx (ฉบับแก้ไขสมบูรณ์)

import React, { useState, useEffect, useMemo } from "react";
import {
  Search, Filter, Eye, Edit2, Trash2,
  CheckCircle, XCircle, Clock, CircleDot, Trophy,
  Frown, FileText, LoaderCircle, AlertTriangle, Calendar
} from "lucide-react";
import ManagerMenu from "../../Component/ManagerMenu";
import Modal from "../../ui/Modal";
import EditContestModal from "./EditContestModal";
import { toast } from "react-toastify";
import { getMyContests, deleteMyContest } from "../../services/managerService";

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

const ContestList = () => {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ getMyContests() ตอนนี้คืน Array ตรง ๆ แล้ว (res.data)
      const items = await getMyContests();
      setAllItems(Array.isArray(items) ? items : []);
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล: " + (err?.message || "ไม่ทราบสาเหตุ"));
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      await deleteMyContest(itemToDelete.id); // apiService รองรับ 204 แล้ว
      toast.success(`ลบ "${itemToDelete.name}" สำเร็จ!`);
      await fetchItems();
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการลบ: " + (err?.message || "ไม่ทราบสาเหตุ"));
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleModalClose = (shouldRefetch) => {
    setIsEditModalOpen(false);
    if (shouldRefetch) fetchItems();
  };

  const handleShowDetails = (item) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const formatReadableDate = (isoString) =>
    isoString
      ? new Date(isoString).toLocaleDateString("th-TH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchCategory = !categoryFilter || item.category === categoryFilter;
      const matchStatus = !statusFilter || item.status === statusFilter;
      const matchSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
      if (categoryFilter && categoryFilter !== "การประกวด") {
        return matchCategory && matchSearch;
      }
      return matchCategory && matchStatus && matchSearch;
    });
  }, [allItems, searchQuery, statusFilter, categoryFilter]);

  useEffect(() => {
    if (categoryFilter && categoryFilter !== "การประกวด") {
      setStatusFilter("");
    }
  }, [categoryFilter]);

  const getStatusIcon = (status) => {
    const statusMap = {
      draft: { icon: <CircleDot className="text-gray-500" size={20} /> },
      "กำลังดำเนินการ": { icon: <Clock className="text-blue-500" size={20} /> },
      "ปิดรับสมัคร": { icon: <XCircle className="text-orange-500" size={20} /> },
      "ตัดสิน": { icon: <Trophy className="text-purple-500" size={20} /> },
      "ประกาศผล": { icon: <CheckCircle className="text-green-500" size={20} /> },
      "ยกเลิก": { icon: <XCircle className="text-red-500" size={20} /> },
    };
    return statusMap[status]?.icon || <FileText className="text-gray-600" size={20} />;
  };

  const statusBadgeCls = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'กำลังดำเนินการ':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'ปิดรับสมัคร':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ตัดสิน':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ประกาศผล':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ยกเลิก':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <LoaderCircle className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 bg-red-50 p-4 rounded-md">{error}</div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <ManagerMenu />
      <div className="flex-1 p-4 sm:p-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">รายการกิจกรรมทั้งหมด (แก้ไข/ลบ)</h1>

          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
              <div className="relative flex-grow mb-4 md:mb-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
              <div className="relative flex-grow mb-4 md:mb-0">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none"
                >
                  <option value="">ทุกประเภท</option>
                  <option value="การประกวด">การประกวด</option>
                  <option value="ข่าวสารทั่วไป">ข่าวสารทั่วไป</option>
                  <option value="ข่าวสารประชาสัมพันธ์">ข่าวสารประชาสัมพันธ์</option>
                </select>
              </div>
              <div className="relative flex-grow">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none"
                  disabled={categoryFilter && categoryFilter !== "การประกวด"}
                >
                  <option value="">ทุกสถานะ (เฉพาะการประกวด)</option>
                  <option value="draft">ร่าง</option>
                  <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                  <option value="ปิดรับสมัคร">ปิดรับสมัคร</option>
                  <option value="ตัดสิน">ตัดสิน</option>
                  <option value="ประกาศผล">ประกาศผล</option>
                  <option value="ยกเลิก">ยกเลิก</option>
                </select>
              </div>
            </div>

            <div className="border-t pt-4">
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="group bg-white rounded-2xl overflow-hidden border-2 shadow-sm hover:shadow-md transition-all cursor-pointer border-gray-200 hover:border-purple-300">
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img
                          src={item.poster_url || POSTER_PLACEHOLDER}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.01] transition-transform"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => { e.currentTarget.src = POSTER_PLACEHOLDER; }}
                        />
                        {item.category === 'การประกวด' && (
                          <div className={`absolute left-3 top-3 px-2.5 py-1 text-xs font-semibold rounded-full border ${statusBadgeCls(item.status)}`}>
                            {item.status || 'draft'}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-1">{item.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={16} />
                          <span>{formatReadableDate(item.start_date)} - {formatReadableDate(item.end_date)}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-gray-500 capitalize">{item.category}</span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleShowDetails(item)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                              title="ดูรายละเอียด"
                              type="button"
                            >
                              <Eye />
                            </button>
                            <button
                              onClick={() => handleEditItem(item)}
                              className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full"
                              title="แก้ไข"
                              type="button"
                            >
                              <Edit2 />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                              title="ลบ"
                              type="button"
                            >
                              <Trash2 />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-10 flex flex-col items-center">
                  <Frown size={48} className="mb-2" />
                  <span className="font-semibold">ไม่พบรายการที่ตรงกับเงื่อนไข</span>
                </div>
              )}
            </div>
          </div>

          <Modal isOpen={isDetailModalOpen} onRequestClose={() => setIsDetailModalOpen(false)} title={selectedItem?.name} maxWidth="max-w-2xl">
            {selectedItem && (
              <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                <p>
                  <strong>ประเภท:</strong> {selectedItem.category}
                </p>
                {selectedItem.category === "การประกวด" && (
                  <p>
                    <strong>สถานะ:</strong> {selectedItem.status}
                  </p>
                )}
                <p>
                  <strong>วันที่เริ่ม:</strong> {formatReadableDate(selectedItem.start_date)}
                </p>
                <p>
                  <strong>วันที่สิ้นสุด:</strong> {formatReadableDate(selectedItem.end_date)}
                </p>
                <p>
                  <strong>คำอธิบายย่อ:</strong> {selectedItem.short_description}</p>
                {selectedItem.poster_url && (
                  <div className="my-4">
                    <img
                      src={selectedItem.poster_url}
                      alt="poster"
                      className="rounded-lg max-h-60 mx-auto"
                    />
                  </div>
                )}
                {selectedItem.category === "การประกวด" && (
                  <div>
                    <h4 className="font-bold mt-4">กรรมการที่มอบหมาย:</h4>
                    <ul className="list-disc list-inside ml-5">
                      {(() => {
                        // ✅ รองรับทั้งรูปแบบที่ backend ส่ง judge_id + judge:{} หรือ profiles:{}
                        const judges = selectedItem.contest_judges ?? [];
                        if (judges.length === 0) return <li>ยังไม่มีกรรมการ</li>;
                        return judges.map((j, idx) => {
                          const key = j.judge_id ?? j.profiles?.id ?? idx;
                          const first = j.judge?.first_name ?? j.profiles?.first_name ?? "-";
                          const last = j.judge?.last_name ?? j.profiles?.last_name ?? "";
                          return (
                            <li key={key}>
                              {first} {last} ({j.status})
                            </li>
                          );
                        });
                      })()}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Modal>

          {isEditModalOpen && (
            <EditContestModal
              isOpen={isEditModalOpen}
              onRequestClose={handleModalClose}
              contestData={selectedItem}
            />
          )}

          <Modal isOpen={isDeleteModalOpen} onRequestClose={() => setIsDeleteModalOpen(false)} title="ยืนยันการลบ" maxWidth="max-w-sm">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
              <p className="text-gray-600 mt-2">
                คุณแน่ใจหรือไม่ว่าต้องการลบ <br />
                <span className="font-semibold">&quot;{itemToDelete?.name}&quot;</span>?
                <br />
                การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">ยกเลิก</button>
                <button onClick={confirmDeleteItem} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">ยืนยันการลบ</button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default ContestList;
