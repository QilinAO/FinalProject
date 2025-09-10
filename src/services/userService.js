import apiService from './api';

/**
 * ดึงข้อมูลโปรไฟล์ล่าสุดของผู้ใช้ที่ล็อกอินอยู่
 */
export const fetchProfile = () => {
  return apiService.get('/auth/profile');
};

/**
 * อัปเดตข้อมูลโปรไฟล์ของผู้ใช้ที่ล็อกอินอยู่
 * @param {object} profileData - ข้อมูลที่จะส่งไปอัปเดต
 */
export const updateProfile = (profileData) => {
  return apiService.put('/users/profile', profileData);
};

/**
 * อัปโหลดรูปโปรไฟล์ใหม่ของผู้ใช้ที่ล็อกอินอยู่
 * @param {File} file - ไฟล์รูปภาพที่ผู้ใช้เลือก
 */
export const uploadProfilePicture = (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  return apiService.post('/users/profile/picture', formData);
};

/**
 * ส่งข้อมูลปลากัดเพื่อเข้ารับการประเมินคุณภาพ (ไม่มีการประกวด)
 * @param {FormData} formData - FormData ที่มีข้อมูลปลากัดและไฟล์ต่างๆ
 */
export const submitBettaForEvaluation = (formData) => {
  return apiService.post('/submissions/evaluate', formData);
};

/**
 * ส่งข้อมูลปลากัดเพื่อเข้าร่วมการประกวด
 * @param {FormData} formData - FormData ที่ต้องมี contest_id รวมอยู่ด้วย
 */
export const submitBettaForCompetition = (formData) => {
  return apiService.post('/submissions/compete', formData);
};

/**
 * ดึงประวัติการส่งประเมินคุณภาพทั้งหมดของผู้ใช้ที่ล็อกอินอยู่
 */
export const getMyEvaluationHistory = () => {
  return apiService.get('/users/history/evaluations');
};

/**
 * ดึงประวัติการแข่งขันทั้งหมดของผู้ใช้ที่ล็อกอินอยู่
 */
export const getMyCompetitionHistory = () => {
  return apiService.get('/users/history/competitions');
};

/**
 * ดึงผลการแข่งขันแบบสาธารณะ (หลังประกาศผล)
 */
export const getPublicContestResults = (contestId) => {
  return apiService.get(`/public/contests/${contestId}/results`);
};
