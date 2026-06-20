import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { TEXTBOOK_CHUNKS, CULTURAL_ANALOGIES } from "./src/data/textbooks.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent telemetry
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper: Local Search Engine (Deterministic RAG)
function searchTextbook(query: string, board: string, classNum: string, lang: string) {
  const normQuery = query.toLowerCase();
  
  // Filter chunks matching board, class
  const filtered = TEXTBOOK_CHUNKS.filter(
    (chunk) => chunk.board === board && chunk.class === classNum
  );
  
  if (filtered.length === 0) {
    // Fallback search regardless of board if no match exists
    return TEXTBOOK_CHUNKS.filter((chunk) => chunk.language === lang).slice(0, 2);
  }
  
  // Rank by keyword match
  const ranked = filtered.map((chunk) => {
    let score = 0;
    const words = normQuery.split(/\s+/).filter((w) => w.length > 2);
    
    const titleLower = chunk.title.toLowerCase();
    const contentLower = chunk.content.toLowerCase();
    const chapterLower = chunk.chapter.toLowerCase();
    
    for (const word of words) {
      if (titleLower.includes(word)) score += 10;
      if (chapterLower.includes(word)) score += 5;
      if (contentLower.includes(word)) score += 2;
    }
    
    if (contentLower.includes(normQuery)) score += 20;
    
    return { chunk, score };
  });
  
  const sorted = ranked.filter((item) => item.score > 0).sort((a, b) => b.score - a.score);
  
  if (sorted.length > 0) {
    return sorted.map((item) => item.chunk).slice(0, 2);
  }
  
  // If zero matches, return representative chunks of curriculum
  return filtered.slice(0, 2);
}

// Helper: Concept & Analogy Matcher
function detectConcept(query: string) {
  const normQuery = query.toLowerCase();
  for (const analogy of CULTURAL_ANALOGIES) {
    for (const keyword of analogy.keywords) {
      if (normQuery.includes(keyword.toLowerCase())) {
        return analogy;
      }
    }
  }
  return null;
}

// REST APIs
app.get("/api/v1/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Post a scientific query to the tutor
app.post("/api/v1/query", async (req, res) => {
  try {
    const { query_text, profile } = req.body;
    
    if (!query_text || !profile) {
      return res.status(400).json({ error: "Missing query_text or profile" });
    }
    
    const { name, village, board, class: classNum, language } = profile;
    
    // 1. Local RAG lookup
    const retrievedChunks = searchTextbook(query_text, board, classNum, language);
    
    // 2. Local Cultural Analogy lookup
    const matchedAnalogy = detectConcept(query_text);
    
    // 3. Assemble Gemini Context and Instructions
    const textContext = retrievedChunks
      .map(
        (c) =>
          `[Source: Board: ${c.board}, Class: ${c.class}, Chapter: ${c.chapter}, Page: ${c.page}]\nContent: "${c.content}"`
      )
      .join("\n\n");
      
    let analogyDirective = "";
    if (matchedAnalogy) {
      const analogyText = language === "mr" ? matchedAnalogy.text_mr : matchedAnalogy.text_en;
      analogyDirective = `Highly Relevant Local Maharashtra/Indian Analogy to weave in:
      Concept: "${matchedAnalogy.concept}" (${matchedAnalogy.type})
      Analogy explanation: "${analogyText}"
      Please integrate and weave this analogy naturally into your explanation. Make it highly relatable to a rural student's daily lifecycle.`;
    } else {
      analogyDirective = `No pre-seeded analogy was matched in database for this query. 
      Please invent or describe a simple, authentic, rural or daily household analogy appropriate for this scientific concept (e.g. from farming tools like sickles/plows, water wells, bullock carts, clay stoves, cattle rearing, or kitchen items) to explain the concept beautifully.`;
    }

    const systemInstruction = `You are "Grama-Gyan AI", a compassionate, warm, and highly engaging bilingual AI Science and Technology tutor specifically trained for rural students in Indian villages who are following State Board/NCERT curriculums.
    
    Student details:
    - Name: ${name}
    - Village: ${village}
    - Curriculum: ${board === "SSC_MH" ? "Maharashtra State Board (SSC)" : "CBSE / NCERT"}
    - Grade: Class ${classNum}
    - Language requested: ${language === "mr" ? "Marathi (मराठी)" : "English"}

    Goal:
    - Respond strictly in the requested language: ${language === "mr" ? "Marathi" : "English"}.
    - Keep explanations direct, clean, and simple, matching a Class ${classNum} student's level of comprehension. Avoid overwhelming academic jargon but explain scientific terms with their correct vernacular equivalents.
    - Reference textbook chapters and page numbers explicitly to guide active reading.
    - ALWAYS include illustrative regional, rural examples or analogies (like village wells, farming utensils, local flora/fauna, community cooking, clay stoves) to break down abstract calculations or laws.
    - Begin with a warm, encouraging greeting like "नमस्कार, ${name}!" (if Marathi) or "Hello ${name} from ${village} village!" and close with a supportive learning tip.
    
    Available textbook context chunks:
    ${textContext || "No direct textbook match found. Use general Indian curriculum science standards."}
    
    ${analogyDirective}`;

    // 4. Query Gemini API
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not defined. Supplying a localized preview response.");
      // Fallback response for offline/preview environments where API keys may be loaded later
      return res.json({
        text: language === "mr"
          ? `नमस्कार, ${name}! मी आपला ग्राम-ज्ञान शैक्षणिक सहाय्यक आहे. ${query_text} बद्दल मला विचारल्याबद्दल धन्यवाद! सध्या सराव प्रणाली कार्यान्वित आहे. आपण '${board}' अभ्यासक्रमाचे उत्कृष्ट विद्यार्थी आहात! कृपया वरील secrets मध्ये चावी जोडा.`
          : `Hello, ${name}! I am your Grama-Gyan learning companion. Thank you for asking about ${query_text}. This is a localized helper response while configuring secrets.`,
        conceptDetected: matchedAnalogy ? matchedAnalogy.concept : "General Science",
        citations: retrievedChunks.map((c) => ({
          chapter: c.chapter,
          chapter_number: c.chapter_number,
          page: c.page,
          snippet: c.content,
          subject: c.subject,
        })),
        analogyUsed: matchedAnalogy
          ? {
              concept: matchedAnalogy.concept,
              text: language === "mr" ? matchedAnalogy.text_mr : matchedAnalogy.text_en,
              type: matchedAnalogy.type,
            }
          : undefined,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: query_text }],
        }
      ],
      config: {
        systemInstruction,
        temperature: 0.2, // Low temperature for factual precision representing state textbook standards
      },
    });

    const aiResponseText = response.text || "No response received.";

    res.json({
      text: aiResponseText,
      conceptDetected: matchedAnalogy ? matchedAnalogy.concept : undefined,
      citations: retrievedChunks.map((c) => ({
        chapter: c.chapter,
        chapter_number: c.chapter_number,
        page: c.page,
        snippet: c.content,
        subject: c.subject,
      })),
      analogyUsed: matchedAnalogy
        ? {
            concept: matchedAnalogy.concept,
            text: language === "mr" ? matchedAnalogy.text_mr : matchedAnalogy.text_en,
            type: matchedAnalogy.type,
          }
        : undefined,
    });
  } catch (error: any) {
    console.error("Error in /api/v1/query:", error);
    res.status(500).json({
      error: "Something went wrong during generation.",
      message: error.message,
    });
  }
});

// Community Custom Analogy submission route
const customAnalogiesCache: any[] = [];
app.post("/api/v1/analogy-submit", (req, res) => {
  const { concept, text, contributor, language } = req.body;
  if (!concept || !text) {
    return res.status(400).json({ error: "Missing concept or text" });
  }

  const newAnalogy = {
    id: `custom_${Date.now()}`,
    concept,
    keywords: [concept],
    text_mr: language === "mr" ? text : "",
    text_en: language !== "mr" ? text : "",
    region: "Community Contributed",
    type: "user_contributed",
    contributor: contributor || "Anonymous Teacher",
    timestamp: new Date().toISOString(),
  };

  customAnalogiesCache.push(newAnalogy);
  CULTURAL_ANALOGIES.push({
    concept: concept.toLowerCase(),
    keywords: [concept.toLowerCase()],
    text_mr: language === "mr" ? text : "",
    text_en: language !== "mr" ? text : "",
    region: "Community Contributed",
    type: "community_wisdom",
  });

  res.json({ success: true, message: "Thank you! Your localized village analogy has been preserved in the active session database.", data: newAnalogy });
});

app.get("/api/v1/custom-analogies", (req, res) => {
  res.json({ custom: customAnalogiesCache, base_count: CULTURAL_ANALOGIES.length });
});

// Start server or handle Vite development integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Dynamically import Vite server setup
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
    console.log("Vite middleware merged successfully.");
  } else {
    // Serve static frontend files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Grama-Gyan AI server booted and listening on http://localhost:${PORT}`);
  });
}

startServer();
