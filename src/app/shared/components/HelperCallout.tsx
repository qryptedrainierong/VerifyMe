import type { ReactNode } from "react";

type HelperCalloutProps = {
  children: ReactNode;
  className?: string;
};

export function HelperCallout({ children, className }: HelperCalloutProps) {
  return (
    <p
      className={`rounded-md border border-border/80 bg-muted/30 px-3 py-2 text-xs text-muted-foreground sm:text-sm ${className ?? ""}`.trim()}
    >
      {children}
    </p>
  );
}
