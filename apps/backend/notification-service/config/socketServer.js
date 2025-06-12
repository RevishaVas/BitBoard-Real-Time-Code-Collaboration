const { Server } = require('socket.io');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
  });
}

function emitNotification(data) {
  if (io) {
    console.log(" Emitting notification to clients:", data); 
    io.emit("new-notification", data);
  }else {
    console.warn("  Socket.IO not initialized yet");
}
}

module.exports = { initSocket, emitNotification };
