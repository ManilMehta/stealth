/**
 * Manual end-to-end check of the Supabase pipeline (auth -> storage -> RLS
 * insert -> read back -> cleanup) using a real authenticated user.
 *
 * Run with:
 *   tsx --env-file=.env.local scripts/verify-pipeline.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { parseGenotypeFile } from "../src/domain/parser";
import { assessCad } from "../src/domain/risk";

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");

  const sb = createClient(url, key);
  const email = `pipeline.${Date.now()}@gmail.com`;
  const password = "DemoPass123!";

  await sb.auth.signUp({ email, password });
  const { data: signin, error: signinError } = await sb.auth.signInWithPassword({
    email,
    password,
  });
  if (signinError || !signin.user) throw signinError ?? new Error("no user");
  const user = signin.user;

  const text = readFileSync(join(process.cwd(), "fixtures", "userB_average.txt"), "utf8");
  const result = assessCad(parseGenotypeFile(text));

  const path = `${user.id}/${Date.now()}-userB.txt`;
  const { error: uploadError } = await sb.storage
    .from("genome-uploads")
    .upload(path, new Blob([text], { type: "text/plain" }));
  console.log("storage upload:", uploadError ? `FAIL ${uploadError.message}` : "ok");

  const { data: inserted, error: insertError } = await sb
    .from("results")
    .insert({
      user_id: user.id,
      file_name: "userB_average.txt",
      file_path: uploadError ? null : path,
      raw_score: result.rawScore,
      percentile: result.percentile,
      category: result.category,
      matched_snps: result.matchedSnps,
      total_snps: result.totalSnps,
    })
    .select("*")
    .single();
  console.log("insert + read back:", insertError ? `FAIL ${insertError.message}` : "ok");
  if (inserted) {
    console.log(
      `  -> percentile=${inserted.percentile} category=${inserted.category} file_path=${inserted.file_path}`,
    );
    await sb.from("results").delete().eq("id", inserted.id);
  }
  if (!uploadError) await sb.storage.from("genome-uploads").remove([path]);
  console.log("cleanup: done");
}

void main();
