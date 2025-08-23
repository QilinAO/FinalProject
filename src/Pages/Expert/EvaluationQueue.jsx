// ======================================================================
// File: src/Pages/Expert/EvaluationQueue.jsx
// หน้าที่: จัดการคิวงานประเมินคุณภาพสำหรับผู้เชี่ยวชาญ
// ======================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { getEvaluationQueue, respondToEvaluation, submitQualityScores } from '../../services/expertService';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
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
  <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row items-center gap-4 hover:shadow-md transition-shadow">
    <img 
      src={item.fish_image_urls?.[0] || 'https://placehold.co/150x150/E2E8F0/A0AEC0?text=No+Image'} 
      alt={item.fish_name} 
      className="w-24 h-24 object-cover rounded-md flex-shrink-0 border"
    />
    <div className="flex-grow text-center sm:text-left">
      <h3 className="font-bold text-lg text-gray-800">{item.fish_name}</h3>
      <p className="text-sm text-gray-600">ประเภท: {item.fish_type}</p>
      <p className="text-sm text-gray-500">โดย: {item.owner_name}</p>
    </div>
    <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
      {item.status === 'pending' ? (
        <>
          <button onClick={() => onAccept(item.assignment_id)} className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 font-semibold transition">ตอบรับ</button>
          <button onClick={() => onReject(item)} className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 font-semibold transition">ปฏิเสธ</button>
        </>
      ) : (
        <button onClick={() => onScore(item)} className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 font-semibold transition">ให้คะแนน</button>
      )}
    </div>
  </div>
);

const QueueList = ({ items, onAccept, onReject, onScore }) => (
  <div className="space-y-3">
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
    <Modal isOpen={isOpen} onRequestClose={onClose} style={{ overlay: { zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.75)' } }} className="fixed inset-0 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">เหตุผลที่ปฏิเสธ</h2>
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
    Modal.setAppElement('#root');
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