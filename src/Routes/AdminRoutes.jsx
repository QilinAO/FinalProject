// D:\ProJectFinal\Lasts\my-project\src\Routes\AdminRoutes.js (ฉบับสมบูรณ์)

// --- ส่วนที่ 1: การนำเข้า (Imports) ---

import React from "react";

// นำเข้า Component ของแต่ละหน้าที่เราจะใช้ในส่วนของ Admin
import AdminDashboard from "../Pages/Admin/AdminDashboard";
import ManageUser from "../Pages/Admin/ManageUser";
import Report from "../Pages/Admin/Report";
import DatabaseManagement from "../Pages/Admin/DatabaseManagement";


// --- ส่วนที่ 2: การกำหนดเส้นทาง (Route Definitions) ---

// เราสร้าง Array ของ Object ขึ้นมาเพื่อเก็บข้อมูลเส้นทางทั้งหมดของ Admin
const AdminRoutes = [
    // [อัปเดต] เปลี่ยน Path ทั้งหมดให้เป็นแบบ Relative (ไม่มี "/" นำหน้า)
    // เพื่อให้มันไปต่อท้าย Path หลักที่กำหนดไว้ใน App.jsx (ซึ่งก็คือ "/admin")
    
    // จากเดิม: { path: "/admin/dashboard", ... }
    // แก้ไขเป็น: { path: "dashboard", ... }
    // ผลลัพธ์สุดท้ายจะเป็น URL: /admin/dashboard
    { 
        path: "dashboard", 
        element: <AdminDashboard /> 
    },

    // จากเดิม: { path: "/manage-users", ... }
    // แก้ไขเป็น: { path: "users", ... }
    // ผลลัพธ์สุดท้ายจะเป็น URL: /admin/users
    { 
        path: "users", 
        element: <ManageUser /> 
    },

    // จากเดิม: { path: "/reports", ... }
    // แก้ไขเป็น: { path: "reports", ... }
    // ผลลัพธ์สุดท้ายจะเป็น URL: /admin/reports
    { 
        path: "reports", 
        element: <Report /> 
    },

    // จากเดิม: { path: "/database", ... }
    // แก้ไขเป็น: { path: "database", ... }
    // ผลลัพธ์สุดท้ายจะเป็น URL: /admin/database
    { 
        path: "database", 
        element: <DatabaseManagement /> 
    },
];

// --- ส่วนที่ 3: การส่งออก (Export) ---

// ส่งออก Array ที่เราสร้างขึ้นเพื่อให้ App.jsx สามารถนำไปใช้งานต่อได้
export default AdminRoutes;