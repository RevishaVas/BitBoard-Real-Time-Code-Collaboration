import React from 'react';
import { useGetConversationUsersQuery } from '../../redux/slices/api/chatApiSlice';

export default function ChatSidebar({ currentUser, selectedUserId, onSelectUser }) {
  const { data: conversations = [] } = useGetConversationUsersQuery(currentUser._id);

return (
  <div
    className="text-white p-4 h-full w-full overflow-y-auto"
    style={{ backgroundColor: '#2e2e2e' }}
  >
    <h2 className="text-lg font-bold mb-4">Chats</h2>
    {conversations.length === 0 ? (
      <p className="text-gray-400">No conversations yet</p>
    ) : (
      conversations.map((user) => (
        <div
          key={user._id}
          onClick={() => onSelectUser(user._id)}
          className={`p-2 mb-2 rounded cursor-pointer ${
            selectedUserId === user._id ? 'bg-green-800' : 'hover:bg-gray-700'
          }`}
        >
          {user.name}
        </div>
      ))
    )}
  </div>
);

}