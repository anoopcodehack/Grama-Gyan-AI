import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { rateLimiter } from "./middleware/rateLimit.middleware.js";
import healthRouter from "./routes/health.routes.js";
import queryRouter from "./routes/query.routes.js";
import voiceRouter from "./routes/voice.routes.js";
import logger from "./utils/logger.js";

// Load environment configurations
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" })); // Support rich base64 voice recordings
app.use(rateLimiter);

// Connect MongoDB Atlas RAG storage
connectDB();

// Handlers mounting
app.use("/api/v1", healthRouter);
app.use("/api/v1", queryRouter);
app.use("/api/v1", voiceRouter);

// Root greeting
app.get("/", (req, res) => {
  res.json({
    app: "Grama-Gyan Tutor Backend Services",
    version: "1.0.0",
    status: "online"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Grama-Gyan backend server is booted and listening on port ${PORT}`);
});

export default app;
