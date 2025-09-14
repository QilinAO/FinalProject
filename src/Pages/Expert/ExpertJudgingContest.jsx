import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Modal from '../../ui/Modal';
import PageHeader from '../../ui/PageHeader';
import { LoaderCircle, ArrowLeft, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { getFishInContest, submitCompetitionScore } from '../../services/expertService';
import ScoringFormModal from '../../Component/ScoringFormModal';

const ExpertJudgingContest = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [judgingNotOpen, setJudgingNotOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [quickScores, setQuickScores] = useState({});
  const [scoringSubmission, setScoringSubmission] = useState(null);
  const [compareImageIdx, setCompareImageIdx] = useState({}); // { [submissionId]: index }

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setJudgingNotOpen(false);
    try {
      const res = await getFishInContest(contestId);
      setSubmissions(res.data || []);
    } catch (err) {
      const msg = String(err?.message || '');
      if (msg.includes('ยังไม่เปิดการตัดสิน')) setJudgingNotOpen(true);
      else toast.error('ไม่สามารถโหลดรายชื่อปลาได้');
    } finally {
      setLoading(false);
    }
  }, [contestId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const exists = prev.includes(id);
      if (exists) return prev.filter((x) => x !== id);
      if (prev.length >= 10) { toast.info('เลือกเปรียบเทียบได้สูงสุด 10 ตัว'); return prev; }
      return [...prev, id];
    });
  };

  const handleQuickScoreChange = (id, value) => {
    const v = Math.max(0, Math.min(100, Number(value)));
    setQuickScores((prev) => ({ ...prev, [id]: isNaN(v) ? '' : v }));
  };

  const stepCompareImage = (id, len, dir) => {
    if (!len || len <= 1) return;
    setCompareImageIdx(prev => {
      const cur = Number.isInteger(prev[id]) ? prev[id] : 0;
      const next = (cur + dir + len) % len;
      return { ...prev, [id]: next };
    });
  };

  const setCompareImage = (id, idx) => {
    setCompareImageIdx(prev => ({ ...prev, [id]: idx }));
  };

  const submitQuickScores = async () => {
    const targets = selectedIds.filter((id) => typeof quickScores[id] === 'number');
    if (targets.length === 0) return toast.info('กรุณากรอกคะแนนอย่างน้อย 1 รายการ');
    try {
      for (const id of targets) {
        await submitCompetitionScore(id, { scores: { mode: 'quick' }, totalScore: quickScores[id] });
      }
      toast.success(`บันทึกคะแนน ${targets.length} รายการสำเร็จ`);
      setCompareOpen(false);
      setSelectedIds([]);
      setQuickScores({});
      fetchSubmissions();
    } catch (e) {
      toast.error('บันทึกคะแนนไม่สำเร็จ');
    }
  };

  const pageTitle = useMemo(() => 'ห้องตัดสิน — รายการปลาที่ต้องให้คะแนน', []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button className="text-muted hover:text-heading flex items-center gap-2" onClick={() => navigate('/expert/judging')}> <ArrowLeft size={18}/> กลับไปหน้ารายการ</button>
      </div>
      <PageHeader title={pageTitle} />
      {judgingNotOpen && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          ขณะนี้ยังไม่เปิดการตัดสินสำหรับรายการนี้ เมื่อผู้จัดการเปิดสถานะ "ตัดสิน" แล้วจึงจะเห็นรายชื่อปลาสำหรับให้คะแนน
        </div>
      )}
      {loading ? (
        <div className="flex justify-center p-10"><LoaderCircle className="animate-spin text-primary-500" size={32}/></div>
      ) : submissions.length > 0 ? (
        <>
          <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 border border-neutral-200">
            <div className="text-sm text-caption">เลือกไว้: <span className="font-semibold">{selectedIds.length}</span>/10</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCompareOpen(true)} className="btn-primary btn-sm" disabled={selectedIds.length < 2}>เปรียบเทียบ</button>
              {selectedIds.length > 0 && (
                <button onClick={() => setSelectedIds([])} className="btn-outline btn-sm">ล้างการเลือก</button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {submissions.map((sub) => (
              <div key={sub.id} className="surface-secondary p-4 rounded-xl flex items-center gap-4">
                <img src={sub.fish_image_urls?.[0] || 'https://placehold.co/150x150/E2E8F0/A0AEC0?text=No+Image'} alt={sub.fish_name || 'Betta Fish'} className="w-20 h-20 object-cover rounded-lg border-2 border-white shadow-sm" />
                <div className="flex-1">
                  <p className="font-semibold text-body">{sub.fish_name || 'ไม่มีชื่อ'}</p>
                  <p className="text-sm text-caption">โดย: {sub.owner?.first_name || 'ไม่พบข้อมูลเจ้าของ'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-caption">
                    <input type="checkbox" checked={selectedIds.includes(sub.id)} onChange={() => toggleSelect(sub.id)} disabled={!selectedIds.includes(sub.id) && selectedIds.length >= 10}/>
                    เปรียบเทียบ
                  </label>
                  <button className="btn-primary btn-sm" onClick={() => setScoringSubmission(sub)}>ให้คะแนน</button>
                </div>
              </div>
            ))}
          </div>

          <Modal isOpen={compareOpen} onRequestClose={() => setCompareOpen(false)} title={`เปรียบเทียบปลากัด (${selectedIds.length} ตัว)`} maxWidth="max-w-6xl">
            <div className="max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {submissions.filter((s) => selectedIds.includes(s.id)).map((s) => {
                  const imgs = Array.isArray(s.fish_image_urls) ? s.fish_image_urls : [];
                  const idx = Number.isInteger(compareImageIdx[s.id]) ? compareImageIdx[s.id] : 0;
                  const currentSrc = imgs[idx] || imgs[0] || 'https://placehold.co/300x200';
                  return (
                    <div key={s.id} className="border rounded-xl p-3">
                      <div className="relative">
                        <img src={currentSrc} alt={s.fish_name || 'Betta Fish'} className="w-full h-36 object-cover rounded-lg mb-2" />
                        {imgs.length > 1 && (
                          <>
                            <button type="button" aria-label="prev" onClick={() => stepCompareImage(s.id, imgs.length, -1)} className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 hover:bg-white">
                              <ChevronLeft size={16} />
                            </button>
                            <button type="button" aria-label="next" onClick={() => stepCompareImage(s.id, imgs.length, 1)} className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 hover:bg-white">
                              <ChevronRight size={16} />
                            </button>
                          </>
                        )}
                      </div>
                      {imgs.length > 1 && (
                        <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
                          {imgs.map((u, i) => (
                            <button key={i} onClick={() => setCompareImage(s.id, i)} className={`w-10 h-10 rounded overflow-hidden border ${i===idx?'border-primary-500':'border-neutral-200'} flex-shrink-0`}>
                              <img src={u} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="font-semibold truncate">{s.fish_name || 'ไม่มีชื่อ'}</div>
                      <div className="text-sm text-caption mb-2">โดย: {s.owner?.first_name || 'ไม่พบข้อมูลเจ้าของ'}</div>
                      <input type="number" min="0" max="100" className="w-full border rounded-md p-2 text-center" placeholder="คะแนนรวม (0-100)" value={quickScores[s.id] ?? ''} onChange={(e) => handleQuickScoreChange(s.id, e.target.value)} />
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted">ให้คะแนนแบบรวดเร็ว (Quick Score) จะบันทึกเฉพาะคะแนนรวม</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelectedIds([])} className="btn-outline">ล้างการเลือก</button>
                  <button onClick={submitQuickScores} className="btn-primary">บันทึกคะแนนที่กรอก</button>
                </div>
              </div>
            </div>
          </Modal>

          {scoringSubmission && (
            <ScoringFormModal isOpen={!!scoringSubmission} onRequestClose={() => setScoringSubmission(null)} submission={scoringSubmission} onSubmit={async (id, data) => {
              try {
                await submitCompetitionScore(id, data);
                toast.success('บันทึกคะแนนสำเร็จ');
                setScoringSubmission(null);
                fetchSubmissions();
              } catch (e) { toast.error(e?.message || 'บันทึกคะแนนไม่สำเร็จ'); }
            }}/>
          )}
        </>
      ) : (
        !judgingNotOpen && (
          <div className="text-center p-6 text-muted">
            <ImageIcon size={32} className="mx-auto mb-2 text-neutral-300"/>
            ยังไม่มีผู้สมัครในรายการนี้
          </div>
        )
      )}
    </div>
  );
};

export default ExpertJudgingContest;
