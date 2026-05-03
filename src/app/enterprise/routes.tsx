import { createBrowserRouter } from "react-router";
import { EnterpriseLayout } from "./pages/EnterpriseLayout";
import { EnterpriseDashboard } from "./pages/EnterpriseDashboard";
import { EnterpriseEndUsers } from "./pages/EnterpriseEndUsers";
import { EnterpriseTeam } from "./pages/EnterpriseTeam";
import { EnterpriseUsage } from "./pages/EnterpriseUsage";
import { EnterpriseBilling } from "./pages/EnterpriseBilling";
import { EnterpriseSettings } from "./pages/EnterpriseSettings";

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
          { path: "end-users", Component: EnterpriseEndUsers },
          { path: "users", Component: EnterpriseTeam },
          { path: "team", Component: EnterpriseTeam },
          { path: "usage", Component: EnterpriseUsage },
          { path: "billing", Component: EnterpriseBilling },
          { path: "settings", Component: EnterpriseSettings },
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
    }
  );
}

function NotFoundPage() {
  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto text-center py-20">
        <h2 className="text-[24px] font-semibold text-foreground mb-2">Page Not Found</h2>
        <p className="text-[15px] text-muted-foreground">
          The page you're looking for doesn't exist in the organization portal.
        </p>
      </div>
    </div>
  );
}