// D:\ProJectFinal\Lasts\my-project\src\Pages\Expert\CompetitionJudging.jsx (ฉบับสมบูรณ์)

// --- ส่วนที่ 1: การนำเข้า (Imports) ---

import React, { useState, useEffect } from 'react';
// [อัปเดต] Import ฟังก์ชันที่ถูกต้องจาก Service เวอร์ชันล่าสุด
import { getJudgingContests, respondToJudgeInvitation, getFishInContest, submitCompetitionScore } from '../../services/expertService';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import { LoaderCircle, Trophy, Check, X, ClipboardList, Frown, ChevronDown, ChevronUp } from 'lucide-react';
// [อัปเดต] Import ScoringFormModal ที่เราสร้างเป็น Component กลาง
import ScoringFormModal from '../../Component/ScoringFormModal';


// --- ส่วนที่ 2: Main Component ---

const CompetitionJudging = () => {
    // --- State Management ---
    // [อัปเดต] State ใหม่สำหรับเก็บข้อมูลแยก Tab
    const [judgingData, setJudgingData] = useState({ invitations: [], myContests: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('invitations');
    
    // State สำหรับจัดการ UI
    const [expandedContestId, setExpandedContestId] = useState(null);
    const [contestSubmissions, setContestSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [scoringSubmission, setScoringSubmission] = useState(null);

    // --- Data Fetching ---
    const fetchJudgingContests = () => {
        setLoading(true);
        getJudgingContests()
            .then(res => setJudgingData(res.data || { invitations: [], myContests: [] }))
            .catch(() => toast.error("ไม่สามารถโหลดข้อมูลการแข่งขันได้"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        Modal.setAppElement('#root');
        fetchJudgingContests();
    }, []);
    
    // --- Event Handlers ---
    const handleInvitationResponse = async (contestId, response) => {
        try {
            await respondToJudgeInvitation(contestId, response);
            toast.success(`คุณได้ ${response === 'accepted' ? 'ตอบรับ' : 'ปฏิเสธ'} คำเชิญแล้ว`);
            fetchJudgingContests(); // ดึงข้อมูลใหม่ทั้งหมด
        } catch (error) {
            toast.error(error.message || "เกิดข้อผิดพลาด");
        }
    };
    
    const toggleContestDetails = (contestId) => {
        const newExpandedId = expandedContestId === contestId ? null : contestId;
        setExpandedContestId(newExpandedId);

        if (newExpandedId) {
            setLoadingSubmissions(true);
            getFishInContest(newExpandedId)
                .then(res => setContestSubmissions(res.data || []))
                .catch(() => toast.error("ไม่สามารถโหลดรายชื่อปลาได้"))
                .finally(() => setLoadingSubmissions(false));
        }
    };

    const handleSubmitScores = async (submissionId, scoresData) => {
        try {
            await submitCompetitionScore(submissionId, scoresData);
            toast.success("บันทึกคะแนนสำเร็จ!");
            setScoringSubmission(null); // ปิด Modal
            // โหลดรายชื่อปลาใหม่เพื่อให้เห็นการเปลี่ยนแปลง (ถ้ามี)
            if (expandedContestId) {
                toggleContestDetails(expandedContestId);
                toggleContestDetails(expandedContestId);
            }
        } catch (err) {
            toast.error(err.message || "บันทึกคะแนนไม่สำเร็จ");
        }
    };

    // --- Sub-components สำหรับ Render ---
    const renderInvitations = (items) => {
        if (!items || items.length === 0) return <div className="text-center py-10"><Frown /> ไม่มีคำเชิญใหม่</div>;
        return items.map(inv => (
            <div key={inv.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                <div>
                    <h3 className="font-bold">{inv.name}</h3>
                    <p className="text-sm text-gray-500">วันที่: {new Date(inv.start_date).toLocaleDateString('th-TH')} - {new Date(inv.end_date).toLocaleDateString('th-TH')}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleInvitationResponse(inv.id, 'accepted')} className="bg-green-500 text-white px-3 py-1 rounded">ตอบรับ</button>
                    <button onClick={() => handleInvitationResponse(inv.id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded">ปฏิเสธ</button>
                </div>
            </div>
        ));
    };

    const renderMyContests = (items) => {
        if (!items || items.length === 0) return <div className="text-center py-10"><Frown /> ไม่มีรายการประกวดที่กำลังดำเนินการ</div>;
        return items.map(contest => (
            <div key={contest.id} className="bg-white rounded-lg shadow">
                <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => toggleContestDetails(contest.id)}>
                    <div>
                        <h3 className="font-bold">{contest.name}</h3>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{contest.status}</span>
                    </div>
                    {expandedContestId === contest.id ? <ChevronUp /> : <ChevronDown />}
                </div>
                {expandedContestId === contest.id && (
                    <div className="p-4 border-t">
                        {loadingSubmissions ? <LoaderCircle className="animate-spin"/> : 
                            contestSubmissions.length > 0 ? (
                                <div className="space-y-2">
                                    {contestSubmissions.map(sub => (
                                        <div key={sub.id} className="bg-gray-50 p-3 rounded-md flex justify-between items-center">
                                            <p>{sub.fish_name} (โดย: {sub.owner.first_name})</p>
                                            <button onClick={() => setScoringSubmission(sub)} className="bg-teal-500 text-white px-3 py-1 text-sm rounded-md">ให้คะแนน</button>
                                        </div>
                                    ))}
                                </div>
                            ) : <p>ยังไม่มีผู้สมัครในรายการนี้</p>
                        }
                    </div>
                )}
            </div>
        ));
    };

    // --- Main Render (JSX) ---
    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Trophy className="text-purple-600" />
                การตัดสินการแข่งขัน
            </h1>

            <div className="flex border-b">
                <button onClick={() => setActiveTab('invitations')} className={`px-4 py-2 font-semibold ${activeTab === 'invitations' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}>
                    คำเชิญ ({judgingData.invitations.length})
                </button>
                <button onClick={() => setActiveTab('myContests')} className={`px-4 py-2 font-semibold ${activeTab === 'myContests' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}>
                    การประกวดของฉัน ({judgingData.myContests.length})
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-10"><LoaderCircle className="animate-spin text-purple-500" size={32}/></div>
            ) : (
                <div className="space-y-3">
                    {activeTab === 'invitations' ? renderInvitations(judgingData.invitations) : renderMyContests(judgingData.myContests)}
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
        </div>
    );
};

export default CompetitionJudging;