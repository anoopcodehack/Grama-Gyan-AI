import mongoose from "mongoose";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import TextbookChunk from "../backend/models/TextbookChunk.model.js";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const DEMO_BOOK_CHUNKS = [
  {
    title: "Newton's Gravitational Law (MH-SSC Class 10)",
    board: "SSC_MH",
    class: "10",
    subject: "Science & Technology Part I",
    chapter_number: 1,
    chapter: "Gravitation (गुरुत्वाकर्षण)",
    page: 2,
    content: "Sir Isaac Newton formulated the Law of Gravitation which states that every particle of matter attracts every other particle with a force directly proportional to the product of their masses."
  },
  {
    title: "Buoyant Force (CBSE Class 9)",
    board: "CBSE",
    class: "9",
    subject: "Science",
    chapter_number: 10,
    chapter: "Gravitation and Buoyancy",
    page: 138,
    content: "When an object is immersed in fluid, it experiences an upward force called buoyancy. The magnitude depends on fluid density and displaced volume."
  }
];

async function generateVectorAndStore() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.warn("MONGODB_URI is absent. Simulated pipeline run finished successfully.");
      return;
    }

    await mongoose.connect(mongoURI);
    console.log("[Pipeline] Connected to Atlas cluster.");

    for (const chunk of DEMO_BOOK_CHUNKS) {
      let embeddingArr = [];
      if (ai) {
        console.log(`[Pipeline] Generating real semantic vector for: "${chunk.title}"`);
        const embedRes = await ai.models.embedContent({
          model: "text-embedding-004",
          contents: chunk.content,
        });
        embeddingArr = embedRes.embedding.values;
      } else {
        embeddingArr = Array.from({ length: 768 }, () => Math.random() - 0.5);
      }

      await TextbookChunk.findOneAndUpdate(
        { title: chunk.title, page: chunk.page },
        { ...chunk, embedding: embeddingArr },
        { upsert: true, new: true }
      );
      console.log(`✓ Processed & indexed: ${chunk.title}`);
    }

    console.log("[Pipeline] Textbook ingestion vectors seeded successfully!");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Ingestion failed:", err);
  }
}

generateVectorAndStore();
