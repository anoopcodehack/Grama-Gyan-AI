import TextbookChunk from "../models/TextbookChunk.model.js";
import { TEXTBOOK_CHUNKS } from "../../src/data/textbooks.js";

export async function retrieveRelevantChunks(query, board, classNum, language) {
  const normQuery = query.toLowerCase();
  
  try {
    // 1. Try Live MongoDB Atlas collection first if MongoDB is online
    const liveChunks = await TextbookChunk.find({ board, class: classNum });
    if (liveChunks && liveChunks.length > 0) {
      // Score documents dynamically by keyword match
      const scored = liveChunks.map(chunk => {
        let score = 0;
        const words = normQuery.split(/\s+/).filter(w => w.length > 2);
        
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
      
      const sorted = scored.filter(item => item.score > 0).sort((a,b) => b.score - a.score);
      if (sorted.length > 0) {
        return sorted.map(item => item.chunk).slice(0, 2);
      }
    }
  } catch (err) {
    console.warn("[RAG Warn] MongoDB retrieval offline, falling back to static textbooks.js payload.", err.message);
  }

  // 2. Local fallback RAG search engine (Matches current server.ts exactly)
  const filtered = TEXTBOOK_CHUNKS.filter(c => c.board === board && c.class === classNum);
  if (filtered.length === 0) {
    return TEXTBOOK_CHUNKS.filter(c => c.language === language).slice(0, 2);
  }

  const scored = filtered.map(chunk => {
    let score = 0;
    const words = normQuery.split(/\s+/).filter(w => w.length > 2);
    
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

  const sorted = scored.filter(item => item.score > 0).sort((a,b) => b.score - a.score);
  if (sorted.length > 0) {
    return sorted.map(item => item.chunk).slice(0, 2);
  }

  return filtered.slice(0, 2);
}
