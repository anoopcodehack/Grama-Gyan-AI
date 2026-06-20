import express from "express";
import { handleScientificQuery, handleAnalogySubmission, getCommunityAnalogies } from "../services/query.service.js";

const router = express.Router();

router.post("/query", handleScientificQuery);
router.post("/analogy-submit", handleAnalogySubmission);
router.get("/custom-analogies", getCommunityAnalogies);

export default router;
