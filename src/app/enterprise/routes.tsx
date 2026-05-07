import { createBrowserRouter } from "react-router";
import { EnterpriseLayout } from "./pages/EnterpriseLayout";
import { EnterpriseDashboard } from "./pages/EnterpriseDashboard";
import { EnterpriseEndUsers } from "./pages/EnterpriseEndUsers";
import { EnterpriseLinkedEndUserDetail } from "./pages/EnterpriseLinkedEndUserDetail";
import { EnterpriseTeam } from "./pages/EnterpriseTeam";
import { EnterpriseTeamMemberDetail } from "./pages/EnterpriseTeamMemberDetail";
import { EnterpriseUsage } from "./pages/EnterpriseUsage";
import { EnterpriseBilling } from "./pages/EnterpriseBilling";
import { EnterpriseSettings } from "./pages/EnterpriseSettings";
import { EnterpriseVerificationLogs } from "./pages/EnterpriseVerificationLogs";
import { EnterpriseApiIntegration } from "./pages/EnterpriseApiIntegration";
import { EnterpriseQrLinking } from "./pages/EnterpriseQrLinking";
import { PortalNotFound } from "../shared/components/PortalNotFound";

// Lazy router creation to prevent HMR connection errors
// Reset router on each call to ensure fresh state
export function getEnterpriseRouter() {
  return createBrowserRouter(
    [
      {
        path: "/",
        Component: EnterpriseLayout,
        children: [
          { index: true, Component: EnterpriseDashboard },
          { path: "linked-end-users/:recordId", Component: EnterpriseLinkedEndUserDetail },
          { path: "linked-end-users", Component: EnterpriseEndUsers },
          { path: "verification-logs", Component: EnterpriseVerificationLogs },
          { path: "api-integration", Component: EnterpriseApiIntegration },
          { path: "qr-linking", Component: EnterpriseQrLinking },
          { path: "team-roles/:memberId", Component: EnterpriseTeamMemberDetail },
          { path: "team-roles", Component: EnterpriseTeam },
          { path: "usage-credits", Component: EnterpriseUsage },
          { path: "billing", Component: EnterpriseBilling },
          { path: "settings", Component: EnterpriseSettings },
          { path: "*", Component: EnterpriseNotFoundPage },
        ],
      },
    ],
    {
      future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
        v7_fetcherPersist: true,
        v7_normalizeFormMethod: true,
        v7_partialHydration: true,
        v7_skipActionErrorRevalidation: true,
      },
    }
  );
}

function EnterpriseNotFoundPage() {
  return <PortalNotFound scope="organization" />;
}