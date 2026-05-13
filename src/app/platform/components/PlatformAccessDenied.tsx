import { Link } from "react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "../../shared/components/ui/button";
import { platformRoleLabel } from "../utils/platformRolePermissions";
import type { PlatformRole } from "../utils/platformRolePermissions";

export function PlatformAccessDenied({ role }: { role: PlatformRole }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted/60">
        <ShieldAlert className="h-7 w-7 text-foreground" aria-hidden />
      </div>
      <h1 className="text-xl font-semibold tracking-tight text-foreground">Access not available for this preview role</h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
        You do not have access to this section in the selected preview role:{" "}
        <span className="font-medium text-foreground">{platformRoleLabel(role)}</span>.
      </p>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
        This is a frontend role preview only. Production access must be enforced by backend RBAC.
      </p>
      <Button className="mt-8" asChild>
        <Link to="/">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
