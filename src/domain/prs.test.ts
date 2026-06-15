import { describe, expect, it } from "vitest";
import { computeRawScore, effectAlleleDosage } from "./prs";
import type { ParsedGenome, SnpWeight } from "./types";

function genome(entries: Record<string, string>): ParsedGenome {
  return { genotypes: new Map(Object.entries(entries)) };
}

describe("effectAlleleDosage", () => {
  it("counts 0, 1, or 2 copies of the effect allele", () => {
    expect(effectAlleleDosage("AA", "G")).toBe(0);
    expect(effectAlleleDosage("AG", "G")).toBe(1);
    expect(effectAlleleDosage("GG", "G")).toBe(2);
  });
});

describe("computeRawScore", () => {
  const weights: readonly SnpWeight[] = [
    { rsid: "rs1", effectAllele: "G", weight: 0.5 },
    { rsid: "rs2", effectAllele: "C", weight: 0.2 },
    { rsid: "rs3", effectAllele: "T", weight: 1.0 },
  ];

  it("sums dosage * weight over matched SNPs", () => {
    const result = computeRawScore(
      genome({ rs1: "GG", rs2: "AC", rs3: "AA" }),
      weights,
    );
    // 2*0.5 + 1*0.2 + 0*1.0 = 1.2
    expect(result.rawScore).toBeCloseTo(1.2, 10);
    expect(result.matchedSnps).toBe(3);
  });

  it("ignores SNPs missing from the genome", () => {
    const result = computeRawScore(genome({ rs1: "GG" }), weights);
    expect(result.rawScore).toBeCloseTo(1.0, 10);
    expect(result.matchedSnps).toBe(1);
  });

  it("returns a zero score for an empty genome", () => {
    const result = computeRawScore(genome({}), weights);
    expect(result.rawScore).toBe(0);
    expect(result.matchedSnps).toBe(0);
  });
});
