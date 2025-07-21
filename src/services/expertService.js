// D:\ProJectFinal\Lasts\my-project\src\services\expertService.js (ฉบับสมบูรณ์)

// --- ส่วนที่ 1: การนำเข้า (Imports) ---

import apiService from './api';


// --- ส่วนที่ 2: ฟังก์ชันสำหรับเรียกใช้ API ---

// ========================================================
// Dashboard
// ========================================================

/**
 * ดึงข้อมูลสรุปทั้งหมดสำหรับหน้า Dashboard ของ Expert
 * (เรียกใช้ API: GET /api/experts/dashboard)
 */
export const getExpertDashboardStats = () => {
  return apiService.get('/experts/dashboard');
};


// ========================================================
// Quality Evaluation Queue (คิวงานประเมินคุณภาพ)
// ========================================================

/**
 * ดึงคิวงานประเมินคุณภาพทั้งหมด (ทั้งที่รอตอบรับและรับแล้ว)
 * (เรียกใช้ API: GET /api/experts/queue)
 */
export const getEvaluationQueue = () => {
  return apiService.get('/experts/queue');
};

/**
 * ตอบรับหรือปฏิเสธงานประเมินคุณภาพ
 * (เรียกใช้ API: POST /api/experts/assignments/:assignmentId/respond)
 * @param {string} assignmentId - ID ของ "งาน" ที่ได้รับมอบหมาย
 * @param {'accepted' | 'rejected'} status - สถานะที่ต้องการอัปเดต
 * @param {string} [reason] - (Optional) เหตุผล (จำเป็นถ้าปฏิเสธ)
 */
export const respondToEvaluation = (assignmentId, status, reason = '') => {
  return apiService.post(`/experts/assignments/${assignmentId}/respond`, { status, reason });
};

/**
 * ส่งผลคะแนนการประเมินคุณภาพ
 * (เรียกใช้ API: POST /api/experts/assignments/:assignmentId/score)
 * @param {string} assignmentId - ID ของ "งาน" ที่กำลังทำ
 * @param {object} scoresData - อ็อบเจกต์คะแนน { scores: {...}, totalScore: ... }
 */
export const submitQualityScores = (assignmentId, scoresData) => {
  return apiService.post(`/experts/assignments/${assignmentId}/score`, scoresData);
};


// ========================================================
// Competition Judging (การตัดสินการแข่งขัน)
// ========================================================

/**
 * ดึงข้อมูลการแข่งขันทั้งหมด (ทั้งคำเชิญและรายการที่รับแล้ว)
 * (เรียกใช้ API: GET /api/experts/judging)
 */
export const getJudgingContests = () => {
  return apiService.get('/experts/judging');
};

/**
 * ตอบรับ/ปฏิเสธการเป็นกรรมการ
 * (เรียกใช้ API: POST /api/experts/judging/:contestId/respond)
 * @param {string} contestId - ID การประกวด
 * @param {'accepted' | 'rejected'} response - การตอบรับ
 */
export const respondToJudgeInvitation = (contestId, response) => {
    return apiService.post(`/experts/judging/${contestId}/respond`, { response });
};

/**
 * ดึงรายชื่อปลาในการแข่งขันที่ตอบรับเป็นกรรมการแล้ว
 * (เรียกใช้ API: GET /api/experts/judging/:contestId/submissions)
 * @param {string} contestId - ID การประกวด
 */
export const getFishInContest = (contestId) => {
    return apiService.get(`/experts/judging/${contestId}/submissions`);
};

/**
 * ส่งคะแนนปลากัดในการแข่งขัน
 * (เรียกใช้ API: POST /api/experts/judging/submissions/:submissionId/score)
 * @param {string} submissionId - ID ของปลาที่ส่งเข้าประกวด
 * @param {object} scoresData - อ็อบเจกต์คะแนน { scores: {...}, totalScore: ... }
 */
export const submitCompetitionScore = (submissionId, scoresData) => {
    return apiService.post(`/experts/judging/submissions/${submissionId}/score`, scoresData);
};


// ===================================================================
// ▼▼▼ [ส่วนที่เพิ่มใหม่] สำหรับ Dynamic Scoring Form ▼▼▼
// ===================================================================

/**
 * ดึงเกณฑ์การให้คะแนนจาก Backend ตามประเภทของปลากัด
 * (เรียกใช้ API: GET /api/experts/scoring-schema/:bettaType)
 * @param {string} bettaType - ชื่อประเภทของปลากัด
 */
export const getScoringSchema = (bettaType) => {
  // ใช้ encodeURIComponent เพื่อให้แน่ใจว่าชื่อภาษาไทยถูกส่งไปใน URL ได้อย่างถูกต้อง
  return apiService.get(`/experts/scoring-schema/${encodeURIComponent(bettaType)}`);
};


// ========================================================
// History (ประวัติการทำงาน)
// ========================================================

/**
 * ดึงประวัติการทำงานทั้งหมด
 * (เรียกใช้ API: GET /api/experts/history?type=...)
 * @param {'quality' | 'competition'} type - ประเภทของประวัติที่ต้องการ
 */
export const getExpertHistory = (type) => {
  return apiService.get(`/experts/history?type=${type}`);
};