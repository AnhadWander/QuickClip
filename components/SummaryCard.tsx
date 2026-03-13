"use client";

/**
 * components/SummaryCard.tsx
 * Displays the video info and overall summary.
 */

import Image from "next/image";
import type { SummaryResult } from "@/lib/types";
import { ExternalLink, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Props {
  result: SummaryResult;
}

export default function SummaryCard({ result }: Props) {
  const lengthColors = {
    brief: "#22c55e",
    standard: "#6366f1",
    detailed: "#a78bfa",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Video info row */}
      <div className="section-card fade-in-up" style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start", flexWrap: "wrap" }}>
        {result.thumbnailUrl && (
          <div style={{ position: "relative", width: 180, height: 101, flexShrink: 0, borderRadius: 10, overflow: "hidden", border: "1px solid var(--color-border)" }}>
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
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-text)", marginBottom: "0.4rem", lineHeight: 1.3 }}>
            {result.videoTitle}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <span
              className="badge"
              style={{
                background: `${lengthColors[result.summaryLength]}18`,
                color: lengthColors[result.summaryLength],
                border: `1px solid ${lengthColors[result.summaryLength]}33`,
              }}
            >
              {result.summaryLength}
            </span>
            <a
              href={result.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--color-text-muted)", fontSize: "0.82rem", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
            >
              <ExternalLink size={13} />
              Watch on YouTube
            </a>
          </div>
        </div>
      </div>

      {/* Summary section */}
      <div className="section-card fade-in-up fade-in-up-delay-1">
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
          <div style={{ padding: "0.35rem", borderRadius: 8, background: "rgba(99,102,241,0.15)" }}>
            <BookOpen size={16} color="var(--color-primary)" />
          </div>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Summary
          </h3>
        </div>
        <div className="markdown-content" style={{ color: "var(--color-text)", lineHeight: 1.8, fontSize: "0.97rem" }}>
          <ReactMarkdown>{result.overallSummary}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
