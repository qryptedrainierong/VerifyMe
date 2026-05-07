import { Outlet } from "react-router";
import {
  LayoutDashboard,
  Link2,
  ScrollText,
  Plug,
  QrCode,
  UsersRound,
  CircleDollarSign,
  CreditCard,
  Settings,
  Building2,
} from "lucide-react";
import { PortalSidebar } from "../../shared/components/PortalSidebar";
import { TopBar } from "../../shared/components/TopBar";
import { enterpriseOrganization } from "../data/enterpriseSample";

export function EnterpriseLayout() {
  const navItems = [
    { label: "Dashboard", href: "/", icon: <LayoutDashboard className="w-5 h-5" />, end: true },
    { label: "Linked End Users", href: "/linked-end-users", icon: <Link2 className="w-5 h-5" /> },
    { label: "Verification Logs", href: "/verification-logs", icon: <ScrollText className="w-5 h-5" /> },
    { label: "Usage & Credits", href: "/usage-credits", icon: <CircleDollarSign className="w-5 h-5" /> },
    { label: "Billing", href: "/billing", icon: <CreditCard className="w-5 h-5" /> },
    { label: "API Integration", href: "/api-integration", icon: <Plug className="w-5 h-5" /> },
    { label: "QR Linking", href: "/qr-linking", icon: <QrCode className="w-5 h-5" /> },
    { label: "Team & Roles", href: "/team-roles", icon: <UsersRound className="w-5 h-5" /> },
    { label: "Settings", href: "/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const logo = (
    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
      <Building2 className="w-5 h-5 text-primary-foreground" />
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <PortalSidebar title={enterpriseOrganization.organizationName} items={navItems} logo={logo} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Organization Admin Portal" />
        <main className="flex-1 overflow-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
