import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scoreGenotypeText } from "@/lib/scoring";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB is ample for a genotype file.

const ERROR_MESSAGES: Record<"empty" | "no_snps", string> = {
  empty: "The uploaded file is empty.",
  no_snps:
    "No recognized SNPs were found. Upload a 23andMe-style genotype file (try the demo fixtures).",
};

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File is too large (max 5 MB)." }, { status: 413 });
  }

  const text = await file.text();
  const outcome = scoreGenotypeText(text);
  if (!outcome.ok) {
    return NextResponse.json({ error: ERROR_MESSAGES[outcome.reason] }, { status: 422 });
  }
  const { result } = outcome;

  // Best-effort archival of the raw file. A storage failure must not block the
  // user from seeing their result.
  const filePath = `${user.id}/${Date.now()}-${sanitizeFileName(file.name)}`;
  const { error: storageError } = await supabase.storage
    .from("genome-uploads")
    .upload(filePath, file, { contentType: "text/plain", upsert: false });

  const { data: inserted, error: insertError } = await supabase
    .from("results")
    .insert({
      user_id: user.id,
      file_name: file.name,
      file_path: storageError ? null : filePath,
      raw_score: result.rawScore,
      percentile: result.percentile,
      category: result.category,
      matched_snps: result.matchedSnps,
      total_snps: result.totalSnps,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return NextResponse.json(
      { error: "Could not save your result. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: inserted.id }, { status: 201 });
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "genome.txt";
}
