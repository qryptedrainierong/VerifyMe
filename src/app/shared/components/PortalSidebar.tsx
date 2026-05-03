import { NavLink } from "react-router";
import { cn } from "./ui/utils";
import logoImage from "../../../imports/image-0.png";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface PortalSidebarProps {
  title: string;
  items: NavItem[];
  logo?: React.ReactNode;
}

export function PortalSidebar({ title, items, logo }: PortalSidebarProps) {
  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-screen sticky top-0">
      <div className="h-24 flex items-center px-4 border-b border-border">
        <div className="flex flex-col gap-2 w-full items-center">
          <img src={logoImage} alt="VerifyMe" className="h-10 w-auto max-w-full object-contain" />
          <p className="text-[11px] text-muted-foreground leading-none text-center">
            {title}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-[14px]",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <p className="text-[11px] text-muted-foreground text-center">
          © 2024 VerifyMe
        </p>
      </div>
    </aside>
  );
}
