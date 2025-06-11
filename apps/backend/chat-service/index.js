const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const { createClient } = require('redis');
require('dotenv').config();

const chatRoutes = require('./routes/chatRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected to chatDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Redis Pub/Sub setup
const redisPub = createClient();
const redisSub = createClient();

(async () => {
  await redisPub.connect();
  await redisSub.connect();

  await redisSub.subscribe('chat-messages', (message) => {
    const msg = JSON.parse(message);
    io.emit('newMessage', msg); // Relay to all connected clients
  });

  console.log("Redis Pub/Sub ready");
})();

app.use((req, res, next) => {
  req.redisPub = redisPub;
  next();
});

app.use('/api/chat', chatRoutes);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.set('io', io);

const PORT = process.env.PORT || 5006;
server.listen(PORT, () => console.log(`Chat Server running on port ${PORT}`));
