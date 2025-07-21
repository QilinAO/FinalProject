// D:\ProJectFinal\Lasts\my-project\src\Routes\Routes.jsx (ฉบับแก้ไขสมบูรณ์)

import React from "react";
import { Navigate } from 'react-router-dom';

// User & Public Pages
import HomePage from "../Pages/User/HomePage";
import AllNewsPage from '../Pages/User/AllNewsPage';
import SingleNewsPage from '../Pages/User/SingleNewsPage';
import ContestPage from '../Pages/User/ContestPage';
import HistoryPage from '../Pages/User/HistoryPage';
import Profile from '../Pages/User/Profile';
import Login from '../Pages/User/Login';
import SignUp from '../Pages/User/SignUp';
import ForgotPassword from '../Pages/User/ForgotPassword';

// Shared
import Unauthorized from "../Pages/Shared/Unauthorized"; // สมมติว่าไฟล์ Unauthorized อยู่ที่นี่

// Admin Pages
import AdminDashboard from "../Pages/Admin/AdminDashboard";
import ManageUser from "../Pages/Admin/ManageUser";

// Manager Pages (Import ทั้งหมดที่ต้องใช้จริง)
import ManagerDashboard from "../Pages/Manager/ManagerDashboard";
import ContestManagement from "../Pages/Manager/ContestManagement";
import ContestList from "../Pages/Manager/ContestList";
import AssignJudges from "../Pages/Manager/AssignJudges";
import LiveContestRoom from "../Pages/Manager/LiveContestRoom";
import ContestHistory from "../Pages/Manager/ContestHistory";
import CompetitionResults from "../Pages/Manager/CompetitionResults";
// *** ไม่ต้อง import ManagerProfile และ AnnounceResults แล้ว ***

// Expert Pages
import ExpertDashboard from "../Pages/Expert/ExpertDashboard";


// 1. เส้นทางทั่วไป (ทุกคนเข้าได้)
export const PublicRoutes = [
    { path: "/", element: <HomePage /> },
    { path: "/login", element: <Login /> },
    { path: "/signup", element: <SignUp /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/news", element: <AllNewsPage /> },
    { path: "/news/:id", element: <SingleNewsPage /> },
    { path: "/contest", element: <ContestPage /> },
    { path: "/unauthorized", element: <Unauthorized /> },
];

// 2. เส้นทางที่ต้องล็อกอิน (ไม่สน Role)
export const ProtectedUserRoutes = [
    { path: "/profile", element: <Profile /> },
    { path: "/my-history", element: <HistoryPage /> }, // อาจจะเปลี่ยน path
];

// 3. เส้นทางสำหรับแอดมินเท่านั้น
export const AdminRoutes = [
    { path: "/dashboard", element: <AdminDashboard /> },
    { path: "/users", element: <ManageUser /> },
];

// 4. เส้นทางสำหรับผู้จัดการเท่านั้น (อัปเดตใหม่ทั้งหมด)
export const ManagerRoutePaths = [
    { path: "/dashboard", element: <ManagerDashboard /> },
    { path: "/create", element: <ContestManagement /> }, // สร้างกิจกรรม
    { path: "/list", element: <ContestList /> },         // รายการกิจกรรม (แก้ไข/ลบ)
    { path: "/assign-judges", element: <AssignJudges /> },
    { path: "/live-room", element: <LiveContestRoom /> },   // ห้องแข่งขัน
    { path: "/history", element: <ContestHistory /> },
    { path: "/results", element: <CompetitionResults /> },
    { path: "*", element: <Navigate to="/manager/dashboard" replace /> }, // ถ้าเข้า path ผิด ให้ไปหน้า dashboard
];

// 5. เส้นทางสำหรับผู้เชี่ยวชาญเท่านั้น
export const ExpertRoutes = [
    { path: "/dashboard", element: <ExpertDashboard /> },
];