// D:\ProJectFinal\Lasts\my-project\src\services\adminService.js (ฉบับสมบูรณ์)

// --- ส่วนที่ 1: การนำเข้า (Imports) ---

// นำเข้า apiService ซึ่งเป็นตัวจัดการการยิง API หลักของเรา
import apiService from './api';


// --- ส่วนที่ 2: ฟังก์ชันสำหรับเรียกใช้ API ---

/**
 * ===================================================================
 * ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ทั้งหมด (สำหรับ Admin)
 * (เรียกใช้ API: GET /api/admin/users)
 * ===================================================================
 * @returns {Promise<object>} Promise ที่จะ resolve เป็น response object จาก API
 */
export const getAllUsers = () => {
  return apiService.get('/admin/users');
};

/**
 * ===================================================================
 * ฟังก์ชันสำหรับสร้างผู้ใช้ใหม่ (สำหรับ Admin)
 * (เรียกใช้ API: POST /api/admin/users)
 * ===================================================================
 * @param {object} userData - ข้อมูลผู้ใช้ที่จะสร้าง (เช่น { email, password, ... })
 * @returns {Promise<object>} Promise ที่จะ resolve เป็น response object จาก API
 */
export const createUser = (userData) => {
  return apiService.post('/admin/users', userData);
};

/**
 * ===================================================================
 * ฟังก์ชันสำหรับลบผู้ใช้ (สำหรับ Admin)
 * (เรียกใช้ API: DELETE /api/admin/users/:userId)
 * ===================================================================
 * @param {string} userId - ID ของผู้ใช้ที่จะลบ
 * @returns {Promise<object>} Promise ที่จะ resolve เป็น response object จาก API
 */
export const deleteUser = (userId) => {
  return apiService.delete(`/admin/users/${userId}`);
};

/**
 * ===================================================================
 * ▼▼▼ [ส่วนที่เพิ่มใหม่] ฟังก์ชันดึงข้อมูลสรุปสำหรับ Admin Dashboard ▼▼▼
 * (เรียกใช้ API: GET /api/admin/dashboard/stats)
 * ===================================================================
 * @returns {Promise<object>} Promise ที่จะ resolve เป็น response object จาก API
 */
export const getDashboardStats = () => {
  return apiService.get('/admin/dashboard/stats');
};


// --- ส่วนที่ 3: หมายเหตุสำหรับอนาคต ---

// TODO: เพิ่มฟังก์ชัน updateUser ที่เรียกไปยัง /api/admin/users/:id ในอนาคต
// (เป็นการเขียนโน้ตไว้สำหรับนักพัฒนา ว่าในอนาคตอาจจะต้องมีการสร้างฟังก์ชันนี้เพิ่ม)