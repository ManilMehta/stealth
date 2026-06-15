/**
 * Deterministically generate the three synthetic demo genotype files.
 *
 * Each file is engineered so that the CAD PRS pipeline yields the percentile
 * required by the PRD: User A = 15 (Low), User B = 55 (Average),
 * User C = 97 (High).
 *
 * Run with: npm run gen:fixtures
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Allele, ParsedGenome } from "../src/domain/types";
import { CAD_SNP_WEIGHTS } from "../src/domain/snpWeights";
import { assessCad } from "../src/domain/risk";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(HERE, "..", "fixtures");

const BASES: readonly Allele[] = ["A", "C", "G", "T"];

interface Target {
  readonly file: string;
  readonly label: string;
  readonly percentile: number;
  /** Per-SNP probability of carrying an effect allele when sampling. */
  readonly effectFreq: number;
  readonly seed: number;
}

const TARGETS: readonly Target[] = [
  { file: "userA_low.txt", label: "User A (Low Risk)", percentile: 15, effectFreq: 0.22, seed: 1 },
  { file: "userB_average.txt", label: "User B (Average Risk)", percentile: 55, effectFreq: 0.52, seed: 2 },
  { file: "userC_high.txt", label: "User C (High Risk)", percentile: 97, effectFreq: 0.82, seed: 3 },
];

/** Deterministic PRNG (mulberry32) so output is reproducible. */
function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function nonEffectAllele(effect: Allele): Allele {
  return BASES.find((b) => b !== effect) ?? "A";
}

function dosageToGenotype(dosage: number, effect: Allele): string {
  const other = nonEffectAllele(effect);
  const pair =
    dosage === 2 ? [effect, effect] : dosage === 1 ? [effect, other] : [other, other];
  return [...pair].sort().join("");
}

function genomeFromDosages(dosages: readonly number[]): ParsedGenome {
  const genotypes = new Map<string, string>();
  CAD_SNP_WEIGHTS.forEach((snp, i) => {
    genotypes.set(snp.rsid, dosageToGenotype(dosages[i], snp.effectAllele));
  });
  return { genotypes };
}

/** Find a dosage vector whose assessed percentile equals the target exactly. */
function findDosages(target: Target): number[] {
  const rng = makeRng(target.seed);
  const sampleDosage = (): number => {
    const a = rng() < target.effectFreq ? 1 : 0;
    const b = rng() < target.effectFreq ? 1 : 0;
    return a + b;
  };

  const dosages = CAD_SNP_WEIGHTS.map(sampleDosage);

  for (let iter = 0; iter < 100_000; iter++) {
    const percentile = assessCad(genomeFromDosages(dosages)).percentile;
    if (percentile === target.percentile) {
      return dosages;
    }

    // Nudge a random SNP toward the target percentile.
    const i = Math.floor(rng() * dosages.length);
    if (percentile < target.percentile && dosages[i] < 2) {
      dosages[i] += 1;
    } else if (percentile > target.percentile && dosages[i] > 0) {
      dosages[i] -= 1;
    } else {
      dosages[i] = sampleDosage();
    }
  }

  throw new Error(`Could not converge to percentile ${target.percentile}`);
}

function renderFile(target: Target, dosages: readonly number[]): string {
  const header = [
    `# Synthetic 23andMe-style genotype file -- ${target.label}`,
    `# Generated for the CAD PRS Phase-0 demo. NOT real genetic data.`,
    `# Expected CAD percentile: ${target.percentile}`,
    `# rsid\tchromosome\tposition\tgenotype`,
  ];
  const rows = CAD_SNP_WEIGHTS.map((snp, i) => {
    const chromosome = ((i % 22) + 1).toString();
    const position = (1_000_000 + i * 1117).toString();
    return `${snp.rsid}\t${chromosome}\t${position}\t${dosageToGenotype(dosages[i], snp.effectAllele)}`;
  });
  // A no-call and a non-model SNP to exercise the parser's filtering.
  rows.push("rs0000000\t1\t999999\t--");
  rows.push("rs9999999\t7\t555555\tAT");
  return [...header, ...rows].join("\n") + "\n";
}

function main(): void {
  mkdirSync(FIXTURES_DIR, { recursive: true });
  for (const target of TARGETS) {
    const dosages = findDosages(target);
    const contents = renderFile(target, dosages);
    writeFileSync(join(FIXTURES_DIR, target.file), contents);
    const result = assessCad(genomeFromDosages(dosages));
    console.log(
      `${target.file}: percentile=${result.percentile} category=${result.category} rawScore=${result.rawScore.toFixed(3)}`,
    );
  }
}

main();
