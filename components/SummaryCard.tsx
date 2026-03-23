"use client";

/*
 * SummaryCard.tsx
 * Shows the video details and main summary
 */

import Image from "next/image";
import type { SummaryResult } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import { ExternalLink, BookOpen, Clock } from "lucide-react";

/**
 * Props:
 * - result: contains all summary data (title, thumbnail, summary, etc.)
 */
interface Props {
  result: SummaryResult;
}

export default function SummaryCard({ result }: Props) {
  const colorMap = {
    brief: "#22c55e",
    standard: "#ff453a",
    detailed: "#ff6961",
  };

  /**
   * Calculates estimated reading time based on word count
   * Assumes average reading speed of 200 words per minute
   */
  const wordCount = result.overallSummary.trim().split(/\s+/).length;
  const readingTimeMinutes = Math.ceil(wordCount / 200);

  // Formats reading time text for display
  const readingTimeText =
    readingTimeMinutes < 1 ? "< 1 min read" : `~${readingTimeMinutes} min read`;

  return (
    <div className="flex flex-col gap-5">
      <div className="section-card fade-in-up flex gap-5 items-start flex-wrap">
        {result.thumbnailUrl && (
          <div
            style={{
              position: "relative",
              width: 180,
              height: 101,
              flexShrink: 0,
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid var(--color-border)",
            }}
          >
            <Image
              src={result.thumbnailUrl}
              alt={result.videoTitle}
              fill
              style={{ objectFit: "cover" }}
              sizes="180px"
              unoptimized
            />
          </div>
        )}
        <div className="flex-1 min-w-[200px]">
          <h2 className="text-[1.2rem] font-bold text-[var(--color-text)] mb-[0.4rem] leading-[1.3]">
            {result.videoTitle}
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="badge"
              style={{
                background: `${colorMap[result.summaryLength]}18`,
                color: colorMap[result.summaryLength],
                border: `1px solid ${colorMap[result.summaryLength]}33`,
              }}
            >
              {result.summaryLength}
            </span>

            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                fontSize: "0.82rem",
                color: "var(--color-text-muted)",
              }}
            >
              <Clock size={13} />
              {readingTimeText}
            </span>

            <a
              href={result.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                color: "var(--color-text-muted)",
                fontSize: "0.82rem",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--color-accent)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--color-text-muted)")
              }
            >
              <ExternalLink size={13} />
              Watch on YouTube
            </a>
          </div>
        </div>
      </div>

      <div className="section-card fade-in-up fade-in-up-delay-1">
        <div className="flex items-center gap-[0.6rem] mb-4">
          <div className="p-[0.35rem] rounded-lg bg-[rgba(255,69,58,0.15)]">
            <BookOpen size={16} color="var(--color-primary)" />
          </div>
          <h3 className="text-[0.95rem] font-bold text-[var(--color-text)] uppercase tracking-[0.05em]">
            Summary
          </h3>
        </div>
        <div
          className="markdown-content"
          style={{
            color: "var(--color-text)",
            lineHeight: 1.8,
            fontSize: "0.97rem",
          }}
        >
          <ReactMarkdown>{result.overallSummary}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
