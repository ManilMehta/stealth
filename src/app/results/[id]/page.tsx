import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Disclaimer } from "@/components/Disclaimer";
import { PopulationCurve } from "@/components/PopulationCurve";
import { ResultActions } from "@/components/ResultActions";
import { CATEGORY_META } from "@/lib/category";
import { toScreeningResult } from "@/lib/result";
import { createClient } from "@/lib/supabase/server";

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: row } = await supabase
    .from("results")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!row) {
    notFound();
  }

  const result = toScreeningResult(row);
  const meta = CATEGORY_META[result.category];
  const coverage = Math.round((result.matchedSnps / result.totalSnps) * 100);

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-6 py-10">
        <div>
          <p className="text-sm text-slate-500">CAD Genetic Risk Report</p>
          <h1 className="text-2xl font-semibold text-slate-900">{result.fileName}</h1>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <p className="text-sm text-slate-500">Risk percentile</p>
            <p className="mt-1 text-5xl font-bold text-slate-900">
              {result.percentile}
              <span className="align-top text-lg text-slate-400">th</span>
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <p className="text-sm text-slate-500">Risk category</p>
            <span
              className={`mt-2 inline-block rounded-full px-4 py-1.5 text-lg font-semibold ${meta.badgeClass}`}
            >
              {result.category}
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <p className="text-sm text-slate-500">SNP coverage</p>
            <p className="mt-1 text-5xl font-bold text-slate-900">
              {coverage}
              <span className="align-top text-lg text-slate-400">%</span>
            </p>
            <p className="text-xs text-slate-400">
              {result.matchedSnps}/{result.totalSnps} model SNPs
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-medium text-slate-700">
            Where you fall in the population
          </h2>
          <p className="mt-1 text-sm text-slate-500">{meta.blurb}</p>
          <div className="mt-4">
            <PopulationCurve percentile={result.percentile} color={meta.color} />
          </div>
        </section>

        <ResultActions result={result} />

        <Disclaimer />
      </main>
    </>
  );
}
