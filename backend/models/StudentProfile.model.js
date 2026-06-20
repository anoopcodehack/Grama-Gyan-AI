import mongoose from "mongoose";

const StudentProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  village: { type: String, required: true, index: true },
  board: { type: String, enum: ["SSC_MH", "CBSE"], default: "SSC_MH", index: true },
  class: { type: String, enum: ["9", "10"], default: "9", index: true },
  language: { type: String, enum: ["mr", "en"], default: "mr" },
  savedFavorites: [{
    question: String,
    answer: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model("StudentProfile", StudentProfileSchema);
