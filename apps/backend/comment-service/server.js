require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const commentRoutes = require('./routes/commentRoutes');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/api', commentRoutes);

const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
