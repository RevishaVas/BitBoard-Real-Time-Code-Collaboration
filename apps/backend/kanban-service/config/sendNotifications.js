// utils/sendNotification.js
const stream = require('../redis/streamClient'); // Your Redis client

const sendNotification = async ({ type, message, taskId, assigneeId }) => {
  try {
    const timestamp = new Date().toISOString();
    await stream.xadd('notifications_stream', '*',
      'type', type,
      'message', message,
      'taskId', taskId,
      'assigneeId', assigneeId || '',
      'timestamp', timestamp
    );
    console.log(`📤 Sent XADD notification: ${message}`);
  } catch (err) {
    console.error('❌ Redis XADD error:', err);
  }
};

module.exports = sendNotification;
