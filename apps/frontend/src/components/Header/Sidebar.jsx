import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdDashboard } from 'react-icons/md';
import { PiKanbanFill } from 'react-icons/pi';
import { FaUsers, FaCodeBranch  } from 'react-icons/fa';
import clsx from 'clsx';

const linkData = [
  { label: 'Code Collaboration', link: '/code-collaboration', icon: <FaCodeBranch  size={18} /> },
  { label: 'Kanban Board', link: '/kanban', icon: <PiKanbanFill size={18} /> },
  { label: 'Chat', link: '/chat', icon: <FaUsers size={18} /> },
  { label: 'Visualization', link: '/visualization', icon: <MdDashboard size={18} /> },
  { label: 'Visualization Dashboard', link: '/visualization-dashboard', icon: <MdDashboard size={18} /> }

];

export default function SideBar({ isSidebarOpen, setIsSidebarOpen, setIsUserMenuOpen }) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div
      className={clsx(
        "fixed top-0 left-0 z-40 h-full w-64 bg-[#282828] dark:bg-[#282828] shadow-md transition-transform duration-300",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        "sm:translate-x-0" 
      )}
    >
      <div className="space-y-4 p-4 pt-20"> 
        {linkData.map((item, index) => (
          <Link
            key={index}
            to={item.link}
            onClick={() => {
              setIsSidebarOpen(false);
              setIsUserMenuOpen(false);
            }}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-[#2c8f52] dark:hover:bg-[#2c8f52]',
              currentPath === item.link ? 'bg-[#31a35d] text-white dark:bg-[#31a35d]' : ''
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
