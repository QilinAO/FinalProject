import React from 'react';

export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition ${className}`}
      {...props}
    />
  );
}

