/**
 * lib/llm.ts
 * Provider-agnostic LLM integration for QuickClip.
 *
 * Supports:
 *   - Google Gemini (default)  → set LLM_PROVIDER=gemini
 *   - OpenAI                   → set LLM_PROVIDER=openai
 *
 * Falls back to mock data when NEXT_PUBLIC_USE_MOCK=true or no API key is set.
 *
 * Anti-hallucination: All prompts instruct the model to use ONLY the
 * supplied transcript text and to return valid JSON only.
 */

import type { SummaryLength, SummaryResult, TranscriptSegment } from "./types";
import {
  chunkTranscript,
  combineChunkSummaries,
  needsChunking,
} from "./chunking";
import { segmentsToTimestampedText } from "./transcript";
import { MOCK_SUMMARY_RESULT } from "./mockData";

// ─── Provider Selection ────────────────────────────────────────────────────────

type LLMProvider = "gemini" | "openai";

function getProvider(): LLMProvider {
  const p = process.env.LLM_PROVIDER?.toLowerCase();
  if (p === "openai") return "openai";
  return "gemini"; // default
}

function isMockMode(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_MOCK === "true" ||
    (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY)
  );
}

// ─── Main Orchestrator ─────────────────────────────────────────────────────────

/**
 * Summarize a transcript using the configured LLM provider.
 * Handles chunking automatically for long transcripts.
 */
export async function summarizeTranscript(
  segments: TranscriptSegment[],
  summaryLength: SummaryLength,
  videoTitle: string,
  videoUrl: string,
  thumbnailUrl: string
): Promise<SummaryResult> {
  if (isMockMode()) {
    console.log("[LLM] Mock mode active – returning mock summary.");
    return {
      ...MOCK_SUMMARY_RESULT,
      videoTitle,
      videoUrl,
      thumbnailUrl,
      summaryLength,
    };
  }

  const timestampedText = segmentsToTimestampedText(segments);

  let combinedTranscriptForFinal: string;

  if (needsChunking(segments)) {
    console.log("[LLM] Long transcript detected – using map-reduce approach.");
    const chunks = chunkTranscript(segments);
    console.log(`[LLM] Processing ${chunks.length} chunks...`);

    const chunkSummaries = await Promise.all(
      chunks.map((chunk, i) => {
        console.log(`[LLM] Summarizing chunk ${i + 1}/${chunks.length}`);
        return summarizeChunk(chunk, summaryLength);
      })
    );

    combinedTranscriptForFinal = combineChunkSummaries(chunkSummaries);
  } else {
    combinedTranscriptForFinal = timestampedText;
  }

  const result = await generateFinalSummary(
    combinedTranscriptForFinal,
    summaryLength,
    videoTitle
  );

  return {
    ...result,
    videoUrl,
    thumbnailUrl,
    summaryLength,
    videoTitle: result.videoTitle || videoTitle,
  };
}

// ─── Chunk Summarization ───────────────────────────────────────────────────────

async function summarizeChunk(
  chunkText: string,
  summaryLength: SummaryLength
): Promise<string> {
  const prompt = buildChunkPrompt(chunkText, summaryLength);
  const raw = await callLLM(prompt);
  // For chunk summaries we just want the raw text, not JSON
  return raw;
}

// ─── Final Summary Generation ──────────────────────────────────────────────────

async function generateFinalSummary(
  transcriptText: string,
  summaryLength: SummaryLength,
  videoTitle: string
): Promise<SummaryResult> {
  const prompt = buildFinalPrompt(transcriptText, summaryLength, videoTitle);
  const raw = await callLLM(prompt);

  try {
    // Strip markdown code fences if present
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    return parsed as SummaryResult;
  } catch (err) {
    console.error("[LLM] Failed to parse JSON response:", err);
    console.error("[LLM] Raw response:", raw.slice(0, 500));
    throw new Error(
      "The AI returned an unexpected response format. Please try again."
    );
  }
}

// ─── LLM Dispatcher ───────────────────────────────────────────────────────────

async function callLLM(prompt: string): Promise<string> {
  const provider = getProvider();

  if (provider === "openai") {
    return callOpenAI(prompt);
  }
  return callGemini(prompt);
}

// ─── Gemini Integration ────────────────────────────────────────────────────────

async function callGemini(prompt: string): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.2, // Low temp for factual, grounded output
      responseMimeType: "text/plain",
    },
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

// ─── OpenAI Integration ────────────────────────────────────────────────────────

async function callOpenAI(prompt: string): Promise<string> {
  const { OpenAI } = await import("openai");
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set.");

  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a precise transcript summarizer. You only use information from the provided transcript. You never introduce outside knowledge. You always return valid JSON when asked.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
  });

  return response.choices[0]?.message?.content || "";
}

// ─── Prompt Builders ───────────────────────────────────────────────────────────

function buildChunkPrompt(
  chunkText: string,
  summaryLength: SummaryLength
): string {
  const lengthGuide =
    summaryLength === "brief"
      ? "2–3 sentences"
      : summaryLength === "standard"
      ? "4–6 sentences"
      : "7–10 sentences";

  return `You are a transcript summarizer. Your job is to summarize the following excerpt from a video transcript.

STRICT RULES:
- Use ONLY information found in the transcript below.
- Do NOT introduce any outside knowledge.
- Do NOT guess or invent details.
- If something is unclear, acknowledge it.
- Write a plain text summary of ${lengthGuide}.

TRANSCRIPT EXCERPT:
${chunkText}

Write your summary now:`;
}

function buildFinalPrompt(
  transcriptText: string,
  summaryLength: SummaryLength,
  videoTitle: string
): string {
  const summaryGuide =
    summaryLength === "brief"
      ? "3–5 sentences"
      : summaryLength === "standard"
      ? "1–2 paragraphs (6–10 sentences)"
      : "3–4 paragraphs (12–18 sentences)";

  const keyPointCount =
    summaryLength === "brief" ? 3 : summaryLength === "standard" ? 5 : 8;

  const quizCount =
    summaryLength === "brief" ? 3 : summaryLength === "standard" ? 5 : 7;

  const timestampCount =
    summaryLength === "brief" ? 3 : summaryLength === "standard" ? 5 : 8;

  return `You are an expert video summarizer for students and researchers. Analyze the following transcript and generate structured study notes.

CRITICAL RULES — YOU MUST FOLLOW ALL OF THESE:
1. Use ONLY information explicitly found in the transcript below.
2. Do NOT use any outside knowledge or general facts about the topic.
3. Do NOT invent timestamps — all timestamps must correspond to actual [MM:SS] markers in the transcript.
4. If the transcript is unclear or incomplete, say so in the overallSummary.
5. Return ONLY valid JSON. No markdown, no explanation, no code fences.
6. All quiz questions and answers must be answerable from the transcript alone.

VIDEO TITLE: ${videoTitle}

TRANSCRIPT:
${transcriptText}

Return a JSON object exactly matching this schema:
{
  "videoTitle": "string (use the title above or extract from transcript)",
  "overallSummary": "string (${summaryGuide}, based ONLY on the transcript)",
  "keyPoints": ["array of ${keyPointCount} key insight strings from the transcript"],
  "timestamps": [
    {
      "time": "MM:SS string matching a [MM:SS] marker in the transcript",
      "label": "short topic label (3–6 words)",
      "description": "one sentence describing what happens at this point"
    }
  ],
  "quiz": [
    {
      "question": "question based only on transcript content",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": "must exactly match one of the options strings",
      "explanation": "one sentence explaining why, citing the transcript"
    }
  ]
}

Generate exactly ${timestampCount} timestamps and ${quizCount} quiz questions.
RETURN ONLY THE JSON OBJECT. NO OTHER TEXT.`;
}
