import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ExplanationInput } from "./types";

function buildPrompt(input: ExplanationInput): string {
  return [
    "You are a careful, friendly genetic-health educator writing for a layperson.",
    "Write a short explanation (about 4 short paragraphs) of a Coronary Artery Disease (CAD)",
    "polygenic risk score result. Include: (1) a plain-language summary of what the result means,",
    "(2) an educational note on what a polygenic risk score is and its limitations,",
    "(3) general lifestyle guidance, and (4) a clear statement that this is not medical advice.",
    "Be reassuring and non-alarmist. Do not invent specific numbers beyond those given.",
    "",
    `Result: ${input.category} risk, ${input.percentile}th percentile,`,
    `based on ${input.matchedSnps} of ${input.totalSnps} genetic markers.`,
  ].join(" ");
}

/**
 * Generate an explanation via Google's free-tier Gemini model.
 * Throws on any error so the caller can fall back to the templated version.
 */
export async function geminiExplanation(
  input: ExplanationInput,
  apiKey: string,
): Promise<string> {
  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  const response = await model.generateContent(buildPrompt(input));
  const text = response.response.text().trim();
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }
  return text;
}
