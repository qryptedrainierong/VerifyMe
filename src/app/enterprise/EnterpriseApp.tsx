import { useMemo } from "react";
import { RouterProvider } from "react-router";
import { getEnterpriseRouter } from "./routes";
import { ErrorBoundary } from "../shared/components/ErrorBoundary";

// Enterprise Portal with End-User Management
export function EnterpriseApp() {
  // Create a fresh router instance to ensure all routes are registered
  const router = useMemo(() => {
    console.log('[EnterpriseApp] Creating router instance');
    return getEnterpriseRouter();
  }, []);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} key="enterprise-router" />
    </ErrorBoundary>
  );
}