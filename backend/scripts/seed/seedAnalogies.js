import mongoose from "mongoose";
import dotenv from "dotenv";
import AnalogyLibrary from "../../models/AnalogyLibrary.model.js";
import { CULTURAL_ANALOGIES } from "../../../src/data/textbooks.js";

dotenv.config();

async function runSeeder() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.warn("MONGODB_URI is absent. Analogies skipped - active session data is powered natively via memory fallback.");
      return;
    }

    await mongoose.connect(mongoURI);
    console.log("[Seeder] Connected to MongoDB Atlas.");

    // Clean old documents
    await AnalogyLibrary.deleteMany({});
    console.log("[Seeder] Pruned previous analogy database tables.");

    for (const item of CULTURAL_ANALOGIES) {
      const payload = {
        concept: item.concept,
        keywords: item.keywords,
        text_mr: item.text_mr,
        text_en: item.text_en,
        type: item.type === "agricultural_tool" ? "agricultural_tool" : item.type === "village_well" ? "village_well" : "daily_household",
        region: "Maharashtra Rural Districts",
        contributor: "SCERT / Grama-Gyan Team",
        verified: true
      };

      await AnalogyLibrary.create(payload);
    }

    console.log(`✓ Seeder complete: populated ${CULTURAL_ANALOGIES.length} rural math & physics analogies.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error("[Seeder failure]:", err);
  }
}

runSeeder();
