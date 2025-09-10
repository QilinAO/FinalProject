// D:\\ProJectFinal\\Lasts\\my-project\\src\\Pages\\Manager\\LiveContestRoom.jsx (ฉบับสมบูรณ์)

import React, { useState, useEffect, useMemo } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { Check, X, Eye, LoaderCircle, XCircle, PlayCircle, Lock, Trophy, AlertTriangle, ArrowLeft, Users, CheckSquare, Clock, Calendar, Sparkles, Info, Fish } from 'lucide-react';

import ManagerMenu from '../../Component/ManagerMenu';
import { getMyContests, getContestSubmissions, updateSubmissionStatus, updateMyContest, finalizeContest } from '../../services/managerService';
import { getBettaTypeLabel, BETTA_TYPE_MAP_ID, BETTA_TYPE_MAP_SLUG } from '../../utils/bettaTypes';

// อ่านค่า API_BASE จากบริการ axios ที่ตั้งไว้ หรือ fallback จาก Vite env
import apiService from '../../services/api';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '') || 'http://localhost:5000/api';

// Helper: name -> code (prefer uppercase code)
const NAME_TO_CODE = (() => {
  const map = {};
  Object.entries(BETTA_TYPE_MAP_ID).forEach(([code, name]) => {
    const upper = code.toUpperCase();
    map[name] = upper; // overwrite with uppercase preference
  });
  return map;
})();

const normalizeToCode = (value) => {
  if (!value || typeof value !== 'string') return null;
  const v = value.trim();
  // 1) Already a code A-H
  if (/^[A-Ha-h]$/.test(v)) return v.toUpperCase();
  // 2) Thai label -> code
  if (NAME_TO_CODE[v]) return NAME_TO_CODE[v];
  // 3) slug -> label -> code
  if (BETTA_TYPE_MAP_SLUG && BETTA_TYPE_MAP_SLUG[v]) {
    const name = BETTA_TYPE_MAP_SLUG[v];
    if (NAME_TO_CODE[name]) return NAME_TO_CODE[name];
  }
  return null;
};

const POSTER_PLACEHOLDER =
  'data:image/svg+xml;utf8,\
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">\
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">\
<stop offset="0%" stop-color="#eef2ff"/><stop offset="100%" stop-color="#fce7f3"/>\
</linearGradient></defs>\
<rect width="640" height="360" fill="url(#g)"/>\
<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#9ca3af" font-family="Arial" font-size="24">No poster</text>\
</svg>';

const statusBadgeCls = (status) => {
  switch (status) {
    case 'กำลังดำเนินการ':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'ปิดรับสมัคร':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'ตัดสิน':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const StatCard = ({ icon, label, value, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`w-full betta-card text-left transition-all duration-200 ${isActive ? 'ring-2 ring-primary-500 shadow-large' : 'hover:shadow-medium'}`}
  >
    <div className="flex items-center">
      <div className="p-3 rounded-full bg-neutral-100 text-muted">{icon}</div>
      <div className="ml-4">
        <p className="text-sm font-medium text-caption">{label}</p>
        <h3 className="text-2xl font-bold text-heading">{value}</h3>
      </div>
    </div>
  </button>
);

const LiveContestRoom = () => {
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [finalizeModalOpen, setFinalizeModalOpen] = useState(false);
  const [submissionInModal, setSubmissionInModal] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [actionLoading, setActionLoading] = useState(false);
  // NEW: AI states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiScan, setAiScan] = useState({}); // { [submissionId]: { code,name,prob,is_confident,allowed,allowedList, error? } }
  const [aiDetailModalOpen, setAiDetailModalOpen] = useState(false);
  const [aiDetail, setAiDetail] = useState(null);
  const [aiFilter, setAiFilter] = useState('all'); // all | match | mismatch | uncertain

  useEffect(() => {
    Modal.setAppElement('#root');
    fetchContests();
  }, []);

  const fetchContests = async () => {
    setLoading(true);
    try {
      const data = await getMyContests();
      const activeContests = data.filter(c => c.category === 'การประกวด' && !['ประกาศผล', 'ยกเลิก'].includes(c.status));
      setContests(activeContests);
    } catch (error) {
      toast.error("ไม่สามารถดึงรายการประกวดได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (contestId) => {
    setIsProcessing(true);
    try {
      const data = await getContestSubmissions(contestId);
      setSubmissions(data || []);
      // เติม allowed_subcategories ให้ selectedContest หากยังว่างและมีจาก backend
      if (selectedContest && (!Array.isArray(selectedContest.allowed_subcategories) || selectedContest.allowed_subcategories.length === 0)) {
        const fromApi = (data && data[0] && data[0].contest && Array.isArray(data[0].contest.allowed_subcategories)) ? data[0].contest.allowed_subcategories : null;
        const fromFishType = (data && data[0] && data[0].contest && Array.isArray(data[0].contest.fish_type)) ? data[0].contest.fish_type : null;
        if (fromApi || fromFishType) {
          setSelectedContest((prev) => prev ? { ...prev, allowed_subcategories: fromApi || prev.allowed_subcategories, fish_type: fromFishType || prev.fish_type } : prev);
        }
      }
      // เริ่มสแกน AI เบื้องหลัง
      if (Array.isArray(data) && data.length > 0) {
        scanAllWithAI(data);
      }
    } catch (error) {
      toast.error("ไม่สามารถดึงรายชื่อผู้สมัครได้");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectContest = (contest) => {
    setSelectedContest(contest);
    setAiScan({});
    fetchSubmissions(contest.id);
  };

  const handleBackToList = () => {
    setSelectedContest(null);
    setSubmissions([]);
    setSelectedSubmissions([]);
    setFilterStatus('pending');
    setAiResult(null);
    setAiScan({});
  };

  const handleSelectSubmission = (submissionId) => {
    setSelectedSubmissions(prev =>
      prev.includes(submissionId) ? prev.filter(id => id !== submissionId) : [...prev, submissionId]
    );
  };

  const handleSelectAll = (submissionIds) => {
    if (selectedSubmissions.length === submissionIds.length) setSelectedSubmissions([]);
    else setSelectedSubmissions(submissionIds);
  };

  const handleBulkAction = async (newStatus) => {
    if (selectedSubmissions.length === 0) return toast.info("กรุณาเลือกผู้สมัครก่อน");
    setIsProcessing(true);
    try {
      let reason;
      if (newStatus === 'rejected') {
        reason = window.prompt('ระบุเหตุผลที่ปฏิเสธ/ยกเลิกการอนุมัติ:');
        if (!reason || !reason.trim()) { setIsProcessing(false); return toast.info('ยกเลิก เนื่องจากไม่ได้ระบุเหตุผล'); }
      }
      const promises = selectedSubmissions.map(id => updateSubmissionStatus(id, newStatus, reason));
      await Promise.all(promises);
      toast.success(`อัปเดตสถานะ ${selectedSubmissions.length} รายการสำเร็จ!`);
      setSelectedSubmissions([]);
      await fetchSubmissions(selectedContest.id);
      if (newStatus === 'approved') setFilterStatus('approved');
      else if (newStatus === 'rejected') setFilterStatus('rejected');
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContestStatusChange = async (newStatus) => {
    if (!selectedContest || !window.confirm(`คุณต้องการเปลี่ยนสถานะการประกวดเป็น "${newStatus}" ใช่หรือไม่?`)) return;
    setIsProcessing(true);
    try {
      const response = await updateMyContest(selectedContest.id, { status: newStatus });
      setSelectedContest(response);
      toast.success(`เปลี่ยนสถานะเป็น "${newStatus}" สำเร็จ!`);
      if (newStatus === 'ปิดรับสมัคร') {
        const proceed = window.confirm('ต้องการเปิดการตัดสินตอนนี้เพื่อให้ผู้เชี่ยวชาญเริ่มให้คะแนนหรือไม่?');
        if (proceed) {
          const judging = await updateMyContest(selectedContest.id, { status: 'ตัดสิน' });
          setSelectedContest(judging);
          toast.success('เปิดการตัดสินแล้ว ผู้เชี่ยวชาญสามารถให้คะแนนได้');
        }
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmFinalize = async () => {
    setFinalizeModalOpen(false);
    setIsProcessing(true);
    try {
      await finalizeContest(selectedContest.id);
      toast.success("ประกาศผลสำเร็จ!");
      await fetchContests();
      handleBackToList();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- AI helpers ---
  const computeAllowedList = (contestOverride = null) => {
    const src = contestOverride || selectedContest || {};
    const raw = (Array.isArray(src.allowed_subcategories) && src.allowed_subcategories.length > 0
      ? src.allowed_subcategories
      : Array.isArray(src.fish_type) ? src.fish_type : []) || [];
    const codes = raw
      .map((x) => normalizeToCode(String(x)))
      .filter((x) => x);
    return Array.from(new Set(codes));
  };

  const analyzeFirstImageWithAI = async (submission) => {
    try {
      const firstUrl = submission?.fish_image_urls?.[0];
      if (!firstUrl) { toast.info('ไม่มีรูปภาพสำหรับตรวจด้วย AI'); return; }
      setAiLoading(true);
      setAiResult(null);

      const imgResp = await fetch(firstUrl, { mode: 'cors' });
      const blob = await imgResp.blob();
      const fd = new FormData();
      fd.append('image', blob, 'fish.jpg');
      fd.append('analysis_type', 'competition');

      // ใช้ proxy ผ่าน Vite
      const res = await apiService.post('/model/analyze-single', fd);
      const data = res?.data ?? res; // รองรับกรณี wrapper success/data
      const code = (data?.final_label?.code || 'OTHER').toString().toUpperCase();
      const name = data?.final_label?.name || getBettaTypeLabel(code) || 'อื่นๆ';
      const prob = typeof data?.top1?.prob === 'number' ? data.top1.prob : null;
      const isConfident = !!data?.is_confident;

      const allowed = computeAllowedList(submission?.contest || null);
      const isAllowed = allowed.includes(code);

      setAiResult({ code, name, prob, is_confident: isConfident, allowed: isAllowed, allowedList: allowed });
      setAiScan(prev => ({ ...prev, [submission.id]: { code, name, prob, is_confident: isConfident, allowed: isAllowed, allowedList: allowed } }));

      if (isConfident && isAllowed) toast.success(`AI แนะนำ: ตรงประเภท (${name}${prob != null ? ` ${(prob*100).toFixed(1)}%` : ''})`);
      else if (isConfident && !isAllowed) toast.warn(`AI พบว่าไม่ตรงประเภทที่อนุญาต (${name})`);
      else toast.info(`AI ยังไม่มั่นใจ (${name})`);
    } catch (e) {
      console.error(e);
      toast.error('วิเคราะห์ด้วย AI ไม่สำเร็จ');
    } finally {
      setAiLoading(false);
    }
  };

  const analyzeFirstSilently = async (submission) => {
    try {
      const firstUrl = submission?.fish_image_urls?.[0];
      if (!firstUrl) return { error: 'no-image' };
      const imgResp = await fetch(firstUrl, { mode: 'cors' });
      const blob = await imgResp.blob();
      const fd = new FormData();
      fd.append('image', blob, 'fish.jpg');
      fd.append('analysis_type', 'competition');

      // ใช้ proxy ผ่าน Vite
      const res = await apiService.post('/model/analyze-single', fd);
      const data = res?.data ?? res;
      const code = (data?.final_label?.code || 'OTHER').toString().toUpperCase();
      const name = data?.final_label?.name || getBettaTypeLabel(code) || 'อื่นๆ';
      const prob = typeof data?.top1?.prob === 'number' ? data.top1.prob : null;
      const isConfident = !!data?.is_confident;
      const allowed = computeAllowedList(submission?.contest || null);
      const isAllowed = allowed.includes(code);
      return { code, name, prob, is_confident: isConfident, allowed: isAllowed, allowedList: allowed };
    } catch (e) {
      return { error: e.message || 'analyze-failed' };
    }
  };

  const scanAllWithAI = async (list) => {
    // จำกัดพร้อมกัน 3 รายการเพื่อไม่ให้โหลดหนักเกินไป
    const concurrency = 3;
    let idx = 0;
    const worker = async () => {
      while (idx < list.length) {
        const current = list[idx++];
        const res = await analyzeFirstSilently(current);
        setAiScan(prev => ({ ...prev, [current.id]: res }));
      }
    };
    await Promise.all(new Array(concurrency).fill(0).map(() => worker()));
  };

  const quickApprove = async (submissionId) => {
    setActionLoading(true);
    try {
      await updateSubmissionStatus(submissionId, 'approved');
      toast.success('อนุมัติสำเร็จ');
      await fetchSubmissions(selectedContest.id);
      setFilterStatus('approved');
    } catch (e) { toast.error(e.message || 'อนุมัติไม่สำเร็จ'); } finally { setActionLoading(false); }
  };

  const quickReject = async (submissionId) => {
    const reason = window.prompt('ระบุเหตุผลที่ปฏิเสธ/ยกเลิกการอนุมัติ:');
    if (!reason || !reason.trim()) return;
    setActionLoading(true);
    try {
      await updateSubmissionStatus(submissionId, 'rejected', reason.trim());
      toast.warn('ปฏิเสธแล้ว');
      await fetchSubmissions(selectedContest.id);
      setFilterStatus('rejected');
    } catch (e) { toast.error(e.message || 'ปฏิเสธไม่สำเร็จ'); } finally { setActionLoading(false); }
  };

  const ContestCard = ({ contest }) => {
    const activeCount = (contest.contest_judges || []).filter(j => j.status !== 'declined').length;
    const submissionCount = (contest.submissions || []).length;
    return (
      <div
        onClick={() => handleSelectContest(contest)}
        className="group bg-white rounded-2xl overflow-hidden border-2 shadow-sm hover:shadow-md transition-all cursor-pointer border-gray-200 hover:border-purple-300"
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={contest.poster_url || POSTER_PLACEHOLDER}
            alt={contest.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.01] transition-transform"
            loading="lazy"
            decoding="async"
            onError={(e) => { e.currentTarget.src = POSTER_PLACEHOLDER; }}
          />
          <div className={`absolute left-3 top-3 px-2.5 py-1 text-xs font-semibold rounded-full border ${statusBadgeCls(contest.status)}`}>{contest.status}</div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-1">{contest.name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} />
            <span>{contest.start_date ? new Date(contest.start_date).toLocaleDateString('th-TH') : 'N/A'} - {contest.end_date ? new Date(contest.end_date).toLocaleDateString('th-TH') : 'N/A'}</span>
          </div>
          <div className="mt-3 text-xs text-gray-500 flex items-center gap-4">
            <span><Users size={14} className="inline mr-1"/> กรรมการ {activeCount}</span>
            <span><Users size={14} className="inline mr-1"/> ผู้สมัคร {submissionCount}</span>
          </div>
      </div>
    </div>
  );
  };

  const ContestDashboard = () => {
    const stats = useMemo(() => ({
      totalOwners: Array.from(new Set(submissions.map(s => s?.owner?.id))).filter(Boolean).length,
      totalFish: submissions.length,
      pending: submissions.filter(s => s.status === 'pending').length,
      approved: submissions.filter(s => s.status === 'approved').length,
      rejected: submissions.filter(s => s.status === 'rejected').length,
    }), [submissions]);

    const filteredSubmissions = useMemo(() => {
      let list = submissions;
      if (filterStatus !== 'all') list = list.filter(s => s.status === filterStatus);
      if (aiFilter !== 'all') {
        list = list.filter((s) => {
          const r = aiScan[s.id];
          if (!r) return false; // ยังไม่สแกน ให้ไม่ติดในโหมดกรองเฉพาะ
          if (aiFilter === 'match') return !!(r.is_confident && r.allowed);
          if (aiFilter === 'mismatch') return !!(r.is_confident && !r.allowed);
          if (aiFilter === 'uncertain') return !r.is_confident;
          return true;
        });
      }
      return list;
    }, [submissions, filterStatus, aiFilter, aiScan]);

    const getStatusBadge = (status) => {
      const styles = { approved: 'status-approved', rejected: 'status-rejected', pending: 'status-pending' };
      return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || 'status-closed'}`}>{status}</span>;
    };

    const renderAiBadge = (subId) => {
      const r = aiScan[subId];
      if (!r) return <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">กำลังตรวจ...</span>;
      if (r.error) return <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">ไม่พร้อม</span>;
      if (r.is_confident && r.allowed) return <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">ตรง</span>;
      if (r.is_confident && !r.allowed) return <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">ไม่ตรง</span>;
      return <span className="px-2 py-1 text-xs rounded bg-amber-100 text-amber-700">ยังไม่มั่นใจ</span>;
    };

    return (
      <div>
        <button onClick={handleBackToList} className="flex items-center gap-2 text-muted hover:text-heading mb-4 transition-colors">
          <ArrowLeft size={18}/> กลับไปหน้ารายการ
        </button>
        <h2 className="text-3xl font-bold text-heading">{selectedContest.name}</h2>
        
        <div className="my-6 p-4 surface-secondary rounded-lg flex justify-between items-center">
          <div>
            <p className="text-body">สถานะปัจจุบัน:</p>
            <p className="font-bold text-xl text-secondary-700">{selectedContest.status}</p>
          </div>
          <div className="flex items-center space-x-2">
            {isProcessing ? <LoaderCircle className="animate-spin"/> : (
              <>
                {selectedContest.status === 'กำลังดำเนินการ' && <button onClick={() => handleContestStatusChange('ปิดรับสมัคร')} className="action-reject flex items-center"><Lock className="mr-2" size={18}/> ปิดรับสมัคร</button>}
                {selectedContest.status === 'ปิดรับสมัคร' && <button onClick={() => handleContestStatusChange('ตัดสิน')} className="btn-primary flex items-center"><PlayCircle className="mr-2" size={18}/> เริ่มการตัดสิน</button>}
                {selectedContest.status === 'ตัดสิน' && <button onClick={() => setFinalizeModalOpen(true)} className="action-pending flex items-center"><Trophy className="mr-2" size={18}/> คำนวณและประกาศผล</button>}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard icon={<Users/>} label="ผู้สมัครทั้งหมด (นับคน)" value={stats.totalOwners} onClick={() => setFilterStatus('all')} isActive={filterStatus === 'all'} />
          <StatCard icon={<Fish/>} label="ปลากัดทั้งหมด (ตัว)" value={stats.totalFish} onClick={() => setFilterStatus('all')} isActive={false} />
          <StatCard icon={<Clock/>} label="รออนุมัติ" value={stats.pending} onClick={() => setFilterStatus('pending')} isActive={filterStatus === 'pending'} />
          <StatCard icon={<CheckSquare/>} label="อนุมัติแล้ว" value={stats.approved} onClick={() => setFilterStatus('approved')} isActive={filterStatus === 'approved'} />
          <StatCard icon={<XCircle/>} label="ปฏิเสธ" value={stats.rejected} onClick={() => setFilterStatus('rejected')} isActive={filterStatus === 'rejected'} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">รายชื่อผู้สมัคร (สถานะ: {{all: 'ทั้งหมด', pending: 'รออนุมัติ', approved: 'อนุมัติแล้ว', rejected: 'ปฏิเสธ'}[filterStatus]})</h3>
          {filterStatus === 'pending' && (
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              {stats.pending > 0 && (
                <>
              <button onClick={() => handleBulkAction('approved')} className="px-3 py-1 bg-green-500 text-white rounded text-sm">อนุมัติที่เลือก</button>
              <button onClick={() => handleBulkAction('rejected')} className="px-3 py-1 bg-red-500 text-white rounded text-sm">ปฏิเสธที่เลือก</button>
                </>
              )}
              <div className="ml-auto flex gap-2">
                <span className="text-sm text-gray-600 self-center">กรองตามสถานะ AI:</span>
                <button className={`px-3 py-1 text-sm rounded ${aiFilter==='all'?'bg-gray-800 text-white':'bg-gray-100 text-gray-700'}`} onClick={() => setAiFilter('all')}>ทั้งหมด</button>
                <button className={`px-3 py-1 text-sm rounded ${aiFilter==='match'?'bg-green-600 text-white':'bg-gray-100 text-gray-700'}`} onClick={() => setAiFilter('match')}>ตรง</button>
                <button className={`px-3 py-1 text-sm rounded ${aiFilter==='mismatch'?'bg-red-600 text-white':'bg-gray-100 text-gray-700'}`} onClick={() => setAiFilter('mismatch')}>ไม่ตรง</button>
                <button className={`px-3 py-1 text-sm rounded ${aiFilter==='uncertain'?'bg-amber-600 text-white':'bg-gray-100 text-gray-700'}`} onClick={() => setAiFilter('uncertain')}>ยังไม่มั่นใจ</button>
              </div>
            </div>
          )}
          {filterStatus === 'approved' && (
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              {stats.approved > 0 && (
                <>
                  <button onClick={() => handleBulkAction('rejected')} className="px-3 py-1 bg-red-600 text-white rounded text-sm">ยกเลิกการอนุมัติที่เลือก</button>
                </>
              )}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {(filterStatus === 'pending' || filterStatus === 'approved') && <th className="p-2 text-left w-10"><input type="checkbox" onChange={() => handleSelectAll(filteredSubmissions.map(s => s.id))} checked={selectedSubmissions.length === filteredSubmissions.length && filteredSubmissions.length > 0}/></th>}
                  <th className="p-2 text-left">ชื่อปลากัด</th>
                  <th className="p-2 text-left">เจ้าของ</th>
                  <th className="p-2 text-left">สถานะ</th>
                  <th className="p-2 text-left">สถานะ AI</th>
                  <th className="p-2 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map(sub => (
                  <tr key={sub.id} className="border-b hover:bg-gray-50">
                    {(filterStatus === 'pending' || filterStatus === 'approved') && <td className="p-2"><input type="checkbox" checked={selectedSubmissions.includes(sub.id)} onChange={() => handleSelectSubmission(sub.id)}/></td>}
                    <td className="p-2 font-semibold">{sub.fish_name}</td>
                    <td className="p-2 text-gray-600">{sub.owner.first_name}</td>
                    <td className="p-2">{getStatusBadge(sub.status)}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {renderAiBadge(sub.id)}
                        {aiScan[sub.id] && aiScan[sub.id].is_confident && !aiScan[sub.id].allowed && (
                          <button className="px-2 py-1 text-xs rounded bg-amber-100 text-amber-800 flex items-center gap-1" onClick={() => { setAiDetail(aiScan[sub.id]); setAiDetailModalOpen(true); }}>
                            <Info size={14}/> คุณสมบัติไม่ตรง
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { setSubmissionInModal(sub); setDetailModalOpen(true); setAiResult(null); }} className="p-1 text-blue-600" title="ดูรายละเอียด"><Eye size={16}/></button>
                        {sub.status !== 'approved' && (
                          <button disabled={actionLoading} onClick={async () => {
                            setActionLoading(true);
                            try {
                              await updateSubmissionStatus(sub.id, 'approved');
                              toast.success('อนุมัติสำเร็จ');
                              await fetchSubmissions(selectedContest.id);
                              setFilterStatus('approved');
                            } catch(e){ toast.error(e.message || 'อนุมัติไม่สำเร็จ'); } finally { setActionLoading(false); }
                          }} className="px-2 py-1 text-xs rounded bg-green-600 text-white">อนุมัติ</button>
                        )}
                        {sub.status !== 'rejected' && (
                          <button disabled={actionLoading} onClick={async () => {
                            const reason = window.prompt('ระบุเหตุผลที่ปฏิเสธ/ยกเลิกการอนุมัติ:');
                            if (!reason || !reason.trim()) return;
                            setActionLoading(true);
                            try {
                              await updateSubmissionStatus(sub.id, 'rejected', reason.trim());
                              toast.warn('ปฏิเสธแล้ว');
                              await fetchSubmissions(selectedContest.id);
                              setFilterStatus('rejected');
                            } catch(e){ toast.error(e.message || 'ปฏิเสธไม่สำเร็จ'); } finally { setActionLoading(false); }
                          }} className="px-2 py-1 text-xs rounded bg-red-600 text-white">{sub.status === 'approved' ? 'ยกเลิกการอนุมัติ' : 'ปฏิเสธ'}</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSubmissions.length === 0 && <p className="text-center text-gray-500 py-6">ไม่พบผู้สมัครในสถานะนี้</p>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <ManagerMenu />
      <div className="pt-16 p-4 sm:p-8 w-full">
        {selectedContest ? <ContestDashboard /> : (
          <>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">ห้องจัดการแข่งขัน</h1>
            {loading ? (
              <div className="flex justify-center p-10"><LoaderCircle className="animate-spin text-purple-500" size={32}/></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contests.map(c => <ContestCard key={c.id} contest={c} />)}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Modal รายละเอียดของ submission พร้อมปุ่มเรียก AI */}
      <Modal isOpen={detailModalOpen} onRequestClose={() => setDetailModalOpen(false)} style={{ overlay: { zIndex: 1050 } }} className="fixed inset-0 flex items-center justify-center p-4">
        {submissionInModal && (
          <div className="bg-white rounded-lg p-6 max-w-lg w-full relative">
            <button onClick={() => setDetailModalOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><XCircle /></button>
            <h2 className="text-2xl font-bold mb-4">{submissionInModal.fish_name}</h2>
            <div className="space-y-4 mb-4">
              <div>
                <h3 className="font-semibold">รูปภาพ:</h3>
                <div className="flex flex-wrap gap-2 bg-gray-100 p-2 rounded-lg">
                  {submissionInModal.fish_image_urls?.map((url, index) => <img key={index} src={url} alt={`Fish ${index+1}`} className="w-28 h-28 object-cover rounded-md"/>)}
                </div>
              </div>
              {submissionInModal.fish_video_url && (
                <div>
                  <h3 className="font-semibold">วิดีโอ:</h3>
                  <video src={submissionInModal.fish_video_url} controls className="w-full rounded-lg bg-black"/>
                </div>
              )}
            </div>
            <div className="space-y-2 text-gray-700">
               <p><strong>เจ้าของ:</strong> {submissionInModal.owner?.first_name}</p>
               <p><strong>ประเภท:</strong> {getBettaTypeLabel(submissionInModal.fish_type)}</p>
            </div>

            <div className="mt-4 p-3 rounded-lg border bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-600"/>
                  <span className="font-semibold">ให้ AI ตรวจสอบความตรงประเภท (รูปแรก)</span>
                </div>
                <button
                  disabled={aiLoading}
                  onClick={() => analyzeFirstImageWithAI(submissionInModal)}
                  className="px-3 py-1.5 text-sm rounded bg-purple-600 text-white disabled:opacity-50"
                >{aiLoading ? 'กำลังวิเคราะห์...' : 'วิเคราะห์ด้วย AI'}</button>
              </div>

              {aiResult && (
                <div className="mt-3 text-sm">
                  <p>
                    ผล AI: <strong>{aiResult.name}</strong>
                    {aiResult.prob != null && <> ({(aiResult.prob * 100).toFixed(1)}%)</>}
                    {' '}• ความมั่นใจ: {aiResult.is_confident ? 'สูง' : 'ต่ำ'}
                  </p>
                  <p>ประเภทที่อนุญาต: {Array.isArray(aiResult.allowedList) && aiResult.allowedList.length > 0 ? aiResult.allowedList.join(', ') : 'ไม่ระบุ'}</p>
                  <div className="mt-2 flex gap-2">
                    {aiResult.is_confident && aiResult.allowed ? (
                      <>
                        <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">แนะนำ: อนุมัติ</span>
                        <button className="px-3 py-1 text-xs rounded bg-green-600 text-white" onClick={() => quickApprove(submissionInModal.id)}>อนุมัติทันที</button>
                      </>
                    ) : (
                      <>
                        <span className="px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs">แนะนำ: ตรวจสอบเพิ่ม/ปฏิเสธ</span>
                        <button className="px-3 py-1 text-xs rounded bg-red-600 text-white" onClick={() => quickReject(submissionInModal.id)}>ปฏิเสธทันที</button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal รายละเอียดคุณสมบัติไม่ตรง */}
      <Modal isOpen={aiDetailModalOpen} onRequestClose={() => setAiDetailModalOpen(false)} style={{ overlay: { zIndex: 1052 } }} className="fixed inset-0 flex items-center justify-center p-4">
        {aiDetail && (
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <button onClick={() => setAiDetailModalOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><XCircle /></button>
            <h3 className="text-xl font-bold mb-2">รายละเอียดคุณสมบัติไม่ตรง</h3>
            <p className="text-sm text-gray-700">AI วิเคราะห์ได้: <strong>{aiDetail.name}</strong>{aiDetail.prob != null && <> ({(aiDetail.prob*100).toFixed(1)}%)</>}</p>
            <p className="text-sm text-gray-700 mt-2">ประเภทที่อนุญาตของการประกวด:</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {(aiDetail.allowedList || []).map((t) => (
                <span key={t} className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">{t}</span>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-1.5 text-sm rounded bg-gray-200" onClick={() => setAiDetailModalOpen(false)}>ปิด</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={finalizeModalOpen} onRequestClose={() => setFinalizeModalOpen(false)} style={{ overlay: { zIndex: 1051 } }} className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-auto text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500" />
          <h2 className="text-xl font-bold mt-4">ยืนยันการประกาศผล</h2>
          <p className="text-gray-600 mt-2">คุณแน่ใจหรือไม่ว่าต้องการประกาศผลการประกวด "{selectedContest?.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
          <div className="mt-6 flex justify-center gap-4">
            <button onClick={() => setFinalizeModalOpen(false)} className="px-6 py-2 bg-gray-200 rounded-lg">ยกเลิก</button>
            <button onClick={confirmFinalize} className="px-6 py-2 bg-green-600 text-white rounded-lg">ยืนยัน</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LiveContestRoom;