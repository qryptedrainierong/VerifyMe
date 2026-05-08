type AuditHintTextProps = {
  text?: string;
  className?: string;
};

export function AuditHintText({
  text = "This action will be recorded in audit logs.",
  className,
}: AuditHintTextProps) {
  return (
    <p className={`rounded-md border border-border/80 bg-muted/30 px-3 py-2 text-[12px] text-muted-foreground ${className ?? ""}`.trim()}>
      {text}
    </p>
  );
}
