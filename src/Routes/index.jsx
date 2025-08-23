// ======================================================================
// File: src/Routes/index.jsx
// หน้าที่: "Barrel file" สำหรับรวบรวมและส่งออก (export) Route Arrays ทั้งหมด
//         เพื่อให้สามารถ import ได้จากที่เดียว สะดวกต่อการใช้งานใน App.jsx
// ======================================================================

/**
 * วิธีการใช้งานที่แนะนำ:
 * ให้นำเข้าแบบ Named Import ในไฟล์ App.jsx ดังนี้
 *
 * import {
 *   PublicRoutes,
 *   ProtectedUserRoutes,
 *   AdminRoutes,
 *   ManagerRoutes,
 *   ExpertRoutes
 * } from "./Routes";
 *
 */

export { default as PublicRoutes } from "./PublicRoutes";
export { default as ProtectedUserRoutes } from "./ProtectedUserRoutes";
export { default as AdminRoutes } from "./AdminRoutes";
export { default as ManagerRoutes } from "./ManagerRoutes";
export { default as ExpertRoutes } from "./ExpertRoutes";