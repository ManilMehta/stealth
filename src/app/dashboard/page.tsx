import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { CATEGORY_META } from "@/lib/category";
import { toScreeningResult } from "@/lib/result";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: rows } = await supabase
    .from("results")
    .select("*")
    .order("created_at", { ascending: false });

  const results = (rows ?? []).map(toScreeningResult);

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Your screenings</h1>
            <p className="mt-1 text-sm text-slate-500">
              Coronary Artery Disease genetic risk reports.
            </p>
          </div>
          <Link
            href="/upload"
            className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700"
          >
            New screening
          </Link>
        </div>

        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-600">No screenings yet.</p>
            <Link
              href="/upload"
              className="mt-4 inline-block rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700"
            >
              Upload a genotype file
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {results.map((result) => {
              const meta = CATEGORY_META[result.category];
              return (
                <li key={result.id}>
                  <Link
                    href={`/results/${result.id}`}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-rose-300 hover:shadow-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{result.fileName}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(result.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-slate-900">
                        {result.percentile}
                        <span className="align-top text-xs text-slate-400">th</span>
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${meta.badgeClass}`}
                      >
                        {result.category}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
