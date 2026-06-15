/**
 * Full end-to-end check against the running app over HTTP, using real Supabase
 * auth cookies (minted via @supabase/ssr, exactly as the browser would have).
 *
 * Exercises: auth -> POST /api/score (upload, parse, score, persist) ->
 * POST /api/explain -> verifies the three demo percentiles and the <15s budget.
 *
 * Usage:
 *   1) npm run build && npm start   (server on :3000)
 *   2) tsx --env-file=.env.local scripts/verify-e2e.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error("Missing Supabase env vars");

const CASES = [
  { file: "userA_low.txt", percentile: 15, category: "Low" },
  { file: "userB_average.txt", percentile: 55, category: "Average" },
  { file: "userC_high.txt", percentile: 97, category: "High" },
] as const;

async function mintAuthCookies(): Promise<{
  cookieHeader: string;
  accessToken: string;
}> {
  const plain = createClient(url!, key!);
  const email = `e2e.${Date.now()}@gmail.com`;
  const password = "DemoPass123!";
  await plain.auth.signUp({ email, password });
  const { data, error } = await plain.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw error ?? new Error("no session");

  const jar: { name: string; value: string }[] = [];
  const server = createServerClient(url!, key!, {
    cookies: {
      getAll: () => jar.map(({ name, value }) => ({ name, value })),
      setAll: (toSet) => {
        for (const { name, value } of toSet) {
          const existing = jar.find((c) => c.name === name);
          if (existing) existing.value = value;
          else jar.push({ name, value });
        }
      },
    },
  });
  await server.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });

  const cookieHeader = jar.map((c) => `${c.name}=${c.value}`).join("; ");
  return { cookieHeader, accessToken: data.session.access_token };
}

async function main(): Promise<void> {
  const { cookieHeader, accessToken } = await mintAuthCookies();
  let allPassed = true;

  for (const testCase of CASES) {
    const text = readFileSync(join(process.cwd(), "fixtures", testCase.file), "utf8");
    const form = new FormData();
    form.append("file", new File([text], testCase.file, { type: "text/plain" }));

    const started = Date.now();
    const scoreRes = await fetch(`${BASE}/api/score`, {
      method: "POST",
      headers: { cookie: cookieHeader },
      body: form,
    });
    const scoreData: { id?: string; error?: string } = await scoreRes.json();
    const elapsed = Date.now() - started;

    if (!scoreRes.ok || !scoreData.id) {
      console.log(`FAIL ${testCase.file}: score -> ${scoreRes.status} ${scoreData.error}`);
      allPassed = false;
      continue;
    }

    const explainRes = await fetch(`${BASE}/api/explain`, {
      method: "POST",
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      body: JSON.stringify({ resultId: scoreData.id }),
    });
    const explainData: { text?: string; source?: string } = await explainRes.json();

    // Read the persisted row (with the user's token, satisfying RLS) to
    // confirm the stored percentile/category.
    const persisted = await fetch(
      `${url}/rest/v1/results?id=eq.${scoreData.id}&select=percentile,category`,
      { headers: { apikey: key!, authorization: `Bearer ${accessToken}` } },
    );
    const persistedRows: { percentile: number; category: string }[] =
      await persisted.json();
    const stored = persistedRows[0];

    const within = elapsed < 15000;
    const totalElapsed = Date.now() - started;
    const correct =
      stored?.percentile === testCase.percentile &&
      stored?.category === testCase.category;
    const pass = scoreRes.ok && explainRes.ok && Boolean(explainData.text) && within && correct;
    allPassed = allPassed && pass;

    console.log(
      `${pass ? "PASS" : "FAIL"} ${testCase.file}: ` +
        `percentile=${stored?.percentile}/${testCase.percentile} ` +
        `category=${stored?.category} explain=${explainData.source} ` +
        `total=${totalElapsed}ms (<15s: ${within})`,
    );
  }

  console.log(allPassed ? "\nALL E2E CHECKS PASSED" : "\nSOME E2E CHECKS FAILED");
  if (!allPassed) process.exitCode = 1;
}

void main();
