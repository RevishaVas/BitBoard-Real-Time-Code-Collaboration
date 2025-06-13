// src/sockets/notificationSocket.js
import { io } from "socket.io-client";

let socket;

export const connectNotificationSocket = (userId) => {
  socket = io("http://localhost:4000"); // match your backend socket server

  socket.on("connect", () => {
    console.log("🔌 Connected to notification socket:", socket.id);
    console.log("Registering user:", userId);
    socket.emit("register", userId); // user joins their room
  });

  socket.on("disconnect", () => {
    console.log("🔌 Disconnected from notification socket");
  });
};

export const subscribeToNotifications = (callback) => {
  if (!socket) return;

  socket.on("new-notification", (data) => {
    console.log("🔔 Notification received:", data);
    callback(data); // pass to component or toast
  });
};

export const disconnectNotificationSocket = () => {
  if (socket) socket.disconnect();
};
