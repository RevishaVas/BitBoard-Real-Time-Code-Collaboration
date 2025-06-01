import express from "express";
import { submitCode } from "../controller/codeController.js";

const router = express.Router();
router.post("/submit", submitCode);

export default router;