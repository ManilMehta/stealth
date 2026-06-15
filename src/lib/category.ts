import type { RiskCategory } from "@/domain/types";

export interface CategoryMeta {
  /** Tailwind classes for a badge (background + text). */
  readonly badgeClass: string;
  /** Hex color for SVG charts and the PDF report. */
  readonly color: string;
  /** Short plain-language description of the category. */
  readonly blurb: string;
}

export const CATEGORY_META: Record<RiskCategory, CategoryMeta> = {
  Low: {
    badgeClass: "bg-emerald-100 text-emerald-800",
    color: "#059669",
    blurb: "Your estimated genetic risk for CAD is below average.",
  },
  Average: {
    badgeClass: "bg-sky-100 text-sky-800",
    color: "#0284c7",
    blurb: "Your estimated genetic risk for CAD is around the population average.",
  },
  Elevated: {
    badgeClass: "bg-amber-100 text-amber-800",
    color: "#d97706",
    blurb: "Your estimated genetic risk for CAD is above average.",
  },
  High: {
    badgeClass: "bg-rose-100 text-rose-800",
    color: "#e11d48",
    blurb: "Your estimated genetic risk for CAD is among the highest in the population.",
  },
};
