import { Outlet } from "react-router";
import { LayoutDashboard, Building2, Users, UserCog, Settings, BarChart3, CreditCard, ScrollText, Shield, NotebookText } from "lucide-react";
import { PortalSidebar } from "../../shared/components/PortalSidebar";
import { TopBar } from "../../shared/components/TopBar";

export function PlatformLayout() {
  const navItems = [
    { label: "Dashboard", href: "/", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Organizations", href: "/organizations", icon: <Building2 className="w-5 h-5" /> },
    { label: "Usage", href: "/usage", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "Billing", href: "/billing", icon: <CreditCard className="w-5 h-5" /> },
    { label: "End Users", href: "/end-users", icon: <Users className="w-5 h-5" /> },
    { label: "Users", href: "/users", icon: <UserCog className="w-5 h-5" /> },
    { label: "Settings", href: "/settings", icon: <Settings className="w-5 h-5" /> },
    { label: "Audit Logs", href: "/audit-logs", icon: <ScrollText className="w-5 h-5" /> },
    { label: "Error Logs", href: "/error-logs", icon: <NotebookText className="w-5 h-5" /> },
  ];

  const logo = (
    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
      <Shield className="w-5 h-5 text-primary-foreground" />
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <PortalSidebar title="Platform Admin" items={navItems} logo={logo} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Platform Administration" />
        <main className="flex-1 overflow-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
