import type { RiskCategory } from "@/domain/types";
import type { Tables } from "@/lib/database.types";

/** A screening result in app-friendly, strongly-typed shape. */
export interface ScreeningResult {
  id: string;
  fileName: string;
  createdAt: string;
  rawScore: number;
  percentile: number;
  category: RiskCategory;
  matchedSnps: number;
  totalSnps: number;
  aiExplanation: string | null;
}

const CATEGORIES: readonly RiskCategory[] = ["Low", "Average", "Elevated", "High"];

function toCategory(value: string): RiskCategory {
  return (CATEGORIES as readonly string[]).includes(value)
    ? (value as RiskCategory)
    : "Average";
}

/** Map a raw `results` row into a {@link ScreeningResult}. */
export function toScreeningResult(row: Tables<"results">): ScreeningResult {
  return {
    id: row.id,
    fileName: row.file_name,
    createdAt: row.created_at,
    rawScore: row.raw_score,
    percentile: row.percentile,
    category: toCategory(row.category),
    matchedSnps: row.matched_snps,
    totalSnps: row.total_snps,
    aiExplanation: row.ai_explanation,
  };
}
