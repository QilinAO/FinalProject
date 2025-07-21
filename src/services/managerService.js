import apiService from './api';

// ========================================================
// Dashboard & Profile
// ========================================================
export const getDashboardStats = () => {
  return apiService.get('/manager/dashboard/stats');
};

/**
 * [เพิ่มใหม่] ดึงข้อมูลทั้งหมดสำหรับหน้าโปรไฟล์ของผู้จัดการ
 */
export const getManagerProfileDashboard = () => {
  return apiService.get('/manager/profile-dashboard');
};


// ========================================================
// Contest & News Management (CRUD)
// ========================================================
export const createContestOrNews = (formData) => {
  return apiService.post('/manager/contests', formData);
};

export const getMyContests = () => {
  return apiService.get('/manager/contests');
};

export const updateMyContest = (contestId, dataToUpdate) => {
  return apiService.put(`/manager/contests/${contestId}`, dataToUpdate);
};

export const deleteMyContest = (contestId) => {
  return apiService.delete(`/manager/contests/${contestId}`);
};


// ========================================================
// Judge & Submission Management (ในห้อง Live)
// ========================================================
export const getContestSubmissions = (contestId) => {
    return apiService.get(`/manager/contests/${contestId}/submissions`);
};

export const updateSubmissionStatus = (submissionId, status) => {
    return apiService.put(`/manager/submissions/${submissionId}/status`, { status });
};

export const getExpertList = () => {
    return apiService.get('/manager/experts');
};

export const assignJudgeToContest = (contestId, judgeId) => {
    return apiService.post(`/manager/contests/${contestId}/judges`, { judgeId });
};

export const removeJudgeFromContest = (contestId, judgeId) => {
    return apiService.delete(`/manager/contests/${contestId}/judges/${judgeId}`);
};


// ========================================================
// Finalization & History
// ========================================================
export const finalizeContest = (contestId) => {
    return apiService.post(`/manager/contests/${contestId}/finalize`);
};

export const getContestHistory = () => {
    return apiService.get('/manager/history');
};

export const getAllResults = () => {
    return apiService.get('/manager/results/all');
};

export const getScoresForSubmission = (submissionId) => {
    return apiService.get(`/manager/submissions/${submissionId}/scores`);
};