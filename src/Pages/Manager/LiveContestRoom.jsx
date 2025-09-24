// D:\\ProJectFinal\\Lasts\\my-project\\src\\Pages\\Manager\\LiveContestRoom.jsx (ฉบับสมบูรณ์)

import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../../ui/Modal';
import { toast } from 'react-toastify';
import { Check, X, Eye, LoaderCircle, XCircle, PlayCircle, Lock, Trophy, AlertTriangle, ArrowLeft, Users, CheckSquare, Clock, Calendar, Sparkles, Info, Fish, ListChecks } from 'lucide-react';
import { Table, THead, TH, TD, TRow } from '../../ui/Table';
import Badge from '../../ui/Badge';
import Button from '../../ui/Button';

import ManagerMenu from '../../Component/ManagerMenu';
import PageHeader from '../../ui/PageHeader';
import { getMyContests, getContestSubmissions, updateSubmissionStatus, updateMyContest, finalizeContest, getScoringProgress, getScoresForSubmission } from '../../services/managerService';
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

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
};

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
  const [scoringProgress, setScoringProgress] = useState({ judges_total: 0, submissions: [] });
  const [scoresCache, setScoresCache] = useState({});
  const [scoreModal, setScoreModal] = useState({ open: false, submission: null, scores: [], loading: false, error: null });
  const judgeScoresSummary = useMemo(() => {
    const evaluatedScores = (scoreModal.scores || []).filter(row => row && row.status === 'evaluated' && row.score != null);
    if (!evaluatedScores.length) return { average: null, evaluatedCount: 0 };
    const total = evaluatedScores.reduce((sum, row) => sum + row.score, 0);
    const average = Math.round((total / evaluatedScores.length) * 100) / 100;
    return { average, evaluatedCount: evaluatedScores.length };
  }, [scoreModal.scores]);

  useEffect(() => {
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

  const fetchScoringProgress = async (contestId) => {
    try {
      const progress = await getScoringProgress(contestId);
      setScoringProgress(progress || { judges_total: 0, submissions: [] });
    } catch (e) {
      // ไม่ต้องรบกวนผู้ใช้ หากโหลดไม่ได้
      console.debug('Load scoring progress failed');
    }
  };

  const handleSelectContest = (contest) => {
    setSelectedContest(contest);
    setAiScan({});
    setScoresCache({});
    setScoreModal({ open: false, submission: null, scores: [], loading: false, error: null });
    fetchSubmissions(contest.id);
    fetchScoringProgress(contest.id);
  };

  const handleBackToList = () => {
    setSelectedContest(null);
    setSubmissions([]);
    setSelectedSubmissions([]);
    setFilterStatus('pending');
    setAiResult(null);
    setAiScan({});
    setScoresCache({});
    setScoreModal({ open: false, submission: null, scores: [], loading: false, error: null });
  };

  useEffect(() => {
    setSelectedSubmissions([]);
  }, [filterStatus]);

  useEffect(() => {
    setSelectedSubmissions(prev => prev.filter(id => submissions.some(sub => sub.id === id)));
  }, [submissions]);

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
      await fetchScoringProgress(selectedContest.id);
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
          // Refresh submissions as pending ones may be auto-approved on server
          await fetchSubmissions(selectedContest.id);
        }
      }
      if (newStatus === 'ตัดสิน') {
        // Server auto-approves pending submissions; refresh list
        await fetchSubmissions(selectedContest.id);
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

  const openScoreModal = async (submission) => {
    if (!submission) return;
    const targetId = submission.id;
    const cached = scoresCache[targetId];
    setScoreModal({ open: true, submission, scores: cached || [], loading: true, error: null });

    try {
      const raw = await getScoresForSubmission(targetId);
      const normalized = (Array.isArray(raw) ? raw : []).map(item => {
        const first = (item?.evaluator?.first_name || '').trim();
        const last = (item?.evaluator?.last_name || '').trim();
        const displayName = `${first} ${last}`.trim() || 'กรรมการไม่ระบุชื่อ';
        const numericScore = Number(item?.total_score);
        return {
          id: item?.evaluator_id || displayName,
          name: displayName,
          status: item?.status || 'pending',
          score: Number.isFinite(numericScore) ? numericScore : null,
          evaluatedAt: item?.evaluated_at || null,
        };
      });

      setScoresCache(prev => ({ ...prev, [targetId]: normalized }));
      setScoreModal(prev => (prev.submission?.id === targetId
        ? { open: true, submission, scores: normalized, loading: false, error: null }
        : prev));
    } catch (err) {
      setScoreModal(prev => (prev.submission?.id === targetId
        ? { ...prev, loading: false, error: err?.message || 'ไม่สามารถโหลดคะแนนได้' }
        : prev));
    }
  };

  const closeScoreModal = () => {
    setScoreModal({ open: false, submission: null, scores: [], loading: false, error: null });
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

  const handleBulkScoreApproval = async () => {
    if (!selectedContest) return;
    if (selectedSubmissions.length === 0) {
      toast.info('กรุณาเลือกผู้สมัครก่อน');
      return;
    }
    if (!window.confirm(`ยืนยันอนุมัติผลคะแนนของ ${selectedSubmissions.length} รายการหรือไม่?`)) return;

    setIsProcessing(true);
    try {
      await Promise.all(selectedSubmissions.map(id => updateSubmissionStatus(id, 'approved')));
      toast.success('อนุมัติผลคะแนนสำเร็จ');
      setScoresCache(prev => {
        if (!prev) return prev;
        const clone = { ...prev };
        selectedSubmissions.forEach(id => delete clone[id]);
        return clone;
      });
      setSelectedSubmissions([]);
      await fetchSubmissions(selectedContest.id);
      await fetchScoringProgress(selectedContest.id);
      setFilterStatus('evaluated');
    } catch (error) {
      toast.error(error?.message || 'ไม่สามารถอนุมัติผลคะแนนได้');
    } finally {
      setIsProcessing(false);
    }
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
    const selectableStatuses = ['pending', 'approved', 'evaluated'];
    const isSelectable = selectableStatuses.includes(filterStatus);
    const stats = useMemo(() => ({
      totalOwners: Array.from(new Set(submissions.map(s => s?.owner?.id))).filter(Boolean).length,
      totalFish: submissions.length,
      pending: submissions.filter(s => s.status === 'pending').length,
      approved: submissions.filter(s => s.status === 'approved').length,
      evaluated: submissions.filter(s => s.status === 'evaluated').length,
      rejected: submissions.filter(s => s.status === 'rejected').length,
    }), [submissions]);

    // ความคืบหน้าการให้คะแนน (รวม)
    const scoringStats = useMemo(() => {
      const totalJudges = scoringProgress.judges_total || 0;
      const subs = scoringProgress.submissions || [];
      const completed = subs.filter(r => totalJudges > 0 && r.evaluated_count >= totalJudges).length;
      const coverage = subs.length > 0
        ? Math.round((subs.reduce((sum, r) => sum + (totalJudges > 0 ? (r.evaluated_count / totalJudges) : 0), 0) / subs.length) * 100)
        : 0;
      return { totalJudges, completed, coverage, totalSubs: subs.length };
    }, [scoringProgress]);

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
    const allSelected = isSelectable && filteredSubmissions.length > 0 && filteredSubmissions.every(sub => selectedSubmissions.includes(sub.id));
    const totalColumns = isSelectable ? 7 : 6;

    const getStatusBadge = (status) => {
      const variant = status === 'approved' || status === 'evaluated' ? 'green' : status === 'rejected' ? 'red' : 'gray';
      return <Badge variant={variant}>{status}</Badge>;
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

        {/* ความคืบหน้าการให้คะแนนของกรรมการ */}
        {selectedContest.status === 'ตัดสิน' && (
          <div className="mb-6 p-4 surface-secondary rounded-lg flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-secondary-800">ความคืบหน้าการให้คะแนน</span>
            <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">กรรมการตอบรับ: {scoringStats.totalJudges} ท่าน</span>
            <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">ให้ครบแล้ว: {scoringStats.completed}/{scoringStats.totalSubs} รายการ</span>
            <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">ความครอบคลุมเฉลี่ย: {scoringStats.coverage}%</span>
            <button className="ml-auto btn-outline btn-sm" onClick={() => fetchScoringProgress(selectedContest.id)}>รีเฟรช</button>
          </div>
        )}

        {filterStatus === 'judges' && (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">รายชื่อกรรมการ</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">ชื่อกรรมการ</th>
                    <th className="p-2 text-left">บัญชี</th>
                    <th className="p-2 text-left">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedContest?.contest_judges || []).length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-4 text-center text-gray-500">ยังไม่มีการมอบหมายกรรมการ</td>
                    </tr>
                  ) : (
                    (selectedContest?.contest_judges || []).map((cj, idx) => {
                      const judge = cj.judge || cj.profiles || {};
                      const fullName = `${judge.first_name || ''} ${judge.last_name || ''}`.trim();
                      const username = judge.username || '-';
                      return (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-semibold">{fullName || 'ไม่ระบุ'}</td>
                          <td className="p-2 text-gray-600">@{username}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${cj.status === 'accepted' ? 'bg-green-100 text-green-700' : cj.status === 'pending' ? 'bg-amber-100 text-amber-700' : cj.status === 'declined' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{cj.status || 'unknown'}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
          <StatCard icon={<Users/>} label="ผู้สมัครทั้งหมด (นับคน)" value={stats.totalOwners} onClick={() => setFilterStatus('all')} isActive={filterStatus === 'all'} />
          <StatCard icon={<Fish/>} label="ปลากัดทั้งหมด (ตัว)" value={stats.totalFish} onClick={() => setFilterStatus('all')} isActive={false} />
          <StatCard icon={<Clock/>} label="รออนุมัติ" value={stats.pending} onClick={() => setFilterStatus('pending')} isActive={filterStatus === 'pending'} />
          <StatCard icon={<CheckSquare/>} label="อนุมัติแล้ว" value={stats.approved} onClick={() => setFilterStatus('approved')} isActive={filterStatus === 'approved'} />
          <StatCard icon={<CheckSquare/>} label="ประเมินแล้ว" value={stats.evaluated} onClick={() => setFilterStatus('evaluated')} isActive={filterStatus === 'evaluated'} />
          <StatCard icon={<XCircle/>} label="ปฏิเสธ" value={stats.rejected} onClick={() => setFilterStatus('rejected')} isActive={filterStatus === 'rejected'} />
          <StatCard icon={<Users/>} label="กรรมการ" value={(selectedContest?.contest_judges || []).filter(j => j.status !== 'declined').length} onClick={() => setFilterStatus('judges')} isActive={filterStatus === 'judges'} />
        </div>

        {filterStatus !== 'judges' && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">รายชื่อผู้สมัคร (สถานะ: {{all: 'ทั้งหมด', pending: 'รออนุมัติ', approved: 'อนุมัติแล้ว', evaluated: 'ประเมินแล้ว', rejected: 'ปฏิเสธ'}[filterStatus]})</h3>
          {filterStatus === 'pending' && (
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              {stats.pending > 0 && (
                <>
                  <button
                    onClick={() => handleBulkAction('approved')}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm disabled:opacity-60"
                    disabled={isProcessing || selectedSubmissions.length === 0}
                  >อนุมัติที่เลือก</button>
                  <button
                    onClick={() => handleBulkAction('rejected')}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm disabled:opacity-60"
                    disabled={isProcessing || selectedSubmissions.length === 0}
                  >ปฏิเสธที่เลือก</button>
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
                  <button
                    onClick={() => handleBulkAction('rejected')}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm disabled:opacity-60"
                    disabled={isProcessing || selectedSubmissions.length === 0}
                  >ยกเลิกการอนุมัติที่เลือก</button>
                </>
              )}
            </div>
          )}
          {filterStatus === 'evaluated' && (
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <button
                onClick={handleBulkScoreApproval}
                className="px-3 py-1 bg-indigo-600 text-white rounded text-sm disabled:opacity-60"
                disabled={isProcessing || selectedSubmissions.length === 0}
              >อนุมัติผลคะแนนที่เลือก</button>
              {selectedSubmissions.length > 0 && (
                <span className="text-xs text-gray-500">เลือก {selectedSubmissions.length} รายการ</span>
              )}
            </div>
          )}
          <div className="bg-white rounded-lg">
            <Table>
              <THead>
                <TRow>
                  {isSelectable && (
                    <TH className="w-10">
                      <input
                        type="checkbox"
                        onChange={() => handleSelectAll(filteredSubmissions.map(s => s.id))}
                        checked={allSelected}
                        disabled={filteredSubmissions.length === 0}
                      />
                    </TH>
                  )}
                  <TH>ชื่อปลากัด</TH>
                  <TH>เจ้าของ</TH>
                  <TH>สถานะ</TH>
                  <TH>สถานะ AI</TH>
                  <TH>คะแนนสุดท้าย</TH>
                  <TH className="text-center">จัดการ</TH>
                </TRow>
              </THead>
              <tbody>
                {filteredSubmissions.map(sub => (
                  <TRow key={sub.id}>
                    {isSelectable && (
                      <TD>
                        <input
                          type="checkbox"
                          checked={selectedSubmissions.includes(sub.id)}
                          onChange={() => handleSelectSubmission(sub.id)}
                        />
                      </TD>
                    )}
                    <TD className="font-semibold">{sub.fish_name}</TD>
                    <TD className="text-gray-600">{sub.owner.first_name}</TD>
                    <TD>{getStatusBadge(sub.status)}</TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        {renderAiBadge(sub.id)}
                        {aiScan[sub.id] && aiScan[sub.id].is_confident && !aiScan[sub.id].allowed && (
                          <button className="px-2 py-1 text-xs rounded bg-amber-100 text-amber-800 flex items-center gap-1" onClick={() => { setAiDetail(aiScan[sub.id]); setAiDetailModalOpen(true); }}>
                            <Info size={14}/> คุณสมบัติไม่ตรง
                          </button>
                        )}
                      </div>
                    </TD>
                    <TD>
                      {(() => {
                        const row = (scoringProgress.submissions || []).find(r => r.submission_id === sub.id);
                        const finalScore = sub.final_score != null
                          ? Number(sub.final_score)
                          : row?.average_score != null ? Number(row.average_score) : null;

                        return (
                          <div className="text-xs text-gray-700 space-y-1">
                            <span className="text-base font-semibold text-gray-900">
                              {finalScore != null ? finalScore.toFixed(2) : '-'}
                            </span>
                            <button
                              type="button"
                              onClick={() => openScoreModal(sub)}
                              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                            >
                              <ListChecks size={14}/> ดูคะแนน
                            </button>
                          </div>
                        );
                      })()}
                    </TD>
                    <TD className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { setSubmissionInModal(sub); setDetailModalOpen(true); setAiResult(null); }} className="p-1 text-blue-600" title="ดูรายละเอียด"><Eye size={16}/></button>
                        {sub.status !== 'approved' && (
                          <Button size="sm" variant="success" disabled={actionLoading} onClick={async () => {
                            setActionLoading(true);
                            try {
                              await updateSubmissionStatus(sub.id, 'approved');
                              toast.success('อนุมัติสำเร็จ');
                              await fetchSubmissions(selectedContest.id);
                              setFilterStatus('approved');
                            } catch(e){ toast.error(e.message || 'อนุมัติไม่สำเร็จ'); } finally { setActionLoading(false); }
                          }}>อนุมัติ</Button>
                        )}
                        {sub.status !== 'rejected' && (
                          <Button size="sm" variant="danger" disabled={actionLoading} onClick={async () => {
                            const reason = window.prompt('ระบุเหตุผลที่ปฏิเสธ/ยกเลิกการอนุมัติ:');
                            if (!reason || !reason.trim()) return;
                            setActionLoading(true);
                            try {
                              await updateSubmissionStatus(sub.id, 'rejected', reason.trim());
                              toast.warn('ปฏิเสธแล้ว');
                              await fetchSubmissions(selectedContest.id);
                              setFilterStatus('rejected');
                            } catch(e){ toast.error(e.message || 'ปฏิเสธไม่สำเร็จ'); } finally { setActionLoading(false); }
                          }}>{sub.status === 'approved' ? 'ยกเลิกการอนุมัติ' : 'ปฏิเสธ'}</Button>
                        )}
                      </div>
                    </TD>
                  </TRow>
                ))}
                {filteredSubmissions.length === 0 && (
                  <TRow>
                    <TD colSpan={totalColumns} className="text-center text-gray-500 py-6">ไม่พบผู้สมัครในสถานะนี้</TD>
                  </TRow>
                )}
              </tbody>
            </Table>
          </div>
        </div>
        )}
      </div>
    );
  };

  // Poll ความคืบหน้าทุก 15 วิ. ระหว่างสถานะ "ตัดสิน"
  useEffect(() => {
    if (!selectedContest || selectedContest.status !== 'ตัดสิน') return;
    const id = selectedContest.id;
    const timer = setInterval(() => {
      fetchScoringProgress(id);
    }, 15000);
    return () => clearInterval(timer);
  }, [selectedContest]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <ManagerMenu />
      <div className="pt-16 p-4 sm:p-8 w-full">
        {selectedContest ? <ContestDashboard /> : (
          <>
            <PageHeader title="ห้องจัดการแข่งขัน" />
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
      <Modal isOpen={detailModalOpen} onRequestClose={() => setDetailModalOpen(false)} title={submissionInModal?.fish_name} maxWidth="max-w-lg">
        {submissionInModal && (
          <div>
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
      <Modal isOpen={aiDetailModalOpen} onRequestClose={() => setAiDetailModalOpen(false)} title="รายละเอียดคุณสมบัติไม่ตรง" maxWidth="max-w-md">
        {aiDetail && (
          <div>
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

      <Modal
        isOpen={scoreModal.open}
        onRequestClose={closeScoreModal}
        title={scoreModal.submission ? `คะแนนกรรมการ - ${scoreModal.submission.fish_name}` : 'คะแนนกรรมการ'}
        maxWidth="max-w-xl"
      >
        {scoreModal.submission ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>เจ้าของ:</strong> {`${scoreModal.submission.owner?.first_name || ''} ${scoreModal.submission.owner?.last_name || ''}`.trim() || '-'}</p>
              <p><strong>สถานะล่าสุด:</strong> {scoreModal.submission.status}</p>
              <p><strong>คะแนนสุดท้าย:</strong> {scoreModal.submission.final_score != null ? Number(scoreModal.submission.final_score).toFixed(2) : '-'}</p>
              {judgeScoresSummary.average != null && (
                <p><strong>คะแนนเฉลี่ย:</strong> {judgeScoresSummary.average.toFixed(2)}</p>
              )}
            </div>

            {scoreModal.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm p-3">{scoreModal.error}</div>
            )}

            {scoreModal.scores.length > 0 ? (
              <Table>
                <THead>
                  <TRow>
                    <TH>กรรมการ</TH>
                    <TH>สถานะ</TH>
                    <TH>คะแนน</TH>
                    <TH>เวลาให้คะแนน</TH>
                  </TRow>
                </THead>
                <tbody>
                  {scoreModal.scores.map((row) => (
                    <TRow key={row.id}>
                      <TD className="text-sm text-gray-800">{row.name}</TD>
                      <TD className="text-sm text-gray-600">{row.status === 'evaluated' ? 'ประเมินแล้ว' : 'รอดำเนินการ'}</TD>
                      <TD className="text-sm font-semibold text-gray-800">{row.score != null ? row.score.toFixed(2) : '-'}</TD>
                      <TD className="text-sm text-gray-500">{formatDateTime(row.evaluatedAt)}</TD>
                    </TRow>
                  ))}
                </tbody>
              </Table>
            ) : (!scoreModal.loading && !scoreModal.error) ? (
              <p className="text-sm text-gray-500 text-center">ยังไม่มีการให้คะแนนจากกรรมการ</p>
            ) : null}

            {scoreModal.loading && (
              <div className="flex justify-center py-3"><LoaderCircle className="animate-spin text-purple-500" size={24}/></div>
            )}

            <div className="flex justify-end">
              <button onClick={closeScoreModal} className="px-4 py-2 text-sm bg-gray-200 rounded-lg">ปิด</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center">ยังไม่มีข้อมูลการเลือก</p>
        )}
      </Modal>

      <Modal isOpen={finalizeModalOpen} onRequestClose={() => setFinalizeModalOpen(false)} title="ยืนยันการประกาศผล" maxWidth="max-w-md">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500" />
          <p className="text-gray-600 mt-2">คุณแน่ใจหรือไม่ว่าต้องการประกาศผลการประกวด &quot;{selectedContest?.name}&quot;? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
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
