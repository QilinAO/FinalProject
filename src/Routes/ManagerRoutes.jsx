// ======================================================================
// File: D:\ProJectFinal\Lasts\my-project\src\Routes\ManagerRoutes.jsx
// หน้าที่: กำหนดเส้นทาง (routes) สำหรับส่วนผู้จัดการประกวด ภายใต้ parent path "/manager"
// - ใช้ React.lazy เพื่อทำ Code Splitting รายหน้า (โหลดเมื่อเข้าหน้านั้นจริง ๆ)
// - เส้นทางเป็นแบบ relative: "dashboard", "profile", "contest-management", ...
// - ใน App.jsx ควรครอบ <Routes> ด้วย <Suspense fallback={...}> ไว้แล้ว
//
// ตัวอย่างการใช้งานใน App.jsx:
//
//   import { Navigate } from "react-router-dom";
//   import ProtectedRoute from "./Component/ProtectedRoute";
//   import ManagerLayout from "./Component/ManagerLayout";
//   import ManagerRoutes from "./Routes/ManagerRoutes";
//
//   <Route
//     path="/manager"
//     element={
//       <ProtectedRoute requiredRole="manager">
//         <ManagerLayout />
//       </ProtectedRoute>
//     }
//   >
//     {ManagerRoutes.map(({ path, element }) => (
//       <Route key={path} path={path} element={element} />
//     ))}
//     <Route index element={<Navigate to="dashboard" replace />} />
//   </Route>
//
// ======================================================================

// ----------------------------- Imports --------------------------------
import React, { lazy } from "react";

// ------------------------- Lazy Components ----------------------------
// หมายเหตุ: ไฟล์ปลายทางควร export default เป็น React component
const ManagerDashboard     = lazy(() => import("../Pages/Manager/ManagerDashboard"));
const ManagerProfile       = lazy(() => import("../Pages/Manager/ManagerProfile"));
const ContestManagement    = lazy(() => import("../Pages/Manager/ContestManagement"));
const ContestList          = lazy(() => import("../Pages/Manager/ContestList"));
const CompetitionResults   = lazy(() => import("../Pages/Manager/CompetitionResults"));
const CompetitionResultsSummary = lazy(() => import("../Pages/Manager/CompetitionResultsSummary"));
const ContestHistory       = lazy(() => import("../Pages/Manager/ContestHistory"));
const AssignJudges         = lazy(() => import("../Pages/Manager/AssignJudges"));
const LiveContestRoom      = lazy(() => import("../Pages/Manager/LiveContestRoom"));

// ------------------------ Route Definitions ---------------------------
// หมายเหตุ:
// - เส้นทางเป็น "relative" ต่อ "/manager"
// - สามารถเพิ่ม/ลดรายการได้ตามหน้าใหม่ ๆ ที่สร้างในโฟลเดอร์ Pages/Manager
const ManagerRoutes = [
  {
    path: "dashboard",
    element: <ManagerDashboard />,
  },
  {
    path: "profile",
    element: <ManagerProfile />,
  },
  {
    path: "contest-management",
    element: <ContestManagement />,
  },
  {
    path: "contest-list",
    element: <ContestList />,
  },
  {
    path: "competition-results",
    element: <CompetitionResults />,
  },
  {
    path: "competition-results/summary",
    element: <CompetitionResultsSummary />,
  },
  {
    path: "contest-history",
    element: <ContestHistory />,
  },
  {
    path: "assign-judges",
    element: <AssignJudges />,
  },
  {
    path: "live-room",
    element: <LiveContestRoom />,
  },
];

// ------------------------------- Export --------------------------------
export default ManagerRoutes;
