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
    
    console.log("JWT_SECRET in WS verify:", JSON.stringify(process.env.JWT_SECRET));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId, roomId } = decoded;
    

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

    if (!roomStates[roomId]) {
      roomStates[roomId] = {
        users: [],
        code: "",
        language: "javascript",
        input: "",
        history: [],
        lastActivity: Date.now()
      };
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

    ws.on("message", (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        room.lastActivity = Date.now();
        
        switch (data.type) {
          case "code":
            room.code = data.code;
            room.history.push({ 
              type: "code",
              code: data.code,
              sender: userId,
              timestamp: Date.now()
            });
            broadcastToOthers(roomId, userId, data);
            break;
            
          case "language":
            room.language = data.language;
            broadcastToOthers(roomId, userId, data);
            break;
            
          case "input":
            room.input = data.input;
            broadcastToOthers(roomId, userId, data);
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

























// import { pub, sub } from "../config/redisClient.js";
// import { cleanEmptyRoom } from "../utils/roomUtils.js";
// import { wsRooms, subscriptions } from "../utils/wsState.js";

// export function handleWebSocketConnection(wss) {
//   wss.on("connection", async (ws, req) => {
//     const query = new URLSearchParams(req.url?.split("?")[1]);
//     const roomId = query.get("roomId");
//     const userId = query.get("userId");
//     const name = query.get("name");

//     if (!roomId || !userId || !name) {
//       ws.send(JSON.stringify({ error: "Missing required parameters" }));
//       ws.close();
//       return;
//     }

//     // Initialize room if not exists
//     if (!wsRooms[roomId]) {
//       wsRooms[roomId] = [];
//       ws.send(JSON.stringify({
//         isNewRoom: true,
//         type: "roomId",
//         roomId,
//         message: `Created new room with ID: ${roomId}`
//       }));
//     } else {
//       ws.send(JSON.stringify({
//         isNewRoom: false,
//         type: "roomId",
//         roomId,
//         message: `Joined room with ID: ${roomId}`
//       }));
//     }

//     // Add user to room
//     wsRooms[roomId].push({ userId, name, ws });
//     broadcastUsersList(roomId);
//  // NEW: Request current data if other users are present
//     if (wsRooms[roomId].length > 1) {
//       console.log(`[WS] Requesting initial data for new user ${userId}`);
//       handleDataRequest(roomId, userId);
//     }
//     // Setup Redis subscription if not exists
//     if (!subscriptions.has(roomId)) {
//       await sub.subscribe(roomId, (message) => {
//         if (!wsRooms[roomId]) return;
//         try {
//           const data = JSON.parse(message);
//           // Handle execution results from workers
//           if (data.type === "execution_result") {
//             wsRooms[roomId].forEach(user => {
//               user.ws.send(JSON.stringify(data));
//             });
//           }
//         } catch (e) {
//           // Fallback to simple broadcast
//           wsRooms[roomId].forEach(user => {
//             user.ws.send(JSON.stringify({ type: "broadcast", message }));
//           });
//         }
//       });
//       subscriptions.add(roomId);
//     }

//      // Add ping/pong for connection health
//     const interval = setInterval(() => {
//       if (ws.readyState === ws.OPEN) {
//         ws.ping();
//       } else {
//         clearInterval(interval);
//       }
//     }, 30000);

//     ws.on('pong', () => {
//       // Connection is healthy
//     });

//     ws.on("message", (msg) => {
//       try {
//         const data = JSON.parse(msg.toString());
        
//         // Handle specific message types
//         switch (data.type) {
//           case "code":
//           case "input":
//           case "language":
//           case "cursorPosition":
//           case "submitBtnStatus":
//             // Broadcast to all other users in room
//             wsRooms[roomId].forEach(user => {
//               if (user.userId !== userId) {
//                 user.ws.send(msg.toString());
//               }
//             });
//             break;
            
//           case "requestForAllData":
//             handleDataRequest(roomId, userId);
//             break;
            
//           case "allData":
//             handleAllData(roomId, data);
//             break;
            
//           default:
//             // Default Redis pub/sub broadcast
//             pub.publish(roomId, msg.toString());
//         }
//       } catch (e) {
//         console.error("Message parsing error:", e);
//       }
//     });

//     ws.on("close", async () => {
//       if (!wsRooms[roomId]) return;
      
//       // Remove user from room
//     //   wsRooms[roomId] = wsRooms[roomId].filter(user => user.userId !== userId);
//      wsRooms[roomId] = wsRooms[roomId].filter(user => {
//         if (user.userId === userId) {
//           // Ensure WebSocket is properly closed
//           if (user.ws.readyState === user.ws.OPEN) {
//             user.ws.close();
//           }
//           return false;
//         }
//         return true;
//       });
//       broadcastUsersList(roomId);

//       // Clean up if room is empty
//       if (wsRooms[roomId].length === 0) {
//         await cleanEmptyRoom(roomId);
//       }
//     });
//     ws.on("error", (error) => {
//       console.error(`[WS] Error for user ${userId}:`, error);
//     });
//   });
// }

// // Helper functions
// function broadcastUsersList(roomId) {
//   if (!wsRooms[roomId]) return;
//   const users = wsRooms[roomId].map(({ userId, name }) => ({ userId, name }));
//   wsRooms[roomId].forEach(user => {
//     user.ws.send(JSON.stringify({ type: "users", users }));
//   });
// }

// // IMPROVED: Better handling of data requests
// function handleDataRequest(roomId, requestingUserId) {
//   const requestingUser = wsRooms[roomId].find(u => u.userId === requestingUserId);
//   if (!requestingUser) return;
  
//   const otherUser = wsRooms[roomId].find(user => user.userId !== requestingUserId);
//   if (otherUser) {
//     otherUser.ws.send(JSON.stringify({
//       type: "requestForAllData",
//       userId: requestingUserId
//     }));
//   } else {
//     // No other users - send empty state
//     requestingUser.ws.send(JSON.stringify({
//       type: "allData",
//       code: "",
//       input: "",
//       language: "javascript", // default
//       currentButtonState: false,
//       isLoading: false
//     }));
//   }
// }
// // function handleDataRequest(roomId, requestingUserId) {
// //   const otherUser = wsRooms[roomId].find(user => user.userId !== requestingUserId);
// //   if (otherUser) {
// //     otherUser.ws.send(JSON.stringify({
// //       type: "requestForAllData",
// //       userId: requestingUserId
// //     }));
// //   }
// // }

// function handleAllData(roomId, data) {
//   const targetUser = wsRooms[roomId].find(user => user.userId === data.userId);
//   if (targetUser) {
//     targetUser.ws.send(JSON.stringify({
//       type: "allData",
//       code: data.code,
//       input: data.input,
//       language: data.language,
//       currentButtonState: data.currentButtonState,
//       isLoading: data.isLoading
//     }));
//   }
// }




















// // import { pub, sub } from "../config/redisClient.js";
// // const { cleanEmptyRoom } = await import("../utils/roomUtils.js");
// // import { wsRooms, subscriptions } from "../utils/wsState.js";
// // // const wsRooms = {};
// // // const subscriptions = new Set();

// // export function handleWebSocketConnection(wss) {
// //   wss.on("connection", async (ws, req) => {
// //     const query = new URLSearchParams(req.url?.split("?")[1]);
// //     const roomId = query.get("roomId");
// //     const userId = query.get("userId");
// //     const name = query.get("name");

// //     if (!roomId || !userId || !name) {
// //       ws.send(JSON.stringify({ error: "Missing required parameters" }));
// //       ws.close();
// //       return;
// //     }

// //     if (!wsRooms[roomId]) wsRooms[roomId] = [];
// //     wsRooms[roomId].push({ userId, ws });

// //     const users = wsRooms[roomId].map((u) => u.userId);
// //     wsRooms[roomId].forEach((u) => u.ws.send(JSON.stringify({ type: "users", users })));

// //     if (!subscriptions.has(roomId)) {
// //       await sub.subscribe(roomId, (message) => {
// //         if (!wsRooms[roomId]) return;
// //         wsRooms[roomId].forEach((u) => u.ws.send(JSON.stringify({ type: "broadcast", message })));
// //       });
// //       subscriptions.add(roomId);
// //     }

// //     ws.on("message", (msg) => {
// //       pub.publish(roomId, msg.toString());
// //     });

// //     ws.on("close", async () => {
// //       if (!wsRooms[roomId]) return;
// //       wsRooms[roomId] = wsRooms[roomId].filter((u) => u.userId !== userId);

// //       const updatedUsers = wsRooms[roomId].map((u) => u.userId);
// //       wsRooms[roomId].forEach((u) => u.ws.send(JSON.stringify({ type: "users", users: updatedUsers })));

// //       if (wsRooms[roomId].length === 0) {

// //         await cleanEmptyRoom(roomId);
// //         // delete wsRooms[roomId];
// //         // if (subscriptions.has(roomId)) {
// //         //   await sub.unsubscribe(roomId);
// //         //   subscriptions.delete(roomId);
// //         // }
// //       }
// //     });
// //   });
// // }
