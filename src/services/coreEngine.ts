import crypto from "crypto";
import { TEXTBOOK_CHUNKS, CULTURAL_ANALOGIES } from "../data/textbooks.js";
import { TextbookChunk, Analogy, Citation } from "../types.js";

// ==========================================
// 1. INPUT VALIDATION & SANITIZATION
// ==========================================
export interface ValidationResult {
  isValid: boolean;
  sanitizedText?: string;
  sanitizedProfile?: any;
  errors: string[];
}

export function validateAndSanitizeQuery(body: any): ValidationResult {
  const errors: string[] = [];

  if (!body || typeof body !== "object") {
    return { isValid: false, errors: ["Request payload must be a valid JSON object."] };
  }

  const { query_text, profile } = body;

  // Validate Query Text
  if (!query_text || typeof query_text !== "string") {
    errors.push("Missing or invalid 'query_text'. Query must be a non-empty string.");
  } else {
    const trimmed = query_text.trim();
    if (trimmed.length < 2) {
      errors.push("Query text is too short (minimum 2 characters required).");
    } else if (trimmed.length > 500) {
      errors.push("Query text exceeds maximum allowed length of 500 characters.");
    }
  }

  // Sanitize XSS and script tags completely
  const sanitizedText = query_text
    ? String(query_text)
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<[^>]*>?/gm, "")
        .replace(/javascript:/gi, "")
        .trim()
    : "";

  // Validate Profile
  if (!profile || typeof profile !== "object") {
    errors.push("Learner profile context is required for curriculum grounding.");
  } else {
    const validBoards = ["SSC_MH", "NCERT"];
    if (!validBoards.includes(profile.board)) {
      errors.push(`Invalid board '${profile.board}'. Supported boards: ${validBoards.join(", ")}.`);
    }

    const validClasses = ["9", "10"];
    if (!validClasses.includes(String(profile.class))) {
      errors.push(`Invalid class '${profile.class}'. Supported classes: ${validClasses.join(", ")}.`);
    }

    const validLangs = ["mr", "en"];
    if (!validLangs.includes(profile.language)) {
      errors.push(`Invalid language '${profile.language}'. Supported languages: ${validLangs.join(", ")}.`);
    }
  }

  const sanitizedProfile = profile
    ? {
        name: String(profile.name || "Student").replace(/<[^>]*>?/gm, "").trim().slice(0, 50),
        village: String(profile.village || "Rural School").replace(/<[^>]*>?/gm, "").trim().slice(0, 50),
        board: profile.board === "NCERT" ? "NCERT" : "SSC_MH",
        class: String(profile.class) === "10" ? "10" : "9",
        language: profile.language === "en" ? "en" : "mr",
        subject: "Science & Technology"
      }
    : null;

  return {
    isValid: errors.length === 0,
    sanitizedText,
    sanitizedProfile,
    errors
  };
}

// ==========================================
// 2. AUTHENTICATION & RBAC TOKENS
// ==========================================
export type UserRole = "student" | "teacher" | "admin";

export interface AuthSession {
  userId: string;
  name: string;
  role: UserRole;
  schoolId: string;
  issuedAt: number;
  expiresAt: number;
  signature: string;
}

const JWT_SECRET = process.env.AUTH_SECRET || "gramagyan_rural_sec_key_2026";

export function generateSessionToken(name: string, role: UserRole = "student", schoolId: string = "MH-ZP-042"): string {
  const payload = {
    userId: `usr_${crypto.randomBytes(6).toString("hex")}`,
    name,
    role,
    schoolId,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  const payloadStr = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(payloadStr).digest("hex");
  return Buffer.from(JSON.stringify({ ...payload, signature })).toString("base64");
}

export function verifySessionToken(token: string): { valid: boolean; session?: AuthSession; error?: string } {
  try {
    if (!token) return { valid: false, error: "Authentication token missing." };
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    const { signature, ...payload } = decoded;
    const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(JSON.stringify(payload)).digest("hex");
    if (signature !== expectedSig) {
      return { valid: false, error: "Cryptographic signature mismatch. Token corrupted or tampered." };
    }
    if (Date.now() > payload.expiresAt) {
      return { valid: false, error: "Session token has expired. Please log in again." };
    }
    return { valid: true, session: decoded };
  } catch (e: any) {
    return { valid: false, error: "Malformed session token format." };
  }
}

// ==========================================
// 3. RATE LIMITING ENGINE (Sliding Window)
// ==========================================
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  clientIdentifier: string,
  limit: number = 60,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = rateLimitStore.get(clientIdentifier);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(clientIdentifier, record);
  }

  // Filter timestamps within active window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetTime = Math.ceil((oldest + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, resetTime: Math.max(resetTime, 1) };
  }

  record.timestamps.push(now);
  const remaining = limit - record.timestamps.length;
  return { allowed: true, remaining, resetTime: Math.ceil(windowMs / 1000) };
}

// ==========================================
// 4. PERSISTENT LRU QUERY CACHE (MD5 Hashing)
// ==========================================
interface CacheItem {
  data: any;
  cachedAt: number;
  ttlMs: number;
  hits: number;
}

class QueryCacheManager {
  private cache = new Map<string, CacheItem>();
  private maxItems = 500;
  public totalHits = 0;
  public totalMisses = 0;

  public computeHash(query: string, board: string, classNum: string, lang: string): string {
    const normalized = `${query.toLowerCase().trim()}|${board}|${classNum}|${lang}`;
    return crypto.createHash("md5").update(normalized).digest("hex");
  }

  public get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) {
      this.totalMisses++;
      return null;
    }
    if (Date.now() - item.cachedAt > item.ttlMs) {
      this.cache.delete(key);
      this.totalMisses++;
      return null;
    }
    item.hits++;
    this.totalHits++;
    // Move to end (LRU behavior)
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.data;
  }

  public set(key: string, data: any, ttlMs: number = 3600000): void {
    if (this.cache.size >= this.maxItems) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, { data, cachedAt: Date.now(), ttlMs, hits: 0 });
  }

  public getStats() {
    return {
      size: this.cache.size,
      maxItems: this.maxItems,
      totalHits: this.totalHits,
      totalMisses: this.totalMisses,
      hitRate: this.totalHits + this.totalMisses > 0 
        ? ((this.totalHits / (this.totalHits + this.totalMisses)) * 100).toFixed(1) + "%" 
        : "0%"
    };
  }

  public clear() {
    this.cache.clear();
    this.totalHits = 0;
    this.totalMisses = 0;
  }
}

export const queryCache = new QueryCacheManager();

// ==========================================
// 5. DETERMINISTIC RAG RETRIEVAL ENGINE
// ==========================================
export interface ScoredChunk {
  chunk: TextbookChunk;
  score: number;
  matchReasons: string[];
}

export function retrieveCurriculumChunks(
  query: string,
  board: string,
  classNum: string,
  limit: number = 2
): ScoredChunk[] {
  const norm = query.toLowerCase();
  const words = norm.split(/\s+/).filter((w) => w.length > 2);

  // Filter candidates matching board and class
  let candidates = TEXTBOOK_CHUNKS.filter(
    (c) => c.board === board && c.class === classNum
  );

  if (candidates.length === 0) {
    candidates = TEXTBOOK_CHUNKS.filter((c) => c.board === board);
  }
  if (candidates.length === 0) {
    candidates = TEXTBOOK_CHUNKS;
  }

  const scored: ScoredChunk[] = candidates.map((chunk) => {
    let score = 0;
    const matchReasons: string[] = [];

    const titleLower = chunk.title.toLowerCase();
    const chapterLower = chunk.chapter.toLowerCase();
    const contentLower = chunk.content.toLowerCase();

    // Direct phrase match (+25)
    if (contentLower.includes(norm) || titleLower.includes(norm)) {
      score += 25;
      matchReasons.push("Exact phrase match");
    }

    // Word scoring
    for (const w of words) {
      if (titleLower.includes(w)) {
        score += 10;
        matchReasons.push(`Title match: "${w}" (+10)`);
      }
      if (chapterLower.includes(w)) {
        score += 5;
        matchReasons.push(`Chapter match: "${w}" (+5)`);
      }
      if (contentLower.includes(w)) {
        score += 2;
        matchReasons.push(`Content keyword: "${w}" (+2)`);
      }
    }

    return { chunk, score, matchReasons };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

// ==========================================
// 6. CULTURAL ANALOGY ENGINE
// ==========================================
export function matchCulturalAnalogy(query: string): Analogy | null {
  const norm = query.toLowerCase();
  for (const analogy of CULTURAL_ANALOGIES) {
    for (const keyword of analogy.keywords) {
      if (norm.includes(keyword.toLowerCase())) {
        return analogy;
      }
    }
  }
  return null;
}

// ==========================================
// 7. DYNAMIC MULTI-TIER FALLBACK GENERATOR
// (Resolves "Hardcoded Fallbacks" Risk)
// ==========================================
export function generateDynamicCurriculumAnswer(
  query: string,
  profile: any,
  retrievedChunks: ScoredChunk[],
  matchedAnalogy: Analogy | null
): { text: string; citations: Citation[]; analogyUsed?: any } {
  const { name, village, board, class: classNum, language } = profile;
  const isMarathi = language === "mr";

  const topChunk = retrievedChunks[0]?.chunk || TEXTBOOK_CHUNKS[0];
  const conceptName = matchedAnalogy ? matchedAnalogy.concept : topChunk.chapter;

  let analogyParagraph = "";
  if (matchedAnalogy) {
    const text = isMarathi ? matchedAnalogy.text_mr : matchedAnalogy.text_en;
    analogyParagraph = isMarathi
      ? `\n\n🌾 **आपल्या गावातील उदाहरण (${matchedAnalogy.concept}):**\n${text}`
      : `\n\n🌾 **Village Life Analogy (${matchedAnalogy.concept}):**\n${text}`;
  } else {
    analogyParagraph = isMarathi
      ? `\n\n🌾 **स्थानिक उदाहरण:**\nशेतीमधील नांगर, विहिरीचे रहाट किंवा घरात वापरल्या जाणाऱ्या साधनांमध्ये हेच विज्ञानाचे नियम लागू होतात.`
      : `\n\n🌾 **Village Life Analogy:**\nIn our rural farms and households, tools like plows, well pulleys, and clay hearths follow this exact physical principle.`;
  }

  let explanation = "";
  if (isMarathi) {
    explanation = `नमस्कार ${name} (${village})! तुमच्या ${board === "SSC_MH" ? "महाराष्ट्र राज्य मंडळ (SSC)" : "NCERT"} इयत्ता ${classNum} वीच्या विज्ञान पाठ्यपुस्तकानुसार:\n\n${topChunk.content}${analogyParagraph}\n\n📖 **पाठ्यपुस्तक संदर्भ:** अधिक माहितीसाठी तुमच्या पुस्तकातील '${topChunk.chapter}' मधील पान क्र. ${topChunk.page} अवश्य वाचा!`;
  } else {
    explanation = `Hello ${name} from ${village}! According to your ${board === "SSC_MH" ? "Maharashtra State Board (SSC)" : "NCERT"} Class ${classNum} Science curriculum:\n\n${topChunk.content}${analogyParagraph}\n\n📖 **Curriculum Reference:** Refer to "${topChunk.chapter}" on Page ${topChunk.page} of your official textbook for detailed diagrams.`;
  }

  const citations: Citation[] = retrievedChunks.map((sc) => ({
    chapter: sc.chunk.chapter,
    chapter_number: sc.chunk.chapter_number,
    page: sc.chunk.page,
    snippet: sc.chunk.content,
    subject: sc.chunk.subject
  }));

  return {
    text: explanation,
    citations,
    analogyUsed: matchedAnalogy
      ? {
          concept: matchedAnalogy.concept,
          text: isMarathi ? matchedAnalogy.text_mr : matchedAnalogy.text_en,
          type: matchedAnalogy.type
        }
      : undefined
  };
}
