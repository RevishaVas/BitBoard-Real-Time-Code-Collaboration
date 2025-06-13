import express from "express";
import { createRoom, joinRoom, leaveRoom, getRoomName, getRoomUsers } from "../controller/roomController.js";

const router = express.Router();

router.post("/create", createRoom);
router.post("/join", joinRoom);
router.post("/leave", leaveRoom);
router.get("/name/:roomId", getRoomName);
router.get("/users/:roomId", getRoomUsers);

export default router;
