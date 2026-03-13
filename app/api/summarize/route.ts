/**
 * app/api/summarize/route.ts
 * POST /api/summarize
 *
 * Accepts { url, summaryLength }, validates the YouTube URL,
 * retrieves the transcript, and calls the LLM for a structured summary.
 * All LLM and transcript API calls happen server-side only.
 */

import { NextRequest, NextResponse } from "next/server";
import { validateYoutubeUrl, getVideoMetadata } from "@/lib/youtube";
import { getTranscript } from "@/lib/transcript";
import { summarizeTranscript } from "@/lib/llm";
import type { SummarizeRequest } from "@/lib/types";

export const maxDuration = 60; // Allow up to 60s for long videos

export async function POST(req: NextRequest) {
  try {
    const body: SummarizeRequest = await req.json();
    const { url, summaryLength } = body;

    // ── 1. Validate input ────────────────────────────────────────────────────

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, error: "A YouTube URL is required." },
        { status: 400 }
      );
    }

    if (!["brief", "standard", "detailed"].includes(summaryLength)) {
      return NextResponse.json(
        { success: false, error: "Invalid summaryLength. Must be brief, standard, or detailed." },
        { status: 400 }
      );
    }

    // ── 2. Validate YouTube URL ──────────────────────────────────────────────

    let videoId: string;
    try {
      videoId = validateYoutubeUrl(url);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: (err as Error).message },
        { status: 400 }
      );
    }

    // ── 3. Fetch video metadata (title, thumbnail) ───────────────────────────

    const metadata = await getVideoMetadata(videoId);

    // ── 4. Retrieve transcript ───────────────────────────────────────────────

    let segments;
    try {
      segments = await getTranscript(videoId);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: (err as Error).message },
        { status: 422 }
      );
    }

    // ── 5. Generate summary via LLM ──────────────────────────────────────────

    let result;
    try {
      result = await summarizeTranscript(
        segments,
        summaryLength,
        metadata.title,
        url,
        metadata.thumbnailUrl
      );
    } catch (err) {
      console.error("[/api/summarize] LLM error:", err);
      return NextResponse.json(
        {
          success: false,
          error:
            "The AI summarization failed. Please try again. If this persists, check your API key configuration.",
        },
        { status: 500 }
      );
    }

    // ── 6. Return result ─────────────────────────────────────────────────────

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("[/api/summarize] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
