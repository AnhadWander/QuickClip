"use client";

/**
 * components/KeyPoints.tsx
 * Animated bullet list of key points from the summary.
 */

import type { SummaryResult } from "@/lib/types";
import { CheckCircle2 } from "lucide-react";

interface Props {
  keyPoints: SummaryResult["keyPoints"];
}

export default function KeyPoints({ keyPoints }: Props) {
  if (!keyPoints?.length) return null;

  return (
    <div className="section-card fade-in-up fade-in-up-delay-2">
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
        <div style={{ padding: "0.35rem", borderRadius: 8, background: "rgba(34,197,94,0.12)" }}>
          <CheckCircle2 size={16} color="var(--color-success)" />
        </div>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Key Points
        </h3>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {keyPoints.map((point, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              padding: "0.75rem 0.875rem",
              background: "var(--color-surface-2)",
              borderRadius: 10,
              border: "1px solid var(--color-border)",
              transition: "border-color 0.2s",
              animation: `fadeInUp 0.4s ease ${i * 0.06}s both`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLLIElement).style.borderColor = "rgba(34,197,94,0.3)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLLIElement).style.borderColor = "var(--color-border)";
            }}
          >
            <span style={{
              width: 22, height: 22, borderRadius: "50%",
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              fontSize: "0.7rem", fontWeight: 700, color: "var(--color-success)",
              marginTop: "1px",
            }}>
              {i + 1}
            </span>
            <span style={{ color: "var(--color-text)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              {point}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
