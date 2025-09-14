import React from 'react';

export default function Card({ className = '', children }) {
  return (
    <div className={`bg-white rounded-xl shadow-md border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, actions, className = '' }) {
  return (
    <div className={`px-6 py-4 border-b border-gray-100 flex items-center justify-between ${className}`}>
      <div>
        {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardBody({ className = '', children }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

