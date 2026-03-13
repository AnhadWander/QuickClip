"use client";

/**
 * components/ExportButtons.tsx
 * Buttons to export the summary as TXT or PDF.
 */

import { useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import type { SummaryResult } from "@/lib/types";
import toast from "react-hot-toast";

interface Props {
  result: SummaryResult;
}

export default function ExportButtons({ result }: Props) {
  const [exportingPdf, setExportingPdf] = useState(false);

  const handleTxt = () => {
    try {
      import("@/lib/export").then(({ exportAsTxt }) => {
        exportAsTxt(result);
        toast.success("Downloaded as TXT");
      });
    } catch {
      toast.error("Failed to export TXT");
    }
  };

  const handlePdf = async () => {
    setExportingPdf(true);
    try {
      const { exportAsPdf } = await import("@/lib/export");
      await exportAsPdf(result);
      toast.success("Downloaded as PDF");
    } catch {
      toast.error("Failed to export PDF");
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
      <button
        onClick={handleTxt}
        className="btn-secondary"
        style={{ fontSize: "0.88rem", padding: "0.6rem 1.25rem" }}
      >
        <FileText size={15} />
        Export TXT
      </button>
      <button
        onClick={handlePdf}
        disabled={exportingPdf}
        className="btn-secondary"
        style={{ fontSize: "0.88rem", padding: "0.6rem 1.25rem" }}
      >
        {exportingPdf ? (
          <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          <Download size={15} />
        )}
        {exportingPdf ? "Generating PDF..." : "Export PDF"}
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
