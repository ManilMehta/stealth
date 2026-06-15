"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type Status = "idle" | "uploading" | "error";

export function UploadForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Please choose a genotype file first.");
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setError(null);

    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/score", { method: "POST", body });
      const data: { id?: string; error?: string } = await response.json();

      if (!response.ok || !data.id) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      router.push(`/results/${data.id}`);
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  const uploading = status === "uploading";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition hover:border-rose-400 hover:bg-rose-50/40"
      >
        <input
          ref={inputRef}
          type="file"
          name="file"
          accept=".txt,.csv,.tsv,text/plain"
          className="sr-only"
          onChange={(e) => {
            setFileName(e.target.files?.[0]?.name ?? null);
            setStatus("idle");
            setError(null);
          }}
        />
        <svg
          className="mb-3 h-10 w-10 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <span className="font-medium text-slate-700">
          {fileName ?? "Click to choose a genotype file"}
        </span>
        <span className="mt-1 text-xs text-slate-400">
          23andMe-style .txt — max 5 MB
        </span>
      </label>

      {error ? (
        <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={uploading}
        className="w-full rounded-lg bg-rose-600 px-4 py-2.5 font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading ? "Analyzing…" : "Analyze CAD risk"}
      </button>
    </form>
  );
}
