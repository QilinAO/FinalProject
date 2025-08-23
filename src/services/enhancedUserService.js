// ======================================================================
// File: src/services/enhancedUserService.js
// หน้าที่: Enhanced User Service with Better Error Handling
// ======================================================================

import apiService from './api';
import { parseApiErrorEnhanced, formatErrorForUI } from '../utils/apiErrorHandler';

/**
 * Enhanced API call wrapper with proper error handling
 */
const apiCallWithErrorHandling = async (apiCall) => {
  try {
    return await apiCall();
  } catch (error) {
    const enhancedError = parseApiErrorEnhanced(error);
    throw enhancedError;
  }
};

/**
 * ดึงข้อมูลโปรไฟล์ล่าสุดของผู้ใช้ที่ล็อกอินอยู่
 */
export const fetchProfile = () => {
  return apiCallWithErrorHandling(() => apiService.get('/auth/profile'));
};

/**
 * อัปเดตข้อมูลโปรไฟล์ของผู้ใช้ที่ล็อกอินอยู่
 */
export const updateProfile = (profileData) => {
  // Validate required fields before sending
  const errors = [];
  
  if (profileData.username && profileData.username.length < 3) {
    errors.push({ field: 'username', message: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร' });
  }
  
  if (profileData.firstName && profileData.firstName.trim().length === 0) {
    errors.push({ field: 'firstName', message: 'กรุณากรอกชื่อ' });
  }
  
  if (profileData.lastName && profileData.lastName.trim().length === 0) {
    errors.push({ field: 'lastName', message: 'กรุณากรอกนามสกุล' });
  }

  if (errors.length > 0) {
    const validationError = new Error('ข้อมูลไม่ถูกต้อง');
    validationError.details = errors;
    validationError.status = 400;
    throw validationError;
  }

  return apiCallWithErrorHandling(() => apiService.put('/users/profile', profileData));
};

/**
 * อัปโหลดรูปโปรไฟล์ใหม่ของผู้ใช้ที่ล็อกอินอยู่
 */
export const uploadProfilePicture = (file) => {
  // Validate file before upload
  const errors = [];
  
  if (!file) {
    errors.push({ field: 'file', message: 'กรุณาเลือกไฟล์รูปภาพ' });
  } else {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push({ field: 'file', message: 'รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WebP)' });
    }
    
    // Check file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push({ field: 'file', message: 'ขนาดไฟล์ต้องไม่เกิน 5MB' });
    }
  }

  if (errors.length > 0) {
    const validationError = new Error('ไฟล์ไม่ถูกต้อง');
    validationError.details = errors;
    validationError.status = 400;
    throw validationError;
  }

  const formData = new FormData();
  formData.append('profilePicture', file);
  
  return apiCallWithErrorHandling(() => apiService.post('/users/profile/picture', formData));
};

/**
 * ส่งข้อมูลปลากัดเพื่อเข้ารับการประเมินคุณภาพ
 */
export const submitBettaForEvaluation = (formData) => {
  // Validate FormData contents
  const errors = [];
  
  if (!formData.get('betta_name')) {
    errors.push({ field: 'betta_name', message: 'กรุณากรอกชื่อปลากัด' });
  }
  
  if (!formData.get('betta_type')) {
    errors.push({ field: 'betta_type', message: 'กรุณาระบุประเภทปลากัด' });
  }
  
  // Check if images are provided
  const images = formData.getAll('images');
  if (!images || images.length === 0) {
    errors.push({ field: 'images', message: 'กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป' });
  } else if (images.length > 3) {
    errors.push({ field: 'images', message: 'อัปโหลดรูปภาพได้สูงสุด 3 รูป' });
  }

  if (errors.length > 0) {
    const validationError = new Error('ข้อมูลไม่ถูกต้อง');
    validationError.details = errors;
    validationError.status = 400;
    throw validationError;
  }

  return apiCallWithErrorHandling(() => apiService.post('/submissions/evaluate', formData));
};

/**
 * ส่งข้อมูลปลากัดเพื่อเข้าร่วมการประกวด
 */
export const submitBettaForCompetition = (formData) => {
  // Validate FormData contents including contest_id
  const errors = [];
  
  if (!formData.get('betta_name')) {
    errors.push({ field: 'betta_name', message: 'กรุณากรอกชื่อปลากัด' });
  }
  
  if (!formData.get('betta_type')) {
    errors.push({ field: 'betta_type', message: 'กรุณาระบุประเภทปลากัด' });
  }
  
  if (!formData.get('contest_id')) {
    errors.push({ field: 'contest_id', message: 'จำเป็นต้องระบุรหัสการประกวด' });
  }
  
  // Check if images are provided
  const images = formData.getAll('images');
  if (!images || images.length === 0) {
    errors.push({ field: 'images', message: 'กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป' });
  } else if (images.length > 3) {
    errors.push({ field: 'images', message: 'อัปโหลดรูปภาพได้สูงสุด 3 รูป' });
  }

  if (errors.length > 0) {
    const validationError = new Error('ข้อมูลไม่ถูกต้อง');
    validationError.details = errors;
    validationError.status = 400;
    throw validationError;
  }

  return apiCallWithErrorHandling(() => apiService.post('/submissions/compete', formData));
};

/**
 * ดึงประวัติการส่งประเมินคุณภาพทั้งหมดของผู้ใช้ที่ล็อกอินอยู่
 */
export const getMyEvaluationHistory = () => {
  return apiCallWithErrorHandling(() => apiService.get('/users/history/evaluations'));
};

/**
 * ดึงประวัติการแข่งขันทั้งหมดของผู้ใช้ที่ล็อกอินอยู่
 */
export const getMyCompetitionHistory = () => {
  return apiCallWithErrorHandling(() => apiService.get('/users/history/competitions'));
};

/**
 * Helper function สำหรับแปลง API errors เป็น UI-friendly format
 */
export const handleUserServiceError = (error) => {
  const formattedError = formatErrorForUI(error);
  
  // Log เพื่อ debugging
  console.error('User Service Error:', {
    original: error,
    formatted: formattedError
  });
  
  return formattedError;
};

// Export ทั้ง individual functions และ default object
export default {
  fetchProfile,
  updateProfile,
  uploadProfilePicture,
  submitBettaForEvaluation,
  submitBettaForCompetition,
  getMyEvaluationHistory,
  getMyCompetitionHistory,
  handleUserServiceError
};
