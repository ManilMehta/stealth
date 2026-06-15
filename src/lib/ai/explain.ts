import { geminiExplanation } from "./gemini";
import { templatedExplanation } from "./templated";
import type { Explanation, ExplanationInput } from "./types";

/**
 * Generate a plain-language explanation for a result.
 *
 * Uses Gemini when an API key is provided; on any failure (or when no key is
 * configured) it falls back to the deterministic templated explanation, so the
 * feature always works and stays $0.
 */
export async function generateExplanation(
  input: ExplanationInput,
  apiKey: string | undefined = process.env.GEMINI_API_KEY,
): Promise<Explanation> {
  if (apiKey) {
    try {
      const text = await geminiExplanation(input, apiKey);
      return { text, source: "gemini" };
    } catch {
      // Fall through to the templated explanation.
    }
  }

  return { text: templatedExplanation(input), source: "templated" };
}
