import { redis } from "../config/redisClient.js";
import { wsRooms, subscriptions } from "./wsState.js";

export async function generateUserId(name) {
  if (!name) throw new Error("Name is required");

  const parts = name.trim().split(/\s+/);

  let prefix = "";
  if (parts.length === 1) {
    prefix = parts[0][0].toLowerCase();
  } else if (parts.length === 2) {
    prefix = parts.map(p => p[0]).join("").toLowerCase(); // bilal hussain -> bh
  } else {
    prefix = parts.map(p => p[0]).join("").toLowerCase(); // mbh
  }

  const counterKey = `userCounter:${prefix}`;
  let count = await redis.get(counterKey);
  if (!count) count = 0;

  count = parseInt(count) + 1;
  await redis.set(counterKey, count.toString());

  const userId = `${prefix}-${count.toString().padStart(5, "0")}`;
  return userId;
}

export async function generateRoomName() {
  const countKey = "roomCount";
  let count = await redis.get(countKey);
  if (!count) count = 0;
  count = parseInt(count) + 1;
  await redis.set(countKey, count.toString());
  return `BitBoard-${count.toString().padStart(5, "0")}`;
}

export async function removeUserFromAllRooms(userId) {
  const keys = await redis.keys("room:*");
  for (const key of keys) {
    const usersData = await redis.get(key);
    if (usersData) {
      const users = JSON.parse(usersData);
      const updated = users.filter((u) => u.userId !== userId);
      if (updated.length !== users.length) {
        await redis.set(key, JSON.stringify(updated));
        // if (updated.length === 0) {
        //   await cleanEmptyRoom(roomId);
        // }
      }
    }
  }
}

export async function cleanEmptyRoom(roomId) {
  const roomKey = `room:${roomId}`;
  const roomNameKey = `roomName:${roomId}`;
  const roomData = await redis.get(roomKey);

  if (!roomData) return;

  const users = JSON.parse(roomData);
  if (users.length === 0) {
    await redis.del(roomKey);
    await redis.del(roomNameKey);

    if (wsRooms[roomId]) {
      wsRooms[roomId].forEach(({ ws }) => {
        ws.send(JSON.stringify({
          type: "room_closed",
          message: "Room has been deleted because no users are left."
        }));
        ws.close();
      });
      delete wsRooms[roomId];
    }

    if (subscriptions.has(roomId)) {
      await sub.unsubscribe(roomId);
      subscriptions.delete(roomId);
    }

    console.log(`✅ Room ${roomId} cleaned (no users left)`);
  }
}