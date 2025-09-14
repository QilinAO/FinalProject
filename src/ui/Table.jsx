import React from 'react';

export function Table({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full text-left bg-white">
        {children}
      </table>
    </div>
  );
}

export function THead({ children }) {
  return <thead className="bg-gray-50 text-gray-600 text-sm font-semibold">{children}</thead>;
}

export function TRow({ children, className = '' }) {
  return <tr className={`border-b hover:bg-gray-50 ${className}`}>{children}</tr>;
}

export function TH({ children, className = '' }) {
  return <th className={`px-4 py-3 ${className}`}>{children}</th>;
}

export function TD({ children, className = '' }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

