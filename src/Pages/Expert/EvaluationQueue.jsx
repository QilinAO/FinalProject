// my-project/src/Pages/Expert/EvaluationQueue.jsx (ฉบับสมบูรณ์พร้อมใช้งาน)

import React, { useState, useEffect } from 'react';
import { getPendingEvaluations, respondToEvaluation, submitQualityScores } from '../../services/expertService';
import { Loader, AlertCircle, Frown, Check, X, Send, ClipboardCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from 'react-modal';

// --- Component: ฟอร์มให้คะแนน ---
const ScoringForm = ({ submission, onCancel, onSubmit }) => {
    const [scores, setScores] = useState({});
    const scoreCriteria = [
        { key: 'body_shape', label: 'รูปร่างและลำตัว', max: 20 },
        { key: 'fins_tail', label: 'ครีบและหาง', max: 30 },
        { key: 'color', label: 'สีสันและลวดลาย', max: 25 },
        { key: 'flare_attitude', label: 'การพองสู้ (Attitude)', max: 15 },
        { key: 'overall_impression', label: 'ความสมบูรณ์โดยรวม', max: 10 },
    ];

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
        onSubmit(submission.assignment_id, scores, totalScore);
    };

    return (
        <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X /></button>
            <h2 className="text-2xl font-bold mb-4">ให้คะแนน: <span className="text-teal-600">{submission.fish_name}</span></h2>
            <img src={submission.image_url || 'https://placehold.co/400x300/E2E8F0/4A5568?text=No+Image'} alt={submission.fish_name} className="w-full h-64 object-contain rounded-lg bg-gray-100 mb-4"/>
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
            <button onClick={handleSubmit} className="w-full mt-4 bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-700 flex items-center justify-center transition">
                <Send className="mr-2"/> ส่งผลการประเมิน
            </button>
        </div>
    );
};


// --- Component หลัก ---
const EvaluationQueue = () => {
    const [queue, setQueue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalInfo, setModalInfo] = useState({ type: null, data: null });

    useEffect(() => {
        Modal.setAppElement('#root');
        fetchQueue();
    }, []);

    const fetchQueue = () => {
        setLoading(true);
        setError(null);
        getPendingEvaluations()
            .then(res => {
                setQueue(res.data || []);
            })
            .catch(err => {
                setError(err.message || "ไม่สามารถโหลดรายการได้");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleResponse = async (assignmentId, status) => {
        if (status === 'rejected') {
            setModalInfo({ type: 'reject', data: { assignment_id: assignmentId } });
            return;
        }

        // สำหรับ 'accepted'
        try {
            await respondToEvaluation(assignmentId, 'accepted');
            toast.success(`ตอบรับงานสำเร็จ! กรุณาให้คะแนน`);
            
            const acceptedItem = queue.find(item => item.assignment_id === assignmentId);
            setQueue(prev => prev.filter(item => item.assignment_id !== assignmentId));
            setModalInfo({ type: 'score', data: acceptedItem });
        } catch (err) {
            toast.error(err.message || "เกิดข้อผิดพลาด");
        }
    };

    const handleRejectSubmit = async (assignmentId, reason) => {
        if (!reason) return toast.warn("กรุณากรอกเหตุผลที่ปฏิเสธ");
        try {
            await respondToEvaluation(assignmentId, 'rejected', reason);
            toast.success("ปฏิเสธงานเรียบร้อยแล้ว");
            setQueue(prev => prev.filter(item => item.assignment_id !== assignmentId));
            setModalInfo({ type: null, data: null });
        } catch (err) {
            toast.error(err.message || "เกิดข้อผิดพลาด");
        }
    };

    const handleSubmitScores = async (assignmentId, scores, totalScore) => {
        try {
            await submitQualityScores(assignmentId, { scores, totalScore });
            toast.success("ส่งคะแนนเรียบร้อยแล้ว!");
            setModalInfo({ type: null, data: null });
        } catch (err) {
            toast.error(err.message || "ส่งคะแนนไม่สำเร็จ");
        }
    };

    if (loading) {
        return <div className="flex justify-center p-10"><Loader className="animate-spin text-teal-600" size={40} /></div>;
    }

    if (error) {
        return <div className="text-red-600 bg-red-100 p-4 rounded-md flex items-center"><AlertCircle className="mr-2"/> {error}</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <ClipboardCheck className="mr-3 text-teal-600" />
                รายการรอประเมินคุณภาพ
            </h1>
            
            {queue && queue.length > 0 ? (
                <div className="space-y-4">
                    {queue.map(item => (
                        <div key={item.assignment_id} className="bg-white rounded-xl shadow-lg p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-shadow hover:shadow-xl">
                            <img 
                                src={item.image_url || 'https://placehold.co/150x150/E2E8F0/4A5568?text=No+Image'} 
                                alt={item.fish_name}
                                className="w-full sm:w-32 h-32 rounded-lg bg-gray-200 object-cover flex-shrink-0"
                            />
                            <div className="flex-grow">
                                <h3 className="text-xl font-bold text-gray-800">{item.fish_name}</h3>
                                <p className="text-sm text-gray-500">ประเภท: <span className="font-medium text-gray-600">{item.fish_type || 'N/A'}</span></p>
                                <p className="text-sm text-gray-500">เจ้าของ: <span className="font-medium text-gray-600">{item.owner_name}</span></p>
                            </div>
                            <div className="flex flex-row sm:flex-col items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                                <button onClick={() => handleResponse(item.assignment_id, 'accepted')} className="w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center shadow-md">
                                    <Check size={18} className="mr-2" /> ตอบรับ
                                </button>
                                <button onClick={() => handleResponse(item.assignment_id, 'rejected')} className="w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center shadow-md">
                                    <X size={18} className="mr-2" /> ปฏิเสธ
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl shadow-md">
                    <Frown size={64} className="mx-auto text-gray-400 mb-4"/>
                    <h2 className="text-2xl font-semibold text-gray-600">ไม่มีรายการรอประเมิน</h2>
                    <p className="text-gray-400 mt-2">ยอดเยี่ยม! คุณเคลียร์งานทั้งหมดแล้ว</p>
                </div>
            )}
            
            <Modal isOpen={modalInfo.type !== null} onRequestClose={() => setModalInfo({ type: null, data: null })} style={{ overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1050 } }} className="fixed inset-0 flex items-center justify-center p-4">
                {modalInfo.type === 'reject' && (
                    <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 max-w-lg w-full">
                        <h2 className="text-2xl font-bold mb-4">เหตุผลที่ปฏิเสธ</h2>
                        <textarea id="rejection-reason" placeholder="เช่น รูปภาพไม่ชัดเจน, ข้อมูลไม่ครบถ้วน..." className="w-full h-32 p-3 border rounded-md" />
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setModalInfo({ type: null, data: null })} className="px-4 py-2 bg-gray-200 rounded-md">ยกเลิก</button>
                            <button onClick={() => {
                                const reason = document.getElementById('rejection-reason').value;
                                handleRejectSubmit(modalInfo.data.assignment_id, reason);
                            }} className="px-4 py-2 bg-red-600 text-white rounded-md">ยืนยัน</button>
                        </div>
                    </div>
                )}
                {modalInfo.type === 'score' && modalInfo.data && (
                    <ScoringForm submission={modalInfo.data} onCancel={() => setModalInfo({ type: null, data: null })} onSubmit={handleSubmitScores}/>
                )}
            </Modal>
        </div>
    );
};

export default EvaluationQueue;