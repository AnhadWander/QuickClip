"use client";

/**
 * components/TimestampList.tsx
 * Clickable timestamp chips that link to specific moments in the YouTube video.
 */

import type { SummaryResult } from "@/lib/types";
import { Clock } from "lucide-react";

interface Props {
  timestamps: SummaryResult["timestamps"];
  videoUrl: string;
}

/**
 * Converts a time string (HH:MM:SS or MM:SS) into total seconds
 */
function timeToSeconds(timeStr: string): number {
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

/**
 * Builds a YouTube URL with a timestamp query parameter
 */
function buildTimestampUrl(videoUrl: string, timeStr: string): string {
  const seconds = timeToSeconds(timeStr);
  try {
    const url = new URL(videoUrl);
    url.searchParams.set("t", String(seconds));
    return url.toString();
  } catch {
    return `${videoUrl}&t=${seconds}`;
  }
}

export default function TimestampList({ timestamps, videoUrl }: Props) {
  if (!timestamps?.length) return null;

  return (
    <div className="section-card fade-in-up fade-in-up-delay-3">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          marginBottom: "1.25rem",
        }}
      >
        <div
          style={{
            padding: "0.35rem",
            borderRadius: 8,
            background: "rgba(255,69,58,0.12)",
          }}
        >
          <Clock size={16} color="var(--color-primary)" />
        </div>
        <h3
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "var(--color-text)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Timestamps
        </h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {timestamps.map((ts, i) => {
          const href = buildTimestampUrl(videoUrl, ts.time);
          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                padding: "0.875rem 1rem",
                background: "var(--color-surface-2)",
                borderRadius: 12,
                border: "1px solid var(--color-border)",
                textDecoration: "none",
                transition: "all 0.15s ease",
                animation: `fadeInUp 0.4s ease ${i * 0.07}s both`,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.borderColor = "rgba(255,69,58,0.5)";
                el.style.background = "rgba(255,69,58,0.06)";
                el.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.borderColor = "var(--color-border)";
                el.style.background = "var(--color-surface-2)";
                el.style.transform = "translateX(0)";
              }}
            >
              <span
                className="timestamp-chip"
                style={{ flexShrink: 0, textDecoration: "none" }}
              >
                {ts.time}
              </span>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    color: "var(--color-text)",
                    fontSize: "0.92rem",
                    marginBottom: "0.2rem",
                  }}
                >
                  {ts.label}
                </div>
                <div
                  style={{
                    color: "var(--color-text-muted)",
                    fontSize: "0.85rem",
                    lineHeight: 1.5,
                  }}
                >
                  {ts.description}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
