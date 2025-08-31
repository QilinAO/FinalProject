// D:\ProJectFinal\Lasts\my-project\src\services\managerService.js
import apiService from './api';

const unwrap = (res, fallbackMessage) => {
  if (res && typeof res === 'object' && 'success' in res) {
    if (res.success) return res.data ?? null;
    throw new Error(res.error || fallbackMessage);
  }
  if (res === undefined || res === null) return null;
  return res;
};

/* ===== Dashboard & Profile ===== */
export async function getDashboardStats() {
  const res = await apiService.get('/manager/dashboard/stats');
  return unwrap(res, 'โหลดสถิติล้มเหลว');
}

export async function getManagerProfileDashboard() {
  const res = await apiService.get('/manager/profile-dashboard');
  return unwrap(res, 'โหลดข้อมูลโปรไฟล์ผู้จัดการล้มเหลว');
}

/* ===== Contest & News (CRUD) ===== */
export async function createContestOrNews(formData) {
  const res = await apiService.post('/manager/contests', formData);
  return unwrap(res, 'สร้างกิจกรรมล้มเหลว');
}

export async function getMyContests() {
  const res = await apiService.get('/manager/contests');
  return unwrap(res, 'โหลดรายการกิจกรรมล้มเหลว');
}

export async function updateMyContest(contestId, data) {
  const res = await apiService.put(`/manager/contests/${contestId}`, data);
  return unwrap(res, 'อัปเดตการประกวดล้มเหลว');
}

export async function deleteMyContest(contestId) {
  const res = await apiService.delete(`/manager/contests/${contestId}`);
  return unwrap(res, 'ลบการประกวดล้มเหลว');
}

/* ===== Live Contest Room & Flow Control ===== */
export async function getContestSubmissions(contestId) {
  const res = await apiService.get(`/manager/contests/${contestId}/submissions`);
  return unwrap(res, 'โหลดรายชื่อผู้สมัครล้มเหลว');
}

export async function updateSubmissionStatus(submissionId, status, reason) {
  const payload = reason ? { status, reason } : { status };
  const res = await apiService.put(`/manager/submissions/${submissionId}/status`, payload);
  return unwrap(res, 'อัปเดตสถานะผู้สมัครล้มเหลว');
}

export async function updateContestStatus(contestId, status) {
  const res = await apiService.put(`/manager/contests/${contestId}/status`, { status });
  return unwrap(res, 'อัปเดตสถานะกิจกรรมล้มเหลว');
}

export async function finalizeContest(contestId) {
  const res = await apiService.post(`/manager/contests/${contestId}/finalize`);
  return unwrap(res, 'ประกาศผลล้มเหลว');
}

/* ===== Approve / Reject single submission ===== */
export async function approveContestSubmission(contestId, submissionId) {
  const res = await apiService.post(
    `/manager/contests/${contestId}/submissions/${submissionId}/approve`
  );
  return unwrap(res, 'อนุมัติรายการล้มเหลว');
}

export async function rejectContestSubmission(contestId, submissionId, reason) {
  const res = await apiService.post(
    `/manager/contests/${contestId}/submissions/${submissionId}/reject`,
    { reason }
  );
  return unwrap(res, 'ปฏิเสธรายการล้มเหลว');
}

/* ===== Judges ===== */
export async function getExpertList(contestId = null) {
  const params = contestId ? { contest_id: contestId } : {};
  const res = await apiService.get('/manager/experts', params);
  return unwrap(res, 'โหลดรายชื่อผู้เชี่ยวชาญล้มเหลว');
}

export async function assignJudgeToContest(contestId, judgeId) {
  const res = await apiService.post(`/manager/contests/${contestId}/judges`, { judgeId });
  return unwrap(res, 'มอบหมายกรรมการล้มเหลว');
}

export async function removeJudgeFromContest(contestId, judgeId) {
  const res = await apiService.delete(`/manager/contests/${contestId}/judges/${judgeId}`);
  return unwrap(res, 'ปลดกรรมการล้มเหลว');
}

/* ===== History & Results ===== */
export async function getContestHistory() {
  const res = await apiService.get('/manager/history');
  return unwrap(res, 'โหลดประวัติการประกวดล้มเหลว');
}

export async function getAllResults() {
  const res = await apiService.get('/manager/results/all');
  return unwrap(res, 'โหลดผลคะแนนทั้งหมดล้มเหลว');
}

export async function getScoresForSubmission(submissionId) {
  const res = await apiService.get(`/manager/submissions/${submissionId}/scores`);
  return unwrap(res, 'โหลดคะแนนของผู้สมัครล้มเหลว');
}

/* ===== Notifications (manager scope) ===== */
export async function listManagerNotifications(query = {}) {
  const res = await apiService.get('/manager/notifications', { query });
  return unwrap(res, 'โหลดศูนย์แจ้งเตือนล้มเหลว');
}

export async function markNotificationRead(notificationId) {
  const res = await apiService.patch(`/manager/notifications/${notificationId}/read`);
  return unwrap(res, 'อัปเดตสถานะแจ้งเตือนล้มเหลว');
}

export async function markAllNotificationsRead() {
  const res = await apiService.patch('/manager/notifications/read-all');
  return unwrap(res, 'อ่านแจ้งเตือนทั้งหมดล้มเหลว');
}

export default {
  getDashboardStats,
  getManagerProfileDashboard,
  createContestOrNews,
  getMyContests,
  updateMyContest,
  deleteMyContest,
  getContestSubmissions,
  updateSubmissionStatus,
  updateContestStatus,
  finalizeContest,
  approveContestSubmission,
  rejectContestSubmission,
  getExpertList,
  assignJudgeToContest,
  removeJudgeFromContest,
  getContestHistory,
  getAllResults,
  getScoresForSubmission,
  listManagerNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
