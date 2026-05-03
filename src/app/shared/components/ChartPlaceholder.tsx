import { Card } from "./ui/card";
import { BarChart3 } from "lucide-react";

interface ChartPlaceholderProps {
  title: string;
  height?: number;
}

export function ChartPlaceholder({ title, height = 300 }: ChartPlaceholderProps) {
  return (
    <Card className="p-6 shadow-sm">
      <h3 className="text-[15px] font-semibold text-foreground mb-4">{title}</h3>
      <div
        className="border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/20"
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-[13px] text-muted-foreground">Chart visualization</p>
        </div>
      </div>
    </Card>
  );
}
