import { ShieldAlert } from "lucide-react";

export type RiskLevelLabel = "Low" | "Moderate" | "High" | "Critical";

export type RiskSummaryProps = {
  score: number;
  level: RiskLevelLabel;
  signals: string[];
  recommendation: string;
};

function levelTone(level: RiskLevelLabel): string {
  switch (level) {
    case "Low":
      return "border-emerald-500/25 bg-emerald-500/[0.06] text-emerald-900 dark:text-emerald-100";
    case "Moderate":
      return "border-amber-500/30 bg-amber-500/[0.08] text-amber-950 dark:text-amber-100";
    case "High":
      return "border-orange-500/35 bg-orange-500/[0.08] text-orange-950 dark:text-orange-100";
    case "Critical":
      return "border-red-500/40 bg-red-500/[0.08] text-red-950 dark:text-red-100";
    default:
      return "border-border bg-muted/30";
  }
}

function badgeTone(level: RiskLevelLabel): string {
  switch (level) {
    case "Low":
      return "border-emerald-500/40 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200";
    case "Moderate":
      return "border-amber-500/45 bg-amber-500/15 text-amber-950 dark:text-amber-200";
    case "High":
      return "border-orange-500/45 bg-orange-500/15 text-orange-950 dark:text-orange-200";
    case "Critical":
      return "border-red-500/50 bg-red-500/15 text-red-950 dark:text-red-200";
    default:
      return "border-border bg-muted text-foreground";
  }
}

/**
 * Product-style risk block: numeric score, level badge, non-sensitive signal labels, recommendation.
 */
/** Compact badge for lists (VerifyMe User risk level only — no link-level score). */
export function UserRiskStatusBadge({ level }: { level: RiskLevelLabel }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${badgeTone(level)}`}
    >
      {level}
    </span>
  );
}

export function RiskSummary({ score, level, signals, recommendation }: RiskSummaryProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));

  return (
    <div
      className={`relative overflow-hidden rounded-xl border-2 p-5 shadow-sm ${levelTone(level)}`}
      data-testid="risk-summary"
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/[0.07]" aria-hidden />
      <div className="relative flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/80 shadow-sm">
          <ShieldAlert className="h-6 w-6 text-primary" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Risk score</span>
            <span className="font-mono text-3xl font-semibold tabular-nums text-foreground">{clamped}</span>
            <span
              className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[12px] font-medium ${badgeTone(level)}`}
            >
              {level}
            </span>
          </div>

          {signals.length > 0 ? (
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Signals</p>
              <ul className="list-inside list-disc space-y-1 text-[13px] leading-snug text-foreground/90">
                {signals.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-[13px] text-muted-foreground">No elevated signals in the current sample window.</p>
          )}

          <p className="border-t border-border/60 pt-3 text-[13px] leading-relaxed text-muted-foreground">
            {recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
