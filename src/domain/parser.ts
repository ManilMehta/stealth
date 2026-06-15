import type { ParsedGenome } from "./types";

/**
 * Parse a 23andMe-style raw genotype file.
 *
 * Format (tab- or whitespace-separated, `#` comment lines ignored):
 *
 *   # rsid  chromosome  position  genotype
 *   rs4977574   9   22098574    AG
 *
 * Genotypes are normalized to uppercase. No-calls ("--", "..", "00", "I"/"D"
 * insertions/deletions, or anything other than two A/C/G/T bases) are skipped.
 */
export function parseGenotypeFile(content: string): ParsedGenome {
  const genotypes = new Map<string, string>();

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith("#")) {
      continue;
    }

    const fields = line.split(/\s+/);
    if (fields.length < 4) {
      continue;
    }

    const rsid = fields[0].toLowerCase();
    const genotype = fields[3].toUpperCase();

    if (!rsid.startsWith("rs") || !isValidGenotype(genotype)) {
      continue;
    }

    genotypes.set(rsid, genotype);
  }

  return { genotypes };
}

/** A valid diploid SNP genotype is exactly two A/C/G/T bases. */
function isValidGenotype(genotype: string): boolean {
  return /^[ACGT]{2}$/.test(genotype);
}
