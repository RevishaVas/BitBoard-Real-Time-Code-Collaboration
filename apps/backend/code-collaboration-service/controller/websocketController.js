import { pub, sub } from "../config/redisClient.js";
const { cleanEmptyRoom } = await import("../utils/roomUtils.js");
import { wsRooms, subscriptions } from "../utils/wsState.js";
// const wsRooms = {};
// const subscriptions = new Set();

export function handleWebSocketConnection(wss) {
  wss.on("connection", async (ws, req) => {
    const query = new URLSearchParams(req.url?.split("?")[1]);
    const roomId = query.get("roomId");
    const userId = query.get("userId");

    if (!roomId || !userId) {
      ws.send(JSON.stringify({ error: "Missing params" }));
      ws.close();
      return;
    }

    if (!wsRooms[roomId]) wsRooms[roomId] = [];
    wsRooms[roomId].push({ userId, ws });

    const users = wsRooms[roomId].map((u) => u.userId);
    wsRooms[roomId].forEach((u) => u.ws.send(JSON.stringify({ type: "users", users })));

    if (!subscriptions.has(roomId)) {
      await sub.subscribe(roomId, (message) => {
        if (!wsRooms[roomId]) return;
        wsRooms[roomId].forEach((u) => u.ws.send(JSON.stringify({ type: "broadcast", message })));
      });
      subscriptions.add(roomId);
    }

    ws.on("message", (msg) => {
      pub.publish(roomId, msg.toString());
    });

    ws.on("close", async () => {
      if (!wsRooms[roomId]) return;
      wsRooms[roomId] = wsRooms[roomId].filter((u) => u.userId !== userId);

      const updatedUsers = wsRooms[roomId].map((u) => u.userId);
      wsRooms[roomId].forEach((u) => u.ws.send(JSON.stringify({ type: "users", users: updatedUsers })));

      if (wsRooms[roomId].length === 0) {

        await cleanEmptyRoom(roomId);
        // delete wsRooms[roomId];
        // if (subscriptions.has(roomId)) {
        //   await sub.unsubscribe(roomId);
        //   subscriptions.delete(roomId);
        // }
      }
    });
  });
}
