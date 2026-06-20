import { GoogleGenAI } from "@google/genai";
import { queryGroq } from "../config/groq.js";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } }) : null;

export async function generateTutorResponse({ queryText, systemInstruction }) {
  // 1. Try Gemini 3.5 Flash first (Highly recommended production standard)
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: "user", parts: [{ text: queryText }] }],
        config: {
          systemInstruction,
          temperature: 0.2, // low temp for curriculum grounding
        }
      });
      return response.text || "No response text received from Gemini.";
    } catch (err) {
      console.error("[LLM Error] Gemini invocation failed. Falling back to Groq.", err);
    }
  }

  // 2. Try Groq Llama 3 8B Fallback as requested
  if (process.env.GROQ_API_KEY) {
    try {
      const messages = [
        { role: "system", content: systemInstruction },
        { role: "user", content: queryText }
      ];
      const resText = await queryGroq(messages);
      return resText;
    } catch (groqErr) {
      console.error("[LLM Error] Groq execution failed:", groqErr);
    }
  }

  // 3. Fallback for offline/preview sandbox setups
  return `[Mock Tutors Backplane Callback]
नमस्कार! सध्या सराव प्रणाली कार्यान्वित आहे. आपण '${queryText}' बद्दल विचारले. कृपया API की सेट केल्याची खात्री करा.`;
}
