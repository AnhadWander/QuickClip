/**
 * lib/chunking.ts
 * Splits long transcripts into smaller chunks for safe LLM processing.
 * Uses a map-reduce strategy: summarize each chunk, then combine.
 */

import type { TranscriptSegment } from "./types";

// Approximate token limit per chunk (conservative for 8K context models)
const DEFAULT_CHUNK_TOKEN_LIMIT = 3000;

// Rough character-to-token ratio (English text ≈ 4 chars per token)
const CHARS_PER_TOKEN = 4;

/**
 * Split transcript segments into chunks that fit within the token limit.
 * Each chunk is a plain-text string with embedded timestamps.
 */
export function chunkTranscript(
  segments: TranscriptSegment[],
  maxTokens: number = DEFAULT_CHUNK_TOKEN_LIMIT
): string[] {
  const maxChars = maxTokens * CHARS_PER_TOKEN;
  const chunks: string[] = [];
  let currentChunk = "";

  for (const seg of segments) {
    const timeStr = formatSeconds(seg.start);
    const line = `[${timeStr}] ${seg.text}\n`;

    if (currentChunk.length + line.length > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = line;
    } else {
      currentChunk += line;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Estimate the approximate token count of a string.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Determine whether the transcript needs to be chunked.
 * Returns true if the transcript exceeds the safe token limit.
 */
export function needsChunking(
  segments: TranscriptSegment[],
  maxTokens: number = DEFAULT_CHUNK_TOKEN_LIMIT
): boolean {
  const fullText = segments.map((s) => s.text).join(" ");
  return estimateTokens(fullText) > maxTokens;
}

/**
 * Combine multiple chunk summaries into a single text block for the final pass.
 */
export function combineChunkSummaries(summaries: string[]): string {
  return summaries
    .map((s, i) => `--- Segment ${i + 1} ---\n${s}`)
    .join("\n\n");
}

// ─── Helper ────────────────────────────────────────────────────────────────────

function formatSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
