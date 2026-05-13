import { Link } from "react-router";
import { Button } from "../../shared/components/ui/button";
import { Card } from "../../shared/components/ui/card";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";
import { usePlatformRole } from "../context/PlatformRoleContext";
import { usePlatformOperatorExperience } from "../context/PlatformOperatorExperienceContext";
import { buildPlatformOperatorProfile, formatOperatorTimestamp } from "../data/platformOperatorProfile";
import { platformRoleDescription } from "../utils/platformRolePermissions";

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border py-2.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

export function PlatformProfile() {
  const { role } = usePlatformRole();
  const profile = buildPlatformOperatorProfile(role);
  const { preferences } = usePlatformOperatorExperience();

  return (
    <PortalPageFrame
      title="Platform operator profile"
      description="Account summary for the signed-in platform administrator. Identity and authorization are not enforced in this frontend build."
      headerActions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/platform-security">Security settings</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/platform-preferences">Preferences</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/audit-logs">View audit logs</Link>
          </Button>
        </div>
      }
      bodyClassName="space-y-6"
    >
      <Card className="border border-border p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Profile &amp; status</h2>
        <div className="mt-3 divide-y divide-border rounded-md border border-border px-4">
          <MetaRow label="Full name" value={profile.fullName} />
          <MetaRow label="Email" value={profile.email} />
          <MetaRow label="Platform Admin ID" value={profile.platformAdminId} />
          <MetaRow label="Selected role" value={profile.roleLabel} />
          <MetaRow label="Department" value={profile.department} />
          <MetaRow label="Status" value={profile.status === "active" ? "Active" : profile.status} />
          <MetaRow label="Last login" value={formatOperatorTimestamp(profile.lastLoginAt)} />
          <MetaRow label="Last activity" value={formatOperatorTimestamp(profile.lastActivityAt)} />
        </div>
      </Card>

      <Card className="border border-border p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Role context</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Preview role:</span> {profile.roleLabel}
        </p>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{platformRoleDescription(role)}</p>
        <p className="mt-3 rounded-md border border-border bg-muted/30 px-3 py-2 text-[12px] text-muted-foreground leading-relaxed">
          Role preview changes visible portal areas. Production access must be enforced by backend RBAC.
        </p>
      </Card>

      <Card className="border border-border p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Recent operator activity</h2>
        <ul className="mt-3 space-y-3">
          {profile.recentOperatorActivity.map((item) => (
            <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <span className="text-foreground">{item.label}</span>
              <span className="text-[12px] text-muted-foreground tabular-nums">{formatOperatorTimestamp(item.timestamp)}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="border border-border p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Preferences summary</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">Values reflect settings stored on this device for this browser.</p>
        <div className="mt-3 divide-y divide-border rounded-md border border-border px-4">
          <MetaRow label="Timezone" value={preferences.localization.timezone} />
          <MetaRow label="Date format" value={preferences.localization.dateFormat} />
          <MetaRow label="Dashboard density" value={preferences.display.dashboardDensity} />
          <MetaRow label="Default landing page" value={preferences.defaultViews.defaultLandingPage} />
        </div>
      </Card>
    </PortalPageFrame>
  );
}
