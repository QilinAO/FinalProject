import React, { useState, useEffect, useMemo } from "react";
import { Search, Filter, Eye, Edit2, Trash2, CheckCircle, XCircle, Clock, CircleDot, Trophy, Frown, FileText, LoaderCircle, AlertTriangle } from "lucide-react";
import ManagerMenu from "../../Component/ManagerMenu";
import Modal from "react-modal";
import EditContestModal from "./EditContestModal";
import { toast } from 'react-toastify';
import { getMyContests, deleteMyContest } from "../../services/managerService";

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

  // State ใหม่สำหรับ Modal การลบ
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    Modal.setAppElement("#root");
    fetchItems();
  }, []);

  const fetchItems = () => {
    setLoading(true);
    setError(null);
    getMyContests()
      .then(data => {
        setAllItems(data || []);
      })
      .catch(err => {
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล: " + err.message);
        toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // แก้ไข handleDeleteItem ให้เปิด Modal แทนการลบทันที
  const handleDeleteItem = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  // ฟังก์ชันสำหรับยืนยันการลบ (จะถูกเรียกจาก Modal)
  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      await deleteMyContest(itemToDelete.id);
      toast.success(`ลบ "${itemToDelete.name}" สำเร็จ!`);
      fetchItems(); // ดึงข้อมูลใหม่หลังลบสำเร็จ
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการลบ: " + err.message);
    } finally {
      // ปิด Modal และเคลียร์ state ไม่ว่าจะสำเร็จหรือล้มเหลว
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleModalClose = (shouldRefetch) => {
    setIsEditModalOpen(false);
    if (shouldRefetch) {
      fetchItems();
    }
  };

  const handleShowDetails = (item) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const formatReadableDate = (isoString) => isoString ? new Date(isoString).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A";
  
  const filteredItems = useMemo(() => {
    return (allItems || []).filter(item => {
      const matchCategory = !categoryFilter || item.category === categoryFilter;
      const matchStatus = !statusFilter || item.status === statusFilter;
      const matchSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
      if (categoryFilter && categoryFilter !== 'การประกวด') {
        return matchCategory && matchSearch;
      }
      return matchCategory && matchStatus && matchSearch;
    });
  }, [allItems, searchQuery, statusFilter, categoryFilter]);

  useEffect(() => {
    if (categoryFilter && categoryFilter !== 'การประกวด') {
      setStatusFilter("");
    }
  }, [categoryFilter]);

  const getStatusIcon = (status) => {
    const statusMap = {
      draft: { icon: <CircleDot className="text-gray-500" size={20} /> },
      'กำลังดำเนินการ': { icon: <Clock className="text-blue-500" size={20} /> },
      'ปิดรับสมัคร': { icon: <XCircle className="text-orange-500" size={20} /> },
      'ตัดสิน': { icon: <Trophy className="text-purple-500" size={20} /> },
      'ประกาศผล': { icon: <CheckCircle className="text-green-500" size={20} /> },
      'ยกเลิก': { icon: <XCircle className="text-red-500" size={20} /> }
    };
    return statusMap[status]?.icon || <FileText className="text-gray-600" size={20} />;
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">รายการกิจกรรมทั้งหมด (แก้ไข/ลบ)</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
          <div className="relative flex-grow mb-4 md:mb-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="ค้นหาชื่อ..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
          <div className="relative flex-grow mb-4 md:mb-0">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none">
              <option value="">ทุกประเภท</option>
              <option value="การประกวด">การประกวด</option>
              <option value="ข่าวสารทั่วไป">ข่าวสารทั่วไป</option>
              <option value="ข่าวสารประชาสัมพันธ์">ข่าวสารประชาสัมพันธ์</option>
            </select>
          </div>
          <div className="relative flex-grow">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none" disabled={categoryFilter && categoryFilter !== 'การประกวด'}>
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
          <div className="grid gap-4">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-lg transition">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(item.status)}
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                      <span className="text-sm text-gray-500 capitalize">{item.category}{item.status && ` - ${item.status}`}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3 sm:mt-0 flex-shrink-0">
                    <button onClick={() => handleShowDetails(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="ดูรายละเอียด"><Eye /></button>
                    <button onClick={() => handleEditItem(item)} className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full" title="แก้ไข"><Edit2 /></button>
                    <button onClick={() => handleDeleteItem(item)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="ลบ"><Trash2 /></button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-10 flex flex-col items-center">
                <Frown size={48} className="mb-2" />
                <span className="font-semibold">ไม่พบรายการที่ตรงกับเงื่อนไข</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isDetailModalOpen} onRequestClose={() => setIsDetailModalOpen(false)} style={{ overlay: { zIndex: 1050 } }} className="fixed inset-0 flex items-center justify-center p-4" overlayClassName="fixed inset-0 bg-black bg-opacity-70">
        {selectedItem && (
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 overflow-y-auto max-h-[90vh] relative">
            <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><XCircle /></button>
            <h2 className="text-2xl font-bold mb-4">{selectedItem.name}</h2>
            <div className="space-y-2">
              <p><strong>ประเภท:</strong> {selectedItem.category}</p>
              {selectedItem.category === 'การประกวด' && <p><strong>สถานะ:</strong> {selectedItem.status}</p>}
              <p><strong>วันที่เริ่ม:</strong> {formatReadableDate(selectedItem.start_date)}</p>
              <p><strong>วันที่สิ้นสุด:</strong> {formatReadableDate(selectedItem.end_date)}</p>
              <p><strong>คำอธิบายย่อ:</strong> {selectedItem.short_description}</p>
            </div>
            <div className="my-4"><img src={selectedItem.poster_url} alt="poster" className="rounded-lg max-h-60 mx-auto" /></div>
            {selectedItem.category === 'การประกวด' && (
              <div>
                <h4 className="font-bold mt-4">กรรมการที่มอบหมาย:</h4>
                <ul className="list-disc list-inside ml-5">
                  {(selectedItem.contest_judges || []).length > 0 ? selectedItem.contest_judges.map(j => (<li key={j.profiles.id}>{j.profiles.first_name} {j.profiles.last_name} ({j.status})</li>)) : <li>ยังไม่มีกรรมการ</li>}
                </ul>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button onClick={() => setIsDetailModalOpen(false)} className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400">ปิด</button>
            </div>
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

      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        style={{ overlay: { zIndex: 1051, backgroundColor: 'rgba(0, 0, 0, 0.75)' } }}
        className="fixed inset-0 flex items-center justify-center p-4"
        contentLabel="Delete Confirmation Modal"
      >
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-auto text-center shadow-xl">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="text-xl font-bold mt-4 text-gray-800">ยืนยันการลบ</h2>
          <p className="text-gray-600 mt-2">
            คุณแน่ใจหรือไม่ว่าต้องการลบ <br />
            <span className="font-semibold">"{itemToDelete?.name}"</span>?
            <br />
            การกระทำนี้ไม่สามารถย้อนกลับได้
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
            >
              ยกเลิก
            </button>
            <button
              onClick={confirmDeleteItem}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              ยืนยันการลบ
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ContestList;