/**
 * lib/transcript.ts
 * Retrieves the transcript for a YouTube video.
 * Uses the `youtube-transcript` npm package directly (no Python needed).
 */

import { YoutubeTranscript } from "youtube-transcript";
import type { TranscriptSegment } from "./types";

/**
 * Fetch the transcript for a given YouTube video ID.
 * Uses the youtube-transcript npm package directly.
 */
export async function getTranscript(videoId: string): Promise<TranscriptSegment[]> {
  try {
    const rawTranscript = await YoutubeTranscript.fetchTranscript(videoId);

    if (!rawTranscript || rawTranscript.length === 0) {
      throw new Error("Transcript is empty or unavailable for this video.");
    }

    return rawTranscript.map((item) => ({
      text: cleanTranscriptText(item.text),
      start: item.offset / 1000,
      duration: item.duration / 1000,
    }));
  } catch (error: any) {
    console.error(`[getTranscript] Error: ${error.message}`);
    throw new Error(
      "No transcript is available for this video. This may be because captions are disabled, the video is private, or the language is not supported."
    );
  }
}

/**
 * Convert transcript segments into a flat string with approximate timestamps.
 * Used for LLM input when we want readable timestamped text.
 */
export function segmentsToTimestampedText(segments: TranscriptSegment[]): string {
  return segments
    .map((seg) => {
      const timeStr = formatSeconds(seg.start);
      return `[${timeStr}] ${seg.text}`;
    })
    .join("\n");
}

/**
 * Convert transcript segments into a plain text string (no timestamps).
 * Used for summarization when timestamps are not needed in the prompt.
 */
export function segmentsToPlainText(segments: TranscriptSegment[]): string {
  return segments.map((seg) => seg.text).join(" ");
}

/**
 * Format seconds into MM:SS or HH:MM:SS string.
 */
export function formatSeconds(totalSeconds: number): string {
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

/**
 * Remove HTML entities and clean up transcript text.
 */
function cleanTranscriptText(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n/g, " ")
    .trim();
}