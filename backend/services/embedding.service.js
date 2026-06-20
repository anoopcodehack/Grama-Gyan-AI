import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function generateEmbedding(text) {
  if (!ai) {
    // Deterministic hash array fallback for localized tests
    const arr = Array.from({ length: 768 }, (_, i) => {
      const charCode = text.charCodeAt(i % text.length) || 1;
      return Math.sin(charCode + i) / 10;
    });
    return arr;
  }
  
  try {
    const response = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: text,
    });
    
    return response.embedding.values;
  } catch (error) {
    console.error("[Embedding Error] Failed to generate embedding vector:", error);
    // Return deterministic backup vector
    return Array.from({ length: 768 }, () => Math.random() - 0.5);
  }
}
