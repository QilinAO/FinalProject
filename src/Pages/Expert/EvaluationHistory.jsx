// my-project/src/Pages/Expert/EvaluationHistory.jsx (ฉบับสมบูรณ์)

import React, { useState, useEffect, useCallback } from 'react';
import { getExpertHistory } from '../../services/expertService';
import { toast } from 'react-toastify';
import { History, Frown, ClipboardCheck, Trophy } from 'lucide-react';
import PageHeader from '../../ui/PageHeader';
import { Table, THead, TH, TD, TRow } from '../../ui/Table';
import EmptyState from '../../ui/EmptyState';
import LoadingSpinner from '../../ui/LoadingSpinner';

// Component ย่อยสำหรับแสดงตารางข้อมูล
const HistoryTable = ({ data, type }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <EmptyState
        icon={<Frown size={48} className="mx-auto text-gray-400" />}
        title="ไม่พบประวัติในหมวดนี้"
        subtitle="ลองเปลี่ยนหมวดหรือกลับมาภายหลัง"
      />
    );
  }

  const isQuality = type === 'quality';

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('th-TH');
  };

  const formatScore = (score, shouldHide = false) => {
    if (shouldHide) return '-';
    if (score === null || score === undefined) return '-';
    const num = Number(score);
    return Number.isFinite(num) ? num.toFixed(2) : '-';
  };

  return (
    <Table>
      <THead>
        <TRow>
          <TH>{isQuality ? 'ชื่อปลา' : 'ชื่อการแข่งขัน'}</TH>
          <TH>{isQuality ? 'เจ้าของ' : 'ชื่อปลาที่ให้คะแนน'}</TH>
          <TH>ประเภท</TH>
          <TH>คะแนนรวม</TH>
          <TH>วันที่เสร็จสิ้น</TH>
        </TRow>
      </THead>
      <tbody>
        {data.map((item) => (
          <TRow key={item.id}>
            <TD className="font-medium text-gray-800">
              {isQuality ? item.fish_name : item.name}
            </TD>
            <TD className="text-gray-600">
              {isQuality ? item.owner_name || '-' : item.fish_name || '-'}
            </TD>
            <TD className="text-gray-600">
              {isQuality ? (item.fish_type || '-') : (item.type || '-')}
            </TD>
            <TD className="font-semibold text-teal-600">
              {formatScore(item.total_score, isQuality && item.status !== 'evaluated')}
            </TD>
            <TD className="text-gray-600">{formatDate(isQuality ? item.evaluated_at : item.date)}</TD>
          </TRow>
        ))}
      </tbody>
    </Table>
  );
};

// Component หลักของหน้า
const ExpertHistory = () => {
    const [activeTab, setActiveTab] = useState(() => {
        try {
            const saved = localStorage.getItem('expert_history_tab');
            return saved === 'quality' || saved === 'competition' ? saved : 'competition';
        } catch { return 'competition'; }
    });
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    // ใช้ useCallback เพื่อป้องกันการสร้างฟังก์ชันใหม่ทุกครั้งที่ Render
    const fetchHistory = useCallback((type) => {
        setLoading(true);
        getExpertHistory(type)
            .then(res => {
                const items = Array.isArray(res?.data) ? res.data : [];
                setHistoryData(items);
            })
            .catch(() => toast.error("ไม่สามารถโหลดประวัติได้"))
            .finally(() => setLoading(false));
    }, []);

    // useEffect จะทำงานเมื่อ activeTab เปลี่ยนแปลง
    useEffect(() => {
        fetchHistory(activeTab);
        try { localStorage.setItem('expert_history_tab', activeTab); } catch {}
    }, [activeTab, fetchHistory]);

    // Component ย่อยสำหรับปุ่ม Tab
    const TabButton = ({ type, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-300 
              ${activeTab === type 
                ? "bg-teal-600 text-white shadow-md" 
                : "bg-white text-gray-600 hover:bg-teal-50"
              }`}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <PageHeader title={<span className="flex items-center"><History className="mr-3 text-teal-600"/>ประวัติการทำงาน</span>} />

            {/* ส่วนของ Tab */}
            <div className="flex justify-center items-center gap-4 p-2 bg-gray-100 rounded-xl">
                <TabButton type="competition" label="การตัดสินการแข่งขัน" icon={Trophy} />
                <TabButton type="quality" label="การประเมินคุณภาพ" icon={ClipboardCheck} />
            </div>

            {/* ส่วนแสดงผลตาราง */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {loading ? (
                <LoadingSpinner label="กำลังโหลดประวัติ..." />
              ) : (
                <HistoryTable data={historyData} type={activeTab} />
              )}
            </div>
        </div>
    );
};

export default ExpertHistory;
