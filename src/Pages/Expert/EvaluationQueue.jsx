// ======================================================================
// File: src/Pages/Expert/EvaluationQueue.jsx
// หน้าที่: จัดการคิวงานประเมินคุณภาพสำหรับผู้เชี่ยวชาญ
// ======================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { getEvaluationQueue, respondToEvaluation, submitQualityScores } from '../../services/expertService';
import { toast } from 'react-toastify';
import Modal from '../../ui/Modal';
import { LoaderCircle, Frown, ClipboardCheck } from 'lucide-react';
import ScoringFormModal from '../../Component/ScoringFormModal';

// --- Sub-components for UI Sections ---

const QueueTabs = ({ activeTab, setActiveTab, counts }) => (
  <div className="flex border-b">
    <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'pending' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
      รอการตอบรับ ({counts.pending})
    </button>
    <button onClick={() => setActiveTab('accepted')} className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'accepted' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
      ที่ต้องให้คะแนน ({counts.accepted})
    </button>
  </div>
);

const QueueItem = ({ item, onAccept, onReject, onScore }) => (
  <div className="group bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-300 hover:-translate-y-1 border border-neutral-200/50 flex flex-col">
    {/* รูปด้านบน */}
    <div className="relative h-40 overflow-hidden bg-neutral-100">
      <img
        src={item.fish_image_urls?.[0] || 'https://placehold.co/600x400/E2E8F0/A0AEC0?text=No+Image'}
        alt={item.fish_name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
      <div className="absolute top-3 left-3 inline-flex items-center px-2 py-1 text-xs rounded-full bg-white/90 backdrop-blur-sm text-neutral-700">
        {item.status === 'pending' ? 'รอการตอบรับ' : 'ต้องให้คะแนน'}
      </div>
    </div>
    {/* เนื้อหา */}
    <div className="p-4 flex-1 flex flex-col">
      <h3 className="font-bold text-lg text-heading line-clamp-1">{item.fish_name || 'ไม่มีชื่อ'}</h3>
      {/* แถวแสดงรายละเอียดแบบ badge */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          🏷️ ประเภท: {item.fish_type || 'ไม่ระบุ'}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-neutral-50 text-neutral-700 border border-neutral-200">
          👤 ผู้ส่ง: {item.owner_name || 'ไม่ทราบ'}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {item.status === 'pending' ? (
          <>
            <button onClick={() => onAccept(item.assignment_id)} className="px-3 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition">ตอบรับ</button>
            <button onClick={() => onReject(item)} className="px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 transition">ปฏิเสธ</button>
          </>
        ) : (
          <div className="col-span-2">
            <button onClick={() => onScore(item)} className="w-full px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">ให้คะแนน</button>
          </div>
        )}
      </div>
    </div>
  </div>
);

const QueueList = ({ items, onAccept, onReject, onScore }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {items.map(item => (
      <QueueItem key={item.assignment_id} item={item} onAccept={onAccept} onReject={onReject} onScore={onScore} />
    ))}
  </div>
);

const RejectReasonModal = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!reason.trim()) {
      return toast.warn("กรุณากรอกเหตุผลที่ปฏิเสธ");
    }
    onSubmit(reason);
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} title="เหตุผลที่ปฏิเสธ" maxWidth="max-w-lg">
      <textarea 
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="เช่น รูปภาพไม่ชัดเจน, ข้อมูลไม่ครบถ้วน..." 
        className="w-full h-32 p-3 border rounded-md focus:ring-2 focus:ring-blue-500" 
      />
      <div className="flex justify-end gap-3 mt-4">
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">ยกเลิก</button>
        <button onClick={handleSubmit} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">ยืนยันการปฏิเสธ</button>
      </div>
    </Modal>
  );
};

const LoadingIndicator = () => (
  <div className="flex justify-center p-10"><LoaderCircle className="animate-spin text-blue-500" size={32}/></div>
);

const EmptyState = () => (
  <div className="text-center py-16 bg-gray-50 rounded-lg">
    <Frown size={48} className="mx-auto text-gray-400 mb-2"/>
    <p className="text-gray-500">ไม่มีรายการในคิวนี้</p>
  </div>
);

// --- Main Component ---

const EvaluationQueue = () => {
  const [queue, setQueue] = useState({ pending: [], accepted: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [scoringSubmission, setScoringSubmission] = useState(null);
  const [rejectingSubmission, setRejectingSubmission] = useState(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEvaluationQueue();
      setQueue(res.data || { pending: [], accepted: [] });
    } catch (error) {
      toast.error("ไม่สามารถโหลดคิวงานประเมินได้");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleResponse = async (assignmentId, status) => {
    try {
      await respondToEvaluation(assignmentId, status);
      toast.success(`คุณได้ ${status === 'accepted' ? 'ตอบรับ' : 'ปฏิเสธ'} งานแล้ว`);
      fetchQueue();
    } catch (error) { 
      toast.error(error.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleRejectSubmit = async (reason) => {
    if (!rejectingSubmission) return;
    try {
      await respondToEvaluation(rejectingSubmission.assignment_id, 'rejected', reason);
      toast.success("ปฏิเสธงานเรียบร้อยแล้ว");
      setRejectingSubmission(null);
      fetchQueue();
    } catch (err) {
      toast.error(err.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleSubmitScores = async (assignmentId, scoresData) => {
    try {
      await submitQualityScores(assignmentId, scoresData);
      toast.success("ส่งคะแนนเรียบร้อยแล้ว!");
      setScoringSubmission(null);
      fetchQueue();
    } catch (err) { 
      toast.error(err.message || "ส่งคะแนนไม่สำเร็จ");
    }
  };

  const currentList = queue[activeTab] || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
        <ClipboardCheck className="text-teal-600"/>
        คิวงานประเมินคุณภาพ
      </h1>
      
      <QueueTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        counts={{ pending: queue.pending.length, accepted: queue.accepted.length }}
      />

      {loading ? (
        <LoadingIndicator />
      ) : currentList.length > 0 ? (
        <QueueList 
          items={currentList}
          onAccept={(id) => handleResponse(id, 'accepted')}
          onReject={(item) => setRejectingSubmission(item)}
          onScore={(item) => setScoringSubmission(item)}
        />
      ) : (
        <EmptyState />
      )}

      {scoringSubmission && (
        <ScoringFormModal 
          isOpen={!!scoringSubmission} 
          onRequestClose={() => setScoringSubmission(null)} 
          submission={scoringSubmission} 
          onSubmit={handleSubmitScores} 
        />
      )}

      <RejectReasonModal 
        isOpen={!!rejectingSubmission}
        onClose={() => setRejectingSubmission(null)}
        onSubmit={handleRejectSubmit}
      />
    </div>
  );
};

export default EvaluationQueue;
