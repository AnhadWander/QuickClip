"use client";

/**
 * app/page.tsx
 * Landing page – URL input, summary length selector, and feature overview.
 */

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Zap, BookOpen, Clock, Brain, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import type { SummaryLength, SummarizeResponse } from "@/lib/types";
import { extractVideoId } from "@/lib/youtube";

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [summaryLength, setSummaryLength] = useState<SummaryLength>("standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidUrl = url.trim() !== "" && extractVideoId(url) !== null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) { setError("Please enter a YouTube URL."); return; }
    if (!isValidUrl) { setError("That doesn't look like a valid YouTube URL."); return; }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), summaryLength }),
      });

      const data: SummarizeResponse = await res.json();

      if (!data.success || !data.data) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      // Store result in sessionStorage and navigate
      sessionStorage.setItem("quickclip_result", JSON.stringify(data.data));
      router.push("/results");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const lengths: { value: SummaryLength; label: string; desc: string }[] = [
    { value: "brief", label: "Brief", desc: "3–5 sentences" },
    { value: "standard", label: "Standard", desc: "1–2 paragraphs" },
    { value: "detailed", label: "Detailed", desc: "3–4 paragraphs" },
  ];

  return (
    <div className="hero-bg" style={{ minHeight: "100vh" }}>
      {/* ── Hero ── */}
      <section style={{ paddingTop: "7rem", paddingBottom: "5rem", textAlign: "center" }}>
        <div className="container-app">
          <div className="fade-in-up" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <span className="badge badge-primary">
              <Zap size={11} />
              AI Powered
            </span>
          </div>

          <h1 className="gradient-text fade-in-up" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", marginBottom: "1rem", fontWeight: 900 }}>
            QuickClip
          </h1>
          <p className="fade-in-up fade-in-up-delay-1" style={{ fontSize: "clamp(1rem, 2.5vw, 1.3rem)", color: "var(--color-text-muted)", maxWidth: 560, margin: "0 auto 3rem", lineHeight: 1.7 }}>
            Turn any YouTube video into structured study notes, key insights, timestamps, and a quiz — instantly.
          </p>

          {/* ── Input Form ── */}
          <form
            onSubmit={handleSubmit}
            className="glass-card fade-in-up fade-in-up-delay-2"
            style={{ maxWidth: 720, margin: "0 auto", padding: "2rem", textAlign: "left" }}
          >
            {/* URL Input */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                YouTube URL
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="url"
                  className="input-field"
                  placeholder="https://youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(""); }}
                  disabled={loading}
                  autoFocus
                  aria-label="YouTube video URL"
                  aria-describedby="url-error"
                />
                {url && (
                  <div style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)" }}>
                    {isValidUrl ? (
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-success)" }} />
                    ) : (
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-error)" }} />
                    )}
                  </div>
                )}
              </div>
              {error && (
                <p id="url-error" style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-error)", fontSize: "0.85rem", marginTop: "0.4rem" }}>
                  <AlertCircle size={14} />
                  {error}
                </p>
              )}
            </div>

            {/* Summary Length */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Summary Length
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                {lengths.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSummaryLength(value)}
                    style={{
                      padding: "0.75rem",
                      borderRadius: 10,
                      border: summaryLength === value ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                      background: summaryLength === value ? "rgba(99,102,241,0.1)" : "var(--color-surface-2)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: summaryLength === value ? "var(--color-primary)" : "var(--color-text)", marginBottom: "0.2rem" }}>
                      {label}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !isValidUrl}
              style={{ width: "100%", justifyContent: "center", padding: "0.9rem", fontSize: "1rem" }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                  Summarizing...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Summarize Video
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section style={{ padding: "5rem 0", borderTop: "1px solid var(--color-border)" }}>
        <div className="container-app">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-text)", marginBottom: "0.5rem" }}>
              How it works
            </h2>
            <p style={{ color: "var(--color-text-muted)" }}>
              Three steps to transform any video into structured study material.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
            {[
              { icon: <Zap size={22} color="var(--color-primary)" />, bg: "rgba(99,102,241,0.1)", title: "1. Paste URL", desc: "Drop any YouTube link into the input box." },
              { icon: <BookOpen size={22} color="var(--color-success)" />, bg: "rgba(34,197,94,0.1)", title: "2. Get Summary", desc: "Our AI reads the transcript and generates structured notes." },
              { icon: <Clock size={22} color="var(--color-accent)" />, bg: "rgba(167,139,250,0.1)", title: "3. Study & Export", desc: "Review timestamps, take the quiz, and export your notes." },
            ].map(({ icon, bg, title, desc }) => (
              <div key={title} className="section-card" style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text)" }}>{title}</h3>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "5rem 0", borderTop: "1px solid var(--color-border)" }}>
        <div className="container-app">
          <h2 style={{ textAlign: "center", fontSize: "1.8rem", fontWeight: 800, color: "var(--color-text)", marginBottom: "3rem" }}>
            Everything you need to learn faster
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            {[
              { icon: <BookOpen size={18} />, label: "AI Summary", desc: "Grounded strictly in the video transcript" },
              { icon: <Clock size={18} />, label: "Timestamps", desc: "Jump to key moments instantly" },
              { icon: <Brain size={18} />, label: "Quiz", desc: "Test your understanding" },
              { icon: <ChevronDown size={18} />, label: "3 Detail Levels", desc: "Brief, standard, or detailed notes" },
            ].map(({ icon, label, desc }) => (
              <div key={label} style={{ padding: "1.25rem", borderRadius: 14, background: "var(--color-surface)", border: "1px solid var(--color-border)", display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
                <div style={{ color: "var(--color-primary)", marginTop: "2px", flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--color-text)", fontSize: "0.92rem", marginBottom: "0.2rem" }}>{label}</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "0.82rem" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
