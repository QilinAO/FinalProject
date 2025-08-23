// D:\ProJectFinal\Lasts\my-project\src\services\notificationService.js
// (ฉบับสมบูรณ์: เรียก endpoint กลาง /notifications, รองรับกรอง unread/type, ครบฟังก์ชันพื้นฐาน)

import apiService from './api';

/**
 * รูปแบบ Notification ฝั่ง Frontend (อ้างอิงโครง DB)
 * @typedef {Object} Notification
 * @property {number}   id           - ไอดี (bigint ใน DB)
 * @property {string}   user_id      - UUID ผู้รับ
 * @property {string}   message      - ข้อความแจ้งเตือน
 * @property {string?}  link_to      - เส้นทางใน Frontend (อาจเป็น null)
 * @property {boolean}  is_read      - อ่านแล้วหรือยัง
 * @property {string}   created_at   - ISO datetime
 * @property {string?}  type         - ประเภทแจ้งเตือน (เช่น 'contest_result','judge_assigned') ถ้ามีในระบบคุณ
 */

/**
 * ตัวช่วยประกอบ query string อย่างปลอดภัย
 * @param {Object} opts
 * @returns {string} query string ที่ขึ้นต้นด้วย '?' หรือเป็น string ว่าง
 */
function buildQuery(opts = {}) {
  const params = new URLSearchParams();

  // รองรับ unreadOnly (ค่าเริ่มต้น false)
  if (opts.unreadOnly === true) params.set('unreadOnly', 'true');

  // รองรับ limit (ค่าเริ่มต้น 50)
  if (Number.isFinite(opts.limit) && opts.limit > 0) {
    params.set('limit', String(Math.min(opts.limit, 200))); // กันค่ามากไป
  } else {
    params.set('limit', '50');
  }

  // รองรับ types เป็น array เช่น ['contest_result','judge_assigned']
  if (Array.isArray(opts.types) && opts.types.length > 0) {
    params.set('types', opts.types.join(','));
  }

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/**
 * ดึงรายการ "การแจ้งเตือน" ของผู้ใช้คนปัจจุบัน
 * (ต้องแน่ใจว่า apiService แนบ Token ให้อยู่แล้ว)
 *
 * @param {Object} [opts]
 * @param {boolean} [opts.unreadOnly=false] - ดึงเฉพาะที่ยังไม่อ่าน
 * @param {number}  [opts.limit=50]         - จำนวนสูงสุด (สูงสุด 200)
 * @param {string[]} [opts.types]           - กรองตามประเภท (ถ้าระบบคุณมี)
 * @returns {Promise<Notification[]>}
 */
export async function getMyNotifications(opts = {}) {
  const url = `/notifications${buildQuery(opts)}`;
  const res = await apiService.get(url);

  // รองรับทั้งสองรูปแบบตอบกลับจาก backend:
  // 1) { success:true, data:[...] }
  // 2) ส่ง array ตรง ๆ (ถ้าคุณปรับ backend แบบนี้)
  if (Array.isArray(res)) return res;
  if (res?.success) return Array.isArray(res.data) ? res.data : [];

  throw new Error(res?.error || 'โหลดการแจ้งเตือนล้มเหลว');
}

/**
 * ทำแจ้งเตือน "รายการเดียว" เป็นอ่านแล้ว
 * @param {number|string} id - ไอดีของ notification (bigint อาจถูกส่งมาเป็น string)
 * @returns {Promise<boolean>}
 */
export async function markNotificationRead(id) {
  const nid = typeof id === 'number' ? id : String(id || '').trim();
  if (!nid) throw new Error('ต้องระบุ notification id');

  const res = await apiService.patch(`/notifications/${nid}/read`);
  if (res === null) return true;           // backend ตอบ 204
  if (res?.success) return true;

  throw new Error(res?.error || 'อัปเดตการแจ้งเตือนล้มเหลว');
}

/**
 * ทำ "การแจ้งเตือนทั้งหมดของผู้ใช้ปัจจุบัน" เป็นอ่านแล้ว
 * @returns {Promise<boolean>}
 */
export async function markAllNotificationsRead() {
  const res = await apiService.patch(`/notifications/read-all`);
  if (res === null) return true;           // backend ตอบ 204
  if (res?.success) return true;

  throw new Error(res?.error || 'อัปเดตการแจ้งเตือนทั้งหมดล้มเหลว');
}

/**
 * (ออปชัน) นับจำนวนแจ้งเตือนที่ยังไม่อ่านอย่างเร็ว ๆ
 * @returns {Promise<number>}
 */
export async function countUnread() {
  const list = await getMyNotifications({ unreadOnly: true, limit: 200 });
  return Array.isArray(list) ? list.length : 0;
}

/* ===== Aliases เพื่อความเข้ากันได้ย้อนหลัง (โค้ดเก่า) ===== */
export { getMyNotifications as getNotifications };
export { markNotificationRead as markNotificationAsRead };

/* ===== Default export style ===== */
const NotificationService = {
  getMyNotifications,
  getNotifications: getMyNotifications,
  markNotificationRead,
  markNotificationAsRead: markNotificationRead,
  markAllNotificationsRead,
  countUnread,
};

export default NotificationService;
