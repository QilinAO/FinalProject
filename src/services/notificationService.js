// D:\ProJectFinal\Lasts\my-project\src\services\notificationService.js (ฉบับสมบูรณ์)

// --- ส่วนที่ 1: การนำเข้า (Imports) ---

// นำเข้า apiService ซึ่งเป็นตัวจัดการการยิง API หลักของเรา
import apiService from './api';


// --- ส่วนที่ 2: ฟังก์ชันสำหรับเรียกใช้ API ---

/**
 * ===================================================================
 * ฟังก์ชันสำหรับ "ดึง" การแจ้งเตือนทั้งหมดของผู้ใช้ที่ล็อกอินอยู่
 * (เรียกใช้ API: GET /api/notifications/)
 * ===================================================================
 * @returns {Promise<Array>} Promise ที่จะ resolve เป็น Array ของ notifications
 */
export const getNotifications = async () => {
    try {
        // เรียกใช้เมธอด get จาก apiService ของเรา
        const response = await apiService.get('/notifications/');
        
        // คืนค่าข้อมูลที่อยู่ใน property `data` ของ response
        // หากไม่มีข้อมูล ให้คืนค่าเป็น Array ว่างเปล่าเพื่อป้องกัน Error
        return response.data || [];
    } catch (error) {
        // หากเกิดข้อผิดพลาดในการเรียก API ให้แสดง log ใน console
        console.error("Failed to fetch notifications:", error);
        
        // และคืนค่าเป็น Array ว่างเปล่า เพื่อให้หน้าเว็บยังคงทำงานต่อไปได้โดยไม่พัง
        return [];
    }
};

/**
 * ===================================================================
 * ฟังก์ชันสำหรับ "อัปเดต" สถานะการแจ้งเตือนเป็น "อ่านแล้ว"
 * (เรียกใช้ API: POST /api/notifications/:notificationId/read)
 * ===================================================================
 * @param {number} notificationId - ID ของการแจ้งเตือนที่จะอัปเดต
 * @returns {Promise<object>} Promise ที่จะ resolve เป็น notification object ที่อัปเดตแล้ว
 */
export const markNotificationAsRead = (notificationId) => {
    // เรียกใช้เมธอด post จาก apiService ไปยัง URL ที่ถูกต้อง
    // เราไม่จำเป็นต้องส่ง body ไปด้วย เพราะ Backend รู้ว่าจะต้องทำอะไรจาก URL อยู่แล้ว
    return apiService.post(`/notifications/${notificationId}/read`);
};