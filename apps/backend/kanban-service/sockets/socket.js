const { sub } = require('../redis/client');

function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);
  });

  sub.subscribe('taskCreated', (message) => {
    const task = JSON.parse(message);
    io.emit('taskCreated', task);
  });
}

module.exports = { setupSocket };
