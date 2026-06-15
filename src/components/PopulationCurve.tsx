import { percentileToZ } from "@/domain/risk";

interface PopulationCurveProps {
  percentile: number;
  color: string;
}

const WIDTH = 560;
const HEIGHT = 200;
const PAD = 24;
const Z_RANGE = 3.4;

function standardNormalPdf(z: number): number {
  return Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI);
}

function zToX(z: number): number {
  return PAD + ((z + Z_RANGE) / (2 * Z_RANGE)) * (WIDTH - 2 * PAD);
}

function pdfToY(pdf: number): number {
  const peak = standardNormalPdf(0);
  return HEIGHT - PAD - (pdf / peak) * (HEIGHT - 2 * PAD);
}

/**
 * Bell-curve population comparison: the standard-normal distribution with the
 * user's position marked and the lower-percentile area shaded.
 */
export function PopulationCurve({ percentile, color }: PopulationCurveProps) {
  const samples: { z: number; x: number; y: number }[] = [];
  const steps = 120;
  for (let i = 0; i <= steps; i++) {
    const z = -Z_RANGE + (i / steps) * (2 * Z_RANGE);
    samples.push({ z, x: zToX(z), y: pdfToY(standardNormalPdf(z)) });
  }

  const curvePath = samples
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  const markerZ = Math.max(-Z_RANGE, Math.min(Z_RANGE, percentileToZ(percentile)));
  const markerX = zToX(markerZ);
  const baseY = pdfToY(0);

  const areaSamples = samples.filter((p) => p.z <= markerZ);
  const areaPath =
    areaSamples.length > 0
      ? `M ${zToX(-Z_RANGE).toFixed(2)} ${baseY.toFixed(2)} ` +
        areaSamples.map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ") +
        ` L ${markerX.toFixed(2)} ${baseY.toFixed(2)} Z`
      : "";

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full"
      role="img"
      aria-label={`Population distribution with your position at the ${percentile}th percentile`}
    >
      {areaPath ? <path d={areaPath} fill={color} fillOpacity={0.18} /> : null}
      <path d={curvePath} fill="none" stroke="#94a3b8" strokeWidth={2} />
      <line
        x1={markerX}
        y1={pdfToY(standardNormalPdf(markerZ))}
        x2={markerX}
        y2={baseY}
        stroke={color}
        strokeWidth={2.5}
      />
      <circle cx={markerX} cy={pdfToY(standardNormalPdf(markerZ))} r={5} fill={color} />
      <line
        x1={PAD}
        y1={baseY}
        x2={WIDTH - PAD}
        y2={baseY}
        stroke="#cbd5e1"
        strokeWidth={1}
      />
      <text
        x={markerX}
        y={pdfToY(standardNormalPdf(markerZ)) - 10}
        textAnchor="middle"
        className="fill-slate-700 text-[11px] font-semibold"
      >
        You
      </text>
      <text x={zToX(-Z_RANGE)} y={baseY + 16} textAnchor="start" className="fill-slate-400 text-[10px]">
        Lower risk
      </text>
      <text x={zToX(Z_RANGE)} y={baseY + 16} textAnchor="end" className="fill-slate-400 text-[10px]">
        Higher risk
      </text>
    </svg>
  );
}
