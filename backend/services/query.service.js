import crypto from "crypto";
import QueryCache from "../models/QueryCache.model.js";
import { retrieveRelevantChunks } from "./retrieval.service.js";
import { findAnalogyForQuery } from "./analogy.service.js";
import { assemblePromptContext } from "./promptBuilder.service.js";
import { generateTutorResponse } from "./llm.service.js";
import { CULTURAL_ANALOGIES } from "../../src/data/textbooks.js";

// Main handler for scientific queries
export async function handleScientificQuery(req, res) {
  try {
    const { query_text, profile } = req.body;
    if (!query_text || !profile) {
      return res.status(400).json({ error: "Missing query_text or profile" });
    }

    const { board, class: classNum, language } = profile;

    // 1. Semantic cache lookup using md5 hash of variables
    const queryHash = crypto
      .createHash("md5")
      .update(`${query_text.trim().toLowerCase()}_${board}_${classNum}_${language}`)
      .digest("hex");

    try {
      const cached = await QueryCache.findOne({ query_hash: queryHash });
      if (cached) {
        console.log("[Cache Hit] Served response from local Atlas query cache.");
        return res.json({
          text: cached.response_text,
          conceptDetected: cached.analogyUsed ? cached.analogyUsed.concept : "Curriculum Standard",
          citations: cached.citations,
          analogyUsed: cached.analogyUsed,
          isOfflineCached: true,
        });
      }
    } catch (cacheErr) {
      // Database not active or caching failed; proceed cleanly
    }

    // 2. Retrieve state textbook chunks
    const chunks = await retrieveRelevantChunks(query_text, board, classNum, language);

    // 3. Match native village analogies
    const matchedAnalogy = await findAnalogyForQuery(query_text);

    // 4. Synthesize instructions & prompt body
    const systemInstruction = assemblePromptContext({
      profile,
      query_text,
      chunks,
      matchedAnalogy,
    });

    // 5. Query Gemini Flash or fallback Low Latency LLM
    const finalText = await generateTutorResponse({
      queryText: query_text,
      systemInstruction,
    });

    const outputPayload = {
      text: finalText,
      conceptDetected: matchedAnalogy ? matchedAnalogy.concept : "Science Concepts",
      citations: chunks.map((c) => ({
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
    };

    // 6. Asynchronously store in Cache if DB is operating
    try {
      await QueryCache.create({
        query_hash: queryHash,
        query_text,
        board,
        classNum,
        language,
        response_text: finalText,
        citations: outputPayload.citations,
        analogyUsed: outputPayload.analogyUsed,
      });
    } catch (dbErr) {
      // MongoDB offline; ignore and deliver payload
    }

    res.json(outputPayload);
  } catch (err) {
    console.error("[Orchestrator Error]:", err);
    res.status(500).json({ error: "Something went wrong in the orchestrator.", detail: err.message });
  }
}

// Community Analogy preserve in memory/Active state
const customStorageList = [];
export async function handleAnalogySubmission(req, res) {
  try {
    const { concept, text, contributor, language } = req.body;
    if (!concept || !text) {
      return res.status(400).json({ error: "Missing concept or text fields" });
    }

    const payload = {
      id: `custom_${Date.now()}`,
      concept,
      keywords: [concept.toLowerCase()],
      text_mr: language === "mr" ? text : "",
      text_en: language !== "mr" ? text : "",
      region: "Community Contributed",
      type: "user_contributed",
      contributor: contributor || "Anonymous Teacher",
      timestamp: new Date().toISOString()
    };

    customStorageList.push(payload);
    CULTURAL_ANALOGIES.push({
      concept: concept.toLowerCase(),
      keywords: [concept.toLowerCase()],
      text_mr: language === "mr" ? text : "",
      text_en: language !== "mr" ? text : "",
      region: "Community Contributed",
      type: "community_wisdom",
    });

    res.json({
      success: true,
      message: "Successfully received child teaching analogy.",
      data: payload
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function getCommunityAnalogies(req, res) {
  res.json({ custom: customStorageList, base_count: CULTURAL_ANALOGIES.length });
}
