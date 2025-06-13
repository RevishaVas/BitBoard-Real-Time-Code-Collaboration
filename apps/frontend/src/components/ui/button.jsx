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
      className={` text-white rounded-xl shadow bg-green-600 hover:bg-green-700 transition ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
