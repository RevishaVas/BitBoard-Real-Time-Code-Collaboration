import React, { useState, useEffect } from 'react';
import SideBar from './SideBar';
import { FaSignOutAlt, FaUserCircle, FaBell } from "react-icons/fa";
import { MdSettings } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import logo from '../../assets/logo.png'; 
import network from '../../assets/network.png';
import { 
  connectNotificationSocket, 
  subscribeToNotifications, 
  disconnectNotificationSocket 
} from '../../sockets/notificationSocket';

export default function NavBar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (currentUser) {
      console.log(` Logged in as: ${currentUser.name || currentUser.username}`);
    }
  }, [currentUser]);


  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  // ✅ Notification states
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // ✅ Setup notifications after login
  useEffect(() => {
    if (!currentUser || !currentUser._id) return;

    console.log("🟡 Connecting with userId:", currentUser._id);
    connectNotificationSocket(currentUser._id);

    subscribeToNotifications((notif) => {
      console.log("🔔 Received notification:", notif);
      setNotifications((prev) => [notif, ...prev]);
      setNotificationCount((count) => count + 1);
    });

    return () => {
      disconnectNotificationSocket();
    };
  }, [currentUser?._id]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsSidebarOpen(false);
  };

  const handleMenuItemClick = (action) => {
    if (action) action();
    setIsUserMenuOpen(false);
  };

  const userMenuData = [
    {
      label: 'Settings',
      icon: <MdSettings style={{ fontSize: '18px' }} />,
      onClick: () => navigate(`/profilePage`),
    },
    {
      label: 'Sign out',
      icon: <FaSignOutAlt style={{ fontSize: '18px' }} />,
      onClick: () => {
        dispatch(logout());
        console.log(" User logged out.");
        navigate("/");
      },
    },
  ];

  return (
    <>
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsUserMenuOpen(false)}
        ></div>
      )}

      <SideBar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
      />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#282828] border-b border-[#303030] dark:bg-darkNavbar dark:border-darkNavbar text-gray-700 dark:text-gray-300">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600"
              >
                <span className="sr-only">Open sidebar</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                  />
                </svg>
              </button>
              <a href="/" className="flex items-center ms-2">
                <img src={network} className="h-8 me-3" alt="Logo" />
                <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
                  BitBoard
                </span>
              </a>
            </div>

            <div className="flex items-center ms-3">

              {/* 🔔 Notification Bell */}
              {currentUser && (
                <div className="relative mr-4">
                  <button onClick={() => setIsNotifOpen(!isNotifOpen)}>
                    <FaBell className="text-white w-6 h-6 cursor-pointer" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1">
                        {notificationCount}
                      </span>
                    )}
                  </button>

                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-[#1f1f1f] text-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                      <div className="px-4 py-2 font-semibold border-b border-gray-700">
                        Notifications
                        <button
                          onClick={() => setNotificationCount(0)}
                          className="ml-2 text-xs text-blue-400 hover:underline"
                        >
                          Mark all as read
                        </button>
                      </div>
                      <ul className="divide-y divide-gray-700">
                        {notifications.length === 0 ? (
                          <li className="px-4 py-2 text-sm text-gray-400">No new notifications</li>
                        ) : (
                          notifications.map((n, i) => (
                            <li key={i} className="px-4 py-2 text-sm hover:bg-gray-800">
                              {n.message}
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* 👤 User Avatar */}

              {/* Welcome Text */}
              {currentUser && (
                <span className="text-white mr-4 hidden sm:inline">
                  Welcome, {currentUser.name || currentUser.username}
                </span>
              )}

              {/* User Avatar */}

              <button
                onClick={toggleUserMenu}
                type="button"
                className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
              >
                <span className="sr-only">Open user menu</span>
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="user"
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <FaUserCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                )}
              </button>

              {isUserMenuOpen && (
                <div className="absolute top-14 right-4 z-50 w-48 bg-[#282828] rounded-lg shadow-md dark:bg-[#282828]">
                  <ul className="py-2">
                    {userMenuData.map((item, index) => (
                      <li
                        key={index}
                        onClick={() => handleMenuItemClick(item.onClick)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        {item.icon}
                        <span className="ml-2">{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
