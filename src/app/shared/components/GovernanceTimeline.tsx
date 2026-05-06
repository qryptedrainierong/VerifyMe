import type { ReactNode } from "react";

export type GovernanceTimelineItem = {
  id: string;
  timestamp: string;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
};

function formatTimelineTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

/** Compact vertical timeline for risk / conflict / activity governance views. */
export function GovernanceTimeline({ items }: { items: GovernanceTimelineItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No entries yet.</p>;
  }

  return (
    <ul className="relative space-y-0 border-l border-border pl-6">
      {items.map((item, i) => (
        <li key={item.id} className="relative pb-8 last:pb-0">
          <span
            className={`absolute -left-[25px] top-1.5 flex h-3 w-3 rounded-full border-2 border-background ${
              i === 0 ? "bg-primary" : "bg-muted-foreground/50"
            }`}
            aria-hidden
          />
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {formatTimelineTime(item.timestamp)} UTC
          </p>
          <div className="mt-1 text-sm font-medium text-foreground">{item.title}</div>
          {item.subtitle ? (
            <div className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{item.subtitle}</div>
          ) : null}
          {item.meta ? <div className="mt-2 text-[12px] text-muted-foreground">{item.meta}</div> : null}
        </li>
      ))}
    </ul>
  );
}
