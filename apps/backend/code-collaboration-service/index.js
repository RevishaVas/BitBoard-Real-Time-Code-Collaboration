import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import cors from "cors";
import dotenv from "dotenv";
import roomRoutes from "./routes/roomRoutes.js";
import { handleWebSocketConnection } from "./controller/websocketController.js";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
dotenv.config();
app.use(cors());
app.use(express.json());

app.use("/room", roomRoutes);

handleWebSocketConnection(wss);

server.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${process.env.PORT} ✅`);
});
