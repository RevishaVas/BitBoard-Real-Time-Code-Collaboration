const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const taskRoutes = require('./routes/taskRoutes');
const columnRoutes = require('./routes/columnRoutes');
const userRoutes = require('./routes/userRoutes');
const { pub, sub } = require('./redis/client');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/users', userRoutes);

// WebSocket
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

// Redis subscriptions
sub.subscribe('taskCreated', (msg) => {
  const task = JSON.parse(msg);
  console.log('[Redis → WS] taskCreated:', task.title, '| Assigned to:', task.assignee?.name || 'N/A');
  io.emit('taskCreated', task);
});

sub.subscribe('taskUpdated', (msg) => {
  const task = JSON.parse(msg);
  console.log('[Redis → WS] taskUpdated:', task.title, '| Assigned to:', task.assignee?.name || 'N/A');
  io.emit('taskUpdated', task);
});

sub.subscribe('taskDeleted', (msg) => {
  const data = JSON.parse(msg);
  console.log('[Redis → WS] taskDeleted:', data.id);
  io.emit('taskDeleted', { id: data.id });
});

// Redis test
sub.subscribe('testChannel', (msg) => {
  console.log('Redis Received:', msg);
});

setTimeout(() => {
  pub.publish('testChannel', 'Hello from Redis!');
}, 2000);

// MongoDB connection and server startup
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  server.listen(PORT, () => console.log(`Server + Socket running on http://localhost:${PORT}`));
}).catch(err => {
  console.error('MongoDB connection error:', err);
});
