// D:\ProJectFinal\Lasts\my-project\src\Pages\Expert\CompetitionJudging.jsx (ฉบับสมบูรณ์)

// --- ส่วนที่ 1: การนำเข้า (Imports) ---
import React, { useState, useEffect, useCallback } from 'react';
import { getJudgingContests, respondToJudgeInvitation, getFishInContest, submitCompetitionScore } from '../../services/expertService';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import { LoaderCircle, Trophy, Check, X, Frown, ChevronDown, ChevronUp, Calendar, Users, Image as ImageIcon } from 'lucide-react';
import ScoringFormModal from '../../Component/ScoringFormModal';

// --- ส่วนที่ 2: Helper Functions & Components ---

/**
 * จัดรูปแบบวันที่ให้อ่านง่าย
 */
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return dateString;
    }
};

/**
 * รูปภาพสำรองกรณีไม่มีโปสเตอร์
 */
const POSTER_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="%239ca3af">No Poster</text></svg>';

/**
 * Component: การ์ดสำหรับแสดงคำเชิญ (Invitation Card) - ดีไซน์ใหม่
 */
const InvitationCard = ({ inv, onResponse }) => (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-300 border border-neutral-200/50 flex flex-col">
        <div className="relative aspect-[16/9] overflow-hidden">
            <img 
                src={inv.poster_url || POSTER_PLACEHOLDER} 
                alt={`Poster for ${inv.name}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.currentTarget.src = POSTER_PLACEHOLDER; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
        <div className="p-5 flex flex-col flex-1">
            <h3 className="text-xl font-bold text-heading mb-2 line-clamp-2">{inv.name}</h3>
            <div className="flex items-center text-sm text-muted mb-4">
                <Calendar size={14} className="mr-2" />
                <span>{formatDate(inv.start_date)} - {formatDate(inv.end_date)}</span>
            </div>
            <div className="mt-auto flex gap-3">
                <button onClick={() => onResponse(inv.id, 'accepted')} className="btn-primary flex-1 bg-green-600 hover:bg-green-700 focus:ring-green-500">
                    <Check size={16} className="mr-2" /> ตอบรับ
                </button>
                <button onClick={() => onResponse(inv.id, 'rejected')} className="btn-primary flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500">
                    <X size={16} className="mr-2" /> ปฏิเสธ
                </button>
            </div>
        </div>
    </div>
);

/**
 * การ์ดแสดงรายการประกวดที่ตอบรับแล้ว (Flash Card)
 */
const MyContestCard = ({ contest, onToggle, isExpanded, onScore }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);

    useEffect(() => {
        if (isExpanded && submissions.length === 0) {
            setLoadingSubmissions(true);
            getFishInContest(contest.id)
                .then(res => setSubmissions(res.data || []))
                .catch(() => toast.error(`ไม่สามารถโหลดรายชื่อปลาใน '${contest.name}' ได้`))
                .finally(() => setLoadingSubmissions(false));
        }
    }, [isExpanded, contest.id, contest.name, submissions.length]);

    return (
        <div className="group bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-300 border border-neutral-200/50 flex flex-col">
            <div className="relative aspect-[16/9] overflow-hidden">
                <img
                    src={contest.poster_url || POSTER_PLACEHOLDER}
                    alt={`Poster for ${contest.name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.src = POSTER_PLACEHOLDER; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-heading mb-2 line-clamp-2">{contest.name}</h3>
                <div className="flex items-center text-sm text-muted mb-3">
                    <Calendar size={14} className="mr-2" />
                    <span>{formatDate(contest.start_date)} - {formatDate(contest.end_date)}</span>
                </div>
                <div className="mt-auto flex items-center justify-between">
                    <span className="badge-primary">{contest.status}</span>
                    <button onClick={() => onToggle(contest.id)} className="btn-primary btn-sm flex items-center gap-1">
                        {isExpanded ? (<><ChevronUp size={16}/> ซ่อนรายชื่อปลา</>) : (<><ChevronDown size={16}/> ดูรายชื่อปลา</>)}
                    </button>
                </div>
            </div>
            {isExpanded && (
                <div className="p-5 border-t border-neutral-200">
                    <h4 className="font-semibold text-subheading mb-3">รายชื่อปลาที่ต้องให้คะแนน</h4>
                    {loadingSubmissions ? (
                        <div className="flex items-center justify-center p-4"><LoaderCircle className="animate-spin text-primary-500" /><span className="ml-2 text-muted">กำลังโหลด...</span></div>
                    ) : submissions.length > 0 ? (
                        <div className="space-y-3">
                            {submissions.map(sub => (
                                <div key={sub.id} className="surface-secondary p-4 rounded-xl flex items-center gap-4">
                                    <img
                                        src={sub.fish_image_urls?.[0] || 'https://placehold.co/150x150/E2E8F0/A0AEC0?text=No+Image'}
                                        alt={sub.fish_name}
                                        className="w-16 h-16 object-cover rounded-lg border-2 border-white shadow-sm"
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold text-body">{sub.fish_name}</p>
                                        <p className="text-sm text-caption">โดย: {sub.owner.first_name}</p>
                                    </div>
                                    <button onClick={() => onScore(sub)} className="btn-primary btn-sm">ให้คะแนน</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-4"><ImageIcon size={32} className="mx-auto text-neutral-400 mb-2" /><p className="text-muted">ยังไม่มีผู้สมัครในรายการนี้</p></div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- ส่วนที่ 3: Main Component ---
const CompetitionJudging = () => {
    // --- State Management ---
    const [judgingData, setJudgingData] = useState({ invitations: [], myContests: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('invitations');
    const [expandedContestId, setExpandedContestId] = useState(null);
    const [scoringSubmission, setScoringSubmission] = useState(null);

    // --- Data Fetching ---
    const fetchJudgingContests = useCallback(() => {
        setLoading(true);
        getJudgingContests()
            .then(res => setJudgingData(res.data || { invitations: [], myContests: [] }))
            .catch(() => toast.error("ไม่สามารถโหลดข้อมูลการแข่งขันได้"))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        Modal.setAppElement('#root');
        fetchJudgingContests();
    }, [fetchJudgingContests]);
    
    // --- Event Handlers ---
    const handleInvitationResponse = async (contestId, response) => {
        try {
            await respondToJudgeInvitation(contestId, response);
            toast.success(`คุณได้ ${response === 'accepted' ? 'ตอบรับ' : 'ปฏิเสธ'} คำเชิญแล้ว`);
            fetchJudgingContests();
        } catch (error) {
            toast.error(error.message || "เกิดข้อผิดพลาด");
        }
    };
    
    const toggleContestDetails = (contestId) => {
        setExpandedContestId(prevId => (prevId === contestId ? null : contestId));
    };

    const handleSubmitScores = async (submissionId, scoresData) => {
        try {
            await submitCompetitionScore(submissionId, scoresData);
            toast.success("บันทึกคะแนนสำเร็จ!");
            setScoringSubmission(null);
            if (expandedContestId) {
                const currentId = expandedContestId;
                setExpandedContestId(null);
                setTimeout(() => setExpandedContestId(currentId), 100);
            }
        } catch (err) {
            toast.error(err.message || "บันทึกคะแนนไม่สำเร็จ");
        }
    };

    // --- Main Render (JSX) ---
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Trophy className="text-purple-600" />
                การตัดสินการแข่งขัน
            </h1>

            <div className="flex border-b border-neutral-200">
                <button onClick={() => setActiveTab('invitations')} className={`px-6 py-3 font-semibold transition-all duration-200 ${activeTab === 'invitations' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500 hover:text-purple-600'}`}>
                    คำเชิญ ({judgingData.invitations.length})
                </button>
                <button onClick={() => setActiveTab('myContests')} className={`px-6 py-3 font-semibold transition-all duration-200 ${activeTab === 'myContests' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500 hover:text-purple-600'}`}>
                    การประกวดของฉัน ({judgingData.myContests.length})
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-10"><LoaderCircle className="animate-spin text-purple-500" size={32}/></div>
            ) : (
                <div>
                    {activeTab === 'invitations' ? (
                        judgingData.invitations.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {judgingData.invitations.map(inv => (
                                    <InvitationCard key={inv.id} inv={inv} onResponse={handleInvitationResponse} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 empty-state"><Frown className="mx-auto mb-4" size={48} /> ไม่มีคำเชิญใหม่</div>
                        )
                    ) : (
                        judgingData.myContests.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {judgingData.myContests.map(contest => (
                                    <MyContestCard
                                        key={contest.id}
                                        contest={contest}
                                        isExpanded={expandedContestId === contest.id}
                                        onToggle={toggleContestDetails}
                                        onScore={setScoringSubmission}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 empty-state"><Users className="mx-auto mb-4" size={48} /> ไม่มีรายการประกวดที่กำลังดำเนินการ</div>
                        )
                    )}
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