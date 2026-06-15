import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { scoreGenotypeText } from "./scoring";

describe("scoreGenotypeText", () => {
  it("scores a valid demo fixture", () => {
    const text = readFileSync(
      join(process.cwd(), "fixtures", "userC_high.txt"),
      "utf8",
    );
    const outcome = scoreGenotypeText(text);

    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.result.percentile).toBe(97);
      expect(outcome.result.category).toBe("High");
    }
  });

  it("rejects an empty file", () => {
    expect(scoreGenotypeText("   \n  ")).toEqual({ ok: false, reason: "empty" });
  });

  it("rejects a file with no model SNPs", () => {
    const text = "# header\nrs0000001\t1\t100\tAA\nrs0000002\t1\t200\tGG";
    expect(scoreGenotypeText(text)).toEqual({ ok: false, reason: "no_snps" });
  });
});
