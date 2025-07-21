import React, { useState, useEffect } from 'react';
import ManagerMenu from '../../Component/ManagerMenu';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import { 
    getMyContests, 
    getContestSubmissions, 
    updateSubmissionStatus, 
    updateMyContest, 
    finalizeContest,
    getScoresForSubmission 
} from '../../services/managerService';
import { 
    Check, X, Eye, LoaderCircle, XCircle as CloseIcon, PlayCircle, 
    BarChart2, Lock, Trophy, AlertTriangle 
} from 'lucide-react';

const LiveContestRoom = () => {
    // --- State Management ---
    const [contests, setContests] = useState([]);
    const [selectedContest, setSelectedContest] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loadingContests, setLoadingContests] = useState(true);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Modal States
    const [modalType, setModalType] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [submissionScores, setSubmissionScores] = useState([]);
    const [loadingScores, setLoadingScores] = useState(false);

    // State ใหม่สำหรับ Modal ยืนยัน
    const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);

    // --- Effects ---
    useEffect(() => {
        Modal.setAppElement('#root');
        fetchContests();
    }, []);

    useEffect(() => {
        if (!selectedContest) {
            setSubmissions([]);
            return;
        }
        const fetchSubmissions = async () => {
            setLoadingSubmissions(true);
            try {
                const data = await getContestSubmissions(selectedContest.id);
                setSubmissions(data || []);
            } catch (error) {
                toast.error("ไม่สามารถดึงรายชื่อผู้สมัครได้: " + error.message);
            } finally {
                setLoadingSubmissions(false);
            }
        };
        fetchSubmissions();
    }, [selectedContest]);
    
    // --- Data Fetching ---
    const fetchContests = async () => {
        setLoadingContests(true);
        try {
            const data = await getMyContests();
            const activeContests = data.filter(c => c.category === 'การประกวด' && !['ประกาศผล', 'ยกเลิก'].includes(c.status));
            setContests(activeContests);
        } catch (error) {
            toast.error("ไม่สามารถดึงรายการประกวดได้");
        } finally {
            setLoadingContests(false);
        }
    };

    // --- Event Handlers ---
    const handleStatusUpdate = async (submissionId, newStatus) => {
        try {
            await updateSubmissionStatus(submissionId, newStatus);
            toast.success(`อัปเดตสถานะสำเร็จ`);
            setSubmissions(prev => prev.map(sub => 
                sub.id === submissionId ? { ...sub, status: newStatus } : sub
            ));
        } catch (error) {
            toast.error("เกิดข้อผิดพลาด: " + error.message);
        }
    };
    
    const handleContestStatusChange = async (newStatus) => {
        if (!selectedContest || !window.confirm(`คุณต้องการเปลี่ยนสถานะการประกวดเป็น "${newStatus}" ใช่หรือไม่?`)) return;
        
        setIsProcessing(true);
        try {
            const updatedContest = await updateMyContest(selectedContest.id, { status: newStatus });
            toast.success(`เปลี่ยนสถานะเป็น "${newStatus}" สำเร็จ!`);
            setSelectedContest(updatedContest);
        } catch(error) { 
            toast.error("เกิดข้อผิดพลาด: " + error.message); 
        } finally {
            setIsProcessing(false);
        }
    };
    
    // แก้ไข handleFinalize ให้เปิด Modal ก่อน
    const handleFinalize = () => {
        if (!selectedContest) return;
        setIsFinalizeModalOpen(true);
    };

    // ฟังก์ชันสำหรับยืนยันการประกาศผล
    const confirmFinalize = async () => {
        setIsFinalizeModalOpen(false);
        setIsProcessing(true);
        try {
            await finalizeContest(selectedContest.id);
            toast.success("ประกาศผลสำเร็จ!");
            setSelectedContest(prev => ({ ...prev, status: 'ประกาศผล' }));
            fetchContests();
        } catch(error) { 
            toast.error("เกิดข้อผิดพลาด: " + error.message); 
        } finally {
            setIsProcessing(false);
        }
    };

    const handleShowModal = async (type, submission) => {
        setSelectedSubmission(submission);
        setModalType(type);
        if (type === 'scores') {
            setLoadingScores(true);
            try {
                const scores = await getScoresForSubmission(submission.id);
                setSubmissionScores(scores || []);
            } catch (error) { 
                toast.error("ไม่สามารถดึงข้อมูลคะแนนได้: " + error.message); 
            } finally { 
                setLoadingScores(false); 
            }
        }
    };

    const closeModal = () => { 
        setModalType(null); 
        setSelectedSubmission(null); 
    };

    const getStatusBadge = (status) => {
        const styles = {
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            pending: 'bg-yellow-100 text-yellow-800'
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    // --- Render ---
    return (
        <div className="bg-gray-100 min-h-screen">
            <ManagerMenu />
            <div className="pt-16 p-4 sm:p-8 w-full">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">ห้องจัดการแข่งขัน</h1>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="mb-6">
                        <label htmlFor="contest-select" className="font-semibold block mb-2 text-gray-700">เลือกการประกวดเพื่อจัดการ:</label>
                        <select
                            id="contest-select"
                            value={selectedContest?.id || ''}
                            onChange={e => {
                                const contest = contests.find(c => c.id.toString() === e.target.value);
                                setSelectedContest(contest);
                            }}
                            className="w-full md:w-1/2 p-3 border rounded-lg bg-gray-50"
                            disabled={loadingContests}
                        >
                            <option value="" disabled>-- {loadingContests ? "กำลังโหลด..." : "กรุณาเลือกการประกวด"} --</option>
                            {contests.map(c => <option key={c.id} value={c.id}>{c.name} ({c.status})</option>)}
                        </select>
                    </div>

                    {selectedContest && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                               <p className="text-gray-600">สถานะปัจจุบัน:</p>
                               <p className="font-bold text-xl text-purple-700">{selectedContest.status}</p>
                               <p className="text-sm text-gray-500 mt-1">มีผู้สมัครในระบบ {submissions.length} คน</p>
                            </div>
                            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                                {isProcessing ? <LoaderCircle className="animate-spin" /> : (
                                    <>
                                        {selectedContest.status === 'กำลังดำเนินการ' && (
                                            <button onClick={() => handleContestStatusChange('ปิดรับสมัคร')} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700 shadow-sm transition">
                                                <Lock className="mr-2" size={18}/> ปิดรับสมัคร
                                            </button>
                                        )}
                                        {selectedContest.status === 'ปิดรับสมัคร' && (
                                            <button onClick={() => handleContestStatusChange('ตัดสิน')} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 shadow-sm transition">
                                                <PlayCircle className="mr-2" size={18}/> เริ่มการตัดสิน
                                            </button>
                                        )}
                                        {selectedContest.status === 'ตัดสิน' && (
                                             <button onClick={handleFinalize} className="bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-yellow-600 shadow-sm transition">
                                                <Trophy className="mr-2" size={18}/> คำนวณและประกาศผล
                                             </button>
                                        )}
                                        {selectedContest.status === 'ประกาศผล' && (
                                            <span className="text-green-600 font-bold bg-green-100 px-4 py-2 rounded-lg">การประกวดสิ้นสุดแล้ว</span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <hr className="my-6"/>

                    <h2 className="text-2xl font-bold mb-4 text-gray-800">รายชื่อผู้ส่งเข้าประกวด</h2>
                    {loadingSubmissions ? (
                        <div className="text-center p-4"><LoaderCircle className="animate-spin inline-block text-purple-600" size={28}/></div>
                    ) : (
                        <div className="space-y-3">
                            {submissions.length > 0 ? submissions.map(sub => (
                                <div key={sub.id} className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-sm transition-shadow">
                                    <div className="mb-2 md:mb-0">
                                        <p className="font-bold text-lg text-gray-800">{sub.fish_name} <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(sub.status)}`}>{sub.status}</span></p>
                                        <p className="text-sm text-gray-600">ประเภท: {sub.subcategory_id || 'N/A'}</p>
                                        <p className="text-sm text-gray-500">โดย: {sub.profiles?.first_name} ({sub.profiles?.username})</p>
                                    </div>
                                    <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                                        <button onClick={() => handleShowModal('detail', sub)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="ดูรายละเอียดปลา"><Eye size={18}/></button>
                                        {['ตัดสิน', 'ประกาศผล'].includes(selectedContest?.status) && (
                                            <button onClick={() => handleShowModal('scores', sub)} className="p-2 text-purple-600 hover:bg-purple-100 rounded-full" title="ดูคะแนนดิบ"><BarChart2 size={18}/></button>
                                        )}
                                        {['กำลังดำเนินการ', 'ปิดรับสมัคร'].includes(selectedContest?.status) && (
                                            <>
                                                <button onClick={() => handleStatusUpdate(sub.id, 'approved')} className="p-2 text-green-600 hover:bg-green-100 rounded-full" title="อนุมัติ"><Check size={18}/></button>
                                                <button onClick={() => handleStatusUpdate(sub.id, 'rejected')} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="ปฏิเสธ"><X size={18}/></button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )) : <p className="text-center text-gray-500 py-6">ไม่มีผู้สมัคร หรือยังไม่ได้เลือกการประกวด</p>}
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={!!modalType} onRequestClose={closeModal} style={{ overlay: { zIndex: 1050 } }} className="fixed inset-0 flex items-center justify-center p-4" overlayClassName="fixed inset-0 bg-black bg-opacity-75">
                {selectedSubmission && modalType === 'detail' && (
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full relative">
                         <button onClick={closeModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"><CloseIcon /></button>
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2">{selectedSubmission.fish_name}</h2>
                        <div className="mb-4"><img src={selectedSubmission.fish_image_url} alt={`Image of ${selectedSubmission.fish_name}`} className="rounded-lg w-full h-auto max-h-80 object-contain bg-gray-100"/></div>
                        <div className="space-y-2 text-gray-800">
                           <p><strong>เจ้าของ:</strong> {selectedSubmission.profiles?.first_name} {selectedSubmission.profiles?.last_name}</p>
                           <p><strong>อายุ:</strong> {selectedSubmission.fish_age || 'N/A'}</p>
                           <p><strong>สายพันธุ์:</strong> {selectedSubmission.fish_breed || 'N/A'}</p>
                           {selectedSubmission.fish_video_url && (<a href={selectedSubmission.fish_video_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition">ดูวิดีโอการโพสท่า</a>)}
                        </div>
                    </div>
                )}
                 {selectedSubmission && modalType === 'scores' && (
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full relative">
                        <button onClick={closeModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"><CloseIcon /></button>
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2">ผลคะแนนดิบ: {selectedSubmission.fish_name}</h2>
                        {loadingScores ? <LoaderCircle className="animate-spin mx-auto text-purple-600"/> : (
                            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                {submissionScores.length > 0 ? submissionScores.map((score, index) => (
                                    <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                                        <p className="font-bold text-gray-800">กรรมการ: {score.profiles.first_name}</p>
                                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                                            {Object.entries(score.scores_data).map(([key, value]) => (
                                                <div key={key}><span className="text-gray-500">{key}:</span> <strong className="text-purple-700">{value}</strong></div>
                                            ))}
                                        </div>
                                    </div>
                                )) : <p className="text-center py-5">ยังไม่มีกรรมการให้คะแนนสำหรับปลานี้</p>}
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={isFinalizeModalOpen}
                onRequestClose={() => setIsFinalizeModalOpen(false)}
                style={{ overlay: { zIndex: 1051, backgroundColor: 'rgba(0, 0, 0, 0.75)' } }}
                className="fixed inset-0 flex items-center justify-center p-4"
                contentLabel="Finalize Confirmation Modal"
            >
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-auto text-center shadow-xl">
                    <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500" />
                    <h2 className="text-xl font-bold mt-4 text-gray-800">ยืนยันการประกาศผล</h2>
                    <p className="text-gray-600 mt-2">
                        คุณต้องการคำนวณคะแนนและประกาศผลการประกวด <br/>
                        <span className="font-semibold">"{selectedContest?.name}"</span> ใช่หรือไม่?
                        <br/>
                        <strong className="text-red-600">การกระทำนี้ถือเป็นที่สิ้นสุดและไม่สามารถย้อนกลับได้</strong>
                    </p>
                    <div className="mt-6 flex justify-center gap-4">
                        <button
                            onClick={() => setIsFinalizeModalOpen(false)}
                            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
                        >
                            ยกเลิก
                        </button>
                        <button
                            onClick={confirmFinalize}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                        >
                            ยืนยัน
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default LiveContestRoom;