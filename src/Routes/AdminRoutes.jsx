// ======================================================================
// File: D:\ProJectFinal\Lasts\my-project\src\Routes\AdminRoutes.jsx
// หน้าที่: กำหนดเส้นทาง (routes) สำหรับส่วนแอดมิน ภายใต้ parent path "/admin"
// - ใช้ React.lazy เพื่อทำ Code Splitting รายหน้า
// - เส้นทางเป็นแบบ relative: "dashboard", "users", "reports", "database"
// - App.jsx จะครอบด้วย <Suspense fallback={<LoadingFallback />}> เอง
// ======================================================================

// ----------------------------- Imports --------------------------------
import React, { lazy } from "react";

// ------------------------- Lazy Components ----------------------------
// แต่ละหน้าในฝั่งแอดมินจะถูกโหลดเมื่อถูกเรียกใช้จริง ช่วยให้ initial load เร็วขึ้น
const AdminDashboard      = lazy(() => import("../Pages/Admin/AdminDashboard"));
const ManageUser          = lazy(() => import("../Pages/Admin/ManageUser"));
const Report              = lazy(() => import("../Pages/Admin/Report"));
const DatabaseManagement  = lazy(() => import("../Pages/Admin/DatabaseManagement"));

// ------------------------ Route Definitions ---------------------------
// หมายเหตุ:
// - ไฟล์นี้ export เป็น "array ของวัตถุ route" ให้ App.jsx นำไป map ใต้ <Route path="/admin" ...>
// - ตัวอย่างใน App.jsx:
//     <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout/></ProtectedRoute>}>
//       {AdminRoutes.map(({ path, element }) => <Route key={path} path={path} element={element} />)}
//       <Route index element={<Navigate to="dashboard" replace />} />
//     </Route>
const AdminRoutes = [
  {
    path: "dashboard",
    element: <AdminDashboard />,
  },
  {
    path: "users",
    element: <ManageUser />,
  },
  {
    path: "reports",
    element: <Report />,
  },
  {
    path: "database",
    element: <DatabaseManagement />,
  },
];

// ------------------------------- Export --------------------------------
export default AdminRoutes;
