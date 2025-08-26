// ======================================================================
// File: src/utils/apiErrorHandler.js
// หน้าที่: Centralized API Error Handling สำหรับ Frontend
// ======================================================================

/**
 * ตรวจสอบว่า string เป็น UUID format หรือไม่
 */
export const isUuid = (v) =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

/**
 * แปลง API Error เป็นข้อความที่เข้าใจง่าย
 */
export const parseApiError = (error) => {
  console.error('API Error:', error);

  // Default error message
  let message = "เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง";
  let details = null;
  let code = null;

  // ตรวจสอบ error response structure
  if (error?.response?.data) {
    const errorData = error.response.data;
    code = error.response.status;

    // ถ้ามี validation details
    if (errorData.details && Array.isArray(errorData.details)) {
      details = errorData.details;
      message = errorData.error || "ข้อมูลไม่ถูกต้อง";
    }
    // ถ้ามี error message โดยตรง
    else if (errorData.error) {
      message = errorData.error;
    }
    // ถ้ามี message
    else if (errorData.message) {
      message = errorData.message;
    }
  }
  // Network errors
  else if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
    message = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต";
    code = 'NETWORK_ERROR';
  }
  // Timeout errors
  else if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    message = "การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง";
    code = 'TIMEOUT';
  }
  // Axios errors
  else if (error?.message) {
    message = error.message;
  }

  return {
    message,
    details,
    code,
    status: error?.response?.status || null
  };
};

/**
 * จัดการ HTTP Status Codes เฉพาะ
 */
export const getStatusErrorMessage = (status) => {
  switch (status) {
    case 400:
      return "ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่";
    case 401:
      return "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่";
    case 403:
      return "คุณไม่มีสิทธิ์ในการดำเนินการนี้";
    case 404:
      return "ไม่พบข้อมูลที่ต้องการ";
    case 409:
      return "ข้อมูลขัดแย้งกับที่มีอยู่ในระบบ";
    case 422:
      return "ข้อมูลไม่ถูกต้องตามเงื่อนไขของระบบ";
    case 429:
      return "คำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่";
    case 500:
      return "เกิดข้อผิดพลาดในเซิร์ฟเวอร์ กรุณาติดต่อผู้ดูแลระบบ";
    case 502:
      return "เซิร์ฟเวอร์ไม่พร้อมให้บริการ กรุณาลองใหม่ในภายหลัง";
    case 503:
      return "ระบบอยู่ระหว่างการบำรุงรักษา กรุณาลองใหม่ในภายหลัง";
    default:
      return null;
  }
};

/**
 * Enhanced Error Parser ที่รวม status code handling
 */
export const parseApiErrorEnhanced = (error) => {
  const basicError = parseApiError(error);
  
  // ถ้ามี status code ให้ใช้ message ที่เฉพาะเจาะจงกว่า
  if (basicError.status) {
    const statusMessage = getStatusErrorMessage(basicError.status);
    if (statusMessage && !basicError.details) {
      basicError.message = statusMessage;
    }
  }

  return basicError;
};

/**
 * สร้าง error message สำหรับแสดงใน UI
 */
export const formatErrorForUI = (error) => {
  const parsedError = parseApiErrorEnhanced(error);
  
  let displayMessage = parsedError.message;
  
  // ถ้ามี validation details ให้แสดงเป็น list
  if (parsedError.details && parsedError.details.length > 0) {
    const detailMessages = parsedError.details.map(detail => 
      `• ${detail.message || detail}`
    );
    displayMessage = `${parsedError.message}\n\n${detailMessages.join('\n')}`;
  }

  return {
    title: getErrorTitle(parsedError.status),
    message: displayMessage,
    type: getErrorType(parsedError.status)
  };
};

/**
 * กำหนด Error Title ตาม status
 */
const getErrorTitle = (status) => {
  switch (status) {
    case 400:
    case 422:
      return "ข้อมูลไม่ถูกต้อง";
    case 401:
      return "ไม่ได้รับการอนุญาต";
    case 403:
      return "ไม่มีสิทธิ์เข้าถึง";
    case 404:
      return "ไม่พบข้อมูล";
    case 429:
      return "คำขอมากเกินไป";
    case 500:
    case 502:
    case 503:
      return "ข้อผิดพลาดของระบบ";
    default:
      return "เกิดข้อผิดพลาด";
  }
};

/**
 * กำหนด Error Type สำหรับ Toast
 */
const getErrorType = (status) => {
  switch (status) {
    case 400:
    case 422:
      return "warning";
    case 401:
    case 403:
      return "error";
    case 404:
      return "info";
    case 429:
      return "warning";
    default:
      return "error";
  }
};

/**
 * Retry logic สำหรับ error บางประเภท
 */
export const shouldRetry = (error) => {
  const parsedError = parseApiError(error);
  
  // Retry สำหรับ network errors และ server errors
  return [
    'NETWORK_ERROR',
    'TIMEOUT',
    500,
    502,
    503,
    504
  ].includes(parsedError.code || parsedError.status);
};

/**
 * กำหนดเวลารอก่อน retry
 */
export const getRetryDelay = (attemptNumber, error) => {
  const parsedError = parseApiError(error);
  
  // Rate limiting - รอนานกว่า
  if (parsedError.status === 429) {
    return Math.min(attemptNumber * 2000, 10000); // 2s, 4s, 6s, 8s, 10s
  }
  
  // Server errors - exponential backoff
  if (parsedError.status >= 500) {
    return Math.min(Math.pow(2, attemptNumber) * 1000, 30000); // 2s, 4s, 8s, 16s, 30s
  }
  
  // Network errors
  return Math.min(attemptNumber * 1000, 5000); // 1s, 2s, 3s, 4s, 5s
};

export default {
  parseApiError,
  parseApiErrorEnhanced,
  formatErrorForUI,
  getStatusErrorMessage,
  shouldRetry,
  getRetryDelay
};
