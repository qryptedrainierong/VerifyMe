import { Outlet, useLocation } from "react-router";
import { usePlatformRole } from "../context/PlatformRoleContext";
import { canAccessPlatformRoute, pathnameToSection } from "../utils/platformRolePermissions";
import { PlatformAccessDenied } from "./PlatformAccessDenied";

/**
 * Blocks child routes when the current path is not allowed for the preview role.
 * Does not render page content for denied sections (no data leakage behind a banner).
 */
export function PlatformRouteGuard() {
  const { role } = usePlatformRole();
  const { pathname } = useLocation();
  const section = pathnameToSection(pathname);

  if (section !== null && !canAccessPlatformRoute(role, section)) {
    return <PlatformAccessDenied role={role} />;
  }

  return <Outlet />;
}
