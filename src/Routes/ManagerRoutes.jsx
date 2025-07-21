// D:\ProJectFinal\Lasts\my-project\src\Routes\ManagerRoutes.js (ฉบับสมบูรณ์)

// --- ส่วนที่ 1: การนำเข้า (Imports) ---

import React from "react";

// นำเข้า Component ของแต่ละหน้าที่เราจะใช้ในส่วนของ Manager
import ManagerDashboard from "../Pages/Manager/ManagerDashboard";
import ManagerProfile from "../Pages/Manager/ManagerProfile";
import ContestManagement from "../Pages/Manager/ContestManagement";
import ContestList from "../Pages/Manager/ContestList";
import CompetitionResults from "../Pages/Manager/CompetitionResults";
import ContestHistory from "../Pages/Manager/ContestHistory";

// [อัปเดต] Import สองหน้าที่ขาดหายไปเข้ามาด้วย
import AssignJudges from "../Pages/Manager/AssignJudges";
import LiveContestRoom from "../Pages/Manager/LiveContestRoom";


// --- ส่วนที่ 2: การกำหนดเส้นทาง (Route Definitions) ---

const ManagerRoutes = [
    // [อัปเดต] Path ทั้งหมดถูกเปลี่ยนเป็นแบบ Relative (ไม่มี "/" นำหน้า)
    // เพื่อให้ไปต่อท้าย Path หลัก "/manager" ที่กำหนดใน App.jsx

    // URL: /manager/dashboard
    { path: "dashboard", element: <ManagerDashboard /> },

    // URL: /manager/profile
    { path: "profile", element: <ManagerProfile /> },

    // URL: /manager/contest-management
    { path: "contest-management", element: <ContestManagement /> },

    // URL: /manager/contest-list
    { path: "contest-list", element: <ContestList /> },

    // URL: /manager/competition-results
    { path: "competition-results", element: <CompetitionResults /> },

    // URL: /manager/contest-history
    { path: "contest-history", element: <ContestHistory /> },
    
    // [อัปเดต] เพิ่มสอง Route ที่หายไปใน Array
    // URL: /manager/assign-judges
    { path: "assign-judges", element: <AssignJudges /> },

    // URL: /manager/live-room
    { path: "live-room", element: <LiveContestRoom /> },
];


// --- ส่วนที่ 3: การส่งออก (Export) ---

export default ManagerRoutes;