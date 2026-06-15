"use client";

import { useEffect, useState } from "react";
import { DownloadReportButton } from "@/components/report/DownloadReportButton";
import type { ScreeningResult } from "@/lib/result";

interface ResultActionsProps {
  result: ScreeningResult;
}

export function ResultActions({ result }: ResultActionsProps) {
  const [explanation, setExplanation] = useState<string | null>(result.aiExplanation);
  const [loading, setLoading] = useState<boolean>(!result.aiExplanation);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (explanation) {
      return;
    }
    let active = true;
    fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resultId: result.id }),
    })
      .then((response) => response.json())
      .then((data: { text?: string; error?: string }) => {
        if (!active) return;
        if (data.text) {
          setExplanation(data.text);
        } else {
          setError(data.error ?? "Could not generate an explanation.");
        }
      })
      .catch(() => active && setError("Could not generate an explanation."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [result.id, explanation]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-700">AI explanation</h2>
        <DownloadReportButton result={result} explanation={explanation} />
      </div>

      {loading ? (
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-11/12 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
        </div>
      ) : error ? (
        <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      ) : explanation ? (
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
          {explanation.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
