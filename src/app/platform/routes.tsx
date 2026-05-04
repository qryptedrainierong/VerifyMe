import { createBrowserRouter } from "react-router";
import { PlatformLayout } from "./pages/PlatformLayout";
import { PlatformDashboard } from "./pages/PlatformDashboard";
import { PlatformOrganizations } from "./pages/PlatformOrganizations";
import { PlatformOrganizationDetail } from "./pages/PlatformOrganizationDetail";
import { PlatformUsers } from "./pages/PlatformUsers";
import { PlatformBilling } from "./pages/PlatformBilling";
import { PlatformAuditLogs } from "./pages/PlatformAuditLogs";
import { PlatformSettings } from "./pages/PlatformSettings";
import { PlatformClientApps, PlatformIdentityLinks } from "./pages/PlatformIaPlaceholders";
import { PlatformVerificationSessions } from "./pages/PlatformVerificationSessions";

// Lazy router creation to prevent HMR connection errors
// Reset router on each call to ensure fresh state
export function getPlatformRouter() {
  return createBrowserRouter(
    [
      {
        path: "/",
        Component: PlatformLayout,
        children: [
          { index: true, Component: PlatformDashboard },
          {
            path: "organizations",
            Component: PlatformOrganizations,
          },
          {
            path: "organizations/:id",
            Component: PlatformOrganizationDetail,
          },
          { path: "verifyme-users", Component: PlatformUsers },
          { path: "identity-links", Component: PlatformIdentityLinks },
          { path: "verification-sessions", Component: PlatformVerificationSessions },
          { path: "client-apps", Component: PlatformClientApps },
          { path: "billing", Component: PlatformBilling },
          { path: "audit-logs", Component: PlatformAuditLogs },
          { path: "settings", Component: PlatformSettings },
          { path: "*", Component: NotFoundPage },
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
    },
  );
}

function NotFoundPage() {
  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto text-center py-20">
        <h2 className="text-[24px] font-semibold text-foreground mb-2">
          Page Not Found
        </h2>
        <p className="text-[15px] text-muted-foreground">
          The page you're looking for doesn't exist in the
          platform admin portal.
        </p>
      </div>
    </div>
  );
}