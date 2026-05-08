import { Button } from "./ui/button";

type ScopedFilterBannerProps = {
  entityLabel?: string;
  scopedValue: string;
  isKnown: boolean;
  onClear?: () => void;
  unknownHelperText?: string;
  className?: string;
};

export function ScopedFilterBanner({
  entityLabel = "organization",
  scopedValue,
  isKnown,
  onClear,
  unknownHelperText = "This scoped value was not found in available records.",
  className,
}: ScopedFilterBannerProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md border border-border/80 bg-muted/30 px-3 py-2 text-xs text-muted-foreground sm:text-sm ${className ?? ""}`.trim()}
    >
      <span>
        Filtered by {entityLabel}: <span className="font-mono text-foreground">{scopedValue}</span>
        {!isKnown ? ` (${unknownHelperText})` : " (applied from URL scope)."}
      </span>
      {onClear ? (
        <Button variant="outline" size="sm" className="h-7" onClick={onClear}>
          Clear
        </Button>
      ) : null}
    </div>
  );
}
