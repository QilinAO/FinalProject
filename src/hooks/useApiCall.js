// ======================================================================
// File: src/hooks/useApiCall.js
// หน้าที่: Custom Hook สำหรับจัดการ API calls แบบมาตรฐาน
// ======================================================================

import { useState, useCallback, useRef } from 'react';
import useErrorHandler from './useErrorHandler';

/**
 * Custom Hook สำหรับจัดการ API calls ด้วย loading, error states
 * @param {object} options - ตัวเลือกการตั้งค่า
 */
const useApiCall = (options = {}) => {
  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'ดำเนินการสำเร็จ',
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  const abortControllerRef = useRef(null);
  const { handleError, showSuccess } = useErrorHandler({
    showToast: showErrorToast
  });

  /**
   * ยกเลิก API call ที่กำลังทำงานอยู่
   */
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * รีเซ็ต state กลับสู่สถานะเริ่มต้น
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
    abort();
  }, [abort]);

  /**
   * เรียก API function พร้อมจัดการ loading และ error states
   */
  const execute = useCallback(async (apiFunction, ...args) => {
    // ยกเลิก request เก่าถ้ามี
    abort();

    setLoading(true);
    setError(null);

    // สร้าง AbortController ใหม่
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // เพิ่ม signal เข้าไปใน args ถ้า apiFunction รองรับ
      const argsWithSignal = args.length > 0 && 
        typeof args[args.length - 1] === 'object' && 
        args[args.length - 1].signal === undefined
        ? [...args.slice(0, -1), { ...args[args.length - 1], signal }]
        : [...args, { signal }];

      const result = await apiFunction(...argsWithSignal);
      
      // ตรวจสอบว่า request ถูกยกเลิกหรือไม่
      if (signal.aborted) {
        return null;
      }

      setData(result);
      
      // แสดง success message ถ้าต้องการ
      if (showSuccessToast) {
        showSuccess(successMessage);
      }

      return result;
    } catch (err) {
      // ไม่แสดง error ถ้า request ถูกยกเลิก
      if (err.name === 'AbortError' || signal.aborted) {
        return null;
      }

      setError(err);
      handleError(err, { function: apiFunction.name });
      throw err;
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
      abortControllerRef.current = null;
    }
  }, [handleError, showSuccess, showSuccessToast, successMessage, abort]);

  /**
   * Wrapper สำหรับ multiple API calls พร้อมกัน
   */
  const executeParallel = useCallback(async (apiCalls) => {
    setLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        apiCalls.map(({ apiFunction, args = [] }) => 
          apiFunction(...args)
        )
      );
      
      setData(results);
      
      if (showSuccessToast) {
        showSuccess(successMessage);
      }

      return results;
    } catch (err) {
      setError(err);
      handleError(err, { function: 'executeParallel' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError, showSuccess, showSuccessToast, successMessage]);

  /**
   * Cleanup เมื่อ component unmount
   */
  const cleanup = useCallback(() => {
    abort();
    reset();
  }, [abort, reset]);

  return {
    loading,
    error,
    data,
    execute,
    executeParallel,
    reset,
    abort,
    cleanup,
    isIdle: !loading && !error && !data,
    hasError: !!error,
    hasData: !!data && !error,
  };
};

export default useApiCall;
