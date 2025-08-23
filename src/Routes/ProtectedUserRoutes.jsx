// --- ส่วนที่ 1: การนำเข้า (Imports) ---

// [อัปเดต] นำเข้า 'lazy' จาก React เพื่อเปิดใช้งาน Code Splitting
import React, { lazy } from "react";

// [อัปเดต] เปลี่ยนจากการ import Component ตรงๆ มาเป็นการใช้ lazy()
// เพื่อให้โค้ดของแต่ละหน้าถูกแยกออกเป็นไฟล์ย่อย (chunk) และจะถูกดาวน์โหลด
// ก็ต่อเมื่อผู้ใช้พยายามจะเข้าไปยังหน้านั้นๆ
const BettaEvaluationForm = lazy(() => import('../Pages/User/BettaEvaluationForm'));
const HistoryPage = lazy(() => import('../Pages/User/HistoryPage'));
const Profile = lazy(() => import('../Pages/User/Profile'));

// [ลบ] ไม่จำเป็นต้อง import Unauthorized ที่นี่แล้ว เพราะถูกจัดการใน App.jsx


// --- ส่วนที่ 2: การกำหนดเส้นทาง (Route Definitions) ---

const ProtectedUserRoutes = [
    // [อัปเดต] เปลี่ยน Path ทั้งหมดให้เป็นแบบ Relative (ไม่มี "/" นำหน้า)
    // เพื่อให้ทำงานกับ <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
    // ใน App.jsx ได้อย่างถูกต้อง
    { 
        path: "evaluate", 
        element: <BettaEvaluationForm /> 
    },
    { 
        path: "history", 
        element: <HistoryPage /> 
    },
    { 
        path: "profile", 
        element: <Profile /> 
    },
    // [ลบ] นำ Route "/unauthorized" ออกจาก Array นี้
    // เพราะเป็น Route พิเศษที่ถูกจัดการแยกต่างหากใน App.jsx แล้ว
];

// --- ส่วนที่ 3: การส่งออก (Export) ---

export default ProtectedUserRoutes;