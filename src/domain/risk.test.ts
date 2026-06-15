import { describe, expect, it } from "vitest";
import { categorize, normalCdf, percentileToZ, probit, scoreToPercentile } from "./risk";
import type { ReferenceDistribution } from "./types";

describe("normalCdf", () => {
  it("returns 0.5 at the mean", () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 6);
  });

  it("matches known standard-normal values", () => {
    expect(normalCdf(1)).toBeCloseTo(0.8413, 4);
    expect(normalCdf(-1)).toBeCloseTo(0.1587, 4);
    expect(normalCdf(1.96)).toBeCloseTo(0.975, 3);
  });
});

describe("scoreToPercentile", () => {
  const ref: ReferenceDistribution = { mean: 3.2, sd: 1.2 };

  it("maps the mean to the 50th percentile", () => {
    expect(scoreToPercentile(ref.mean, ref)).toBe(50);
  });

  it("clamps to the 1..99 range", () => {
    expect(scoreToPercentile(-100, ref)).toBe(1);
    expect(scoreToPercentile(100, ref)).toBe(99);
  });

  it("increases monotonically with the raw score", () => {
    const low = scoreToPercentile(2.0, ref);
    const mid = scoreToPercentile(3.2, ref);
    const high = scoreToPercentile(5.0, ref);
    expect(low).toBeLessThan(mid);
    expect(mid).toBeLessThan(high);
  });
});

describe("probit", () => {
  it("is the inverse of normalCdf", () => {
    for (const z of [-2, -1, -0.3, 0, 0.5, 1.2, 2.1]) {
      expect(probit(normalCdf(z))).toBeCloseTo(z, 4);
    }
  });

  it("maps known percentiles to z-scores", () => {
    expect(percentileToZ(50)).toBeCloseTo(0, 4);
    expect(percentileToZ(97)).toBeCloseTo(1.8808, 3);
    expect(percentileToZ(15)).toBeCloseTo(-1.0364, 3);
  });
});

describe("categorize", () => {
  it("assigns categories by percentile thresholds", () => {
    expect(categorize(15)).toBe("Low");
    expect(categorize(24)).toBe("Low");
    expect(categorize(25)).toBe("Average");
    expect(categorize(55)).toBe("Average");
    expect(categorize(74)).toBe("Average");
    expect(categorize(75)).toBe("Elevated");
    expect(categorize(89)).toBe("Elevated");
    expect(categorize(90)).toBe("High");
    expect(categorize(97)).toBe("High");
  });
});
