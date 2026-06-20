import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "StudentProfile", required: true, index: true },
  messages: [{
    id: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    text: { type: String, required: true },
    timestamp: { type: String, required: true },
    isOfflineCached: { type: Boolean, default: false },
    citations: [{
      chapter: String,
      page: Number,
      snippet: String,
      subject: String
    }],
    analogyUsed: {
      concept: String,
      text: String,
      type: String
    }
  }]
}, { timestamps: true });

export default mongoose.model("Session", SessionSchema);
