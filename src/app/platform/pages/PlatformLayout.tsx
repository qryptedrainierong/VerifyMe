import { useMemo, type ReactElement } from "react";
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
import { PlatformRoleProvider, usePlatformRole } from "../context/PlatformRoleContext";
import { PlatformOperatorExperienceProvider } from "../context/PlatformOperatorExperienceContext";
import { PlatformShellTopBar } from "../components/PlatformShellTopBar";
import { PlatformRouteAccessBanner } from "../components/PlatformRouteAccessBanner";
import { canShowNavSection, type PlatformNavSection } from "../utils/platformRolePermissions";

function PlatformLayoutInner() {
  const { role } = usePlatformRole();

  const navItems = useMemo(() => {
    const defs: Array<{
      label: string;
      href: string;
      icon: ReactElement;
      end?: boolean;
      section: PlatformNavSection;
    }> = [
      { label: "Dashboard", href: "/", icon: <LayoutDashboard className="h-4 w-4" />, end: true, section: "dashboard" },
      { label: "Organizations", href: "/organizations", icon: <Building2 className="h-4 w-4" />, section: "organizations" },
      { label: "VerifyMe Users", href: "/verifyme-users", icon: <Users className="h-4 w-4" />, section: "verifyme_users" },
      { label: "Identity Links", href: "/identity-links", icon: <Link2 className="h-4 w-4" />, section: "identity_links" },
      { label: "Client Apps / API", href: "/client-apps", icon: <Code2 className="h-4 w-4" />, section: "client_apps" },
      {
        label: "Verification Sessions",
        href: "/verification-sessions",
        icon: <ListChecks className="h-4 w-4" />,
        section: "verification_sessions",
      },
      { label: "Billing & Credits", href: "/billing", icon: <Coins className="h-4 w-4" />, section: "billing" },
      { label: "Audit Logs", href: "/audit-logs", icon: <ScrollText className="h-4 w-4" />, section: "audit_logs" },
      { label: "Platform Team & Access", href: "/platform-team", icon: <Users className="h-4 w-4" />, section: "platform_team" },
      { label: "Platform Settings", href: "/settings", icon: <Settings className="h-4 w-4" />, section: "settings" },
    ];

    return defs
      .filter((d) => canShowNavSection(role, d.section))
      .map((d) => ({
        label: d.label,
        href: d.href,
        icon: d.icon,
        end: d.end,
      }));
  }, [role]);

  const logo = (
    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
      <Shield className="h-4 w-4 text-primary-foreground" />
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <PortalSidebar compact title="VerifyMe Admin" items={navItems} logo={logo} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PlatformShellTopBar title="VerifyMe Admin Portal" />
        <div className="shrink-0 border-b border-border/80 bg-card px-4 py-1.5 sm:px-5">
          <PlatformRouteAccessBanner />
        </div>
        <main className="flex-1 overflow-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PlatformLayout() {
  return (
    <PlatformRoleProvider>
      <PlatformOperatorExperienceProvider>
        <PlatformLayoutInner />
      </PlatformOperatorExperienceProvider>
    </PlatformRoleProvider>
  );
}
