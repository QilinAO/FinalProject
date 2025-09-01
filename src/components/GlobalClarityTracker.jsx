// ======================================================================
// File: src/components/GlobalClarityTracker.jsx
// หน้าที่: ติดตามการใช้งาน Microsoft Clarity ทั่วทั้งระบบ
// ======================================================================

import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useClarityContext } from '../context/ClarityContext';

const GlobalClarityTracker = () => {
  const location = useLocation();
  const clarityContext = useClarityContext();
  const lastPathRef = useRef(location.pathname);
  const scrollTimeoutRef = useRef(null);
  const idleTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // ติดตามการเปลี่ยนแปลง route
  useEffect(() => {
    if (lastPathRef.current !== location.pathname) {
      const fromPath = lastPathRef.current;
      const toPath = location.pathname;
      
      // บันทึกการนำทาง
      clarityContext.trackGlobalEvent('route_changed', {
        from_path: fromPath,
        to_path: toPath,
        navigation_type: 'route_change',
        timestamp: new Date().toISOString()
      });
      
      // อัปเดต path
      lastPathRef.current = location.pathname;
    }
  }, [location.pathname, clarityContext]);

  // ติดตามการเลื่อนหน้าจอทั่วทั้งระบบ
  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const scrollPercentage = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );

        // บันทึกการเลื่อนทุก 25%
        if (scrollPercentage % 25 === 0) {
          clarityContext.trackGlobalEvent('global_scroll_milestone', {
            scroll_percentage: scrollPercentage,
            current_path: location.pathname
          });
        }
      }, 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [location.pathname, clarityContext]);

  // ติดตามการใช้งานเมาส์ทั่วทั้งระบบ
  useEffect(() => {
    const handleMouseMove = () => {
      lastActivityRef.current = Date.now();
      
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };

    const handleClick = () => {
      lastActivityRef.current = Date.now();
    };

    const handleKeyPress = () => {
      lastActivityRef.current = Date.now();
    };

    const handleScroll = () => {
      lastActivityRef.current = Date.now();
    };

    // ติดตามการ idle (ไม่มีการใช้งาน)
    const checkIdle = () => {
      const now = Date.now();
      const idleTime = now - lastActivityRef.current;
      
      // บันทึกการ idle ทุก 5 นาที
      if (idleTime > 5 * 60 * 1000) {
        clarityContext.trackGlobalEvent('user_idle', {
          idle_time_minutes: Math.round(idleTime / (60 * 1000)),
          current_path: location.pathname
        });
      }
    };

    // ตรวจสอบการ idle ทุก 1 นาที
    const idleInterval = setInterval(checkIdle, 60 * 1000);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('keypress', handleKeyPress);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keypress', handleKeyPress);
      window.removeEventListener('scroll', handleScroll);
      clearInterval(idleInterval);
    };
  }, [location.pathname, clarityContext]);

  // ติดตามการเปลี่ยนแปลงขนาดหน้าจอ
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // บันทึกการเปลี่ยนแปลงขนาดหน้าจอ
      clarityContext.trackGlobalEvent('viewport_resized', {
        width: width,
        height: height,
        current_path: location.pathname
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [location.pathname, clarityContext]);

  // ติดตามการ focus และ blur ของหน้าจอ
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // หน้าจอถูกซ่อน (เปลี่ยน tab หรือ minimize)
        clarityContext.trackGlobalEvent('page_hidden', {
          current_path: location.pathname,
          timestamp: new Date().toISOString()
        });
      } else {
        // หน้าจอกลับมาแสดง
        clarityContext.trackGlobalEvent('page_visible', {
          current_path: location.pathname,
          timestamp: new Date().toISOString()
        });
      }
    };

    const handleFocus = () => {
      clarityContext.trackGlobalEvent('window_focused', {
        current_path: location.pathname,
        timestamp: new Date().toISOString()
      });
    };

    const handleBlur = () => {
      clarityContext.trackGlobalEvent('window_blurred', {
        current_path: location.pathname,
        timestamp: new Date().toISOString()
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [location.pathname, clarityContext]);

  // ติดตามการโหลดข้อมูลทั่วทั้งระบบ
  useEffect(() => {
    const originalFetch = window.fetch;
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    // ติดตาม Fetch API
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const url = args[0];
      const options = args[1] || {};
      const method = options.method || 'GET';

      try {
        const response = await originalFetch(...args);
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // บันทึกการเรียก API สำเร็จ
        clarityContext.trackAPIOperation(url, method, true, responseTime, {
          response_status: response.status,
          response_ok: response.ok
        });

        return response;
      } catch (error) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // บันทึกการเรียก API ไม่สำเร็จ
        clarityContext.trackAPIOperation(url, method, false, responseTime, {
          error_message: error.message
        });

        throw error;
      }
    };

    // ติดตาม XMLHttpRequest
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      this._clarityMethod = method;
      this._clarityUrl = url;
      this._clarityStartTime = Date.now();
      
      return originalXHROpen.apply(this, [method, url, ...args]);
    };

    XMLHttpRequest.prototype.send = function(...args) {
      const xhr = this;
      
      xhr.addEventListener('load', function() {
        const endTime = Date.now();
        const responseTime = endTime - xhr._clarityStartTime;

        // บันทึกการเรียก API สำเร็จ
        clarityContext.trackAPIOperation(xhr._clarityUrl, xhr._clarityMethod, true, responseTime, {
          response_status: xhr.status,
          response_ok: xhr.status >= 200 && xhr.status < 300
        });
      });

      xhr.addEventListener('error', function() {
        const endTime = Date.now();
        const responseTime = endTime - xhr._clarityStartTime;

        // บันทึกการเรียก API ไม่สำเร็จ
        clarityContext.trackAPIOperation(xhr._clarityUrl, xhr._clarityMethod, false, responseTime, {
          error_type: 'network_error'
        });
      });

      return originalXHRSend.apply(this, args);
    };

    return () => {
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalXHROpen;
      XMLHttpRequest.prototype.send = originalXHRSend;
    };
  }, [clarityContext]);

  // ติดตามการ error ทั่วทั้งระบบ
  useEffect(() => {
    const handleError = (event) => {
      const error = event.error || event.reason;
      
      if (error) {
        clarityContext.trackGlobalError('javascript_error', error.message || 'Unknown error', 'runtime_error', {
          error_stack: error.stack,
          current_path: location.pathname,
          user_agent: navigator.userAgent
        });
      }
    };

    const handleUnhandledRejection = (event) => {
      clarityContext.trackGlobalError('unhandled_promise_rejection', event.reason?.message || 'Unknown rejection', 'promise_error', {
        current_path: location.pathname,
        user_agent: navigator.userAgent
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [location.pathname, clarityContext]);

  // Component นี้ไม่แสดงผลใดๆ
  return null;
};

export default GlobalClarityTracker; 