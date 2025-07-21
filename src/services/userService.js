import apiService from './api';

// --- Functions for Logged-in User's Own Data ---

/**
 * ดึงข้อมูลโปรไฟล์ล่าสุดของผู้ใช้ที่ล็อกอินอยู่จากเซิร์ฟเวอร์
 * @returns {Promise<object>} Promise ที่จะ resolve เป็น object ที่มี key 'profile'
 */
export const fetchProfile = () => {
  // เรียกไปที่ Endpoint ที่ต้องการ Token เพื่อระบุว่า "เอาโปรไฟล์ของฉัน"
  return apiService.get('/auth/profile');
};

/**
 * อัปเดตข้อมูลโปรไฟล์ของผู้ใช้ที่ล็อกอินอยู่
 * @param {object} profileData - ข้อมูลที่จะส่งไปอัปเดต (เช่น { first_name, last_name })
 * @returns {Promise<object>} Promise ที่จะ resolve เป็น object ที่มี key 'data' ซึ่งบรรจุโปรไฟล์ที่อัปเดตแล้ว
 */
export const updateProfile = (profileData) => {
  return apiService.put('/users/profile', profileData);
};

/**
 * อัปโหลดรูปโปรไฟล์ใหม่ของผู้ใช้ที่ล็อกอินอยู่
 * @param {File} file - ไฟล์รูปภาพที่ผู้ใช้เลือก
 * @returns {Promise<object>} Promise ที่จะ resolve เป็น object ที่มี key 'data' ซึ่งบรรจุโปรไฟล์ที่อัปเดตแล้ว (รวม avatar_url ใหม่)
 */
export const uploadProfilePicture = (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file); // ชื่อ field 'profilePicture' ต้องตรงกับที่ Backend (Multer) คาดหวัง
  return apiService.post('/users/profile/picture', formData);
};

/**
 * ส่งข้อมูลปลากัดเพื่อเข้ารับการประเมินคุณภาพหรือการประกวด
 * @param {FormData} formData - FormData ที่มีข้อมูลปลากัดและไฟล์ต่างๆ (อาจมี contest_id)
 * @returns {Promise<object>} Promise จาก API response
 */
export const submitBettaForEvaluation = (formData) => {
  return apiService.post('/submissions/evaluate', formData);
};

/**
 * ดึงประวัติการส่งประเมินคุณภาพทั้งหมดของผู้ใช้ที่ล็อกอินอยู่
 * @returns {Promise<object>} Promise ที่จะ resolve เป็น response object จาก API
 */
export const getMyEvaluationHistory = () => {
  return apiService.get('/users/history/evaluations');
};

/**
 * ดึงประวัติการแข่งขันทั้งหมดของผู้ใช้ที่ล็อกอินอยู่
 * @returns {Promise<object>} Promise ที่จะ resolve เป็น response object จาก API
 */
export const getMyCompetitionHistory = () => {
  return apiService.get('/users/history/competitions');
};