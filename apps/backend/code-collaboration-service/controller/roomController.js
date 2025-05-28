import { redis } from "../config/redisClient.js";
import { generateRoomName, generateUserId , removeUserFromAllRooms, cleanEmptyRoom } from "../utils/roomUtils.js";

export const createRoom = async (req, res) => {
  let { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  const userId = await generateUserId(name);
  await removeUserFromAllRooms(userId);

  const roomId = Math.floor(100000 + Math.random() * 900000).toString();
  const roomName = await generateRoomName();

  await redis.set(`room:${roomId}`, JSON.stringify([{ userId, name }]));
  await redis.set(`roomName:${roomId}`, roomName);

  res.status(200).json({userId, name, roomId, roomName: roomName, message: "Room created" });
};

export const joinRoom = async (req, res) => {
    const { roomId, name } = req.body;
    if (!roomId || !name) return res.status(400).json({ error: "Missing roomId or name" });

    const roomKey = `room:${roomId}`;
    const roomNameKey = `roomName:${roomId}`;

    const exists = await redis.exists(roomKey);
    if (!exists) return res.status(404).json({ error: "Room not found" });

        const userId = await generateUserId(name);
        await removeUserFromAllRooms(userId);

        const roomData = await redis.get(roomKey);
        const room = roomData ? JSON.parse(roomData) : [];

        if (!room.some((u) => u.userId === userId)) {
            room.push({ userId, name });
            await redis.set(roomKey, JSON.stringify(room));
        }

        const roomName = await redis.get(roomNameKey);

        res.status(200).json({ message: "User joined room",userId, users: room, roomId, roomName: roomName });
};

export const leaveRoom = async (req, res) => {
  const { roomId, userId } = req.body;
  if (!roomId || !userId) return res.status(400).json({ error: "Missing roomId or userId" });

  const roomKey = `room:${roomId}`;
  const roomNameKey = `roomName:${roomId}`;

  const roomData = await redis.get(roomKey);
  if (!roomData) return res.status(404).json({ error: "Room not found" });

  const room = JSON.parse(roomData);
  const updatedRoom = room.filter((u) => u.userId !== userId);
  await redis.set(roomKey, JSON.stringify(updatedRoom));

  // If no users left, delete the room
  if (updatedRoom.length === 0) {
    await cleanEmptyRoom(roomId);
  }

  const roomName = await redis.get(roomNameKey);

  res.status(200).json({ message: "User removed", users: updatedRoom, roomId, roomName: roomName });
};

export const getRoomName = async (req, res) => {
  const name = await redis.get(`roomName:${req.params.roomId}`);
  if (!name) return res.status(404).json({ error: "Room not found" });
  res.status(200).json({ roomId: req.params.roomId, name });
};

export const getRoomUsers = async (req, res) => {
    const { roomId } = req.params;
    const roomData = await redis.get(`room:${req.params.roomId}`);
    const roomName = await redis.get(`roomName:${req.params.roomId}`);
    if (!roomData || !roomName) return res.status(404).json({ error: "Room not found" });

    const users = JSON.parse(roomData);

    if (users.length === 0) {
        await cleanEmptyRoom(roomId);
        return res.status(404).json({ error: "Room is empty and has been deleted" });
    }

    res.status(200).json({ roomId: req.params.roomId, name: roomName, users });
};
