// ======================================================================
// File: D:\ProJectFinal\Lasts\my-project\src\Routes\PublicRoutes.jsx
// หน้าที่: กำหนด "เส้นทางสาธารณะ" (ไม่ต้องล็อกอิน) ของแอป
// - ใช้ React.lazy เพื่อทำ Code Splitting (โหลดไฟล์เฉพาะเมื่อเข้าหน้านั้นจริง ๆ)
// - กำหนดเส้นทางแบบ "absolute path" เช่น "/", "/news", "/contest/:id"
// - ให้ App.jsx เป็นผู้ครอบ <Routes> ด้วย <Suspense fallback={...}>
// ======================================================================

// ----------------------------- Imports --------------------------------
import React, { lazy } from "react";

// ------------------------- Lazy Components ----------------------------
// หมายเหตุ: ทุกไฟล์ปลายทางควร export default เป็น React component
const HomePage          = lazy(() => import("../Pages/User/HomePage"));
const AllNewsPage       = lazy(() => import("../Pages/User/AllNewsPage"));
const SingleNewsPage    = lazy(() => import("../Pages/User/SingleNewsPage"));
const Login             = lazy(() => import("../Pages/User/Login"));
const SignUp            = lazy(() => import("../Pages/User/SignUp"));
const ForgotPassword    = lazy(() => import("../Pages/User/ForgotPassword"));
const ContestPage       = lazy(() => import("../Pages/User/ContestPage"));

// หน้ารายละเอียด "การประกวด" แยกออกจากหน้ารายละเอียด "ข่าว"
// โปรดสร้างไฟล์: ../Pages/User/SingleContestPage.jsx (export default component)
const SingleContestPage = lazy(() => import("../Pages/User/SingleContestPage"));

// ------------------------ Route Definitions ---------------------------
// หมายเหตุ:
// - โครงสร้างเป็น array ของ { path, element }
// - ใน App.jsx ให้นำไปใช้กับ <Route element={<PublicLayout />}> แล้ว map เส้นทางเหล่านี้
//   เช่น:
//     <Route element={<PublicLayout />}>
//       {PublicRoutes.map(({ path, element }) => (
//         <Route key={path} path={path} element={element} />
//       ))}
//     </Route>
const PublicRoutes = [
  // หน้าแรก
  { path: "/", element: <HomePage /> },

  // ข่าวทั้งหมด + ข่าวเดี่ยว
  { path: "/news", element: <AllNewsPage /> },
  { path: "/news/:id", element: <SingleNewsPage /> },

  // ยืนยันตัวตนทั่วไป
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/forgot-password", element: <ForgotPassword /> },

  // การประกวด (รายการทั้งหมด + รายการเดี่ยว)
  { path: "/contest", element: <ContestPage /> },
  { path: "/contest/:id", element: <SingleContestPage /> },
];

// ------------------------------- Export --------------------------------
export default PublicRoutes;
