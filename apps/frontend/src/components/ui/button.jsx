import React from 'react';

export function Button({ children, onClick, size = 'md', className = '', ...props }) {
  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      onClick={onClick}
      className={`bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
