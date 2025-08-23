// ======================================================================
// File: src/components/LoadingSpinner.jsx
// หน้าที่: Component สำหรับแสดง Loading State แบบต่างๆ
// ======================================================================

import React from 'react';
import { LoaderCircle, Loader2 } from 'lucide-react';

/**
 * Loading Spinner Component ที่ใช้งานได้หลากหลาย
 */
const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'default', 
  text = '', 
  className = '',
  centered = false,
  overlay = false 
}) => {
  // กำหนดขนาด
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6', 
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // กำหนดสไตล์
  const variantClasses = {
    default: 'text-purple-600',
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    white: 'text-white'
  };

  // ขนาด icon
  const iconSize = {
    xs: 16,
    sm: 24,
    md: 32,
    lg: 48,
    xl: 64
  };

  const baseClasses = `animate-spin ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  // เลือก icon ตาม variant
  const SpinnerIcon = variant === 'default' ? LoaderCircle : Loader2;

  const spinnerElement = (
    <div className={centered ? 'flex flex-col items-center justify-center' : 'flex items-center'}>
      <SpinnerIcon 
        size={iconSize[size]} 
        className={baseClasses}
      />
      {text && (
        <p className={`mt-2 text-sm text-gray-600 ${centered ? 'text-center' : ''}`}>
          {text}
        </p>
      )}
    </div>
  );

  // ถ้าต้องการ overlay แบบเต็มหน้าจอ
  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-xl">
          {spinnerElement}
        </div>
      </div>
    );
  }

  // ถ้าต้องการ center แบบเต็มพื้นที่
  if (centered) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};

/**
 * Loading Spinner สำหรับใช้ใน Button
 */
export const ButtonSpinner = ({ size = 'sm', className = '' }) => (
  <LoaderCircle 
    size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} 
    className={`animate-spin ${className}`} 
  />
);

/**
 * Loading Skeleton สำหรับ Card Content
 */
export const LoadingSkeleton = ({ lines = 3, className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <div 
        key={index}
        className={`bg-gray-300 rounded h-4 mb-3 ${
          index === lines - 1 ? 'w-3/4' : 'w-full'
        }`}
      />
    ))}
  </div>
);

/**
 * Loading Card Component
 */
export const LoadingCard = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    <div className="animate-pulse">
      <div className="bg-gray-300 rounded h-6 w-3/4 mb-4"></div>
      <div className="bg-gray-300 rounded h-4 w-full mb-2"></div>
      <div className="bg-gray-300 rounded h-4 w-5/6 mb-2"></div>
      <div className="bg-gray-300 rounded h-4 w-2/3"></div>
    </div>
  </div>
);

/**
 * Page Loading Component
 */
export const PageLoading = ({ text = 'กำลังโหลด...' }) => (
  <LoadingSpinner 
    size="lg" 
    text={text} 
    centered 
    className="text-purple-600"
  />
);

export default LoadingSpinner;
