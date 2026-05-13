import type { ReactNode } from "react";
import { NavLink } from "react-router";
import { cn } from "./ui/utils";
import logoImage from "../../../imports/image-0.png";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  /** When true, only exact path matches (e.g. dashboard at `/`). */
  end?: boolean;
  /** Lower emphasis for preview roles that keep the link visible for testing. */
  dimmed?: boolean;
}

interface PortalSidebarProps {
  title: string;
  items: NavItem[];
  logo?: ReactNode;
  /** Tighter layout for platform admin shell */
  compact?: boolean;
}

export function PortalSidebar({ title, items, logo, compact }: PortalSidebarProps) {
  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-card",
        compact ? "w-[13.5rem]" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center border-b border-border/80",
          compact ? "min-h-[4.25rem] px-3 py-2" : "min-h-24 px-4 py-3",
        )}
      >
        <div className={cn("flex w-full flex-col gap-1", compact ? "items-start" : "items-center gap-1.5")}>
          {logo && (
            <div className={cn("flex items-center text-primary", compact ? "h-6" : "h-7 w-full justify-center")}>
              {logo}
            </div>
          )}
          <img
            src={logoImage}
            alt="VerifyMe"
            className={cn("w-auto object-contain", compact ? "h-7 max-w-[9.5rem]" : "h-9 max-w-full")}
          />
          <p className={cn("leading-tight text-muted-foreground", compact ? "text-left text-[10px]" : "text-center text-[11px] leading-none")}>
            {title}
          </p>
        </div>
      </div>

      <nav className={cn("flex-1 overflow-y-auto", compact ? "space-y-0.5 px-2 py-2" : "space-y-1 px-3 py-4")}>
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-md transition-colors duration-150",
                compact ? "gap-2.5 px-2.5 py-1.5 text-[13px] leading-snug" : "gap-3 rounded-lg px-3 py-2 text-[14px]",
                item.dimmed && !isActive && "text-muted-foreground opacity-55",
                isActive
                  ? compact
                    ? "border border-primary/25 bg-primary/10 font-semibold text-primary shadow-sm"
                    : "bg-primary text-primary-foreground opacity-100 shadow-sm"
                  : "text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground",
              )
            }
          >
            <span className={cn("flex shrink-0 items-center justify-center", compact ? "h-4 w-4 [&_svg]:h-4 [&_svg]:w-4" : "h-5 w-5")}>
              {item.icon}
            </span>
            <span className="min-w-0 truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={cn("border-t border-border/80", compact ? "px-2 py-2" : "p-4")}>
        <p className={cn("text-muted-foreground", compact ? "text-center text-[10px]" : "text-center text-[11px]")}>© 2026 VerifyMe</p>
      </div>
    </aside>
  );
}
