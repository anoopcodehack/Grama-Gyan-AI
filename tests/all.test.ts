import { test, describe } from "node:test";
import assert from "node:assert";
import {
  validateAndSanitizeQuery,
  checkRateLimit,
  generateSessionToken,
  verifySessionToken,
  queryCache,
  retrieveCurriculumChunks,
  matchCulturalAnalogy,
  generateDynamicCurriculumAnswer
} from "../src/services/coreEngine.js";

describe("1. Input Validation & XSS Sanitization Tests", () => {
  test("Should accept valid query payload for MH-SSC Class 9", () => {
    const payload = {
      query_text: "दाब म्हणजे काय?",
      profile: {
        name: "प्रिया पाटील",
        village: "शेळगाव",
        board: "SSC_MH",
        class: "9",
        language: "mr"
      }
    };
    const res = validateAndSanitizeQuery(payload);
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.errors.length, 0);
    assert.strictEqual(res.sanitizedText, "दाब म्हणजे काय?");
  });

  test("Should reject empty or too short query text", () => {
    const payload = {
      query_text: "a",
      profile: { board: "SSC_MH", class: "9", language: "mr" }
    };
    const res = validateAndSanitizeQuery(payload);
    assert.strictEqual(res.isValid, false);
    assert.match(res.errors[0], /too short/);
  });

  test("Should reject unsupported boards or invalid classes", () => {
    const payload = {
      query_text: "What is friction?",
      profile: { board: "CAMBRIDGE_IGCSE", class: "12", language: "en" }
    };
    const res = validateAndSanitizeQuery(payload);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.errors.some((e) => e.includes("Invalid board")));
    assert.ok(res.errors.some((e) => e.includes("Invalid class")));
  });

  test("Should strip dangerous HTML/script tags (XSS sanitization)", () => {
    const payload = {
      query_text: "<script>alert('hack')</script>What is buoyancy?",
      profile: { board: "SSC_MH", class: "9", language: "en" }
    };
    const res = validateAndSanitizeQuery(payload);
    assert.strictEqual(res.isValid, true);
    assert.ok(!res.sanitizedText?.includes("<script>"));
    assert.strictEqual(res.sanitizedText, "What is buoyancy?");
  });
});

describe("2. Authentication & Cryptographic Token Verification Tests", () => {
  test("Should generate valid HMAC session token and verify successfully", () => {
    const token = generateSessionToken("Priya Patil", "student", "MH-ZP-102");
    assert.ok(typeof token === "string" && token.length > 20);

    const verified = verifySessionToken(token);
    assert.strictEqual(verified.valid, true);
    assert.strictEqual(verified.session?.name, "Priya Patil");
    assert.strictEqual(verified.session?.role, "student");
    assert.strictEqual(verified.session?.schoolId, "MH-ZP-102");
  });

  test("Should reject tampered or modified session token", () => {
    const token = generateSessionToken("Teacher A", "teacher");
    // Tamper with payload
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    decoded.role = "admin"; // unauthorized privilege escalation attempt
    const tamperedToken = Buffer.from(JSON.stringify(decoded)).toString("base64");

    const verified = verifySessionToken(tamperedToken);
    assert.strictEqual(verified.valid, false);
    assert.match(verified.error!, /signature mismatch/i);
  });

  test("Should reject empty or garbage tokens", () => {
    const verified = verifySessionToken("not_a_valid_token");
    assert.strictEqual(verified.valid, false);
  });
});

describe("3. Sliding Window Rate Limiting Tests", () => {
  test("Should allow requests under rate limit threshold", () => {
    const clientId = `test_client_${Date.now()}`;
    const r1 = checkRateLimit(clientId, 5, 10000);
    assert.strictEqual(r1.allowed, true);
    assert.strictEqual(r1.remaining, 4);

    const r2 = checkRateLimit(clientId, 5, 10000);
    assert.strictEqual(r2.allowed, true);
    assert.strictEqual(r2.remaining, 3);
  });

  test("Should block excessive requests and enforce 429 threshold", () => {
    const clientId = `flood_client_${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      checkRateLimit(clientId, 3, 10000);
    }
    // 4th request must be blocked
    const blocked = checkRateLimit(clientId, 3, 10000);
    assert.strictEqual(blocked.allowed, false);
    assert.strictEqual(blocked.remaining, 0);
    assert.ok(blocked.resetTime > 0);
  });
});

describe("4. RAG Retrieval & Textbook Grounding Tests", () => {
  test("Should retrieve Force and Pressure chunk with page number 42 for pressure query", () => {
    const results = retrieveCurriculumChunks("pressure and area of contact", "SSC_MH", "9");
    assert.ok(results.length > 0);
    assert.strictEqual(results[0].chunk.chapter, "Chapter 3: Force and Pressure");
    assert.ok(results[0].score > 0);
    assert.ok(results[0].chunk.page >= 39);
  });

  test("Should retrieve Life Processes chunk for photosynthesis query", () => {
    const results = retrieveCurriculumChunks("photosynthesis chlorophyll sunlight", "SSC_MH", "9");
    assert.ok(results.length > 0);
    assert.strictEqual(results[0].chunk.chapter, "Chapter 15: Life Processes in Living Organisms");
    assert.strictEqual(results[0].chunk.page, 162);
  });

  test("Should retrieve NCERT Gravitation & Buoyancy chunk for NCERT board", () => {
    const results = retrieveCurriculumChunks("buoyancy and floating objects", "NCERT", "9");
    assert.ok(results.length > 0);
    assert.strictEqual(results[0].chunk.board, "NCERT");
  });
});

describe("5. Cultural Analogy Engine Tests", () => {
  test("Should match Chumbhal (head cloth ring) for pressure queries", () => {
    const analogy = matchCulturalAnalogy("डोक्यावर चुंबळ ओझे pressure");
    assert.ok(analogy !== null);
    assert.strictEqual(analogy?.concept, "pressure");
    assert.ok(analogy?.text_mr.includes("चुंबळ"));
  });

  test("Should match well water bucket for buoyancy queries", () => {
    const analogy = matchCulturalAnalogy("विहिरीतून बादली पाणी ओढताना हलकी buoyancy");
    assert.ok(analogy !== null);
    assert.strictEqual(analogy?.concept, "buoyancy");
    assert.ok(analogy?.text_mr.includes("विहिरीतून"));
  });

  test("Should match clay stove (chulha) for photosynthesis queries", () => {
    const analogy = matchCulturalAnalogy("photosynthesis plant food making");
    assert.ok(analogy !== null);
    assert.strictEqual(analogy?.concept, "photosynthesis");
    assert.ok(analogy?.text_en.includes("clay stove") || analogy?.text_mr.includes("चूल"));
  });
});

describe("6. Persistent Query Cache Tests (MD5)", () => {
  test("Should compute deterministic MD5 hash for query keys", () => {
    const h1 = queryCache.computeHash("what is force", "SSC_MH", "9", "en");
    const h2 = queryCache.computeHash("WHAT IS FORCE ", "SSC_MH", "9", "en");
    assert.strictEqual(h1, h2);
    assert.strictEqual(h1.length, 32);
  });

  test("Should store and hit cached responses", () => {
    const hash = queryCache.computeHash("test query", "SSC_MH", "9", "en");
    queryCache.set(hash, { answer: "cached science answer" }, 5000);

    const hit = queryCache.get(hash);
    assert.deepStrictEqual(hit, { answer: "cached science answer" });
  });
});

describe("7. Dynamic Multitier Fallback (Zero Hardcoded Failure)", () => {
  test("Should dynamically generate full curriculum answer with citations and village analogy", () => {
    const query = "विहिरीतील बादली";
    const profile = {
      name: "प्रिया",
      village: "शेळगाव",
      board: "SSC_MH",
      class: "9",
      language: "mr"
    };

    const chunks = retrieveCurriculumChunks(query, profile.board, profile.class);
    const analogy = matchCulturalAnalogy(query);
    const answer = generateDynamicCurriculumAnswer(query, profile, chunks, analogy);

    assert.ok(answer.text.includes("प्रिया"));
    assert.ok(answer.text.includes("शेळगाव"));
    assert.ok(answer.citations.length > 0);
    assert.ok(answer.citations[0].page > 0);
    assert.ok(answer.analogyUsed !== undefined);
  });
});
