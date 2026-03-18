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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { saveHistory } from "@/lib/firestore";

export default function ResultsPage() {
  const router = useRouter();
  const { user, loading: authLoading, getIdToken } = useAuth();
  
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isFromHistory, setIsFromHistory] = useState(false);

  useEffect(() => {
    // Load result from sessionStorage on mount
    const data = sessionStorage.getItem("quickclip_result");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        // Handle both old format (direct result) and new format (with isFromHistory flag)
        if (parsed.data && typeof parsed.isFromHistory === 'boolean') {
          setResult(parsed.data);
          setIsFromHistory(parsed.isFromHistory);
        } else {
          // Backward compatibility: treat old format as new summary
          setResult(parsed);
          setIsFromHistory(false);
        }
      } catch (err) {
        console.error("Failed to parse result data", err);
      }
    } else {
      // If no data, send them back to home
      router.replace("/");
    }
    setLoading(false);
  }, [router]);

  // Auto-save to history when result and user are available (only for new summaries)
  useEffect(() => {
    if (!result || !user || saved || saving || authLoading || isFromHistory) return;

    const autoSave = async () => {
      setSaving(true);
      try {
        await saveHistory(user.uid, result);
        setSaved(true);
        console.log("[History] Successfully saved summary directly via Client SDK.");
      } catch (err) {
        console.error("[History] Direct save failed:", err);
      } finally {
        setSaving(false);
      }
    };

    autoSave();
  }, [result, user, saved, saving, authLoading, isFromHistory]);

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
