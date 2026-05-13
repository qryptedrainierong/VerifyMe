import { AlertTriangle, ArrowRight, CreditCard, Link2, Server, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { Link } from "react-router";
import { Card } from "../../shared/components/ui/card";
import { Badge } from "../../shared/components/ui/badge";
import { cn } from "../../shared/components/ui/utils";
import { buildInitialOrganizations, getVerificationSpend } from "../data/platformOrganizationsSample";
import { platformEndUserAssociations } from "../data/platformUsersSample";
import { deriveIdProofResult, getVerificationSessionsMock } from "../../shared/data/verificationSessionsMock";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";
import { groupAssociationsByVerifymeUserId } from "../data/groupEndUsers";
import { computePlatformRiskSummary } from "../data/mockPlatformRisk";
import { platformIdentityLinks } from "../data/platformIdentityLinksSample";
import { getPlatformBillingInvoices } from "../data/platformBillingInvoicesMock";
import { platformClientApps } from "../data/platformClientAppsSample";
import { platformAuditLogsSample } from "../data/platformAuditLogsSample";
import { getActionLabel } from "../../shared/types/auditLog";
import type { AuditLog } from "../../shared/types/auditLog";
import { usePlatformRole } from "../context/PlatformRoleContext";
import {
  auditActionVisibleInDashboardActivity,
  dashboardDrilldownLabel,
  getPlatformDashboardConfig,
  type AttentionQueueCardId,
  type PlatformRole,
} from "../utils/platformRolePermissions";

type QueueSeverity = "critical" | "high" | "attention" | "elevated" | "clear";

const PLATFORM_SERVICE_STATUSES: { name: string; status: "Operational" | "Degraded" | "Attention required" }[] = [
  { name: "Verification Service", status: "Operational" },
  { name: "Risk Engine", status: "Degraded" },
  { name: "Audit Pipeline", status: "Operational" },
  { name: "Billing Service", status: "Operational" },
  { name: "Notification Delivery", status: "Attention required" },
  { name: "API Gateway", status: "Operational" },
];

/** Matches audit log UI anchor for stable relative times against sample data. */
const DASHBOARD_CLOCK_MS = Date.parse("2024-04-12T23:59:59Z");

const GOVERNANCE_ACTIVITY_ACTIONS = new Set<string>([
  "verifyme_user.risk_level_changed",
  "identity_link.conflict_reopened",
  "billing.invoice_action_required",
  "client_app.secret_rotated",
  "platform_settings.updated",
  "verification_policy.updated",
  "risk_policy.updated",
  "identity_link.conflict_detected",
]);

function queueSeverityStyles(severity: QueueSeverity): { border: string; badge: string; badgeLabel: string } {
  switch (severity) {
    case "critical":
      return {
        border: "border-red-500/45 dark:border-red-500/35",
        badge: "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/45 dark:text-red-200",
        badgeLabel: "Critical",
      };
    case "high":
      return {
        border: "border-orange-400/40 dark:border-orange-500/25",
        badge: "border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-900/45 dark:bg-orange-950/35 dark:text-orange-100",
        badgeLabel: "High",
      };
    case "attention":
      return {
        border: "border-amber-500/45 dark:border-amber-500/30",
        badge: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/45 dark:bg-amber-950/35 dark:text-amber-100",
        badgeLabel: "Attention",
      };
    case "elevated":
      return {
        border: "border-border",
        badge: "border-border bg-muted text-foreground",
        badgeLabel: "Elevated",
      };
    default:
      return {
        border: "border-border",
        badge: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/45 dark:bg-emerald-950/35 dark:text-emerald-100",
        badgeLabel: "Clear",
      };
  }
}

function attentionQueueShortCta(role: PlatformRole, id: AttentionQueueCardId): string {
  if (role === "compliance_auditor") return "View";
  switch (id) {
    case "invoices":
      return "Open";
    case "services":
      return "View";
    default:
      return "Review";
  }
}

function AttentionQueueItem({
  title,
  count,
  severity,
  href,
  cta,
  icon: Icon,
}: {
  title: string;
  count: number;
  severity: QueueSeverity;
  href: string;
  cta: string;
  icon: LucideIcon;
}) {
  const styles = queueSeverityStyles(severity);
  return (
    <Card
      className={cn(
        "group flex h-full min-h-[5.25rem] flex-col justify-between border px-2.5 py-2 shadow-none transition-shadow duration-150 hover:shadow-sm",
        styles.border,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 gap-2">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded border border-border/70 bg-muted/35 text-muted-foreground transition-colors group-hover:bg-muted/55">
            <Icon className="h-3.5 w-3.5" aria-hidden />
          </span>
          <p className="min-w-0 pt-0.5 text-[11.5px] font-medium leading-snug text-foreground">{title}</p>
        </div>
        <Badge variant="outline" className={cn("h-5 shrink-0 px-1.5 text-[10px] font-medium tracking-normal", styles.badge)}>
          {styles.badgeLabel}
        </Badge>
      </div>
      <div className="mt-2 flex items-end justify-between gap-2 border-t border-border/50 pt-1.5">
        <p className="text-lg font-semibold tabular-nums tracking-tight text-foreground [font-variant-numeric:lining-nums]">
          {count.toLocaleString()}
        </p>
        <Link
          to={href}
          className="inline-flex items-center gap-0.5 text-[10.5px] font-medium text-muted-foreground transition-colors duration-150 hover:text-primary"
        >
          {cta}
          <ArrowRight className="h-2.5 w-2.5 opacity-70" aria-hidden />
        </Link>
      </div>
    </Card>
  );
}

function SnapshotKpi({ label, value, href, linkLabel }: { label: string; value: string; href: string; linkLabel: string }) {
  return (
    <Card className="flex h-full min-h-[6.25rem] flex-col justify-between border border-border/80 bg-card p-3 shadow-none transition-shadow duration-150 hover:shadow-sm">
      <p className="text-[10px] font-medium leading-tight text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground [font-variant-numeric:lining-nums]">
        {value}
      </p>
      <Link
        to={href}
        className="inline-flex w-fit items-center gap-0.5 text-[10px] font-medium text-muted-foreground transition-colors duration-150 hover:text-primary"
      >
        {linkLabel}
        <ArrowRight className="h-2.5 w-2.5 opacity-70" aria-hidden />
      </Link>
    </Card>
  );
}

function formatSnapshotInt(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function formatSnapshotPercent(p: number): string {
  return `${p.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function formatSnapshotCurrency(n: number): string {
  return `$${Math.round(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function ActivitySeverityBadge({ log }: { log: AuditLog }) {
  const s = log.severity ?? "info";
  const cls: Record<string, string> = {
    critical: "border-red-300 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/45 dark:text-red-100",
    high: "border-orange-300 bg-orange-50 text-orange-950 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-50",
    medium: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/45 dark:bg-amber-950/35 dark:text-amber-50",
    low: "border-border bg-muted text-foreground",
    info: "border-border bg-background text-muted-foreground",
  };
  const label = s === "critical" ? "Critical" : s === "high" ? "High" : s === "medium" ? "Medium" : s === "low" ? "Low" : "Info";
  return (
    <Badge variant="outline" className={cn("h-5 px-1.5 text-[9px] font-medium capitalize leading-none", cls[s] ?? cls.info)}>
      {label}
    </Badge>
  );
}

function relatedEntityLabel(log: AuditLog): string {
  return log.relatedVerifymeId ?? log.target ?? log.organization ?? "—";
}

function formatRelativeAuditTime(iso: string, nowMs: number): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  const diffMs = Math.max(0, nowMs - t);
  const sec = Math.floor(diffMs / 1000);
  if (sec < 45) return "Just now";
  const min = Math.floor(diffMs / 60000);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(diffMs / 3600000);
  if (hr < 24) return `${hr}h ago`;

  const then = new Date(t);
  const now = new Date(nowMs);
  const thenDay = Date.UTC(then.getUTCFullYear(), then.getUTCMonth(), then.getUTCDate());
  const nowDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dayDiff = Math.floor((nowDay - thenDay) / 86400000);
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff < 7) return `${dayDiff}d ago`;

  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" }).format(then) + " UTC";
}

function formatDashboardLastUpdated(nowMs: number): string {
  return (
    new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(new Date(nowMs)) + " UTC"
  );
}

function snapshotGridClass(count: number): string {
  if (count <= 0) return "grid items-stretch gap-2";
  if (count === 1) return "grid max-w-xs items-stretch gap-2";
  if (count === 2) return "grid grid-cols-2 items-stretch gap-2";
  if (count === 3) return "grid grid-cols-1 items-stretch gap-2 sm:grid-cols-3";
  if (count === 4) return "grid grid-cols-2 items-stretch gap-2 lg:grid-cols-4";
  return "grid grid-cols-2 items-stretch gap-2 xl:grid-cols-5";
}

export function PlatformDashboard() {
  const { role } = usePlatformRole();
  const dash = useMemo(() => getPlatformDashboardConfig(role), [role]);
  const organizations = useMemo(() => buildInitialOrganizations(), []);
  const sessions = useMemo(() => getVerificationSessionsMock(), []);

  const sessionSnapshot = useMemo(() => {
    const settled = sessions.filter((s) => s.outcome !== "pending");
    const idProofFail = settled.filter((s) => deriveIdProofResult(s) === "id_proof_fail").length;
    const idProofFailRate = settled.length > 0 ? (idProofFail / settled.length) * 100 : 0;
    return {
      total: sessions.length,
      idProofFailRate,
    };
  }, [sessions]);

  const activeOrganizations = useMemo(() => organizations.filter((o) => o.status === "active").length, [organizations]);
  const billableSpend = useMemo(
    () => organizations.reduce((sum, org) => sum + getVerificationSpend(org), 0),
    [organizations],
  );

  const groupedUsers = useMemo(() => groupAssociationsByVerifymeUserId(platformEndUserAssociations), []);
  const activeVerifymeUsers = useMemo(() => groupedUsers.filter((g) => g.rowStatus === "active").length, [groupedUsers]);

  const criticalRiskUsers = useMemo(
    () => groupedUsers.filter((group) => computePlatformRiskSummary(group).level === "Critical").length,
    [groupedUsers],
  );

  const activeIdentityConflicts = useMemo(
    () => platformIdentityLinks.filter((row) => row.conflictStatus === "pending_review").length,
    [],
  );

  const actionRequiredInvoices = useMemo(() => getPlatformBillingInvoices().filter((row) => row.actionRequired), []);
  const actionRequiredInvoiceCount = actionRequiredInvoices.length;

  const integrationIssues = useMemo(
    () =>
      platformClientApps.filter((row) =>
        ["not_configured", "missing_redirect_uri", "missing_keys", "error"].includes(row.integrationStatus),
      ).length,
    [],
  );

  const serviceAttentionCount = useMemo(
    () => PLATFORM_SERVICE_STATUSES.filter((s) => s.status !== "Operational").length,
    [],
  );

  const sortedAudit = useMemo(
    () => [...platformAuditLogsSample].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)),
    [],
  );

  const governanceActivityRows = useMemo(() => {
    const pool = sortedAudit.filter((log) => auditActionVisibleInDashboardActivity(dash.activityFilter, log.action));
    const preferred = pool.filter((log) => GOVERNANCE_ACTIVITY_ACTIONS.has(log.action));
    const merged: AuditLog[] = [];
    const seen = new Set<string>();
    for (const log of preferred) {
      if (!seen.has(log.id)) {
        seen.add(log.id);
        merged.push(log);
      }
    }
    for (const log of pool) {
      if (merged.length >= 5) break;
      if (!seen.has(log.id)) {
        seen.add(log.id);
        merged.push(log);
      }
    }
    return merged.slice(0, 5);
  }, [sortedAudit, dash.activityFilter]);

  const attentionItems = useMemo(() => {
    const byId: Record<AttentionQueueCardId, ReactNode> = {
      critical_users: (
        <AttentionQueueItem
          key="critical_users"
          title="Critical-risk users"
          count={criticalRiskUsers}
          severity={criticalRiskUsers > 0 ? "critical" : "clear"}
          href="/verifyme-users?risk=critical"
          cta={attentionQueueShortCta(role, "critical_users")}
          icon={UserRound}
        />
      ),
      conflicts: (
        <AttentionQueueItem
          key="conflicts"
          title="Active conflicts"
          count={activeIdentityConflicts}
          severity={activeIdentityConflicts > 0 ? "high" : "clear"}
          href="/identity-links?conflict=active"
          cta={attentionQueueShortCta(role, "conflicts")}
          icon={Link2}
        />
      ),
      invoices: (
        <AttentionQueueItem
          key="invoices"
          title="Action-required invoices"
          count={actionRequiredInvoiceCount}
          severity={actionRequiredInvoiceCount > 0 ? "high" : "clear"}
          href="/billing?requiresAction=true"
          cta={attentionQueueShortCta(role, "invoices")}
          icon={CreditCard}
        />
      ),
      integrations: (
        <AttentionQueueItem
          key="integrations"
          title="Integration issues"
          count={integrationIssues}
          severity={integrationIssues > 0 ? "elevated" : "clear"}
          href="/client-apps"
          cta={attentionQueueShortCta(role, "integrations")}
          icon={Server}
        />
      ),
      services: (
        <AttentionQueueItem
          key="services"
          title="Service degradation"
          count={serviceAttentionCount}
          severity={serviceAttentionCount > 1 ? "attention" : serviceAttentionCount > 0 ? "elevated" : "clear"}
          href="/audit-logs"
          cta={attentionQueueShortCta(role, "services")}
          icon={AlertTriangle}
        />
      ),
    };
    return dash.attentionCardOrder.map((id) => byId[id]);
  }, [
    role,
    dash.attentionCardOrder,
    criticalRiskUsers,
    activeIdentityConflicts,
    actionRequiredInvoiceCount,
    integrationIssues,
    serviceAttentionCount,
  ]);

  const snapshotKpis = useMemo(() => {
    if (!dash.showPlatformOverview) return [];
    const isCompliance = role === "compliance_auditor";
    const open = isCompliance ? "View" : "Open";
    const review = isCompliance ? "View" : "Review";
    const nodes: ReactNode[] = [];
    if (dash.overviewShowActiveOrganizations) {
      nodes.push(
        <SnapshotKpi
          key="orgs"
          label="Active organizations"
          value={formatSnapshotInt(activeOrganizations)}
          href="/organizations"
          linkLabel={open}
        />,
      );
    }
    if (dash.overviewShowActiveUsers) {
      nodes.push(
        <SnapshotKpi
          key="users"
          label="Active VerifyMe users"
          value={formatSnapshotInt(activeVerifymeUsers)}
          href="/verifyme-users"
          linkLabel={review}
        />,
      );
    }
    if (dash.overviewShowVerificationSessions) {
      nodes.push(
        <SnapshotKpi
          key="sessions"
          label="Verification sessions"
          value={formatSnapshotInt(sessionSnapshot.total)}
          href="/verification-sessions"
          linkLabel={open}
        />,
      );
    }
    if (dash.overviewShowIdProofFail) {
      nodes.push(
        <SnapshotKpi
          key="idproof"
          label="ID Proof Fail rate"
          value={formatSnapshotPercent(sessionSnapshot.idProofFailRate)}
          href="/verification-sessions"
          linkLabel={open}
        />,
      );
    }
    if (dash.overviewShowSpend) {
      nodes.push(
        <SnapshotKpi
          key="spend"
          label="Billable verification spend"
          value={formatSnapshotCurrency(billableSpend)}
          href="/billing"
          linkLabel={open}
        />,
      );
    }
    return nodes.slice(0, 5);
  }, [
    dash.showPlatformOverview,
    dash.overviewShowActiveOrganizations,
    dash.overviewShowActiveUsers,
    dash.overviewShowVerificationSessions,
    dash.overviewShowIdProofFail,
    dash.overviewShowSpend,
    role,
    activeOrganizations,
    activeVerifymeUsers,
    sessionSnapshot.total,
    sessionSnapshot.idProofFailRate,
    billableSpend,
  ]);

  const ctl = (k: Parameters<typeof dashboardDrilldownLabel>[1]) => dashboardDrilldownLabel(role, k);
  const snapshotCount = snapshotKpis.length;

  return (
    <PortalPageFrame
      title="Dashboard"
      headingClassName="text-xl font-semibold tracking-tight md:text-2xl"
      contentMaxWidthClass="max-w-[min(100%,90rem)]"
      headerClassName="border-border/80 px-5 py-3.5 sm:px-7"
      headerExtra={
        <p className="text-[11px] tabular-nums text-muted-foreground">
          Last updated · {formatDashboardLastUpdated(DASHBOARD_CLOCK_MS)}
        </p>
      }
      bodyClassName="space-y-4 px-5 pb-5 pt-3 sm:px-7 sm:pb-5 sm:pt-4"
    >
      {dash.attentionCardOrder.length > 0 ? (
        <section className="space-y-1.5">
          <h2 className="text-[13px] font-semibold tracking-tight text-foreground">Attention queue</h2>
          <div className="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
            {attentionItems}
          </div>
        </section>
      ) : role === "compliance_auditor" ? (
        <section className="space-y-1.5">
          <h2 className="text-[13px] font-semibold tracking-tight text-foreground">Attention queue</h2>
          <p className="rounded-md border border-dashed border-border/70 bg-muted/15 px-2.5 py-2 text-[11.5px] leading-snug text-muted-foreground">
            No queue for this role. Use <span className="font-medium text-foreground">Platform snapshot</span> and{" "}
            <span className="font-medium text-foreground">Recent governance activity</span> for audit review, or open{" "}
            <Link className="font-medium text-primary underline-offset-2 transition-colors hover:underline" to="/audit-logs">
              Audit logs
            </Link>
            .
          </p>
        </section>
      ) : null}

      {dash.showPlatformOverview && snapshotKpis.length > 0 ? (
        <section className="space-y-1.5">
          <h2 className="text-[13px] font-semibold tracking-tight text-foreground">Platform snapshot</h2>
          <div className={snapshotGridClass(snapshotCount)}>{snapshotKpis}</div>
        </section>
      ) : null}

      {dash.showGovernanceActivity ? (
        <section className="space-y-1.5">
          <div className="space-y-0.5">
            <h2 className="text-[13px] font-semibold tracking-tight text-foreground">{dash.activitySectionTitle}</h2>
            {role === "compliance_auditor" ? (
              <p className="text-[11px] leading-snug text-muted-foreground">
                Read-only audit trail preview. Production scope is enforced by backend RBAC.
              </p>
            ) : null}
          </div>
          <Card className="overflow-hidden border border-border/70 shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[380px] text-[11px]">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/25">
                    <th className="px-2.5 py-1.5 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Event
                    </th>
                    <th className="px-2.5 py-1.5 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Severity
                    </th>
                    <th className="px-2.5 py-1.5 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Time
                    </th>
                    <th className="px-2.5 py-1.5 text-right text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {governanceActivityRows.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-border/40 transition-colors last:border-0 hover:bg-muted/30"
                    >
                      <td
                        className="max-w-[14rem] px-2.5 py-1.5 align-middle font-medium leading-snug text-foreground"
                        title={relatedEntityLabel(log)}
                      >
                        {getActionLabel(log.action)}
                      </td>
                      <td className="px-2.5 py-1.5 align-middle whitespace-nowrap">
                        <ActivitySeverityBadge log={log} />
                      </td>
                      <td className="whitespace-nowrap px-2.5 py-1.5 align-middle tabular-nums text-[10px] text-muted-foreground">
                        {formatRelativeAuditTime(log.timestamp, DASHBOARD_CLOCK_MS)}
                      </td>
                      <td className="px-2.5 py-1.5 align-middle text-right">
                        <Link
                          to="/audit-logs"
                          className="text-[10px] font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-primary hover:underline"
                        >
                          {ctl("view_detail")}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-border/50 bg-muted/10 px-2.5 py-2 text-center">
              <Link
                to="/audit-logs"
                className="text-[11px] font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-primary hover:underline"
              >
                View all audit logs →
              </Link>
            </div>
          </Card>
        </section>
      ) : null}
    </PortalPageFrame>
  );
}
