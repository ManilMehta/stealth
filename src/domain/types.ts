/**
 * Core domain types for the CAD polygenic risk score (PRS) pipeline.
 *
 * NOTE: This is a non-clinical Phase-0 demo. SNP weights, the reference
 * distribution, and category thresholds are illustrative and must not be used
 * for medical decision-making.
 */

/** A single DNA base. */
export type Allele = "A" | "C" | "G" | "T";

/** Discrete risk buckets reported to the user. */
export type RiskCategory = "Low" | "Average" | "Elevated" | "High";

/**
 * One entry in the static PRS model: the effect allele for a SNP and the
 * per-allele weight (beta) contributed for each copy of that allele.
 */
export interface SnpWeight {
  readonly rsid: string;
  readonly effectAllele: Allele;
  readonly weight: number;
}

/**
 * A parsed genome: a mapping from rsid to the observed genotype string
 * (e.g. "AG"). Genotypes are normalized to uppercase. No-calls are excluded.
 */
export interface ParsedGenome {
  readonly genotypes: ReadonlyMap<string, string>;
}

/**
 * Population reference parameters used to convert a raw PRS into a percentile.
 * Derived from a synthetic reference cohort for this demo.
 */
export interface ReferenceDistribution {
  readonly mean: number;
  readonly sd: number;
}

/** The full result of assessing a genome against the CAD PRS model. */
export interface PrsResult {
  /** Sum of dosage * weight across matched SNPs. */
  readonly rawScore: number;
  /** Percentile rank vs the reference cohort, clamped to 1..99. */
  readonly percentile: number;
  readonly category: RiskCategory;
  /** Number of model SNPs found in the uploaded genome. */
  readonly matchedSnps: number;
  /** Total number of SNPs in the model. */
  readonly totalSnps: number;
}
