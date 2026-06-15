import { NextResponse } from "next/server";
import { generateExplanation } from "@/lib/ai/explain";
import { toScreeningResult } from "@/lib/result";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body: { resultId?: string } = await request.json().catch(() => ({}));
  if (!body.resultId) {
    return NextResponse.json({ error: "Missing resultId." }, { status: 400 });
  }

  const { data: row } = await supabase
    .from("results")
    .select("*")
    .eq("id", body.resultId)
    .maybeSingle();

  if (!row) {
    return NextResponse.json({ error: "Result not found." }, { status: 404 });
  }

  // Return the cached explanation if we already generated one.
  if (row.ai_explanation) {
    return NextResponse.json({ text: row.ai_explanation, source: "cached" });
  }

  const result = toScreeningResult(row);
  const explanation = await generateExplanation({
    category: result.category,
    percentile: result.percentile,
    matchedSnps: result.matchedSnps,
    totalSnps: result.totalSnps,
  });

  await supabase
    .from("results")
    .update({ ai_explanation: explanation.text })
    .eq("id", row.id);

  return NextResponse.json(explanation);
}
