import type { Allele, ParsedGenome, SnpWeight } from "./types";

/** Count the copies (0, 1, or 2) of `effectAllele` in a two-base genotype. */
export function effectAlleleDosage(genotype: string, effectAllele: Allele): number {
  let dosage = 0;
  for (const base of genotype) {
    if (base === effectAllele) {
      dosage += 1;
    }
  }
  return dosage;
}

/** Raw PRS plus the number of model SNPs found in the genome. */
export interface RawScore {
  readonly rawScore: number;
  readonly matchedSnps: number;
}

/**
 * Compute the raw polygenic score: the sum of `dosage * weight` over every
 * model SNP present in the parsed genome. SNPs missing from the genome
 * contribute nothing and are not counted as matched.
 */
export function computeRawScore(
  genome: ParsedGenome,
  weights: readonly SnpWeight[],
): RawScore {
  let rawScore = 0;
  let matchedSnps = 0;

  for (const snp of weights) {
    const genotype = genome.genotypes.get(snp.rsid);
    if (genotype === undefined) {
      continue;
    }
    matchedSnps += 1;
    rawScore += effectAlleleDosage(genotype, snp.effectAllele) * snp.weight;
  }

  return { rawScore, matchedSnps };
}
