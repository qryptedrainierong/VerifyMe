import { Link } from "react-router";
import { Button } from "../../shared/components/ui/button";
import { Card } from "../../shared/components/ui/card";
import { Label } from "../../shared/components/ui/label";
import { Switch } from "../../shared/components/ui/switch";
import { Badge } from "../../shared/components/ui/badge";
import { cn } from "../../shared/components/ui/utils";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";
import { usePlatformOperatorExperience } from "../context/PlatformOperatorExperienceContext";
import { formatOperatorTimestamp, type PlatformNotificationSeverity } from "../data/platformOperatorProfile";

function severityBadge(sev: PlatformNotificationSeverity) {
  const cls: Record<PlatformNotificationSeverity, string> = {
    critical: "bg-red-600 text-white border-transparent hover:bg-red-600/90",
    high: "border-red-300 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-100",
    medium: "border-amber-300 bg-amber-50 text-amber-950 dark:bg-amber-950/35 dark:text-amber-50",
    low: "border-border bg-muted text-foreground",
    info: "border-border bg-background text-muted-foreground",
  };
  return <Badge variant="outline" className={cn("font-medium capitalize", cls[sev])}>{sev}</Badge>;
}

export function PlatformNotifications() {
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    preferences,
    setNotificationChannels,
  } = usePlatformOperatorExperience();

  const criticalAlerts = notifications.filter((n) => n.severity === "critical" && !n.read).length;
  const governanceAlerts = notifications.filter((n) => ["Platform Settings", "Risk", "Identity Conflict"].includes(n.category) && !n.read).length;
  const billingAlerts = notifications.filter((n) => n.category === "Billing" && !n.read).length;
  const integrationAlerts = notifications.filter((n) => n.category === "Integration" && !n.read).length;
  const nc = preferences.notificationChannels;

  return (
    <PortalPageFrame
      title="Notification center"
      description="Operational inbox for platform administrators. Read state and delivery choices are stored on this device until backend services are connected."
      headerActions={
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={markAllNotificationsRead} disabled={unreadCount === 0}>
            Mark all as read
          </Button>
        </div>
      }
      bodyClassName="space-y-6"
    >
      <Card className="border border-border p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Notification summary</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Unread", value: unreadCount },
            { label: "Critical alerts", value: criticalAlerts },
            { label: "Governance alerts", value: governanceAlerts },
            { label: "Billing alerts", value: billingAlerts },
            { label: "Integration alerts", value: integrationAlerts },
          ].map((s) => (
            <div key={s.label} className="rounded-md border border-border bg-muted/20 px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="text-xl font-semibold tabular-nums text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border border-border p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
        <ul className="mt-4 space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={cn(
                "rounded-md border border-border p-3",
                !n.read && "border-primary/30 bg-primary/[0.03]",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{n.title}</p>
                    {!n.read ? <span className="text-[10px] font-medium uppercase text-primary">Unread</span> : null}
                  </div>
                  <p className="mt-1 text-[13px] text-muted-foreground leading-relaxed">{n.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {severityBadge(n.severity)}
                    <Badge variant="secondary" className="text-[11px]">
                      {n.category}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground tabular-nums">{formatOperatorTimestamp(n.timestamp)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                    <Link to={n.link} onClick={() => !n.read && markNotificationRead(n.id)}>
                      Open related page
                    </Link>
                  </Button>
                  {!n.read ? (
                    <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={() => markNotificationRead(n.id)}>
                      Mark as read
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="border border-border p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Notification preferences</h2>
        <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
          Categories control what appears in the in-app inbox when backend eventing is connected. Toggles apply to this browser only.
        </p>
        <div className="mt-4 space-y-4">
          {(
            [
              ["governanceAlerts", "Governance alerts"],
              ["riskEscalations", "Risk escalations"],
              ["billingAlerts", "Billing alerts"],
              ["integrationAlerts", "Integration alerts"],
              ["systemHealthAlerts", "System health alerts"],
              ["platformSettingsChanges", "Platform settings changes"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-4 rounded-md border border-border px-3 py-2">
              <Label htmlFor={key} className="text-sm font-normal text-foreground">
                {label}
              </Label>
              <Switch
                id={key}
                checked={nc[key]}
                onCheckedChange={(v) => setNotificationChannels({ [key]: v })}
              />
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Delivery channels</p>
        <div className="mt-3 space-y-4">
          {(
            [
              ["deliveryInApp", "In-app"],
              ["deliveryEmail", "Email"],
              ["deliveryDigest", "Digest"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-4 rounded-md border border-border px-3 py-2">
              <Label htmlFor={key} className="text-sm font-normal text-foreground">
                {label}
              </Label>
              <Switch
                id={key}
                checked={nc[key]}
                onCheckedChange={(v) => setNotificationChannels({ [key]: v })}
              />
            </div>
          ))}
        </div>
      </Card>
    </PortalPageFrame>
  );
}
