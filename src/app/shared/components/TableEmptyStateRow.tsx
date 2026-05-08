type TableEmptyStateRowProps = {
  colSpan: number;
  title: string;
  guidance?: string;
  className?: string;
};

export function TableEmptyStateRow({
  colSpan,
  title,
  guidance = "Try adjusting search or filters.",
  className,
}: TableEmptyStateRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className={`px-6 py-12 text-center text-sm text-muted-foreground ${className ?? ""}`.trim()}>
        <p>{title}</p>
        <p className="mt-1 text-xs">{guidance}</p>
      </td>
    </tr>
  );
}
