// ======================================================================
// File: src/context/ClarityContext.jsx
// หน้าที่: Context สำหรับจัดการ Microsoft Clarity ทั้งระบบ
// ======================================================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import clarityService from '../services/clarityService';

const ClarityContext = createContext();

export const useClarityContext = () => {
  const context = useContext(ClarityContext);
  if (!context) {
    throw new Error('useClarityContext must be used within a ClarityProvider');
  }
  return context;
};

export const ClarityProvider = ({ children }) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [clarityStatus, setClarityStatus] = useState({
    isInitialized: false,
    projectId: null,
    lastActivity: null
  });

  // เริ่มต้น Clarity เมื่อ component mount
  useEffect(() => {
    const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID;
    if (projectId && projectId !== 'your_clarity_project_id_here') {
      clarityService.init(projectId);
      setClarityStatus(prev => ({
        ...prev,
        isInitialized: true,
        projectId
      }));
    }
  }, []);

  // ติดตามการเปลี่ยนแปลง location และบันทึกการนำทาง
  useEffect(() => {
    if (clarityStatus.isInitialized) {
      // บันทึกการนำทาง
      clarityService.trackEvent('route_changed', {
        path: location.pathname,
        user_role: isAuthenticated ? (user?.role || 'user') : 'guest',
        timestamp: new Date().toISOString()
      });

      // อัปเดตสถานะ
      setClarityStatus(prev => ({
        ...prev,
        lastActivity: new Date().toISOString()
      }));
    }
  }, [location.pathname, clarityStatus.isInitialized, isAuthenticated, user]);

  // ติดตามการเปลี่ยนแปลงสถานะการ authentication
  useEffect(() => {
    if (clarityStatus.isInitialized && isAuthenticated && user) {
      // ระบุตัวตนผู้ใช้เมื่อ login
      clarityService.identifyUser(
        user.id || user.email || 'unknown_user',
        `session_${Date.now()}`,
        `auth_${user.role || 'user'}`,
        user.name || user.email || 'User'
      );

      // บันทึกการ login
      clarityService.trackEvent('user_authenticated', {
        user_id: user.id || 'unknown',
        user_email: user.email || 'unknown',
        user_role: user.role || 'user',
        timestamp: new Date().toISOString()
      });
    }
  }, [isAuthenticated, user, clarityStatus.isInitialized]);

  // ฟังก์ชันสำหรับติดตามการใช้งานทั่วทั้งระบบ
  const trackGlobalEvent = (eventName, data = {}) => {
    if (clarityStatus.isInitialized) {
      clarityService.trackEvent(eventName, {
        ...data,
        timestamp: new Date().toISOString(),
        user_role: isAuthenticated ? (user?.role || 'user') : 'guest'
      });
    }
  };

  // ฟังก์ชันสำหรับติดตามการใช้งานฟีเจอร์
  const trackFeatureUsage = (featureName, action = 'used', data = {}) => {
    trackGlobalEvent('feature_usage', {
      feature_name: featureName,
      action: action,
      ...data
    });
  };

  // ฟังก์ชันสำหรับติดตามการ error
  const trackGlobalError = (errorType, errorMessage, errorCode = null, data = {}) => {
    trackGlobalEvent('global_error', {
      error_type: errorType,
      error_message: errorMessage,
      error_code: errorCode,
      ...data
    });
  };

  // ฟังก์ชันสำหรับติดตามการโหลดข้อมูล
  const trackDataOperation = (operation, dataType, success = true, dataCount = 0, data = {}) => {
    trackGlobalEvent('data_operation', {
      operation: operation,
      data_type: dataType,
      success: success,
      data_count: dataCount,
      ...data
    });
  };

  // ฟังก์ชันสำหรับติดตามการตั้งค่า
  const trackSettingsOperation = (operation, settingName, oldValue = null, newValue = null, data = {}) => {
    trackGlobalEvent('settings_operation', {
      operation: operation,
      setting_name: settingName,
      old_value: oldValue,
      new_value: newValue,
      ...data
    });
  };

  // ฟังก์ชันสำหรับติดตามการใช้งาน API
  const trackAPIOperation = (endpoint, method, success = true, responseTime = null, data = {}) => {
    trackGlobalEvent('api_operation', {
      endpoint: endpoint,
      method: method,
      success: success,
      response_time: responseTime,
      ...data
    });
  };

  // ฟังก์ชันสำหรับติดตามการใช้งาน UI
  const trackUIOperation = (elementName, action, elementType = 'element', data = {}) => {
    trackGlobalEvent('ui_operation', {
      element_name: elementName,
      action: action,
      element_type: elementType,
      ...data
    });
  };

  // ฟังก์ชันสำหรับติดตามการใช้งานฟอร์ม
  const trackFormOperation = (formName, action, fieldName = null, data = {}) => {
    trackGlobalEvent('form_operation', {
      form_name: formName,
      action: action,
      field_name: fieldName,
      ...data
    });
  };

  // ฟังก์ชันสำหรับติดตามการใช้งานไฟล์
  const trackFileOperation = (operation, fileName, fileType, fileSize, success = true, data = {}) => {
    trackGlobalEvent('file_operation', {
      operation: operation,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      success: success,
      ...data
    });
  };

  // ฟังก์ชันสำหรับติดตามการใช้งานการแข่งขัน
  const trackContestOperation = (operation, contestId, contestName, data = {}) => {
    trackGlobalEvent('contest_operation', {
      operation: operation,
      contest_id: contestId,
      contest_name: contestName,
      ...data
    });
  };

  // ฟังก์ชันสำหรับติดตามการใช้งานการประเมิน
  const trackEvaluationOperation = (operation, bettaType, confidence = null, success = true, data = {}) => {
    trackGlobalEvent('evaluation_operation', {
      operation: operation,
      betta_type: bettaType,
      confidence: confidence,
      success: success,
      ...data
    });
  };

  // ฟังก์ชันสำหรับติดตามการใช้งานการแจ้งเตือน
  const trackNotificationOperation = (operation, notificationType, success = true, data = {}) => {
    trackGlobalEvent('notification_operation', {
      operation: operation,
      notification_type: notificationType,
      success: success,
      ...data
    });
  };

  // ฟังก์ชันสำหรับติดตามการใช้งานการค้นหา
  const trackSearchOperation = (operation, searchTerm, searchType = 'general', resultsCount = 0, data = {}) => {
    trackGlobalEvent('search_operation', {
      operation: operation,
      search_term: searchTerm,
      search_type: searchType,
      results_count: resultsCount,
      ...data
    });
  };

  // ฟังก์ชันสำหรับติดตามการใช้งานการพิมพ์
  const trackPrintOperation = (operation, documentType, pageCount = 1, data = {}) => {
    trackGlobalEvent('print_operation', {
      operation: operation,
      document_type: documentType,
      page_count: pageCount,
      ...data
    });
  };

  // ฟังก์ชันสำหรับติดตามการใช้งานการดาวน์โหลด
  const trackDownloadOperation = (operation, fileName, fileType, fileSize, data = {}) => {
    trackGlobalEvent('download_operation', {
      operation: operation,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      ...data
    });
  };

  // ฟังก์ชันสำหรับติดตามการใช้งานการอัปโหลด
  const trackUploadOperation = (operation, fileName, fileType, fileSize, success = true, data = {}) => {
    trackGlobalEvent('upload_operation', {
      operation: operation,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      success: success,
      ...data
    });
  };

  const value = {
    // สถานะ
    clarityStatus,
    
    // ฟังก์ชันการติดตามพื้นฐาน
    trackGlobalEvent,
    trackFeatureUsage,
    trackGlobalError,
    trackDataOperation,
    trackSettingsOperation,
    trackAPIOperation,
    trackUIOperation,
    trackFormOperation,
    trackFileOperation,
    trackContestOperation,
    trackEvaluationOperation,
    trackNotificationOperation,
    trackSearchOperation,
    trackPrintOperation,
    trackDownloadOperation,
    trackUploadOperation,
    
    // ฟังก์ชันเพิ่มเติม
    setCustomTag: clarityService.setCustomTag,
    trackEvent: clarityService.trackEvent,
    upgradeSession: clarityService.upgradeSession,
    identifyUser: clarityService.identifyUser
  };

  return (
    <ClarityContext.Provider value={value}>
      {children}
    </ClarityContext.Provider>
  );
}; 