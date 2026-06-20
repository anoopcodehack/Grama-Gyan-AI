import mongoose from "mongoose";

const AnalogyLibrarySchema = new mongoose.Schema({
  concept: { type: String, required: true, unique: true, index: true },
  keywords: [{ type: String, index: true }],
  text_mr: { type: String, required: true },
  text_en: { type: String, required: true },
  region: { type: String, default: "Maharashtra" },
  type: { 
    type: String, 
    enum: ["agricultural_tool", "village_well", "daily_household", "community_wisdom", "kitchen_utensil"],
    default: "daily_household" 
  },
  contributor: { type: String, default: "Grama-Gyan Team" },
  verified: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("AnalogyLibrary", AnalogyLibrarySchema);
