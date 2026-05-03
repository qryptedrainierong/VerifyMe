import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="p-12 shadow-sm">
      <div className="text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
          {icon}
        </div>
        <h3 className="text-[16px] font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-[14px] text-muted-foreground mb-6">{description}</p>
        {action && (
          <Button onClick={action.onClick}>{action.label}</Button>
        )}
      </div>
    </Card>
  );
}
