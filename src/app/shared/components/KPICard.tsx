import { Card } from "./ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "./ui/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

export function KPICard({ title, value, change, changeLabel, icon, trend }: KPICardProps) {
  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="w-4 h-4" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend === "up") return "text-green-600";
    if (trend === "down") return "text-red-600";
    return "text-muted-foreground";
  };

  return (
    <Card className="p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[13px] text-muted-foreground mb-1">{title}</p>
          <p className="text-[28px] font-semibold text-foreground mb-2">{value}</p>
          
          {(change !== undefined || changeLabel) && (
            <div className={cn("flex items-center gap-1 text-[13px]", getTrendColor())}>
              {trend && getTrendIcon()}
              {change !== undefined && (
                <span>
                  {change > 0 ? "+" : ""}
                  {change}%
                </span>
              )}
              {changeLabel && <span className="text-muted-foreground ml-1">{changeLabel}</span>}
            </div>
          )}
        </div>
        
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
