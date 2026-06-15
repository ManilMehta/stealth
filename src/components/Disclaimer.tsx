/** Text shared by the results page and the PDF report. */
export const DISCLAIMER_TEXT =
  "This is a non-clinical Phase-0 demonstration. The polygenic risk score uses a " +
  "simplified, illustrative SNP model and is not a validated medical test. It does " +
  "not diagnose disease and must not be used for medical decisions. Consult a " +
  "qualified healthcare professional for any health concerns.";

export function Disclaimer() {
  return (
    <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
      <span className="font-semibold text-slate-600">Disclaimer. </span>
      {DISCLAIMER_TEXT}
    </p>
  );
}
