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

// LLM setup

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

// main function

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

  let fullText: string;

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

    fullText = combineChunkSummaries(chunkSummaries);
  } else {
    fullText = timestampedText;
  }

  const lastSegment = segments[segments.length - 1];
  const totalDuration = lastSegment ? lastSegment.start + lastSegment.duration : 0;

  const result = await generateFinalSummary(
    fullText,
    summaryLength,
    videoTitle,
    totalDuration
  );

  return {
    ...result,
    videoUrl,
    thumbnailUrl,
    summaryLength,
    videoTitle: result.videoTitle || videoTitle,
  };
}

// chunk processing

async function summarizeChunk(
  chunkText: string,
  summaryLength: SummaryLength
): Promise<string> {
  const prompt = buildChunkPrompt(chunkText, summaryLength);
  const raw = await callLLM(prompt);
  // For chunk summaries we just want the raw text, not JSON
  return raw;
}

// final generation

async function generateFinalSummary(
  transcriptText: string,
  summaryLength: SummaryLength,
  videoTitle: string,
  duration: number
): Promise<SummaryResult> {
  const prompt = buildFinalPrompt(transcriptText, summaryLength, videoTitle, duration);
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

// helpers

async function callLLM(prompt: string): Promise<string> {
  const provider = getProvider();

  if (provider === "openai") {
    return callOpenAI(prompt);
  }
  return callGemini(prompt);
}

// gemini functions

async function callGemini(prompt: string): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("[Gemini] API Key is missing from environment.");
    throw new Error("GEMINI_API_KEY is not set.");
  }

  console.log(`[Gemini] Calling API... (Key present: ${apiKey.slice(0, 6)}... Prompt length: ${prompt.length})`);

  const startTime = Date.now();
  try {
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
    const text = response.text();
    const duration = Date.now() - startTime;

    console.log(`[Gemini] Success! Received ${text.length} chars in ${duration}ms.`);
    return text;
  } catch (error: any) {
    console.error("[Gemini] API Exception:", error.message || error);
    throw error;
  }
}

// openai functions

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

// prompt strings

function buildChunkPrompt(
  chunkText: string,
  summaryLength: SummaryLength
): string {
  return `You are a transcript summarizer. Your job is to summarize the following excerpt from a video transcript.

STRICT RULES:
- Use ONLY information found in the transcript below.
- Do NOT introduce any outside knowledge.
- Do NOT guess or invent details.
- Preserve at least 3-5 key [MM:SS] timestamps in your summary to maintain a timeline.
- Write a clear, dense summary of 200-400 words capturing all main points from this segment.

TRANSCRIPT EXCERPT:
${chunkText}

Write your segment summary now (include [MM:SS] markers where significant topics start):`;
}

function buildFinalPrompt(
  transcriptText: string,
  summaryLength: SummaryLength,
  videoTitle: string,
  duration: number
): string {
  const mins = Math.max(1, Math.round(duration / 60));
  
  let instructions = "";
  let keyPointCount = 0;
  let quizCount = 0;
  let timestampCount = 0;

  if (summaryLength === "brief") {
    // Scaling brief: roughly 1 sentence per 2 mins, cap at 6
    const sentences = Math.min(6, Math.max(3, Math.ceil(mins / 2)));
    instructions = `${sentences} short, concise sentences.`;
    keyPointCount = Math.min(5, Math.max(3, Math.ceil(mins / 3)));
    quizCount = 3;
    timestampCount = Math.min(5, Math.max(3, Math.ceil(mins / 4)));
  } else if (summaryLength === "standard") {
    // Scaling standard: roughly 1 section per 4 mins
    const sections = Math.min(5, Math.max(2, Math.ceil(mins / 4)));
    instructions = `${sections} distinct sections (total ${sections * 4}–${sections * 6} sentences). Use Markdown headers (###) and bolding to make it skimmable.`;
    keyPointCount = Math.min(10, Math.max(5, Math.ceil(mins / 2)));
    quizCount = 5;
    timestampCount = Math.min(8, Math.max(4, Math.ceil(mins / 2)));
  } else {
    // Scaling detailed: roughly 1 section per 2-3 mins
    const sections = Math.min(10, Math.max(4, Math.ceil(mins / 2.5)));
    instructions = `${sections} distinct, in-depth sections (total ${sections * 6}–${sections * 10} sentences). This must be a comprehensive breakdown of every major point in this ${mins}-minute video. Use Markdown headers (###), bolding, and bullet lists for maximum depth.`;
    keyPointCount = Math.min(15, Math.max(8, mins));
    quizCount = Math.min(12, Math.max(7, Math.ceil(mins / 1.5)));
    timestampCount = Math.min(15, Math.max(6, mins));
  }

  return `You are an expert video summarizer for students and researchers. Analyze the following transcript (which may be a collection of segment summaries) and generate structured study notes.

CRITICAL RULES — YOU MUST FOLLOW ALL OF THESE:
1. Use ONLY information explicitly found in the transcript segments below.
2. Do NOT use any outside knowledge or general facts about the topic.
3. Your overallSummary MUST BE ${instructions} Use raw newline characters (\\n\\n) to separate sections. Use Markdown formatting (headers, bolding, lists) WITHIN the JSON string value for overallSummary.
4. Your overallSummary must cover the ENTIRE video from start to finish.
5. Do NOT invent timestamps — all timestamps must correspond to actual [MM:SS] markers in the segments.
6. If the transcript is unclear or incomplete, say so in the overallSummary.
7. Return ONLY valid JSON. No markdown outside the JSON, no explanation, no code fences.
8. All quiz questions and answers must be answerable from the text alone.

VIDEO TITLE: ${videoTitle}

TRANSCRIPT SEGMENTS:
${transcriptText}

Return a JSON object exactly matching this schema:
{
  "videoTitle": "string (use the title above or extract from transcript)",
  "overallSummary": "string (The formatted ${summaryLength} summary using Markdown for readability)",
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
