// my-project/src/Pages/Expert/EvaluationHistory.jsx (ฉบับสมบูรณ์)

import React, { useState, useEffect, useCallback } from 'react';
import { getExpertHistory } from '../../services/expertService';
import { toast } from 'react-toastify';
import { LoaderCircle, History, Frown, ClipboardCheck, Trophy } from 'lucide-react';

// Component ย่อยสำหรับแสดงตารางข้อมูล
const HistoryTable = ({ data, type }) => {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
                <Frown size={48} className="mx-auto text-gray-400 mb-2"/>
                <p className="text-gray-500">ไม่พบประวัติในหมวดนี้</p>
            </div>
        );
    }

    const isQuality = type === 'quality';

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                            {isQuality ? 'ชื่อปลา' : 'ชื่อการแข่งขัน'}
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">ประเภท</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">วันที่เสร็จสิ้น</th>
                        {isQuality && (
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">คะแนน</th>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {data.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            <td className="py-4 px-4 font-medium text-gray-800">{item.name}</td>
                            <td className="py-4 px-4 text-gray-600">{item.type}</td>
                            <td className="py-4 px-4 text-gray-600">{new Date(item.date).toLocaleDateString('th-TH')}</td>
                            {isQuality && (
                                <td className="py-4 px-4 font-bold text-teal-600">{item.score}</td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Component หลักของหน้า
const ExpertHistory = () => {
    const [activeTab, setActiveTab] = useState('quality');
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    // ใช้ useCallback เพื่อป้องกันการสร้างฟังก์ชันใหม่ทุกครั้งที่ Render
    const fetchHistory = useCallback((type) => {
        setLoading(true);
        getExpertHistory(type)
            .then(res => {
                setHistoryData(res.data || []);
            })
            .catch(err => toast.error("ไม่สามารถโหลดประวัติได้"))
            .finally(() => setLoading(false));
    }, []);

    // useEffect จะทำงานเมื่อ activeTab เปลี่ยนแปลง
    useEffect(() => {
        fetchHistory(activeTab);
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
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <History className="mr-3 text-teal-600" />
                ประวัติการทำงาน
            </h1>

            {/* ส่วนของ Tab */}
            <div className="flex justify-center items-center gap-4 p-2 bg-gray-100 rounded-xl">
                <TabButton type="quality" label="การประเมินคุณภาพ" icon={ClipboardCheck} />
                <TabButton type="competition" label="การตัดสินการแข่งขัน" icon={Trophy} />
            </div>

            {/* ส่วนแสดงผลตาราง */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {loading ? (
                    <div className="flex justify-center p-20"><LoaderCircle className="animate-spin text-teal-500" size={40} /></div>
                ) : (
                    <HistoryTable data={historyData} type={activeTab} />
                )}
            </div>
        </div>
    );
};

export default ExpertHistory;