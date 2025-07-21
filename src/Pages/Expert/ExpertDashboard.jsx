// src/Pages/Expert/ExpertDashboard.jsx (New File)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getExpertDashboardStats } from '../../services/expertService';
import { toast } from 'react-toastify';
import { LoaderCircle, ClipboardCheck, Trophy, Bell, CheckSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ icon, label, value, color, linkTo }) => (
    <Link to={linkTo} className={`block p-6 rounded-xl shadow-lg transition-transform transform hover:scale-105 bg-white border-l-4 border-${color}-500`}>
        <div className="flex items-center justify-between">
            <div className="flex flex-col">
                <p className="text-lg font-semibold text-gray-600">{label}</p>
                <p className="text-4xl font-bold text-gray-800 mt-1">{value ?? '0'}</p>
            </div>
            <div className={`p-4 rounded-full bg-${color}-100 text-${color}-600`}>
                {icon}
            </div>
        </div>
    </Link>
);


const ExpertDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getExpertDashboardStats();
                setStats(data);
            } catch (error) {
                toast.error('ไม่สามารถโหลดข้อมูลแดชบอร์ดได้');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><LoaderCircle className="animate-spin text-teal-600" size={48} /></div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-gray-800">
                ยินดีต้อนรับ, <span className="text-teal-600">{user?.profile?.first_name || 'ผู้เชี่ยวชาญ'}!</span>
            </h1>
            <p className="text-lg text-gray-500">
                นี่คือภาพรวมงานของคุณในปัจจุบัน
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <StatCard 
                    icon={<ClipboardCheck size={32}/>} 
                    label="รอประเมินคุณภาพ" 
                    value={stats?.pendingEvaluations} 
                    color="yellow"
                    linkTo="/expert/evaluations"
                />
                <StatCard 
                    icon={<Trophy size={32}/>} 
                    label="รอตอบรับการแข่งขัน" 
                    value={stats?.pendingCompetitions} 
                    color="purple"
                    linkTo="/expert/judging"
                />
                 <StatCard 
                    icon={<CheckSquare size={32}/>} 
                    label="งานที่เสร็จสิ้น" 
                    value={stats?.completedTasks}
                    color="green"
                    linkTo="/expert/history"
                />
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-700 flex items-center mb-4">
                    <Bell className="mr-3 text-teal-500"/>
                    การแจ้งเตือนและงานด่วน
                </h2>
                 {(!stats || (stats.pendingEvaluations === 0 && stats.pendingCompetitions === 0)) ? (
                    <p className="text-center text-gray-500 py-8">ไม่มีงานที่ต้องดำเนินการในขณะนี้ ยอดเยี่ยม!</p>
                ) : (
                    <ul className="space-y-3">
                        {stats.pendingEvaluations > 0 && (
                            <li className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                                <p>คุณมี <strong className="text-yellow-800">{stats.pendingEvaluations}</strong> รายการที่ต้องประเมินคุณภาพ</p>
                            </li>
                        )}
                         {stats.pendingCompetitions > 0 && (
                            <li className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                                <p>คุณได้รับเชิญให้เป็นกรรมการ <strong className="text-purple-800">{stats.pendingCompetitions}</strong> การแข่งขัน</p>
                            </li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ExpertDashboard;
