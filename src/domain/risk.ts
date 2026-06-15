import { computeRawScore } from "./prs";
import { CAD_REFERENCE, CAD_SNP_COUNT, CAD_SNP_WEIGHTS } from "./snpWeights";
import type {
  ParsedGenome,
  PrsResult,
  ReferenceDistribution,
  RiskCategory,
} from "./types";

/**
 * Standard normal cumulative distribution function.
 *
 * Uses the Abramowitz & Stegun 7.1.26 approximation of erf, which is
 * deterministic and accurate to ~1e-7 -- more than enough for percentile
 * rounding.
 */
export function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);

  const t = 1 / (1 + 0.3275911 * absX);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-absX * absX);

  return sign * y;
}

/**
 * Convert a raw PRS into an integer percentile (1..99) relative to the
 * reference distribution.
 */
export function scoreToPercentile(
  rawScore: number,
  reference: ReferenceDistribution,
): number {
  const z = (rawScore - reference.mean) / reference.sd;
  const percentile = Math.round(normalCdf(z) * 100);
  return clamp(percentile, 1, 99);
}

/**
 * Map a percentile to a risk category. Thresholds are illustrative for the
 * demo: Low (<25), Average (25-74), Elevated (75-89), High (>=90).
 */
export function categorize(percentile: number): RiskCategory {
  if (percentile < 25) return "Low";
  if (percentile < 75) return "Average";
  if (percentile < 90) return "Elevated";
  return "High";
}

/**
 * Assess a parsed genome against the CAD PRS model end-to-end.
 */
export function assessCad(genome: ParsedGenome): PrsResult {
  const { rawScore, matchedSnps } = computeRawScore(genome, CAD_SNP_WEIGHTS);
  const percentile = scoreToPercentile(rawScore, CAD_REFERENCE);

  return {
    rawScore,
    percentile,
    category: categorize(percentile),
    matchedSnps,
    totalSnps: CAD_SNP_COUNT,
  };
}

/**
 * Inverse standard-normal CDF (probit) via Acklam's rational approximation.
 * Accurate to ~1e-9 across (0, 1). Used to place a percentile on a bell curve.
 */
export function probit(p: number): number {
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (p <= pHigh) {
    const q = p - 0.5;
    const r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  }
  const q = Math.sqrt(-2 * Math.log(1 - p));
  return -(
    (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  );
}

/** Convert an integer percentile (1..99) to its standard-normal z-score. */
export function percentileToZ(percentile: number): number {
  return probit(clamp(percentile, 1, 99) / 100);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
