require('dotenv').config();
const http = require("http");
const redis = require('./config/redisClient');
const { initSocket, emitNotification } = require("./config/socketServer");


const STREAM_KEY = "notifications_stream";
const CONSUMER_GROUP = "notif_group";
const CONSUMER_NAME = "notif_consumer";

// Create group (ignore error if it exists)
async function createGroup() {
  try {
    await redis.xgroup("CREATE", STREAM_KEY, CONSUMER_GROUP, "0", "MKSTREAM");
    console.log("Consumer group created");
  } catch (err) {
    if (!err.message.includes("BUSYGROUP")) {
      console.error("Failed to create group:", err);
    }
  }
}

async function listenToStream() {
  while (true) {
    try {
      const response = await redis.xreadgroup(
        "GROUP", CONSUMER_GROUP, CONSUMER_NAME,
        "BLOCK", 5000,
        "COUNT", 1,
        "STREAMS", STREAM_KEY, ">"
      );

      if (response) {
        const [_, messages] = response[0];
        for (const [id, fields] of messages) {
          const payload = {};
          for (let i = 0; i < fields.length; i += 2) {
            payload[fields[i]] = fields[i + 1];
          }

          console.log("Notification received:", payload);
          emitNotification(payload);

          await redis.xack(STREAM_KEY, CONSUMER_GROUP, id);
        }
      }
    } catch (err) {
      console.error("Stream read error:", err);
    }
  }
}

// Create HTTP server and WebSocket
const server = http.createServer();
initSocket(server);

// Start
server.listen(4000, async () => {
  console.log("Notification service running on port 4000");
  await createGroup();
  listenToStream();
});


