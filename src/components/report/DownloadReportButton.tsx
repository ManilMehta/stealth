"use client";

import { useState } from "react";
import type { ScreeningResult } from "@/lib/result";

interface DownloadReportButtonProps {
  result: ScreeningResult;
  explanation: string | null;
}

export function DownloadReportButton({ result, explanation }: DownloadReportButtonProps) {
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    if (!explanation) return;
    setGenerating(true);
    try {
      // Lazy-load the (heavy) PDF renderer only when the user downloads.
      const [{ pdf }, { ReportDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./ReportDocument"),
      ]);

      const blob = await pdf(
        <ReportDocument result={result} explanation={explanation} />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cad-risk-report-${result.id.slice(0, 8)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={!explanation || generating}
      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {generating ? "Preparing PDF…" : "Download PDF report"}
    </button>
  );
}
