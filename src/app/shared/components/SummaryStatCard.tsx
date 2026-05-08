import type { ReactNode } from "react";
import { Card } from "./ui/card";

type SummaryStatCardProps = {
  label: string;
  value: string | number;
  valueClassName?: string;
  hint?: string;
  footer?: ReactNode;
  className?: string;
};

export function SummaryStatCard({
  label,
  value,
  valueClassName,
  hint,
  footer,
  className,
}: SummaryStatCardProps) {
  return (
    <Card className={`border border-border p-4 shadow-sm ${className ?? ""}`.trim()}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums tracking-tight ${valueClassName ?? "text-foreground"}`}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
      {footer ? <div className="mt-2">{footer}</div> : null}
    </Card>
  );
}
