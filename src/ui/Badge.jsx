import React from 'react';

const variants = {
  gray: 'bg-gray-100 text-gray-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  amber: 'bg-amber-100 text-amber-800',
};

export default function Badge({ children, variant = 'gray', className = '' }) {
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${variants[variant] || variants.gray} ${className}`}>
      {children}
    </span>
  );
}

