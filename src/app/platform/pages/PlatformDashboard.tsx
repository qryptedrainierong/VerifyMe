import { ListChecks, ScrollText } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { Link } from "react-router";
import { Card } from "../../shared/components/ui/card";
import { Button } from "../../shared/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { buildInitialOrganizations, getVerificationSpend } from "../data/platformOrganizationsSample";
import { platformEndUserAssociations } from "../data/platformUsersSample";
import { getVerificationSessionsMock } from "../../shared/data/verificationSessionsMock";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";
import { groupAssociationsByVerifymeUserId } from "../data/groupEndUsers";
import { computePlatformRiskSummary } from "../data/mockPlatformRisk";
import { platformIdentityLinks } from "../data/platformIdentityLinksSample";
import { getPlatformBillingInvoices } from "../data/platformBillingInvoicesMock";
import { platformClientApps } from "../data/platformClientAppsSample";
import { platformAuditLogsSample } from "../data/platformAuditLogsSample";
import { getActionLabel } from "../../shared/types/auditLog";

function KpiCard({
  label,
  value,
  hint,
  valueClassName,
  footer,
}: {
  label: string;
  value: string | number;
  hint?: string;
  valueClassName?: string;
  footer?: ReactNode;
}) {
  return (
    <Card className="p-4 border border-border shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-semibold tabular-nums tracking-tight mt-1 ${valueClassName ?? "text-foreground"}`}>
        {value}
      </p>
      {hint ? <p className="text-sm text-muted-foreground mt-1">{hint}</p> : null}
      {footer ? <div className="mt-2">{footer}</div> : null}
    </Card>
  );
}

export function PlatformDashboard() {
  const organizations = useMemo(() => buildInitialOrganizations(), []);
  const sessionSnapshot = useMemo(() => {
    const sessions = getVerificationSessionsMock();
    const settled = sessions.filter((s) => s.outcome !== "pending");
    const failed = settled.filter((s) => s.outcome === "failed").length;
    const failRate = settled.length > 0 ? (failed / settled.length) * 100 : 0;
    return { total: sessions.length, failRate };
  }, []);
  const activeOrganizations = useMemo(() => organizations.filter((o) => o.status === "active").length, [organizations]);
  const billableSpend = useMemo(
    () => organizations.reduce((sum, org) => sum + getVerificationSpend(org), 0),
    [organizations],
  );
  const groupedUsers = useMemo(() => groupAssociationsByVerifymeUserId(platformEndUserAssociations), []);
  const highRiskUsers = useMemo(
    () => groupedUsers.filter((group) => ["High", "Critical"].includes(computePlatformRiskSummary(group).level)).length,
    [groupedUsers],
  );
  const activeIdentityConflicts = useMemo(
    () => platformIdentityLinks.filter((row) => row.conflictStatus === "pending_review").length,
    [],
  );
  const actionRequiredInvoices = useMemo(() => getPlatformBillingInvoices().filter((row) => row.actionRequired).length, []);
  const integrationIssues = useMemo(
    () =>
      platformClientApps.filter((row) =>
        ["not_configured", "missing_redirect_uri", "missing_keys", "error"].includes(row.integrationStatus),
      ).length,
    [],
  );

  const verificationTrend = useMemo(() => {
    const base = sessionSnapshot.total > 0 ? sessionSnapshot.total / 7 : 1000;
    return Array.from({ length: 7 }, (_, i) => ({
      day: `D${i + 1}`,
      sessions: Math.max(0, Math.round(base * (0.85 + i * 0.04))),
    }));
  }, [sessionSnapshot.total]);

  const recentGovernance = useMemo(
    () =>
      [...platformAuditLogsSample]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8),
    [],
  );

  return (
    <PortalPageFrame
      title="Dashboard"
      description="Operational command center: attention queue, platform health, and recent governance activity."
      bodyClassName="space-y-8"
    >
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Action required</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="High-risk VerifyMe users"
            value={highRiskUsers}
            hint="Operator review queue"
            valueClassName="text-red-700 dark:text-red-400"
            footer={
              <Button variant="link" className="px-0 h-auto text-sm" asChild>
                <Link to="/verifyme-users">Open VerifyMe Users</Link>
              </Button>
            }
          />
          <KpiCard
            label="Active identity conflicts"
            value={activeIdentityConflicts}
            hint="Pending conflict resolution"
            valueClassName="text-orange-700 dark:text-orange-400"
            footer={
              <Button variant="link" className="px-0 h-auto text-sm" asChild>
                <Link to="/identity-links">Open identity links</Link>
              </Button>
            }
          />
          <KpiCard
            label="Action-required invoices"
            value={actionRequiredInvoices}
            hint="Billing follow-up"
            footer={
              <Button variant="link" className="px-0 h-auto text-sm" asChild>
                <Link to="/billing">Open billing</Link>
              </Button>
            }
          />
          <KpiCard
            label="Integration issues"
            value={integrationIssues}
            hint="Configuration or runtime"
            footer={
              <Button variant="link" className="px-0 h-auto text-sm" asChild>
                <Link to="/client-apps">Open client apps</Link>
              </Button>
            }
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Platform health</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Verification sessions"
            value={sessionSnapshot.total.toLocaleString()}
            hint="Settled + in progress (sample window)"
            footer={
              <Button variant="link" className="px-0 h-auto text-sm" asChild>
                <Link to="/verification-sessions">Open sessions</Link>
              </Button>
            }
          />
          <KpiCard
            label="ID Proof Fail rate"
            value={`${sessionSnapshot.failRate.toFixed(1)}%`}
            hint="Failed ÷ non-pending outcomes"
            valueClassName="text-orange-700 dark:text-orange-400"
          />
          <KpiCard
            label="Billable verification spend"
            value={`$${Math.round(billableSpend).toLocaleString()}`}
            hint="Across organizations (verification units)"
          />
          <KpiCard
            label="Active organizations"
            value={activeOrganizations}
            hint="Lifecycle: active"
            footer={
              <Button variant="link" className="px-0 h-auto text-sm" asChild>
                <Link to="/organizations">Open organizations</Link>
              </Button>
            }
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Trends & activity</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border border-border shadow-sm">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Verification sessions trend</h3>
                  <p className="text-xs text-muted-foreground">Recent window (operational shape)</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={verificationTrend}>
                  <defs>
                    <linearGradient id="dashSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={44} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="sessions" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#dashSessions)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border border-border shadow-sm">
            <div className="p-4 border-b border-border flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Recent governance events</h3>
                  <p className="text-xs text-muted-foreground">From audit log sample</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/audit-logs">Audit logs</Link>
              </Button>
            </div>
            <ul className="divide-y divide-border max-h-[248px] overflow-y-auto">
              {recentGovernance.map((log) => (
                <li key={log.id} className="px-4 py-3 text-sm hover:bg-accent/5">
                  <p className="font-medium text-foreground line-clamp-1">{getActionLabel(log.action)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{log.details}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 tabular-nums">
                    {log.timestamp} · {log.actor}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>
    </PortalPageFrame>
  );
}
