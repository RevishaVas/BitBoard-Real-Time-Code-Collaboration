import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import NewChatModal from '../components/chat/NewChatModal';
import { useGetUsersQuery } from '../redux/slices/api/chatApiSlice'; 

export default function ChatPage() {
  const { user: currentUser } = useSelector((state) => state.auth);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);

  const { data: allUsers = [] } = useGetUsersQuery();

  const selectedUser = allUsers.find((u) => u._id === selectedUserId);

  if (!currentUser) return <p className="p-4 text-white">Loading user...</p>;

  return (
    <div
      className="grid grid-cols-[300px_1fr] h-full mt-14"
      style={{ backgroundColor: '#2e2e2e' }}
    >
      {/* Left Sidebar */}
      <ChatSidebar
        currentUser={currentUser}
        selectedUserId={selectedUserId}
        onSelectUser={setSelectedUserId}
      />

      {/* Main Chat Window */}
      <div className="relative" style={{ backgroundColor: '#2e2e2e' }}>
        <div
          className="flex justify-between items-center p-4"
          style={{
            borderBottom: '1px solid #444',
            backgroundColor: '#2e2e2e'
          }}
        >
          <h2 className="text-white text-lg font-semibold">
            {selectedUser
              ? `${selectedUser.name}`
              : 'Select a chat'}
          </h2>
          <button
            onClick={() => setNewChatModalOpen(true)}
            className="bg-green-600 hover:bg-green-800 text-white px-4 py-2 rounded"
          >
            + New Chat
          </button>
        </div>

        <ChatWindow currentUser={currentUser} selectedUserId={selectedUserId} />
      </div>

      {/* Modal to Start New Chat */}
      {newChatModalOpen && (
        <NewChatModal
          currentUser={currentUser}
          onSelect={(userId) => {
            setSelectedUserId(userId);
            setNewChatModalOpen(false);
          }}
          onClose={() => setNewChatModalOpen(false)}
        />
      )}
    </div>
  );
}