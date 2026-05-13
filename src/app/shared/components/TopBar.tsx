import type { ReactNode } from "react";
import { Bell, Search, Settings, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface TopBarProps {
  title?: string;
  showSearch?: boolean;
  /** When set, replaces the default user label control (e.g. platform role preview menu). */
  userMenu?: ReactNode;
}

export function TopBar({ title, showSearch = true, userMenu }: TopBarProps) {
  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-6 flex-1">
        {title && (
          <h1 className="text-sm font-medium tracking-tight text-muted-foreground">{title}</h1>
        )}

        {showSearch && (
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-10 h-9 bg-background border-border"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="w-9 h-9 hover:bg-accent">
          <Bell className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="w-9 h-9 hover:bg-accent">
          <Settings className="w-4 h-4" />
        </Button>
        <div className="h-6 w-px bg-border mx-1" />
        {userMenu ?? (
          <Button variant="ghost" size="sm" className="h-9 px-2 hover:bg-accent">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center mr-2">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-[13px]">Admin</span>
          </Button>
        )}
      </div>
    </header>
  );
}
