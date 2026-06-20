import mongoose from "mongoose";

const QueryCacheSchema = new mongoose.Schema({
  query_hash: { type: String, required: true, unique: true, index: true },
  query_text: { type: String, required: true },
  board: { type: String, required: true },
  classNum: { type: String, required: true },
  language: { type: String, required: true },
  response_text: { type: String, required: true },
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
}, { timestamps: true });

// Auto expire caches after 30 days to free MongoDB Atlas cluster resources
QueryCacheSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.model("QueryCache", QueryCacheSchema);
