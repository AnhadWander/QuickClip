"use client";

/**
 * components/LoadingSkeleton.tsx
 * Skeleton loading state for the results page.
 */

export default function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Video info skeleton */}
      <div className="section-card" style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
        <div className="skeleton" style={{ width: 160, height: 90, flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <div className="skeleton" style={{ height: 22, width: "70%" }} />
          <div className="skeleton" style={{ height: 16, width: "40%" }} />
        </div>
      </div>

      {/* Summary skeleton */}
      <div className="section-card">
        <div className="skeleton" style={{ height: 18, width: "30%", marginBottom: "1rem" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[100, 90, 95, 75].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: 14, width: `${w}%` }} />
          ))}
        </div>
      </div>

      {/* Key points skeleton */}
      <div className="section-card">
        <div className="skeleton" style={{ height: 18, width: "25%", marginBottom: "1rem" }} />
        {[80, 65, 72, 58, 70].map((w, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.6rem" }}>
            <div className="skeleton" style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0 }} />
            <div className="skeleton" style={{ height: 14, width: `${w}%` }} />
          </div>
        ))}
      </div>

      {/* Timestamps skeleton */}
      <div className="section-card">
        <div className="skeleton" style={{ height: 18, width: "28%", marginBottom: "1rem" }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {[70, 100, 85, 110, 95].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: 28, width: w, borderRadius: 999 }} />
          ))}
        </div>
      </div>

      {/* Quiz skeleton */}
      <div className="section-card">
        <div className="skeleton" style={{ height: 18, width: "20%", marginBottom: "1rem" }} />
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ marginBottom: "1.25rem" }}>
            <div className="skeleton" style={{ height: 16, width: "85%", marginBottom: "0.75rem" }} />
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="skeleton" style={{ height: 44, borderRadius: 12, marginBottom: "0.4rem" }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
