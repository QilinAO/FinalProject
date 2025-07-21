import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { X, Send } from 'lucide-react';
// [สำคัญ] Import เกณฑ์คะแนนที่เราสร้างไว้
import scoringSchemas from '../config/scoringSchemas'; 

const ScoringFormModal = ({ isOpen, onRequestClose, submission, onSubmit }) => {
    const [scores, setScores] = useState({});
    
    // เลือกเกณฑ์คะแนนที่ถูกต้องตามประเภทปลา
    const scoreCriteria = scoringSchemas[submission.fish_type] || scoringSchemas['default'];

    useEffect(() => {
        // Reset scores ทุกครั้งที่เปิด Modal ใหม่
        if (isOpen) {
            setScores({});
        }
    }, [isOpen]);

    const handleScoreChange = (key, value, max) => {
        const numValue = Math.max(0, Math.min(Number(value), max));
        setScores(prev => ({ ...prev, [key]: numValue }));
    };

    const totalScore = scoreCriteria.reduce((sum, item) => sum + (scores[item.key] || 0), 0);

    const handleSubmit = () => {
        for (const item of scoreCriteria) {
            if (scores[item.key] === undefined || scores[item.key] === null) {
                return toast.error(`กรุณากรอกคะแนนในหมวด "${item.label}"`);
            }
        }
        // ส่ง assignmentId หรือ submissionId กลับไปพร้อมข้อมูลคะแนน
        const id = submission.assignment_id || submission.id;
        onSubmit(id, { scores, totalScore });
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={{ overlay: { zIndex: 1050 } }}>
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                <button onClick={onRequestClose} className="absolute top-4 right-4"><X /></button>
                <h2 className="text-2xl font-bold mb-4">ให้คะแนน: <span className="text-teal-600">{submission.fish_name}</span></h2>
                <img src={submission.image_url || submission.fish_image_urls?.[0]} alt={submission.fish_name} className="w-full h-64 object-contain rounded-lg bg-gray-100 mb-4"/>
                
                <div className="space-y-3">
                    {scoreCriteria.map(item => (
                        <div key={item.key} className="flex items-center justify-between gap-4">
                            <label className="font-semibold">{item.label} (สูงสุด {item.max})</label>
                            <input type="number" min="0" max={item.max} onChange={e => handleScoreChange(item.key, e.target.value, item.max)} className="w-24 p-2 border rounded-md text-center" />
                        </div>
                    ))}
                </div>

                <div className="mt-6 border-t pt-4 flex justify-between items-center">
                    <span className="text-xl font-bold">คะแนนรวม:</span>
                    <span className="text-3xl font-bold text-teal-600">{totalScore} / 100</span>
                </div>
                <button onClick={handleSubmit} className="w-full mt-4 bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-700">
                    <Send className="inline mr-2"/> ส่งผลคะแนน
                </button>
            </div>
        </Modal>
    );
};

export default ScoringFormModal;