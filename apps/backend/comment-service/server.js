require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const http = require('http');
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 5002;

server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
