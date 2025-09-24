// ======================================================================
// File: src/App.jsx
// หน้าที่: App หลักของโปรเจกต์, จัดการ Routing และ Global Components
// ======================================================================

import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Hourglass } from "lucide-react";

import ProtectedRoute from "./Component/ProtectedRoute";
import useIdleLogout from "./hooks/useIdleLogout";
import { useAuth } from "./context/AuthContext"; // [ปรับปรุง] Import useAuth เพื่อใช้ signout

// --- Layouts (Code Splitting) ---
const PublicLayout  = lazy(() => import("./Component/PublicLayout"));
const UserLayout    = lazy(() => import("./Component/UserLayout"));
const AdminLayout   = lazy(() => import("./Component/AdminLayout"));
const ManagerLayout = lazy(() => import("./Component/ManagerLayout"));
const ExpertLayout  = lazy(() => import("./Component/ExpertLayout"));

// --- Shared Pages ---
const Unauthorized = lazy(() => import("./Pages/Shared/Unauthorized"));
const NotFound     = lazy(() => import("./Pages/Shared/NotFound"));

// --- Route Definitions ---
import { PublicRoutes, ProtectedUserRoutes, AdminRoutes, ManagerRoutes, ExpertRoutes } from "./Routes";

// --- Loading Fallback Component ---
const LoadingFallback = () => (
  <div className="min-h-screen w-full flex flex-col items-center justify-center">
    <Hourglass className="animate-spin text-purple-600" size={48} />
    <p className="mt-4 text-lg text-gray-700">กำลังโหลด...</p>
  </div>
);

// --- App Routes Component ---
const AppRoutes = () => {
  const { signout } = useAuth(); // [ปรับปรุง] ดึงฟังก์ชัน signout จาก AuthContext

  // เด้งออกอัตโนมัติเมื่อไม่มีการใช้งานครบ 3 ชั่วโมง
  useIdleLogout(() => {
    signout(); // [ปรับปรุง] เรียกใช้ signout จาก Context โดยตรง
    toast.info("เซสชันหมดอายุเนื่องจากไม่มีการใช้งาน");
    // ไม่ต้องใช้ navigate('/login') แล้ว เพราะ ProtectedRoute จะจัดการให้เอง
  }, 3 * 60 * 60 * 1000);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes (ไม่ต้อง Login) */}
        <Route element={<PublicLayout />}>
          {PublicRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>

        {/* User Routes (ต้อง Login) */}
        <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
          {ProtectedUserRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>

        {/* Admin Routes (ต้อง Login และมี Role 'admin') */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
          {AdminRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Manager Routes (ต้อง Login และมี Role 'manager') */}
        <Route path="/manager" element={<ProtectedRoute requiredRole="manager"><ManagerLayout /></ProtectedRoute>}>
          {ManagerRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Expert Routes (ต้อง Login และมี Role 'expert') */}
        <Route path="/expert" element={<ProtectedRoute requiredRole="expert"><ExpertLayout /></ProtectedRoute>}>
          {ExpertRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Fallback Routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

// --- Root Component ---
const App = () => (
  <BrowserRouter>
    <AppRoutes />
    <ToastContainer position="bottom-right" autoClose={4000} hideProgressBar={false} />
  </BrowserRouter>
);

export default App;
