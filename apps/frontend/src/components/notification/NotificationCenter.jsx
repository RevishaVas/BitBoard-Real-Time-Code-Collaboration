// src/components/NotificationCenter.jsx
import { useEffect, useState } from "react";
import {
  connectNotificationSocket,
  subscribeToNotifications,
  disconnectNotificationSocket
} from "../../sockets/notificationSocket";

const NotificationCenter = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);

useEffect(() => {
  if (!userId) return;

  connectNotificationSocket(userId);

  subscribeToNotifications((notif) => {
    setNotifications((prev) => {
      const isDuplicate = prev.some(
        (n) =>
          n.message === notif.message &&
          n.taskId === notif.taskId &&
          n.type === notif.type
      );
      return isDuplicate ? prev : [notif, ...prev];
    });
  });

  return () => {
    disconnectNotificationSocket();
  };
}, [userId]);

  return (
    <div className="p-4 border border-gray-300 rounded">
      <h3 className="text-lg font-semibold mb-2">🔔 Notifications</h3>
      <ul className="space-y-2">
        {notifications.map((n, i) => (
          <li key={i} className="text-sm text-gray-700">
            {n.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationCenter;
