"use client";

/**
 * app/history/page.tsx
 * History page showing all previously saved summaries for the logged-in user.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import type { HistoryItem } from "@/lib/types";
import { History, Trash2, ArrowRight, Loader2, PlayCircle, Plus, Search, X, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import { getHistory, deleteHistory } from "@/lib/firestore";

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push("/auth");
      return;
    }

    const fetchHistoryData = async () => {
      if (!user) return;
      try {
        const historyData = await getHistory(user.uid);
        setHistory(historyData);
      } catch (err) {
        console.error("Failed to fetch history:", err);
        toast.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, [user, authLoading, router]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent navigation
    if (!user) return;
    if (!confirm("Are you sure you want to delete this summary?")) return;

    setDeletingId(id);
    try {
      await deleteHistory(user.uid, id);
      setHistory(prev => prev.filter(item => item.id !== id));
      toast.success("Summary deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete summary");
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenResult = (item: HistoryItem) => {
    // Strip out 'id', 'userId', 'createdAt' to match SummaryResult shape
    const { id, userId, createdAt, ...resultData } = item;
    sessionStorage.setItem("quickclip_result", JSON.stringify(resultData));
    router.push("/results");
  };

  // Filter history based on search query
  const filteredHistory = searchQuery.trim() === ""
    ? history
    : history.filter(item => {
        const query = searchQuery.toLowerCase();
        return (
          item.videoTitle.toLowerCase().includes(query) ||
          item.overallSummary.toLowerCase().includes(query) ||
          item.keyPoints.some(point => point.toLowerCase().includes(query)) ||
          item.timestamps.some(ts =>
            ts.label.toLowerCase().includes(query) ||
            ts.description.toLowerCase().includes(query)
          )
        );
      });

  if (authLoading || loading) {
    return (
      <div className="container-app" style={{ padding: "4rem 1.25rem", display: "flex", justifyContent: "center" }}>
        <Loader2 size={32} color="var(--color-primary)" style={{ animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div className="container-app" style={{ padding: "2.5rem 1.25rem 5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ padding: "0.5rem", borderRadius: 10, background: "rgba(99,102,241,0.15)" }}>
            <History size={20} color="var(--color-primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text)" }}>Your History</h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
              {searchQuery
                ? `${filteredHistory.length} result${filteredHistory.length !== 1 ? 's' : ''} found`
                : "Access your previously generated notes"
              }
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* Search Input */}
          <div style={{ position: "relative", minWidth: "280px", maxWidth: "350px" }}>
            <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <Search size={18} color="var(--color-text-muted)" />
            </div>
            <input
              type="text"
              placeholder="Search summaries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{
                paddingLeft: "2.75rem",
                paddingRight: searchQuery ? "2.75rem" : "1.25rem",
                fontSize: "0.9rem",
                height: "44px"
              }}
              aria-label="Search history"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  color: "var(--color-text-muted)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.color = "var(--color-text)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "var(--color-text-muted)";
                }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <Link href="/" className="btn-primary" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem", whiteSpace: "nowrap" }}>
            <Plus size={18} />
            New Summary
          </Link>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="section-card fade-in-up" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--color-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            {searchQuery ? (
              <Search size={28} color="var(--color-text-muted)" />
            ) : (
              <BookOpen size={28} color="var(--color-text-muted)" />
            )}
          </div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            {searchQuery ? "No results found" : "No summaries yet"}
          </h2>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
            {searchQuery
              ? `No summaries match "${searchQuery}". Try a different search term.`
              : "You haven't saved any YouTube summaries yet."
            }
          </p>
          {!searchQuery && (
            <Link href="/" className="btn-primary" style={{ textDecoration: "none" }}>
              Create Your First Summary
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
          {filteredHistory.map((item, i) => (
            <div
              key={item.id}
              onClick={() => handleOpenResult(item)}
              className="section-card fade-in-up"
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "1.25rem",
                cursor: "pointer",
                animationDelay: `${i * 0.05}s`,
                position: "relative",
                overflow: "hidden"
              }}
            >
              {/* Thumbnail Area */}
              <div style={{ position: "relative", width: "100%", height: 160, borderRadius: 8, overflow: "hidden", marginBottom: "1rem", border: "1px solid var(--color-border)", background: "var(--color-surface-2)" }}>
                {item.thumbnailUrl ? (
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.videoTitle}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 100vw, 350px"
                    unoptimized
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <PlayCircle size={32} color="var(--color-text-muted)" opacity={0.5} />
                  </div>
                )}
                <div style={{ position: "absolute", top: "0.5rem", right: "0.5rem" }}>
                  <span className="badge" style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}>
                    {item.summaryLength}
                  </span>
                </div>
              </div>

              {/* Title & Date */}
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-text)", lineHeight: 1.4, marginBottom: "0.4rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {item.videoTitle}
                </h3>
                <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginBottom: "1rem" }}>
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--color-border)", paddingTop: "1rem", marginTop: "auto" }}>
                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  disabled={deletingId === item.id}
                  className="btn-ghost"
                  style={{ color: "var(--color-error)", padding: "0.4rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
                  aria-label="Delete summary"
                >
                  {deletingId === item.id ? (
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  <span style={{ fontSize: "0.85rem" }}>Delete</span>
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-primary)", fontWeight: 600, fontSize: "0.85rem" }}>
                  View Notes <ArrowRight size={15} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
