import type { ReferenceDistribution, SnpWeight } from "./types";

/**
 * Illustrative CAD PRS model: 24 SNPs with literature-inspired effect alleles
 * and per-allele weights (betas on an arbitrary demo scale).
 *
 * These values are simplified for a Phase-0 demo and are NOT clinically
 * calibrated. Do not use for medical decisions.
 */
export const CAD_SNP_WEIGHTS: readonly SnpWeight[] = [
  { rsid: "rs1333049", effectAllele: "C", weight: 0.29 }, // 9p21
  { rsid: "rs4977574", effectAllele: "G", weight: 0.25 }, // 9p21
  { rsid: "rs10757278", effectAllele: "G", weight: 0.22 }, // 9p21
  { rsid: "rs1746048", effectAllele: "C", weight: 0.17 }, // CXCL12
  { rsid: "rs6725887", effectAllele: "C", weight: 0.15 }, // WDR12
  { rsid: "rs9818870", effectAllele: "T", weight: 0.12 }, // MRAS
  { rsid: "rs17465637", effectAllele: "C", weight: 0.14 }, // MIA3
  { rsid: "rs6922269", effectAllele: "A", weight: 0.11 }, // MTHFD1L
  { rsid: "rs1122608", effectAllele: "G", weight: 0.16 }, // LDLR
  { rsid: "rs9982601", effectAllele: "T", weight: 0.13 }, // KCNE2
  { rsid: "rs2306374", effectAllele: "C", weight: 0.1 }, // MRAS region
  { rsid: "rs12526453", effectAllele: "C", weight: 0.12 }, // PHACTR1
  { rsid: "rs646776", effectAllele: "T", weight: 0.18 }, // SORT1
  { rsid: "rs3184504", effectAllele: "T", weight: 0.09 }, // SH2B3
  { rsid: "rs11206510", effectAllele: "T", weight: 0.11 }, // PCSK9
  { rsid: "rs2259816", effectAllele: "T", weight: 0.07 }, // HNF1A
  { rsid: "rs12190287", effectAllele: "C", weight: 0.08 }, // TCF21
  { rsid: "rs3798220", effectAllele: "C", weight: 0.2 }, // LPA
  { rsid: "rs10455872", effectAllele: "G", weight: 0.19 }, // LPA
  { rsid: "rs1561198", effectAllele: "A", weight: 0.06 }, // VAMP5/8
  { rsid: "rs3825807", effectAllele: "A", weight: 0.08 }, // ADAMTS7
  { rsid: "rs216172", effectAllele: "C", weight: 0.07 }, // SMG6
  { rsid: "rs12936587", effectAllele: "G", weight: 0.06 }, // RAI1
  { rsid: "rs46522", effectAllele: "T", weight: 0.05 }, // UBE2Z
];

/**
 * Total number of SNPs in the model.
 */
export const CAD_SNP_COUNT = CAD_SNP_WEIGHTS.length;

/**
 * Expected raw score when every SNP carries a single effect allele (dosage 1),
 * i.e. the mean of a reference cohort with ~50% effect-allele frequency.
 */
const REFERENCE_MEAN = CAD_SNP_WEIGHTS.reduce((sum, snp) => sum + snp.weight, 0);

/**
 * Reference distribution used to map a raw PRS to a percentile.
 * `sd` is an illustrative population standard deviation for this demo.
 */
export const CAD_REFERENCE: ReferenceDistribution = {
  mean: REFERENCE_MEAN,
  sd: 1.2,
};
