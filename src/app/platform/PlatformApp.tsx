import { useMemo } from "react";
import { RouterProvider } from "react-router";
import { getPlatformRouter } from "./routes";
import { ErrorBoundary } from "../shared/components/ErrorBoundary";

export function PlatformApp() {
  // Create a fresh router instance to ensure all routes are registered
  const router = useMemo(() => {
    console.log('[PlatformApp] Creating router instance');
    return getPlatformRouter();
  }, []);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} key="platform-router" />
    </ErrorBoundary>
  );
}