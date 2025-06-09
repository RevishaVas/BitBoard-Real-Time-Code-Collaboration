import {redis, pub, sub } from "../config/redisClient.js";
import { cleanEmptyRoom } from "../utils/roomUtils.js";
import { wsRooms, subscriptions } from "../utils/wsState.js";
import jwt from 'jsonwebtoken';

const activeConnections = new Map();


const roomStates = {};

export function handleWebSocketConnection(wss) {
  wss.on("connection", async (ws, req) => {
    const query = new URLSearchParams(req.url?.split("?")[1]);
    // const roomId = query.get("roomId");
    // const userId = query.get("userId");
    // const name = query.get("name");
    const token = query.get("token");
  
  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId, roomId } = decoded;
    
    console.log("Incoming token:", token);
    console.log("Decoded token:", decoded);
    
    const roomData = await redis.get(`room:${roomId}`);
    const users = JSON.parse(roomData);
    const user = users.find(u => u.userId === userId);
    
    if (!user) {
      ws.close(4003, "Invalid room membership");
      return;
    }

    const name = user.name;

    if (!roomId || !userId || !name) {
      ws.close(4000, "Missing required parameters");
      return;
    }

    if (activeConnections.has(userId)) {
      ws.close(4001, "User already connected from another device");
      return;
    }

    console.log(`[WS] ${name} (${userId}) connecting to room ${roomId}`);

    // if (!roomStates[roomId]) {
    //   roomStates[roomId] = {
    //     users: [],
    //     code: "",
    //     language: "javascript",
    //     input: "",
    //     history: [],
    //     lastActivity: Date.now()
    //   };
    // }
    if (!roomStates[roomId]) {
    const savedState = await redis.get(`roomstate:${roomId}`);
    if (savedState) {
      const parsed = JSON.parse(savedState);
      roomStates[roomId] = {
        users: [],
        code: parsed.code || "",
        language: parsed.language || "python",
        input: parsed.input || "",
        history: [],
        lastActivity: Date.now()
      };
    } else {
      roomStates[roomId] = {
        users: [],
        code: "",
        language: "python",
        input: "",
        history: [],
        lastActivity: Date.now()
      };
    }
  }


    const room = roomStates[roomId];

    room.users = room.users.filter(u => u.userId !== userId);
    
    const userObj = { userId, name, ws };
    room.users.push(userObj);
    activeConnections.set(userId, { ws, roomId });
    room.lastActivity = Date.now();

    ws.send(JSON.stringify({
      type: "roomInfo",
      roomId,
      isNewRoom: room.users.length === 1,
      message: room.users.length === 1 ? "Room created" : "Room joined"
    }));

    ws.send(JSON.stringify({
      type: "roomState",
      code: room.code,
      language: room.language,
      input: room.input,
      history: room.history, 
      users: room.users.map(u => ({ userId: u.userId, name: u.name }))
    }));

    broadcastUsersList(roomId);

    if (!subscriptions.has(roomId)) {
      await sub.subscribe(roomId, (message) => {
        if (!roomStates[roomId]) return;
        try {
          const data = JSON.parse(message);
          if (data.type === "execution_result") {
            broadcastToRoom(roomId, data);
          }
        } catch (e) {
          broadcastToRoom(roomId, { type: "broadcast", message });
        }
      });
      subscriptions.add(roomId);
    }

   
    ws.on("message", async (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        room.lastActivity = Date.now();
        
        switch (data.type) {
          case "code":
            if (room.code !== data.code) {
              room.code = data.code;
              await redis.set(`roomstate:${roomId}`, JSON.stringify({
                code: room.code,
                language: room.language,
                input: room.input
              }));
             
              broadcastToRoom(roomId, {
                type: "code",
                code: data.code,
                senderId: userId,
                timestamp: Date.now()
              });
            }
            break;
            
          case "language":
            room.language = data.language;
            broadcastToRoom(roomId, {
              type: "language",
              language: data.language,
              senderId: userId,
              timestamp: Date.now()
            });
            break;
            
          case "input":
            room.input = data.input;
            broadcastToRoom(roomId, {
              type: "input",
              input: data.input,
              senderId: userId,
              timestamp: Date.now()
            });
            break;
          case "userJoined":
            const newUser = room.users.find(u => u.userId === data.userId);
            if (newUser) {
              newUser.ws.send(JSON.stringify({
                type: "allData",
                code: room.code,
                language: room.language,
                input: room.input,
                users: room.users.map(u => ({ userId: u.userId, name: u.name })),
                output: room.history
                  .filter(item => item.type === "output")
                  .map(item => item.message),
                timestamp: Date.now()
              }));
            }
            break;
          case "output":
            room.history.push({
              type: "output",
              message: data.message,
              timestamp: Date.now()
            });
            broadcastToRoom(roomId, {
              type: "output",
              message: data.message,
              timestamp: Date.now()
            });
            break;
          case "requestForAllData":
            const requester = room.users.find(u => u.userId === data.userId);
            if (requester) {
              requester.ws.send(JSON.stringify({
                type: "allData",
                code: room.code,
                language: room.language,
                input: room.input,
                users: room.users.map(u => ({ 
                  userId: u.userId, 
                  name: u.name 
                })),
                output: room.history
                  .filter(item => item.type === "output")
                  .map(item => item.message),
                timestamp: Date.now()
              }));
            }
            break;
            
          default:
            pub.publish(roomId, msg.toString());
        }
      } catch (e) {
        console.error("Message error:", e);
      }
    });
    const pingInterval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.ping();
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);

    ws.on("pong", () => {
      room.lastActivity = Date.now();
    });

    ws.on("close", () => {
      clearInterval(pingInterval);
      console.log(`[WS] ${name} (${userId}) disconnected`);

      activeConnections.delete(userId);
      
      if (roomStates[roomId]) {
        roomStates[roomId].users = roomStates[roomId].users.filter(u => u.userId !== userId);
        broadcastUsersList(roomId);
        
        if (roomStates[roomId].users.length === 0) {
          setTimeout(async () => {
            if (roomStates[roomId]?.users.length === 0) {
              await cleanEmptyRoom(roomId);
              delete roomStates[roomId];
            }
          }, 10000);
        }
      }
    });

    ws.on("error", (err) => {
      console.error(`[WS] Error for ${userId}:`, err);
      ws.close();
    });
    } catch (err) {
        console.error("JWT verification failed:", err.message);
    ws.close(4002, "Invalid authentication");
    return;
  }
  });

  setInterval(() => {
    const now = Date.now();
    Object.entries(roomStates).forEach(([roomId, room]) => {
      if (now - room.lastActivity > 60000 && room.users.length === 0) {
        cleanEmptyRoom(roomId);
        delete roomStates[roomId];
      }
    });
  }, 30000);
}

function broadcastUsersList(roomId) {
  if (!roomStates[roomId]) return;
  const users = roomStates[roomId].users.map(({ userId, name }) => ({ userId, name }));
  broadcastToRoom(roomId, { 
    type: "users", 
    users,
    timestamp: Date.now()
  });
}

function broadcastToRoom(roomId, message) {
  if (!roomStates[roomId]) return;
  roomStates[roomId].users.forEach(user => {
    if (user.ws.readyState === user.ws.OPEN) {
      user.ws.send(JSON.stringify({
        ...message,
        timestamp: Date.now()
      }));
    }
  });
}

// function broadcastToOthers(roomId, senderId, message) {
//   const room = roomStates[roomId];
//   if (!room) return;

//   room.users.forEach(({ userId, ws }) => {
//     if (userId !== senderId && ws.readyState === ws.OPEN) {
//       ws.send(JSON.stringify(message));
//     }
//   });
// }


function broadcastToOthers(roomId, senderId, message) {
  if (!roomStates[roomId]) return;
  roomStates[roomId].users.forEach(user => {
    if (user.userId !== senderId && user.ws.readyState === user.ws.OPEN) {
      user.ws.send(JSON.stringify({
        ...message,
        timestamp: Date.now()
      }));
    }
  });
}
