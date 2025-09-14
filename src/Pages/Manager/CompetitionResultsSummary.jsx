import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiBarChart2 } from 'react-icons/fi';
import PageHeader from "../../ui/PageHeader";
import ManagerMenu from '../../Component/ManagerMenu';
import { getAllResults } from '../../services/managerService';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const CompetitionResultsSummary = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAllResults();
        setResults(data || []);
      } catch (e) {
        toast.error('ไม่สามารถดึงผลคะแนนทั้งหมดได้');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const normalized = useMemo(() => (results || []).map(r => ({
    final_score: r.final_score != null ? Number(r.final_score) : null,
    contest_name: r.contest?.name || '',
    contest_end_date: r.contest?.end_date || null,
  })), [results]);

  const filtered = useMemo(() => {
    const q = (searchQuery || '').toLowerCase();
    return normalized.filter(item => {
      const inSearch = item.contest_name.toLowerCase().includes(q);
      const inRange = (() => {
        if (!dateFrom && !dateTo) return true;
        if (!item.contest_end_date) return true;
        const d = new Date(item.contest_end_date).getTime();
        if (dateFrom) {
          const f = new Date(dateFrom + 'T00:00:00').getTime();
          if (d < f) return false;
        }
        if (dateTo) {
          const t = new Date(dateTo + 'T23:59:59').getTime();
          if (d > t) return false;
        }
        return true;
      })();
      return inSearch && inRange;
    });
  }, [normalized, searchQuery, dateFrom, dateTo]);

  const summary = useMemo(() => {
    const map = new Map();
    for (const r of filtered) {
      if (!map.has(r.contest_name)) map.set(r.contest_name, []);
      if (typeof r.final_score === 'number') map.get(r.contest_name).push(r.final_score);
    }
    const rows = Array.from(map.entries()).map(([name, list]) => {
      if (list.length === 0) return { name, count: 0, min: null, max: null, mean: null };
      const min = Math.min(...list);
      const max = Math.max(...list);
      const mean = list.reduce((s, v) => s + v, 0) / list.length;
      return { name, count: list.length, min, max, mean: Math.round(mean * 100) / 100 };
    });
    return rows.sort((a, b) => (b.mean ?? -Infinity) - (a.mean ?? -Infinity));
  }, [filtered]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <ManagerMenu />
      <div className="pt-16 p-4 sm:p-8 w-full">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <PageHeader title={<span className="flex items-center"><FiBarChart2 className="mr-3 text-purple-600"/>สรุปผล คลังข้อมูลผลการแข่งขัน</span>} actions={<button className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center" onClick={() => navigate('/manager/competition-results')}><FiArrowLeft className="mr-2"/>กลับไปตารางผลลัพธ์</button>} />

          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="ค้นหาชื่อการประกวด..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full p-3 border rounded-lg" />
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">ช่วงสิ้นสุด (ถึงวัน)</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="p-2 border rounded" />
              <span className="text-gray-400">—</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="p-2 border rounded" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">แสดง</label>
              <select value={limit} onChange={e => setLimit(Number(e.target.value))} className="p-2 border rounded">
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
              <span className="text-sm text-gray-600">รายการ</span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10"><LoaderCircle className="animate-spin text-purple-600 inline-block" size={32} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.slice(0, limit).map((c) => (
                <div key={c.name} className="p-4 border rounded-lg bg-gray-50">
                  <div className="font-semibold text-gray-800 mb-1 truncate" title={c.name}>{c.name || '—'}</div>
                  <div className="text-xs text-gray-600 mb-2">รายการ: {c.count}</div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 rounded bg-green-100 text-green-800">เฉลี่ย {c.mean ?? '—'}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">สูงสุด {c.max ?? '—'}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800">ต่ำสุด {c.min ?? '—'}</span>
                  </div>
                  <div className="mt-2 h-2 bg-white border rounded overflow-hidden">
                    {typeof c.mean === 'number' && (
                      <div className="h-full bg-purple-500" style={{ width: `${Math.max(0, Math.min(100, c.mean))}%` }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitionResultsSummary;
