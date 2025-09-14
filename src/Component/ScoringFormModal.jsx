// ======================================================================
// File: src/Component/ScoringFormModal.jsx
// หน้าที่: Modal กลางสำหรับให้คะแนนปลากัด (ทั้งการประเมินคุณภาพและการแข่งขัน)
// ======================================================================

import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import { toast } from 'react-toastify';
import { X, Send, LoaderCircle } from 'lucide-react';
import { getScoringSchema } from '../services/expertService';
import { getBettaTypeLabel } from '../utils/bettaTypes';

/**
 * ส่วนหัวของ Modal
 */
const ModalHeader = ({ title, onClose }) => (
  <div className="flex justify-between items-center pb-4 border-b mb-4">
    <h2 className="text-2xl font-bold text-gray-800">
      ให้คะแนน: <span className="text-teal-600">{title}</span>
    </h2>
    <button onClick={onClose} className="text-gray-400 hover:text-gray-800">
      <X size={28} />
    </button>
  </div>
);

/**
 * ส่วนแสดงรูปภาพและวิดีโอของปลากัด
 */
const MediaViewer = ({ submission }) => (
  <div className="space-y-4 mb-6 border-b pb-4">
    <div>
      <h3 className="font-semibold text-gray-700 mb-2">รูปภาพ:</h3>
      <div className="flex flex-wrap gap-2 bg-gray-100 p-2 rounded-lg">
        {submission?.fish_image_urls?.length > 0 ? (
          submission.fish_image_urls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`${submission.fish_name} ${index + 1}`}
              className="w-32 h-32 object-cover rounded-md border"
            />
          ))
        ) : (
          <p className="text-sm text-gray-500 p-4">ไม่มีรูปภาพ</p>
        )}
      </div>
    </div>
    {submission?.fish_video_url && (
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">วิดีโอ:</h3>
        <video src={submission.fish_video_url} controls className="w-full rounded-lg bg-black">
          เบราว์เซอร์ของคุณไม่รองรับวิดีโอ
        </video>
      </div>
    )}
  </div>
);

/**
 * ส่วน Input สำหรับกรอกคะแนนแต่ละหมวด
 */
const ScoreInputs = ({ criteria, scores, onChange }) => (
  <div className="space-y-3">
    {criteria.map(item => (
      <div key={item.key} className="grid grid-cols-3 items-center gap-4">
        <div className="col-span-2">
          <label className="font-semibold text-gray-700">
            {item.label} (สูงสุด {item.max})
          </label>
          {item.desc && (
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
          )}
        </div>
        <input
          type="number"
          min="0"
          max={item.max}
          value={scores[item.key] || ''}
          placeholder="0"
          onChange={e => onChange(item.key, e.target.value, item.max)}
          className="w-full p-2 border rounded-md text-center focus:ring-2 focus:ring-teal-500"
        />
      </div>
    ))}
  </div>
);

/**
 * ส่วนท้ายของ Modal ที่แสดงคะแนนรวมและปุ่ม Submit
 */
const ModalFooter = ({ totalScore, onSubmit, isSubmitting }) => (
  <div className="mt-6 border-t pt-4">
    <div className="flex justify-between items-center mb-4">
      <span className="text-xl font-bold">คะแนนรวม:</span>
      <span className="text-3xl font-bold text-teal-600">{totalScore} / 100</span>
    </div>
    <button
      onClick={onSubmit}
      disabled={isSubmitting}
      className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-700 flex items-center justify-center transition disabled:bg-teal-300"
    >
      {isSubmitting ? (
        <LoaderCircle className="animate-spin mr-2" />
      ) : (
        <Send className="mr-2" />
      )}
      {isSubmitting ? 'กำลังส่งผล...' : 'ส่งผลคะแนน'}
    </button>
  </div>
);

/**
 * Component หลักของ Scoring Form Modal
 */
const ScoringFormModal = ({ isOpen, onRequestClose, submission, onSubmit }) => {
  const [scores, setScores] = useState({});
  const [scoreCriteria, setScoreCriteria] = useState([]);
  const [loadingSchema, setLoadingSchema] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schemaType, setSchemaType] = useState('');

  useEffect(() => {
    if (isOpen && submission?.fish_type) {
      setLoadingSchema(true);
      setSchemaType(submission.fish_type);
      getScoringSchema(submission.fish_type)
        .then(res => setScoreCriteria(res.data || []))
        .catch(() => {
          toast.error("ไม่สามารถโหลดเกณฑ์การให้คะแนนได้");
          onRequestClose();
        })
        .finally(() => setLoadingSchema(false));
    }
    // Reset state ทุกครั้งที่ Modal เปิด
    setScores({});
    setIsSubmitting(false);
  }, [isOpen, submission, onRequestClose]);

  const handleScoreChange = (key, value, max) => {
    const numValue = Math.max(0, Math.min(Number(value), max));
    setScores(prev => ({ ...prev, [key]: isNaN(numValue) ? 0 : numValue }));
  };

  const totalScore = useMemo(() => {
    return scoreCriteria.reduce((sum, item) => sum + (scores[item.key] || 0), 0);
  }, [scoreCriteria, scores]);

  // ไม่ใช้โมเดล AI ในการสลับแบบฟอร์มอีกต่อไปตามคำขอ

  const handleSubmit = async () => {
    for (const item of scoreCriteria) {
      if (scores[item.key] === undefined || scores[item.key] === null) {
        return toast.error(`กรุณากรอกคะแนนในหมวด "${item.label}"`);
      }
    }
    
    setIsSubmitting(true);
    try {
      const id = submission.assignment_id || submission.id;
      const scoresData = { scores, totalScore };
      await onSubmit(id, scoresData);
    } catch (error) {
      console.error("Submission failed:", error);
      // Toast error is likely handled by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} title={submission?.fish_name} maxWidth="max-w-2xl">
      <div className="max-h-[75vh] overflow-y-auto">
        
        {loadingSchema ? (
          <div className="flex justify-center items-center h-64">
            <LoaderCircle className="animate-spin text-teal-500" size={32}/>
            <p className="ml-4 text-gray-600">กำลังโหลดเกณฑ์การให้คะแนน...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 p-3 rounded-lg bg-neutral-50 border flex items-center gap-3">
              <span className="text-sm text-neutral-700">แบบฟอร์มสำหรับประเภท: <span className="font-semibold">{getBettaTypeLabel(schemaType)}</span></span>
            </div>

            <MediaViewer submission={submission} />
            <ScoreInputs criteria={scoreCriteria} scores={scores} onChange={handleScoreChange} />
            <ModalFooter totalScore={totalScore} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </>
        )}
      </div>
    </Modal>
  );
};

export default ScoringFormModal;
