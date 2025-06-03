import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

const DummyUserLogin = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then(setUsers)
      .catch((err) => console.error("Failed to fetch users", err));
  }, []);

  const handleLogin = () => {
    if (selectedUser) {
      dispatch(setCredentials(selectedUser));
      navigate("/kanban");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-white">Choose a User</h2>
      
      <select
        onChange={(e) =>
          setSelectedUser(users.find((u) => u._id === e.target.value || u.id === e.target.value))
        }
        className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
        defaultValue=""
      >
        <option value="" disabled>
          -- Select a User --
        </option>
        {users.map((user) => (
          <option key={user._id || user.id} value={user._id || user.id}>
            {user.name || user.username}
          </option>
        ))}
      </select>

      <button
        onClick={handleLogin}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        disabled={!selectedUser}
      >
        Login
      </button>
    </div>
  );
};

export default DummyUserLogin;
