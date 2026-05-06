import { Outlet } from "react-router";
import {
  LayoutDashboard,
  Building2,
  Users,
  Link2,
  ListChecks,
  Code2,
  Coins,
  ScrollText,
  Settings,
  Shield,
} from "lucide-react";
import { PortalSidebar } from "../../shared/components/PortalSidebar";
import { TopBar } from "../../shared/components/TopBar";

export function PlatformLayout() {
  const navItems = [
    { label: "Dashboard", href: "/", icon: <LayoutDashboard className="w-5 h-5" />, end: true },
    { label: "Organizations", href: "/organizations", icon: <Building2 className="w-5 h-5" /> },
    { label: "VerifyMe Users", href: "/verifyme-users", icon: <Users className="w-5 h-5" /> },
    { label: "Identity Links", href: "/identity-links", icon: <Link2 className="w-5 h-5" /> },
    { label: "Client Apps / API", href: "/client-apps", icon: <Code2 className="w-5 h-5" /> },
    {
      label: "Verification Sessions",
      href: "/verification-sessions",
      icon: <ListChecks className="w-5 h-5" />,
    },
    { label: "Billing & Credits", href: "/billing", icon: <Coins className="w-5 h-5" /> },
    { label: "Audit Logs", href: "/audit-logs", icon: <ScrollText className="w-5 h-5" /> },
    { label: "Platform Team & Access", href: "/platform-team", icon: <Users className="w-5 h-5" /> },
    { label: "Platform Settings", href: "/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const logo = (
    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
      <Shield className="w-5 h-5 text-primary-foreground" />
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <PortalSidebar title="VerifyMe Admin" items={navItems} logo={logo} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="VerifyMe Admin Portal" />
        <main className="flex-1 overflow-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
