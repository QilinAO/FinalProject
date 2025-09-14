import React from 'react';

export default function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

