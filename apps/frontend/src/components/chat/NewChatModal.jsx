import React from 'react';
import { useGetUsersQuery } from "../../redux/slices/api/chatApiSlice";

export default function NewChatModal({ currentUser, onSelect, onClose }) {
  const { data: users = [] } = useGetUsersQuery();

return (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-[#3d3d3d] text-black p-6 rounded shadow-lg w-80 relative">
      {/* Close Icon (Top Right) */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-white text-xl hover:text-red-500"
        aria-label="Close"
      >
        &times;
      </button>

      <h1 className="text-3xl font-bold text-center text-green-500 mb-8">
        Start New Chat
      </h1>

      <select
        className="bg-white w-full p-2 border mb-4"
        onChange={(e) => {
          onSelect(e.target.value);
        }}
      >
        <option value="">Select a user</option>
        {users
          .filter((u) => u._id !== currentUser._id)
          .map((u) => (
            <option key={u._id} value={u._id}>
              {u.name} ({u.role})
            </option>
          ))}
      </select>
    </div>
  </div>
);

}