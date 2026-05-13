import { Search, Settings } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../../shared/components/ui/button";
import { Input } from "../../shared/components/ui/input";
import { PlatformNotificationBell } from "./PlatformNotificationBell";
import { PlatformUserMenu } from "./PlatformUserMenu";

type PlatformShellTopBarProps = {
  title?: string;
  showSearch?: boolean;
};

export function PlatformShellTopBar({ title, showSearch = true }: PlatformShellTopBarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/80 bg-card/95 px-4 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80 sm:gap-4 sm:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        {title ? (
          <h1 className="hidden shrink-0 text-[12px] font-medium leading-none tracking-tight text-muted-foreground sm:block sm:text-[13px]">
            {title}
          </h1>
        ) : null}
        {showSearch ? (
          <div className="relative w-full max-w-[10.5rem] flex-none sm:max-w-[12.5rem]">
            <Search
              className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70"
              aria-hidden
            />
            <Input
              placeholder="Search"
              className="h-8 border-border/70 bg-background/80 py-0 pl-8 pr-2 text-[13px] shadow-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-1"
            />
          </div>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
        <PlatformNotificationBell />
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-accent hover:text-foreground" asChild>
          <Link to="/platform-preferences" aria-label="Preferences">
            <Settings className="h-4 w-4" />
          </Link>
        </Button>
        <div className="mx-0.5 hidden h-5 w-px bg-border sm:mx-1 sm:block" />
        <PlatformUserMenu />
      </div>
    </header>
  );
}
