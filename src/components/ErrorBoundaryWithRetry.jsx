// ======================================================================
// File: src/components/ErrorBoundaryWithRetry.jsx
// หน้าที่: Enhanced Error Boundary with Retry functionality
// ======================================================================

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { reportClientError } from '../utils/errorReporter';

class ErrorBoundaryWithRetry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error, errorInfo) {
    // บันทึก error details
    this.setState({ errorInfo });

    // รายงาน error
    reportClientError({
      message: error?.message || 'React Error Boundary triggered',
      stack: error?.stack + '\n\nComponent Stack:' + errorInfo?.componentStack,
      level: 'error',
      meta: {
        boundary: true,
        retryCount: this.state.retryCount,
        component: this.props.fallbackComponent || 'Unknown'
      },
    });

    // Log สำหรับ development
    if (import.meta.env.DEV) {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Props:', this.props);
      console.groupEnd();
    }
  }

  handleRetry = async () => {
    this.setState({ isRetrying: true });
    
    // รอสักครู่เพื่อให้ดูเป็นธรรมชาติ
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      isRetrying: false
    }));
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  getErrorMessage() {
    const { error } = this.state;
    
    if (error?.message) {
      // แปลง error messages ที่พบบ่อย
      if (error.message.includes('ChunkLoadError')) {
        return 'การโหลดหน้าเว็บไม่สมบูรณ์ อาจเป็นเพราะการอัพเดตของระบบ';
      }
      if (error.message.includes('Loading CSS chunk')) {
        return 'การโหลดส่วนแสดงผลมีปัญหา กรุณาลองโหลดหน้าใหม่';
      }
      if (error.message.includes('NetworkError')) {
        return 'เกิดปัญหาการเชื่อมต่อเครือข่าย กรุณาตรวจสอบอินเทอร์เน็ต';
      }
      return error.message;
    }
    
    return 'เกิดข้อผิดพลาดที่ไม่คาดคิด';
  }

  render() {
    if (this.state.hasError) {
      const { retryCount, isRetrying } = this.state;
      const maxRetries = this.props.maxRetries || 3;
      const showRetry = retryCount < maxRetries;
      const errorMessage = this.getErrorMessage();

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Error Icon */}
            <div className="mb-6">
              <AlertTriangle 
                size={64} 
                className="mx-auto text-red-500" 
              />
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              เกิดข้อผิดพลาดในการแสดงผล
            </h1>

            {/* Error Message */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              {errorMessage}
            </p>

            {/* Retry Information */}
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                ได้พยายามแก้ไขแล้ว {retryCount} ครั้ง
              </p>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {showRetry && (
                <button
                  onClick={this.handleRetry}
                  disabled={isRetrying}
                  className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw size={18} className="animate-spin mr-2" />
                      กำลังลองใหม่...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={18} className="mr-2" />
                      ลองใหม่อีกครั้ง
                    </>
                  )}
                </button>
              )}

              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={18} className="mr-2" />
                โหลดหน้าใหม่
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <Home size={18} className="mr-2" />
                กลับสู่หน้าแรก
              </button>
            </div>

            {/* Development Info */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  รายละเอียดข้อผิดพลาด (สำหรับนักพัฒนา)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-32">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundaryWithRetry;
