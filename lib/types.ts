/**
 * lib/types.ts
 * Central type definitions for QuickClip.
 * All server and client code should import from here.
 */

// ─── Summary Length ────────────────────────────────────────────────────────────

export type SummaryLength = "brief" | "standard" | "detailed";

// ─── LLM Output Schema ─────────────────────────────────────────────────────────

export interface TimestampEntry {
  time: string;       // "MM:SS" or "HH:MM:SS"
  label: string;      // Short topic label
  description: string; // Sentence describing the segment
}

export interface QuizQuestion {
  question: string;
  options: [string, string, string, string]; // Exactly 4 options
  correctAnswer: string;                     // Must match one of options
  explanation: string;                       // Grounded in transcript
}

export interface SummaryResult {
  videoTitle: string;
  videoUrl: string;
  thumbnailUrl: string;
  summaryLength: SummaryLength;
  overallSummary: string;
  keyPoints: string[];
  timestamps: TimestampEntry[];
  quiz: QuizQuestion[];
}

// ─── Transcript ────────────────────────────────────────────────────────────────

export interface TranscriptSegment {
  text: string;
  start: number; // seconds
  duration: number;
}

// ─── Firestore History ─────────────────────────────────────────────────────────

export interface HistoryItem {
  id: string;           // Firestore document ID
  userId: string;
  videoUrl: string;
  videoTitle: string;
  thumbnailUrl: string;
  createdAt: string;    // ISO date string
  summaryLength: SummaryLength;
  overallSummary: string;
  keyPoints: string[];
  timestamps: TimestampEntry[];
  quiz: QuizQuestion[];
}

// ─── API Request / Response ────────────────────────────────────────────────────

export interface SummarizeRequest {
  url: string;
  summaryLength: SummaryLength;
  rawTranscript?: string; // Fallback text if auto-fetch fails
}

export interface SummarizeResponse {
  success: boolean;
  data?: SummaryResult;
  error?: string;
}

export interface HistoryResponse {
  success: boolean;
  data?: HistoryItem[];
  error?: string;
}

export interface SaveHistoryRequest {
  result: SummaryResult;
}
