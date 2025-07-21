// D:\ProJectFinal\Lasts\my-project\src\Pages\Expert\EvaluationQueue.jsx (ฉบับสมบูรณ์)

// --- ส่วนที่ 1: การนำเข้า (Imports) ---

import React, { useState, useEffect } from 'react';
import { getEvaluationQueue, respondToEvaluation, submitQualityScores } from '../../services/expertService';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import { LoaderCircle, Check, X, Frown, ClipboardCheck } from 'lucide-react';
import ScoringFormModal from '../../Component/ScoringFormModal';


// --- ส่วนที่ 2: Main Component ---

const EvaluationQueue = () => {
    // --- State Management ---
    const [queue, setQueue] = useState({ pending: [], accepted: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [scoringSubmission, setScoringSubmission] = useState(null);
    const [rejectingSubmission, setRejectingSubmission] = useState(null);

    // --- Data Fetching ---
    const fetchQueue = () => {
        setLoading(true);
        getEvaluationQueue()
            .then(res => {
                setQueue(res.data || { pending: [], accepted: [] });
            })
            .catch(() => toast.error("ไม่สามารถโหลดคิวงานประเมินได้"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        Modal.setAppElement('#root');
        fetchQueue();
    }, []);

    // --- Event Handlers ---
    const handleResponse = async (assignmentId, status) => {
        try {
            await respondToEvaluation(assignmentId, status);
            toast.success(`คุณได้ ${status === 'accepted' ? 'ตอบรับ' : 'ปฏิเสธ'} งานแล้ว`);
            fetchQueue();
        } catch (error) { 
            toast.error(error.message || "เกิดข้อผิดพลาด");
        }
    };

    const handleRejectSubmit = async (assignmentId, reason) => {
        if (!reason) return toast.warn("กรุณากรอกเหตุผลที่ปฏิเสธ");
        try {
            await respondToEvaluation(assignmentId, 'rejected', reason);
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

    // --- Sub-component สำหรับ Render รายการ ---
    const renderList = (items) => {
        if (!items || items.length === 0) {
            return (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <Frown size={48} className="mx-auto text-gray-400 mb-2"/>
                    <p className="text-gray-500">ไม่มีรายการในคิวนี้</p>
                </div>
            );
        }
        return items.map(item => (
            <div key={item.assignment_id} className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row items-center gap-4">
                {/* ▼▼▼▼▼ [ส่วนที่อัปเดต] การแสดงผลรูปภาพ ▼▼▼▼▼ */}
                <img 
                    // ตรวจสอบว่ามี `fish_image_urls` และมีข้อมูลใน Array หรือไม่
                    // ถ้ามี ให้ใช้รูปแรก (`[0]`)
                    src={(item.fish_image_urls && item.fish_image_urls[0]) || 'https://placehold.co/150x150'} 
                    alt={item.fish_name} 
                    className="w-24 h-24 object-cover rounded flex-shrink-0"
                />
                {/* ▲▲▲▲▲ [จบส่วนที่อัปเดต] ▲▲▲▲▲ */}
                <div className="flex-grow text-center sm:text-left">
                    <h3 className="font-bold text-lg">{item.fish_name}</h3>
                    <p className="text-sm text-gray-600">ประเภท: {item.fish_type}</p>
                    <p className="text-sm text-gray-500">โดย: {item.owner_name}</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    {activeTab === 'pending' ? (
                        <>
                            <button onClick={() => handleResponse(item.assignment_id, 'accepted')} className="flex-1 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">ตอบรับ</button>
                            <button onClick={() => setRejectingSubmission(item)} className="flex-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">ปฏิเสธ</button>
                        </>
                    ) : (
                        <button onClick={() => setScoringSubmission(item)} className="w-full bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">ให้คะแนน</button>
                    )}
                </div>
            </div>
        ));
    };

    // --- Main Render (JSX) ---
    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <ClipboardCheck className="text-teal-600"/>
                คิวงานประเมินคุณภาพ
            </h1>
            
            <div className="flex border-b">
                <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 font-semibold ${activeTab === 'pending' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>
                    รอการตอบรับ ({queue.pending.length})
                </button>
                <button onClick={() => setActiveTab('accepted')} className={`px-4 py-2 font-semibold ${activeTab === 'accepted' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>
                    ที่ต้องให้คะแนน ({queue.accepted.length})
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-10"><LoaderCircle className="animate-spin text-blue-500" size={32}/></div>
            ) : (
                <div className="space-y-3">
                    {renderList(queue[activeTab])}
                </div>
            )}

            {scoringSubmission && (
                <ScoringFormModal 
                    isOpen={!!scoringSubmission} 
                    onRequestClose={() => setScoringSubmission(null)} 
                    submission={scoringSubmission} 
                    onSubmit={handleSubmitScores} 
                />
            )}

            <Modal isOpen={!!rejectingSubmission} onRequestClose={() => setRejectingSubmission(null)} style={{ overlay: { zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.75)' } }} className="fixed inset-0 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl p-6 max-w-lg w-full">
                    <h2 className="text-2xl font-bold mb-4">เหตุผลที่ปฏิเสธ</h2>
                    <textarea id="rejection-reason" placeholder="เช่น รูปภาพไม่ชัดเจน, ข้อมูลไม่ครบถ้วน..." className="w-full h-32 p-3 border rounded-md" />
                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => setRejectingSubmission(null)} className="px-4 py-2 bg-gray-200 rounded-md">ยกเลิก</button>
                        <button onClick={() => {
                            const reason = document.getElementById('rejection-reason').value;
                            handleRejectSubmit(rejectingSubmission.assignment_id, reason);
                        }} className="px-4 py-2 bg-red-600 text-white rounded-md">ยืนยันการปฏิเสธ</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default EvaluationQueue;