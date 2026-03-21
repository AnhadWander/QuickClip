/**
 * lib/transcript.ts
 * Retrieves the transcript for a YouTube video.
 * Uses the `youtube-transcript` npm package.
 */

import { exec } from "child_process";
import path from "path";
import type { TranscriptSegment } from "./types";

/**
 * Fetch the transcript for a given YouTube video ID.
 * Uses a Python bridge script to call youtube-transcript-api.
 */
export async function getTranscript(videoId: string): Promise<TranscriptSegment[]> {
  // If deployed with a standalone Python backend, use its URL
  const backendUrl = process.env.PYTHON_BACKEND_URL;
  if (backendUrl) {
    return fetch(`${backendUrl}/api/transcript?videoId=${videoId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch transcript from backend");
        }
        if (data.error) throw new Error(data.error);
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("Transcript is empty or unavailable for this video.");
        }
        return data as TranscriptSegment[];
      });
  }

  return new Promise((resolve, reject) => {
    // Path to the python interpreter in the venv
    const pythonPath = path.join(process.cwd(), "venv", "bin", "python3");
    const scriptPath = path.join(process.cwd(), "python", "get_transcript.py");

    exec(`"${pythonPath}" "${scriptPath}" ${videoId}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`[getTranscript] Python error: ${stderr}`);
        return reject(new Error("No transcript is available for this video. This may be because captions are disabled, the video is private, or the language is not supported."));
      }

      try {
        const data = JSON.parse(stdout);
        
        if (data.error) {
          return reject(new Error(data.error));
        }

        if (!Array.isArray(data) || data.length === 0) {
          return reject(new Error("Transcript is empty or unavailable for this video."));
        }

        resolve(data as TranscriptSegment[]);
      } catch (parseError) {
        console.error(`[getTranscript] JSON parse error: ${parseError}`);
        reject(new Error("Failed to parse transcript data accurately."));
      }
    });
  });
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
