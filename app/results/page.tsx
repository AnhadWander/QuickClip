"use client";

/**
 * app/results/page.tsx
 * Results page showing the generated summary, timestamps, and quiz.
 * Reads the result payload from sessionStorage.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { SummaryResult } from "@/lib/types";

import SummaryCard from "@/components/SummaryCard";
import KeyPoints from "@/components/KeyPoints";
import TimestampList from "@/components/TimestampList";
import QuizSection from "@/components/QuizSection";
import ExportButtons from "@/components/ExportButtons";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { Save, CheckCircle2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ResultsPage() {
  const router = useRouter();
  const { user, loading: authLoading, getIdToken } = useAuth();
  
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load result from sessionStorage on mount
    const data = sessionStorage.getItem("quickclip_result");
    if (data) {
      try {
        setResult(JSON.parse(data));
      } catch (err) {
        console.error("Failed to parse result data", err);
      }
    } else {
      // If no data, send them back to home
      router.replace("/");
    }
    setLoading(false);
  }, [router]);

  const handleSaveHistory = async () => {
    if (!user) {
      toast("Please sign in to save your history.", { icon: "🔒" });
      router.push("/auth");
      return;
    }

    if (!result || saved || saving) return;

    setSaving(true);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ result }),
      });

      if (!res.ok) throw new Error("Failed to save");
      
      setSaved(true);
      toast.success("Saved to your history");
    } catch (err) {
      toast.error("Failed to save to history");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container-app" style={{ padding: "3rem 1.25rem" }}>
        <LoadingSkeleton />
      </div>
    );
  }

  if (!result) return null; // Will redirect in useEffect

  return (
    <div className="container-app" style={{ padding: "2rem 1.25rem 5rem" }}>
      
      {/* Top Navigation Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <Link href="/" className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0", textDecoration: "none" }}>
          <ArrowLeft size={16} />
          New Summary
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <ExportButtons result={result} />
          
          {/* Save Button */}
          <button
            onClick={handleSaveHistory}
            disabled={saving || saved || authLoading}
            className={saved ? "btn-secondary" : "btn-primary"}
            style={{ 
              padding: "0.6rem 1.25rem", 
              fontSize: "0.88rem",
              background: saved ? "rgba(34,197,94,0.1)" : undefined,
              borderColor: saved ? "var(--color-success)" : undefined,
              color: saved ? "var(--color-success)" : undefined
            }}
          >
            {saving ? (
              "Saving..."
            ) : saved ? (
              <>
                <CheckCircle2 size={16} />
                Saved
              </>
            ) : (
              <>
                <Save size={16} />
                Save to History
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <SummaryCard result={result} />
        <KeyPoints keyPoints={result.keyPoints} />
        <TimestampList timestamps={result.timestamps} videoUrl={result.videoUrl} />
        <QuizSection quiz={result.quiz} />
      </div>

    </div>
  );
}
