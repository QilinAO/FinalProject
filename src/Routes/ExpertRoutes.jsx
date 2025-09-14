// ======================================================================
// File: D:\ProJectFinal\Lasts\my-project\src\Routes\ExpertRoutes.jsx
// หน้าที่: กำหนดเส้นทาง (routes) สำหรับส่วนผู้เชี่ยวชาญ ภายใต้ parent path "/expert"
// - ใช้ React.lazy เพื่อทำ Code Splitting รายหน้า (โหลดเฉพาะเมื่อเข้าหน้านั้นจริง ๆ)
// - เส้นทางเป็นแบบ relative: "dashboard", "evaluations", "judging", "history", "profile"
// - <Routes> ใน App.jsx ควรถูกครอบด้วย <Suspense fallback={...}> อยู่แล้ว
//
// ตัวอย่างการใช้งานใน App.jsx:
//
//   import { Navigate } from "react-router-dom";
//   import ProtectedRoute from "./Component/ProtectedRoute";
//   import ExpertLayout from "./Component/ExpertLayout";
//   import ExpertRoutes from "./Routes/ExpertRoutes";
//
//   <Route
//     path="/expert"
//     element={
//       <ProtectedRoute requiredRole="expert">
//         <ExpertLayout />
//       </ProtectedRoute>
//     }
//   >
//     {ExpertRoutes.map(({ path, element }) => (
//       <Route key={path} path={path} element={element} />
//     ))}
//     <Route index element={<Navigate to="dashboard" replace />} />
//   </Route>
//
// ======================================================================

// ----------------------------- Imports --------------------------------
import React, { lazy } from "react";
import lazyWithRetry from "../utils/lazyWithRetry";

// ------------------------- Lazy Components ----------------------------
// หมายเหตุ: ไฟล์ปลายทางเหล่านี้ควรมี default export เป็น React component
const ExpertDashboard      = lazy(() => import("../Pages/Expert/ExpertDashboard.jsx"));
const EvaluationQueue      = lazy(() => import("../Pages/Expert/EvaluationQueue.jsx"));
// Add retry for judging pages to mitigate transient dynamic import fetch issues
const CompetitionJudging   = lazyWithRetry(() => import("../Pages/Expert/CompetitionJudging.jsx"), 1);
const ExpertJudgingContest = lazyWithRetry(() => import("../Pages/Expert/ExpertJudgingContest.jsx"), 1);
const ExpertHistory        = lazy(() => import("../Pages/Expert/EvaluationHistory.jsx"));
const ExpertProfile        = lazy(() => import("../Pages/Expert/ExpertProfile.jsx"));
const SpecialitiesManagement = lazy(() => import("../Pages/Expert/SpecialitiesManagement.jsx"));

// ------------------------ Route Definitions ---------------------------
const ExpertRoutes = [
  {
    path: "dashboard",
    element: <ExpertDashboard />,
  },
  {
    path: "evaluations",
    element: <EvaluationQueue />,
  },
  {
    path: "judging",
    element: <CompetitionJudging />,
  },
  {
    path: "judging/:contestId",
    element: <ExpertJudgingContest />,
  },
  {
    path: "history",
    element: <ExpertHistory />,
  },
  {
    path: "profile",
    element: <ExpertProfile />,
  },
  {
    path: "specialities",
    element: <SpecialitiesManagement />,
  },
];

// ------------------------------- Export --------------------------------
export default ExpertRoutes;
