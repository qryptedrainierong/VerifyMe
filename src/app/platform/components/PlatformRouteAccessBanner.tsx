import { Info, Shield } from "lucide-react";
import { useLocation } from "react-router";
import { cn } from "../../shared/components/ui/utils";
import { usePlatformRole } from "../context/PlatformRoleContext";
import { isReadOnlyPreviewRole, isReadOnlyRouteForRole, pathnameToSection } from "../utils/platformRolePermissions";

export function PlatformRouteAccessBanner({ className }: { className?: string }) {
  const { role } = usePlatformRole();
  const { pathname } = useLocation();
  const section = pathnameToSection(pathname);
  const readOnlyGlobal = isReadOnlyPreviewRole(role);
  const readOnlyExtra = section != null && isReadOnlyRouteForRole(role, section);

  if (readOnlyGlobal) {
    return (
      <div
        className={cn(
          "rounded-md border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground",
          className,
        )}
        role="status"
      >
        <div className="flex gap-2">
          <Shield className="h-4 w-4 shrink-0 mt-0.5 text-foreground" aria-hidden />
          <p className="leading-relaxed text-foreground/90">
            <span className="font-medium text-foreground">Read-only access.</span> This role can review records and audit
            history but cannot perform operational changes in this preview.
          </p>
        </div>
      </div>
    );
  }

  if (readOnlyExtra) {
    return (
      <div
        className={cn(
          "rounded-md border border-amber-500/35 bg-amber-50/80 px-4 py-3 text-sm dark:bg-amber-950/25",
          className,
        )}
        role="status"
      >
        <div className="flex gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-900 dark:text-amber-100" aria-hidden />
          <p className="leading-relaxed text-amber-950 dark:text-amber-50">
            <span className="font-medium">Read-only review.</span> This section is not in your primary menu but is
            available for audit review. Mutations are disabled. Production access must follow backend RBAC.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
