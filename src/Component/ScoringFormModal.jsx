// D:\ProJectFinal\Lasts\my-project\src\Component\ScoringFormModal.jsx (ฉบับสมบูรณ์)

// --- ส่วนที่ 1: การนำเข้า (Imports) ---

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { X, Send, LoaderCircle } from 'lucide-react';
import { getScoringSchema } from '../services/expertService';


// --- ส่วนที่ 2: Main Component ---

const ScoringFormModal = ({ isOpen, onRequestClose, submission, onSubmit }) => {
    // --- State Management ---
    const [scores, setScores] = useState({});
    const [scoreCriteria, setScoreCriteria] = useState([]);
    const [loadingSchema, setLoadingSchema] = useState(true);

    // --- Effects ---
    useEffect(() => {
        if (isOpen && submission?.fish_type) {
            setLoadingSchema(true);
            getScoringSchema(submission.fish_type)
                .then(res => {
                    setScoreCriteria(res.data || []);
                })
                .catch(() => {
                    toast.error("ไม่สามารถโหลดเกณฑ์การให้คะแนนได้");
                    onRequestClose();
                })
                .finally(() => {
                    setLoadingSchema(false);
                });
        }
        setScores({});
    }, [isOpen, submission, onRequestClose]);

    // --- Event Handlers ---
    const handleScoreChange = (key, value, max) => {
        const numValue = Math.max(0, Math.min(Number(value), max));
        setScores(prev => ({ ...prev, [key]: numValue }));
    };

    const handleSubmit = () => {
        for (const item of scoreCriteria) {
            if (scores[item.key] === undefined || scores[item.key] === null) {
                return toast.error(`กรุณากรอกคะแนนในหมวด "${item.label}"`);
            }
        }
        const id = submission.assignment_id || submission.id;
        const scoresData = { scores, totalScore };
        onSubmit(id, scoresData);
    };

    // --- Calculated Values ---
    const totalScore = scoreCriteria.reduce((sum, item) => sum + (scores[item.key] || 0), 0);

    // --- Main Render (JSX) ---
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={{ overlay: { zIndex: 1050, backgroundColor: 'rgba(0, 0, 0, 0.75)' } }}
            className="fixed inset-0 flex items-center justify-center p-4"
            contentLabel="Scoring Form Modal"
        >
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                <button onClick={onRequestClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X /></button>
                <h2 className="text-2xl font-bold mb-4">ให้คะแนน: <span className="text-teal-600">{submission.fish_name}</span></h2>
                
                {loadingSchema ? (
                    <div className="flex justify-center items-center h-64">
                        <LoaderCircle className="animate-spin text-teal-500" size={32}/>
                        <p className="ml-4 text-gray-600">กำลังโหลดเกณฑ์การให้คะแนน...</p>
                    </div>
                ) : (
                    <>
                        {/* ▼▼▼▼▼ [ส่วนที่อัปเดต] การแสดงผลสื่อทั้งหมด ▼▼▼▼▼ */}
                        <div className="space-y-4 mb-4 border-b pb-4">
                            {/* ส่วนแสดงรูปภาพ (แสดงทุกรูป) */}
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">รูปภาพ:</h3>
                                <div className="flex flex-wrap gap-2 bg-gray-100 p-2 rounded-lg">
                                    {/* ตรวจสอบว่ามี Array รูปภาพหรือไม่ */}
                                    {(submission.fish_image_urls && submission.fish_image_urls.length > 0) ? (
                                        // ใช้ .map() เพื่อวนลูปแสดงรูปภาพทุกรูป
                                        submission.fish_image_urls.map((url, index) => (
                                            <img 
                                                key={index} 
                                                src={url} 
                                                alt={`${submission.fish_name} ${index + 1}`}
                                                className="w-32 h-32 object-cover rounded-md border"
                                            />
                                        ))
                                    ) : (
                                        // กรณีไม่มีรูปภาพ
                                        <p className="text-sm text-gray-500">ไม่มีรูปภาพ</p>
                                    )}
                                </div>
                            </div>

                            {/* ส่วนแสดงวิดีโอ (จะแสดงก็ต่อเมื่อมี URL วิดีโอ) */}
                            {submission.fish_video_url && (
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-2">วิดีโอ:</h3>
                                    <video 
                                        src={submission.fish_video_url} 
                                        controls 
                                        className="w-full rounded-lg bg-black"
                                    >
                                        เบราว์เซอร์ของคุณไม่รองรับวิดีโอ
                                    </video>
                                </div>
                            )}
                        </div>
                        {/* ▲▲▲▲▲ [จบส่วนที่อัปเดต] ▲▲▲▲▲ */}
                        
                        <div className="space-y-3">
                            {scoreCriteria.map(item => (
                                <div key={item.key} className="flex items-center justify-between gap-4">
                                    <label className="font-semibold text-gray-700">{item.label} (สูงสุด {item.max})</label>
                                    <input type="number" min="0" max={item.max} onChange={e => handleScoreChange(item.key, e.target.value, item.max)} className="w-24 p-2 border rounded-md text-center" />
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 border-t pt-4 flex justify-between items-center">
                            <span className="text-xl font-bold">คะแนนรวม:</span>
                            <span className="text-3xl font-bold text-teal-600">{totalScore} / 100</span>
                        </div>
                        <button onClick={handleSubmit} className="w-full mt-4 bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-700 flex items-center justify-center">
                            <Send className="mr-2"/> ส่งผลคะแนน
                        </button>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default ScoringFormModal;