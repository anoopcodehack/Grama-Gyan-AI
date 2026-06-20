import mongoose from "mongoose";

const TextbookChunkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  board: { type: String, required: true, index: true }, // SSC_MH, CBSE
  class: { type: String, required: true, index: true },
  subject: { type: String, required: true, index: true },
  chapter_number: { type: Number, required: true },
  chapter: { type: String, required: true },
  page: { type: Number, required: true },
  content: { type: String, required: true },
  language: { type: String, default: "en" },
  embedding: {
    type: [Number],
    required: false, // For MongoDB Atlas Vector Search index matching variables
    index: false,
  }
}, { timestamps: true });

// Vector Search requires an Index mapping on the "embedding" path
export default mongoose.model("TextbookChunk", TextbookChunkSchema);
