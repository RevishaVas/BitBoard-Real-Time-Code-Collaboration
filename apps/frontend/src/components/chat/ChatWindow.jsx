import React, { useState, useEffect } from 'react';
import {
  useGetChatHistoryQuery,
  useSendMessageMutation
} from '../../redux/slices/api/chatApiSlice';
import chatSocket from '../../sockets/chatSocket';
import { skipToken } from '@reduxjs/toolkit/query';

export default function ChatWindow({ currentUser, selectedUserId }) {
  const [message, setMessage] = useState('');
  const [liveMessages, setLiveMessages] = useState([]);

  const {
    data: chatHistory = [],
    refetch
  } = useGetChatHistoryQuery(
    selectedUserId
      ? { user1: currentUser._id, user2: selectedUserId }
      : skipToken
  );

  const [sendMessage] = useSendMessageMutation();

  const handleSend = async () => {
    if (!message.trim()) return;
    await sendMessage({
      sender: currentUser._id,
      receiver: selectedUserId,
      message
    });
    setMessage('');
  };

  useEffect(() => {
    const handler = (msg) => {
      const isRelevant =
        (msg.sender === selectedUserId && msg.receiver === currentUser._id) ||
        (msg.sender === currentUser._id && msg.receiver === selectedUserId);
      if (isRelevant) {
        setLiveMessages((prev) => [...prev, msg]);
      }
    };

    chatSocket.on('newMessage', handler);
    return () => chatSocket.off('newMessage', handler);
  }, [selectedUserId, currentUser._id]);

  if (!selectedUserId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Select a user to start chatting
      </div>
    );
  }

return (
  <div
    className="flex flex-col h-full text-white p-4"
    style={{ backgroundColor: '#2e2e2e' }}
  >
    {/* ✅ Message List */}
    <div
      className="flex-1 overflow-y-auto mb-4 p-3 rounded"
      style={{ backgroundColor: '#3a3a3a' }} // slightly lighter than #2e2e2e
    >
      {[...chatHistory, ...liveMessages].map((msg, idx) => {
        const isMe = msg.sender?._id === currentUser._id || msg.sender === currentUser._id;
        return (
          <div
            key={idx}
            className={`flex mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-sm px-3 py-2 rounded-lg`}
              style={{
                backgroundColor: isMe ? '#22c55e' : '#e5f9f0', // Tailwind blue-600 and gray-300 equivalent
                color: isMe ? 'white' : 'black'
              }}
            >
              <div className="text-sm font-semibold mb-1">
                {isMe ? 'You' : msg.sender?.name || 'User'}
              </div>
              <div className="text-sm">{msg.message}</div>
            </div>
          </div>
        );
      })}
    </div>

    {/* ✅ Input Box */}
    <div className="flex">
      <input
        className="flex-1 p-2 rounded text-black mr-2"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button
        onClick={handleSend}
        className="bg-blue-600 px-4 py-2 rounded text-white"
      >
        Send
      </button>
    </div>
  </div>
);

}