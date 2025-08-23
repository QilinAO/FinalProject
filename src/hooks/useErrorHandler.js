// ======================================================================
// File: src/hooks/useErrorHandler.js
// หน้าที่: Custom Hook สำหรับจัดการ Error แบบมาตรฐานทั่วทั้งแอป
// ======================================================================

import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { reportClientError } from '../utils/errorReporter';

/**
 * Custom Hook สำหรับจัดการ Error อย่างสม่ำเสมอ
 * @param {object} options - ตัวเลือกการตั้งค่า
 * @param {boolean} options.showToast - แสดง toast notification หรือไม่ (default: true)
 * @param {boolean} options.reportError - รายงาน error ไปยัง backend หรือไม่ (default: true)
 * @param {string} options.defaultMessage - ข้อความ error default
 */
const useErrorHandler = (options = {}) => {
  const {
    showToast = true,
    reportError = true,
    defaultMessage = 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง'
  } = options;

  /**
   * จัดการ Error หลัก
   */
  const handleError = useCallback((error, context = {}) => {
    let message = defaultMessage;
    let level = 'error';

    // ประเมิน Error และกำหนดข้อความที่เหมาะสม
    if (error) {
      if (typeof error === 'string') {
        message = error;
      } else if (error.message) {
        message = error.message;
      } else if (error.error) {
        message = error.error;
      }

      // จำแนกระดับความรุนแรง
      if (error.status) {
        if (error.status >= 400 && error.status < 500) {
          level = 'warning'; // Client errors
        } else if (error.status >= 500) {
          level = 'error'; // Server errors
        }
      }
    }

    // แสดง Toast Notification
    if (showToast) {
      switch (level) {
        case 'warning':
          toast.warning(message);
          break;
        case 'error':
        default:
          toast.error(message);
          break;
      }
    }

    // รายงาน Error ไปยัง Backend
    if (reportError) {
      reportClientError({
        message,
        stack: error?.stack || null,
        level,
        meta: {
          context,
          status: error?.status || null,
          payload: error?.payload || null,
        }
      });
    }

    // Log ใน Console สำหรับ Development
    if (import.meta.env.DEV) {
      console.group(`🚨 Error Handler (${level})`);
      console.error('Message:', message);
      console.error('Original Error:', error);
      console.error('Context:', context);
      console.groupEnd();
    }

    return { message, level };
  }, [showToast, reportError, defaultMessage]);

  /**
   * Wrapper สำหรับ Async Functions
   */
  const handleAsyncError = useCallback((asyncFn, context = {}) => {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        handleError(error, { ...context, function: asyncFn.name });
        throw error; // Re-throw เพื่อให้ caller จัดการต่อได้
      }
    };
  }, [handleError]);

  /**
   * แสดง Success Message
   */
  const showSuccess = useCallback((message) => {
    if (showToast) {
      toast.success(message);
    }
  }, [showToast]);

  /**
   * แสดง Info Message
   */
  const showInfo = useCallback((message) => {
    if (showToast) {
      toast.info(message);
    }
  }, [showToast]);

  /**
   * แสดง Warning Message
   */
  const showWarning = useCallback((message) => {
    if (showToast) {
      toast.warning(message);
    }
  }, [showToast]);

  return {
    handleError,
    handleAsyncError,
    showSuccess,
    showInfo,
    showWarning,
  };
};

export default useErrorHandler;
