import { describe, expect, it } from "vitest";
import { parseGenotypeFile } from "./parser";

describe("parseGenotypeFile", () => {
  it("parses tab-separated 23andMe lines", () => {
    const content = [
      "# rsid\tchromosome\tposition\tgenotype",
      "rs4977574\t9\t22098574\tAG",
      "rs1333049\t9\t22125503\tCC",
    ].join("\n");

    const genome = parseGenotypeFile(content);

    expect(genome.genotypes.get("rs4977574")).toBe("AG");
    expect(genome.genotypes.get("rs1333049")).toBe("CC");
    expect(genome.genotypes.size).toBe(2);
  });

  it("ignores comment and blank lines", () => {
    const content = ["# header comment", "", "   ", "rs1\t1\t100\tAA"].join("\n");

    const genome = parseGenotypeFile(content);

    expect(genome.genotypes.size).toBe(1);
    expect(genome.genotypes.get("rs1")).toBe("AA");
  });

  it("normalizes rsid to lowercase and genotype to uppercase", () => {
    const genome = parseGenotypeFile("RS1234\t1\t100\tag");
    expect(genome.genotypes.get("rs1234")).toBe("AG");
  });

  it("skips no-calls and non-SNP lines", () => {
    const content = [
      "rs1\t1\t100\t--",
      "rs2\t1\t200\tDI",
      "rs3\t1\t300\t00",
      "rs4\t1\t400\tA",
      "i12345\t1\t500\tAA",
      "rs5\t1\t600\tGG",
    ].join("\n");

    const genome = parseGenotypeFile(content);

    expect(genome.genotypes.size).toBe(1);
    expect(genome.genotypes.get("rs5")).toBe("GG");
  });

  it("tolerates whitespace-separated columns", () => {
    const genome = parseGenotypeFile("rs1   1   100   AG");
    expect(genome.genotypes.get("rs1")).toBe("AG");
  });
});
