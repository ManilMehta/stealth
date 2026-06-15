import type { RiskCategory } from "@/domain/types";
import type { ExplanationInput } from "./types";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}

const INTERPRETATION: Record<RiskCategory, string> = {
  Low: "your genetic contribution to CAD risk appears lower than most people in the reference population. Genetics is only one piece of the puzzle, so this is encouraging but not a guarantee.",
  Average:
    "your genetic contribution to CAD risk is similar to most people in the reference population. This is the most common result and reflects typical baseline risk.",
  Elevated:
    "your genetic contribution to CAD risk is higher than the majority of the reference population. This does not mean you will develop disease, but it is a useful signal.",
  High: "your genetic contribution to CAD risk is among the highest in the reference population. A high polygenic score raises the importance of monitoring modifiable risk factors.",
};

/**
 * Deterministic, $0 plain-language explanation. Used as the default and as a
 * fallback when no LLM is configured. Covers a plain summary, an educational
 * interpretation, and lifestyle guidance with a disclaimer.
 */
export function templatedExplanation(input: ExplanationInput): string {
  const { category, percentile, matchedSnps, totalSnps } = input;

  const summary = `Your Coronary Artery Disease (CAD) polygenic risk score places you in the ${ordinal(
    percentile,
  )} percentile, which we classify as ${category} risk.`;

  const interpretation = `In plain terms, ${INTERPRETATION[category]} This estimate is based on ${matchedSnps} of ${totalSnps} genetic markers (SNPs) found in your file.`;

  const education =
    "A polygenic risk score (PRS) adds up the small effects of many common genetic variants. It reflects inherited predisposition only - it does not account for diet, exercise, smoking, blood pressure, cholesterol, or family history, all of which strongly influence real-world heart health.";

  const lifestyle =
    "General heart-healthy habits benefit everyone regardless of score: not smoking, staying physically active, eating a balanced diet, and keeping blood pressure and cholesterol in check. This is general educational information, not medical advice - please discuss any concerns with a qualified healthcare professional.";

  return [summary, interpretation, education, lifestyle].join("\n\n");
}
