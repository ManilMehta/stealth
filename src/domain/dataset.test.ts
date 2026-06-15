import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseGenotypeFile } from "./parser";
import { assessCad } from "./risk";
import type { RiskCategory } from "./types";

const FIXTURES_DIR = join(process.cwd(), "fixtures");

interface DemoCase {
  readonly file: string;
  readonly percentile: number;
  readonly category: RiskCategory;
}

const DEMO_CASES: readonly DemoCase[] = [
  { file: "userA_low.txt", percentile: 15, category: "Low" },
  { file: "userB_average.txt", percentile: 55, category: "Average" },
  { file: "userC_high.txt", percentile: 97, category: "High" },
];

describe("demo dataset", () => {
  it.each(DEMO_CASES)(
    "$file -> percentile $percentile ($category)",
    ({ file, percentile, category }) => {
      const content = readFileSync(join(FIXTURES_DIR, file), "utf8");
      const result = assessCad(parseGenotypeFile(content));

      expect(result.percentile).toBe(percentile);
      expect(result.category).toBe(category);
      // Every model SNP should be present in each fixture.
      expect(result.matchedSnps).toBe(result.totalSnps);
    },
  );

  it("ranks the demo users in increasing risk order", () => {
    const percentiles = DEMO_CASES.map(({ file }) => {
      const content = readFileSync(join(FIXTURES_DIR, file), "utf8");
      return assessCad(parseGenotypeFile(content)).percentile;
    });
    expect(percentiles).toEqual([...percentiles].sort((a, b) => a - b));
  });
});
