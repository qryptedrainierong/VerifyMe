import { Filter } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "./ui/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  onSearch?: (value: string) => void;
  filters?: Array<{
    label: string;
    options: FilterOption[];
    onChange?: (value: string) => void;
  }>;
  actions?: React.ReactNode;
  className?: string;
}

export function FilterBar({ onSearch, filters, actions, className }: FilterBarProps) {
  return (
    <div className={cn("flex items-center gap-3 border-b border-border bg-card p-4", className)}>
      {onSearch && (
        <Input
          placeholder="Search..."
          onChange={(e) => onSearch(e.target.value)}
          className="max-w-xs bg-background"
        />
      )}
      
      {filters && filters.length > 0 && (
        <>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {filters.map((filter, index) => (
              <Select key={index} onValueChange={filter.onChange}>
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        </>
      )}
      
      <div className="flex-1" />
      
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
