/**
 * Grama-Gyan AI Shared Types
 */

export interface StudentProfile {
  name: string;
  village: string;
  board: "SSC_MH" | "NCERT";
  class: "9" | "10";
  language: "mr" | "en";
  subject: string;
}

export interface TextbookChunk {
  id: string;
  title: string;
  content: string;
  chapter: string;
  chapter_number: number;
  page: number;
  subject: string;
  board: "SSC_MH" | "NCERT";
  class: "9" | "10";
  language: "mr" | "en";
}

export interface Analogy {
  concept: string;
  keywords: string[];
  text_mr: string;
  text_en: string;
  region: string;
  type: string;
}

export interface Citation {
  chapter: string;
  chapter_number: number;
  page: number;
  snippet: string;
  subject: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  conceptDetected?: string;
  citations?: Citation[];
  analogyUsed?: {
    concept: string;
    text: string;
    type: string;
  };
  audioUrl?: string; // Optional generated/simulated voice response url
  timestamp: string;
  isOfflineCached?: boolean;
}

export interface Session {
  id: string;
  createdAt: string;
  messages: ChatMessage[];
}
