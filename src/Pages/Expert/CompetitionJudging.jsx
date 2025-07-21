// my-project/src/Pages/Expert/CompetitionJudging.jsx (ฉบับสมบูรณ์)

import React, { useState, useEffect } from 'react';
import { getCompetitionInvitations, respondToJudgeInvitation, getFishInContest, submitCompetitionScore } from '../../services/expertService';
import { toast } from 'react-toastify';
import { LoaderCircle, Trophy, Check, X, ClipboardList, Frown, Send } from 'lucide-react';
import Modal from 'react-modal';

// --- Component: ฟอร์มให้คะแนน (ย้ายมาไว้ในไฟล์เดียวกันเพื่อความง่าย) ---
const ScoringForm = ({ submission, onCancel, onSubmit }) => {
    const [scores, setScores] = useState({});
    // [ปรับปรุง] ใช้เกณฑ์คะแนนมาตรฐาน 100 คะแนน
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
        // ส่ง submission ID, object scores, และ totalScore กลับไป
        onSubmit(submission.id, scores, totalScore);
    };

    return (
        <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X /></button>
            <h2 className="text-2xl font-bold mb-4">ให้คะแนน: <span className="text-purple-600">{submission.fish_name}</span></h2>
            <img src={submission.fish_image_urls[0]} alt={submission.fish_name} className="w-full h-64 object-contain rounded-lg bg-gray-100 mb-4"/>
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
                <span className="text-3xl font-bold text-purple-600">{totalScore} / 100</span>
            </div>
            <button onClick={handleSubmit} className="w-full mt-4 bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center transition">
                <Send className="mr-2"/> บันทึกคะแนน
            </button>
        </div>
    );
};


// --- Component หลัก ---
const CompetitionJudging = () => {
    const [invitations, setInvitations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedContestId, setExpandedContestId] = useState(null);
    const [contestSubmissions, setContestSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [scoringSubmission, setScoringSubmission] = useState(null); // State สำหรับเก็บข้อมูลปลาที่จะให้คะแนน

    useEffect(() => {
        Modal.setAppElement('#root');
        fetchInvitations();
    }, []);

    const fetchInvitations = () => {
        setLoading(true);
        getCompetitionInvitations()
            .then(res => setInvitations(res.data.items || []))
            .catch(err => toast.error("ไม่สามารถโหลดรายการคำเชิญได้"))
            .finally(() => setLoading(false));
    };
    
    const handleInvitationResponse = async (contestId, response) => {
        try {
            await respondToJudgeInvitation(contestId, response);
            toast.success(`คุณได้ ${response === 'accepted' ? 'ตอบรับ' : 'ปฏิเสธ'} คำเชิญแล้ว`);
            setInvitations(prev => 
                prev.map(inv => inv.id === contestId ? { ...inv, expert_status: response } : inv)
            );
        } catch (error) {
            toast.error("เกิดข้อผิดพลาด: " + error.message);
        }
    };
    
    const toggleContestDetails = (contestId) => {
        const newExpandedId = expandedContestId === contestId ? null : contestId;
        setExpandedContestId(newExpandedId);

        if (newExpandedId) {
            setLoadingSubmissions(true);
            getFishInContest(newExpandedId)
                .then(res => setContestSubmissions(res.data.items || []))
                .catch(err => toast.error("ไม่สามารถโหลดรายชื่อปลาได้"))
                .finally(() => setLoadingSubmissions(false));
        }
    };

    const handleSaveScore = async (submissionId, scores, totalScore) => {
        try {
            await submitCompetitionScore(submissionId, { scores, totalScore });
            toast.success("บันทึกคะแนนสำเร็จ!");
            setScoringSubmission(null); // ปิด Modal
            // อาจจะ Refresh รายการปลาใหม่เพื่อให้เห็นว่าให้คะแนนแล้ว
            // toggleContestDetails(expandedContestId); 
        } catch (err) {
            toast.error(err.message || "บันทึกคะแนนไม่สำเร็จ");
        }
    };

    if (loading) { return <div className="flex justify-center p-10"><LoaderCircle className="animate-spin text-purple-600" size={40} /></div>; }
    if (!invitations) { return <p>ไม่สามารถโหลดข้อมูลได้</p>; }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Trophy className="mr-3 text-purple-600" />
                การแข่งขันที่ได้รับเชิญ
            </h1>
            
            {invitations.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl shadow"><Frown className="mx-auto mb-2"/>คุณยังไม่ได้รับเชิญให้เป็นกรรมการในการแข่งขันใดๆ</div>
            ) : (
                <div className="space-y-4">
                    {invitations.map(inv => (
                        <div key={inv.id} className="bg-white rounded-xl shadow-lg p-5">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div className="flex-grow">
                                    <h3 className="text-xl font-bold text-gray-800">{inv.contest_name}</h3>
                                    <p className="text-sm text-gray-500">วันที่: {new Date(inv.start_date).toLocaleDateString('th-TH')} - {new Date(inv.end_date).toLocaleDateString('th-TH')}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-3 sm:mt-0 flex-shrink-0">
                                    {inv.expert_status === 'pending' && (
                                        <>
                                            <button onClick={() => handleInvitationResponse(inv.id, 'accepted')} className="bg-green-500 text-white px-3 py-1.5 rounded-lg flex items-center hover:bg-green-600"><Check size={16} className="mr-1"/> ตอบรับ</button>
                                            <button onClick={() => handleInvitationResponse(inv.id, 'rejected')} className="bg-red-500 text-white px-3 py-1.5 rounded-lg flex items-center hover:bg-red-600"><X size={16} className="mr-1"/> ปฏิเสธ</button>
                                        </>
                                    )}
                                    {inv.expert_status === 'accepted' && (
                                        <>
                                            <span className="text-green-600 font-semibold bg-green-100 px-3 py-1.5 rounded-lg">ตอบรับแล้ว</span>
                                             <button onClick={() => toggleContestDetails(inv.id)} className="bg-blue-500 text-white px-3 py-1.5 rounded-lg flex items-center hover:bg-blue-600">
                                                <ClipboardList size={16} className="mr-1"/> {expandedContestId === inv.id ? "ซ่อน" : "ดูปลาที่เข้าประกวด"}
                                             </button>
                                        </>
                                    )}
                                     {inv.expert_status === 'rejected' && (
                                         <span className="text-red-600 font-semibold bg-red-100 px-3 py-1.5 rounded-lg">ปฏิเสธแล้ว</span>
                                    )}
                                </div>
                            </div>
                            
                            {expandedContestId === inv.id && (
                                <div className="mt-4 pt-4 border-t">
                                    {loadingSubmissions ? (
                                        <div className="text-center"><LoaderCircle className="animate-spin text-blue-500" /></div>
                                    ) : contestSubmissions.length > 0 ? (
                                        <div className="space-y-2">
                                            {contestSubmissions.map(sub => (
                                                <div key={sub.id} className="bg-gray-50 p-3 rounded-md flex justify-between items-center">
                                                    <div>
                                                        <p className="font-semibold">{sub.fish_name}</p>
                                                        <p className="text-xs text-gray-500">โดย {sub.owner.first_name}</p>
                                                    </div>
                                                     <button onClick={() => setScoringSubmission(sub)} className="bg-teal-500 text-white px-3 py-1 text-sm rounded-md hover:bg-teal-600">ให้คะแนน</button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-500">ยังไม่มีปลากัดในรายการนี้</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={!!scoringSubmission} onRequestClose={() => setScoringSubmission(null)} style={{ overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1050 } }} className="fixed inset-0 flex items-center justify-center p-4">
                {scoringSubmission && (
                    <ScoringForm 
                        submission={scoringSubmission}
                        onCancel={() => setScoringSubmission(null)}
                        onSubmit={handleSaveScore}
                    />
                )}
            </Modal>
        </div>
    );
}

export default CompetitionJudging;