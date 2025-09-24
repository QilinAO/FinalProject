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
 * 尝试 /experts/judging，若失败或无数据回退 /experts/contests/judging
 */
export const getJudgingContests = async () => {
  // 主请求
  try {
    const res = await apiService.get('/experts/judging');
    const data = res?.data ?? res;
    const invitations = Array.isArray(data?.invitations) ? data.invitations : [];
    const myContests = Array.isArray(data?.myContests) ? data.myContests : [];
    if (invitations.length > 0 || myContests.length > 0) {
      return { data: { invitations, myContests } };
    }
  } catch (_e) {
    // 忽略，进入回退
  }
  // 回退
  const fallback = await apiService.get('/experts/contests/judging');
  const fbData = fallback?.data ?? fallback;
  return {
    data: {
      invitations: Array.isArray(fbData?.invitations) ? fbData.invitations : [],
      myContests: Array.isArray(fbData?.myContests) ? fbData.myContests : [],
    }
  };
};

/**
 * ตอบรับ/ปฏิเสธการเป็นกรรมการ
 * (เรียกใช้ API: POST /api/experts/judging/:contestId/respond)
 * @param {string} contestId - ID การประกวด
 * @param {'accepted' | 'rejected'} response - การตอบรับ
 */
export const respondToJudgeInvitation = (contestId, response, reason = '') => {
    const normalized = String(response).toLowerCase();
    if (normalized === 'accepted' || normalized === 'accept') {
      return apiService.post(`/experts/contests/${contestId}/accept`, {});
    }
    // rejected / decline → ต้องส่ง reason ได้ (optional)
    return apiService.post(`/experts/contests/${contestId}/decline`, { reason });
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
export const getScoringSchema = (bettaType, options = {}) => {
  const { contestId = null } = options;
  const query = { betta_type: bettaType };
  if (contestId) query.contest_id = contestId;
  return apiService.get('/experts/scoring-schema', { query });
};


// ========================================================
// History (ประวัติการทำงาน)
// ========================================================

/**
 * ดึงประวัติการทำงานทั้งหมด
 * (เรียกใช้ API: GET /api/experts/history/evaluations หรือ /api/experts/history/contests)
 * @param {'quality' | 'competition'} type - ประเภทของประวัติที่ต้องการ
 */
export const getExpertHistory = (type) => {
  if (type === 'quality') {
    return apiService.get('/experts/history/evaluations');
  } else if (type === 'competition') {
    return apiService.get('/experts/history/contests');
  }
  return apiService.get('/experts/history/evaluations'); // default
};

/**
 * ดึงความเชี่ยวชาญของผู้เชี่ยวชาญ
 * (เรียกใช้ API: GET /api/experts/specialities)
 */
export const getSpecialities = () => {
  return apiService.get('/experts/specialities');
};

/**
 * อัปเดตความเชี่ยวชาญของผู้เชี่ยวชาญ
 * @param {Object} data - ข้อมูลความเชี่ยวชาญ
 * (เรียกใช้ API: PUT /api/experts/specialities)
 */
export const updateSpecialities = (data) => {
  return apiService.put('/experts/specialities', data);
};

/**
 * ดึงคำแนะนำความเชี่ยวชาญ
 * (เรียกใช้ API: GET /api/experts/specialities/suggestions)
 */
export const getSpecialitiesSuggestions = () => {
  return apiService.get('/experts/specialities/suggestions');
};
