// src/pages/LoginPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import loginIllustration from '../assets/login-illustration.svg'; 
import network from '../assets/network.png';

const LoginPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    axios.get('http://localhost:5000/api/users')
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Failed to load users:", err));
  }, []);

  const handleLogin = () => {
    const user = users.find((u) => u._id === selectedUserId);
    if (user) {
      dispatch(setCredentials(user));
      navigate('/kanban');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side Illustration */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#2b2b2b]">
        <div className='flex items-center mb-6'>
          <img src={network} alt="BitBoard Logo" className="h-20 mb-6" />
          <span className="text-4xl font-semibold text-white">
            BitBoard
          </span>
        </div>
        <img src={loginIllustration} alt="Login Illustration" className="w-3/4 h-auto" />
      </div>

      {/* Right Side Login Box */}
      <div className="flex flex-1 items-center justify-center bg-[#f5f5f5] dark:bg-[#1b1b1b] text-black dark:text-white">
        <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-lg">
          

          <h2 className="text-3xl font-bold text-gray-800 mb-2">Hello!</h2>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Select User</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-md"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">-- Select a User --</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {`${user.name} (${user.role})`}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleLogin}
            disabled={!selectedUserId}
            className="w-full bg-green-500 hover:bg-green-900 text-white py-2 px-4 rounded disabled:opacity-90"
          >
            Login
          </button>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
