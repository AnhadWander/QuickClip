/**
 * lib/transcript.ts
 * Retrieves the transcript for a YouTube video.
 * Uses the `youtube-transcript` npm package.
 */

import { YoutubeTranscript } from "youtube-transcript";
import type { TranscriptSegment } from "./types";

/**
 * Fetch the transcript for a given YouTube video ID.
 * Returns an array of transcript segments with text, start time (seconds), and duration.
 * Throws a descriptive error if the transcript is unavailable.
 */
export async function getTranscript(videoId: string): Promise<TranscriptSegment[]> {
  try {
    const rawSegments = await YoutubeTranscript.fetchTranscript(videoId);

    if (!rawSegments || rawSegments.length === 0) {
      throw new Error("Transcript is empty or unavailable for this video.");
    }

    return rawSegments.map((seg) => ({
      text: cleanTranscriptText(seg.text),
      start: seg.offset / 1000, // convert ms to seconds
      duration: seg.duration / 1000,
    }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    // Provide user-friendly error messages for common cases
    if (
      message.includes("Could not find any transcripts") ||
      message.includes("Transcript is disabled") ||
      message.includes("empty")
    ) {
      throw new Error(
        "No transcript is available for this video. This may be because captions are disabled, the video is private, or the language is not supported."
      );
    }

    throw new Error(`Failed to retrieve transcript: ${message}`);
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
