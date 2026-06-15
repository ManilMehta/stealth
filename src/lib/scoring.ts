import { parseGenotypeFile } from "@/domain/parser";
import { assessCad } from "@/domain/risk";
import type { PrsResult } from "@/domain/types";

/** Outcome of scoring an uploaded genotype file. */
export type ScoreOutcome =
  | { ok: true; result: PrsResult }
  | { ok: false; reason: "empty" | "no_snps" };

/**
 * Parse raw genotype text and assess it against the CAD PRS model.
 *
 * Returns a failure outcome (rather than throwing) when the file is empty or
 * contains none of the model's SNPs, so callers can return a clean 4xx.
 */
export function scoreGenotypeText(text: string): ScoreOutcome {
  if (text.trim().length === 0) {
    return { ok: false, reason: "empty" };
  }

  const result = assessCad(parseGenotypeFile(text));
  if (result.matchedSnps === 0) {
    return { ok: false, reason: "no_snps" };
  }

  return { ok: true, result };
}
