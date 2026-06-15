import { describe, expect, it } from "vitest";
import { generateExplanation } from "./explain";
import { templatedExplanation } from "./templated";
import type { ExplanationInput } from "./types";

const input: ExplanationInput = {
  category: "High",
  percentile: 97,
  matchedSnps: 24,
  totalSnps: 24,
};

describe("generateExplanation", () => {
  it("falls back to a templated explanation when no API key is set", async () => {
    const explanation = await generateExplanation(input, undefined);
    expect(explanation.source).toBe("templated");
    expect(explanation.text).toContain("High");
    expect(explanation.text).toContain("97th percentile");
  });

  it("uses the templated explanation when Gemini fails", async () => {
    // An obviously invalid key makes the Gemini call throw -> fallback.
    const explanation = await generateExplanation(input, "invalid-key");
    expect(explanation.source).toBe("templated");
  });
});

describe("templatedExplanation", () => {
  it("includes a not-medical-advice statement", () => {
    expect(templatedExplanation(input).toLowerCase()).toContain("not medical advice");
  });

  it("mentions SNP coverage", () => {
    expect(templatedExplanation(input)).toContain("24 of 24");
  });
});
