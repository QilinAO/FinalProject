// D:\ProJectFinal\Lasts\my-project\src\Component\ErrorBoundary.jsx
import React from 'react';
import { reportClientError } from '../utils/errorReporter';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, msg: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, msg: error?.message || 'เกิดข้อผิดพลาด' };
  }

  componentDidCatch(error, info) {
    reportClientError({
      message: error?.message || 'React render error',
      stack: (error?.stack || '') + '\n' + (info?.componentStack || ''),
      level: 'error',
      meta: { boundary: true },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
          <h1 className="text-2xl font-semibold text-red-600">เกิดข้อผิดพลาดในการแสดงผล</h1>
          <p className="mt-2 text-gray-700">{this.state.msg}</p>
          <button
            onClick={() => location.reload()}
            className="mt-4 px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
          >
            โหลดหน้าใหม่
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
