import { Outlet } from "react-router";
import { LayoutDashboard, Users, Settings, CreditCard, BarChart3, Building2, UserCheck } from "lucide-react";
import { PortalSidebar } from "../../shared/components/PortalSidebar";
import { TopBar } from "../../shared/components/TopBar";

export function EnterpriseLayout() {
  const navItems = [
    { label: "Dashboard", href: "/", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "End Users", href: "/end-users", icon: <UserCheck className="w-5 h-5" /> },
    { label: "Users", href: "/users", icon: <Users className="w-5 h-5" /> },
    { label: "Usage", href: "/usage", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "Billing", href: "/billing", icon: <CreditCard className="w-5 h-5" /> },
    { label: "Settings", href: "/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const logo = (
    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
      <Building2 className="w-5 h-5 text-primary-foreground" />
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <PortalSidebar title="Acme Corp" items={navItems} logo={logo} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Organization Portal" />
        <main className="flex-1 overflow-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
