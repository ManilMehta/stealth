import type { RiskCategory } from "@/domain/types";

/** Inputs needed to generate a plain-language explanation of a result. */
export interface ExplanationInput {
  readonly category: RiskCategory;
  readonly percentile: number;
  readonly matchedSnps: number;
  readonly totalSnps: number;
}

export type ExplanationSource = "gemini" | "templated";

export interface Explanation {
  readonly text: string;
  readonly source: ExplanationSource;
}
