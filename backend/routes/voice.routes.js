import express from "express";
import { handleASR, handleTTS } from "../services/voice.service.js";

const router = express.Router();

router.post("/asr", handleASR);
router.post("/tts", handleTTS);

export default router;
