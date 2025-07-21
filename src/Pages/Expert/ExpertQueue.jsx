import React, { useState, useEffect } from 'react';
import { getEvaluationQueue, respondToEvaluation, submitQualityScores } from '../../services/expertService';
import { toast } from 'react-toastify';
import { LoaderCircle, Check, X, Frown } from 'lucide-react';
import ScoringFormModal from '../../Component/ScoringFormModal';

const ExpertQueue = () => {
    const [queue, setQueue] = useState({ pending: [], accepted: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [scoringSubmission, setScoringSubmission] = useState(null);

    const fetchQueue = () => {
        setLoading(true);
        getEvaluationQueue()
            .then(res => setQueue(res.data || { pending: [], accepted: [] }))
            .catch(() => toast.error("ไม่สามารถโหลดคิวงานได้"))
            .finally(() => setLoading(false));
    };

    useEffect(fetchQueue, []);

    const handleResponse = async (assignmentId, status) => {
        try {
            await respondToEvaluation(assignmentId, status);
            toast.success(`คุณได้ ${status === 'accepted' ? 'ตอบรับ' : 'ปฏิเสธ'} งานแล้ว`);
            fetchQueue(); // ดึงข้อมูลใหม่
        } catch (error) { toast.error(error.message); }
    };

    const handleSubmitScores = async (assignmentId, scoresData) => {
        try {
            await submitQualityScores(assignmentId, scoresData);
            toast.success("ส่งคะแนนเรียบร้อยแล้ว!");
            setScoringSubmission(null);
            fetchQueue(); // ดึงข้อมูลใหม่
        } catch (err) { toast.error(err.message); }
    };

    const renderList = (items) => {
        if (items.length === 0) return <div className="text-center py-10"><Frown /> ไม่มีรายการ</div>;
        return items.map(item => (
            <div key={item.assignment_id} className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
                <img src={item.image_url} alt={item.fish_name} className="w-24 h-24 object-cover rounded"/>
                <div className="flex-grow">
                    <h3 className="font-bold">{item.fish_name}</h3>
                    <p className="text-sm text-gray-600">{item.fish_type}</p>
                </div>
                {activeTab === 'pending' ? (
                    <div className="flex flex-col gap-2">
                        <button onClick={() => handleResponse(item.assignment_id, 'accepted')} className="bg-green-500 text-white px-3 py-1 rounded">ตอบรับ</button>
                        <button onClick={() => handleResponse(item.assignment_id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded">ปฏิเสธ</button>
                    </div>
                ) : (
                    <button onClick={() => setScoringSubmission(item)} className="bg-blue-500 text-white px-3 py-1 rounded">ให้คะแนน</button>
                )}
            </div>
        ));
    };

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">คิวงานประเมินคุณภาพ</h1>
            <div className="flex border-b">
                <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 ${activeTab === 'pending' ? 'border-b-2 border-blue-500' : ''}`}>รอการตอบรับ ({queue.pending.length})</button>
                <button onClick={() => setActiveTab('accepted')} className={`px-4 py-2 ${activeTab === 'accepted' ? 'border-b-2 border-blue-500' : ''}`}>ที่ต้องให้คะแนน ({queue.accepted.length})</button>
            </div>
            {loading ? <LoaderCircle className="animate-spin"/> : (
                <div className="space-y-3">
                    {renderList(queue[activeTab])}
                </div>
            )}
            {scoringSubmission && <ScoringFormModal isOpen={!!scoringSubmission} onRequestClose={() => setScoringSubmission(null)} submission={scoringSubmission} onSubmit={handleSubmitScores} />}
        </div>
    );
};

export default ExpertQueue;