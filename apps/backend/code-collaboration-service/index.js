import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import cors from "cors";
import dotenv from "dotenv";
import roomRoutes from "./routes/roomRoutes.js";
import codeRoutes from "./routes/codeRoutes.js";
import { handleWebSocketConnection } from "./controller/websocketController.js";
import cluster from "cluster";
import os from 'os';
import { initializeRedis } from "./config/redisClient.js"; 

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
dotenv.config();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use("/api/room", roomRoutes);
app.use("/api/code", codeRoutes);

handleWebSocketConnection(wss);

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);
  
  
   try {
    await initializeRedis();
    console.log(`Redis initialized in primary process [PID: ${process.pid}]`);
  } catch (error) {
    console.error("Failed to initialize Redis in primary process:", error);
    process.exit(1);
  }

  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork({ TYPE: 'WORKER' });
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });

  server.listen(process.env.PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${process.env.PORT} ✅`);
  });
} else {
  if (process.env.TYPE === 'WORKER') {
    import('./worker/codeWorker.js');
  }
}

// server.listen(process.env.PORT, "0.0.0.0", () => {
//   console.log(`Server running on port ${process.env.PORT} ✅`);
// });
