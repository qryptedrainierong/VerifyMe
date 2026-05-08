import { useMemo, useSyncExternalStore, type ReactNode } from "react";
import { CheckCircle2, Circle, ListChecks, ScrollText } from "lucide-react";
import { Link } from "react-router";
import { Card } from "../../shared/components/ui/card";
import { Button } from "../../shared/components/ui/button";
import { Progress } from "../../shared/components/ui/progress";
import { getOrgVerificationSessions } from "../../shared/data/verificationSessionsMock";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  enterpriseActiveEndUsers,
  enterpriseCreditRemaining,
  enterpriseCreditUtilizationPct,
  enterpriseInvoices,
  enterpriseOrganization,
  enterprisePortalSetupIncomplete,
  enterpriseSetupSteps,
  enterpriseUsageTrend,
  enterpriseUsageSpend,
  enterpriseUsageLimit,
  enterpriseUsagePct,
} from "../data/enterpriseSample";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";
import {
  getLinkedEndUserRecords,
  getLinkedEndUsersStoreVersion,
  subscribeLinkedEndUsersListeners,
} from "../data/enterpriseLinkedEndUsersSession";
import { userRiskLevelForOrgAdmin } from "../../platform/data/mockPlatformRisk";
import { getEndUserAssociations } from "../../platform/data/platformEndUserAssociationsSession";

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

export function EnterpriseDashboard() {
  const linkedVersion = useSyncExternalStore(
    subscribeLinkedEndUsersListeners,
    getLinkedEndUsersStoreVersion,
    getLinkedEndUsersStoreVersion,
  );
  const linkedRecords = useMemo(() => getLinkedEndUserRecords(), [linkedVersion]);
  const platformAssociations = useMemo(() => getEndUserAssociations(), []);

  const usageData = enterpriseUsageTrend;
  const orgSessionSnap = useMemo(() => {
    const sessions = getOrgVerificationSessions(enterpriseOrganization.id);
    const settled = sessions.filter((s) => s.outcome !== "pending");
    const failed = settled.filter((s) => s.outcome === "failed").length;
    const failRate = settled.length > 0 ? (failed / settled.length) * 100 : 0;
    return { total: sessions.length, failRate };
  }, []);

  const setupIncompleteCount = enterpriseSetupSteps.filter((s) => !s.complete).length;
  const activeConflicts = linkedRecords.filter((r) => r.linkStatus === "conflict" && !r.conflictReviewed).length;
  const userRiskWarnings = useMemo(
    () =>
      linkedRecords.filter((r) => {
        const lvl = userRiskLevelForOrgAdmin(r.platformRiskVerifymeId, platformAssociations);
        return lvl === "High" || lvl === "Critical";
      }).length,
    [linkedRecords, platformAssociations],
  );
  const actionRequiredInvoices = enterpriseInvoices.filter((i) => i.actionRequired).length;
  const integrationIssueSteps = enterpriseSetupSteps.filter(
    (s) => !s.complete && ["redirect", "qr", "verification", "test", "api"].includes(s.id),
  ).length;
  const setupPrimaryRoute = useMemo(() => {
    const incompleteIds = new Set(enterpriseSetupSteps.filter((step) => !step.complete).map((step) => step.id));
    if (incompleteIds.has("api") || incompleteIds.has("redirect") || incompleteIds.has("test")) return "/api-integration";
    if (incompleteIds.has("qr")) return "/qr-linking";
    if (incompleteIds.has("verification") || incompleteIds.has("profile")) return "/settings";
    return "/settings";
  }, []);

  const creditOverage = Math.max(0, enterpriseUsageSpend - enterpriseOrganization.creditBalance);

  const recentActivity = linkedRecords.slice(0, 5).map((user, index) => ({
    id: user.id,
    clientUserId: user.clientUserId || "—",
    action:
      user.linkStatus === "linked"
        ? "Linked — verification activity may appear in logs"
        : user.linkStatus === "pending"
          ? "Pending VerifyMe link"
          : `Status: ${user.linkStatus}`,
    timestamp: `${1 + index}h ago`,
  }));

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <PortalPageFrame
      title="Dashboard"
      description="Operational view: attention queue, organization health, and recent activity."
      bodyClassName="space-y-8"
    >
      {enterprisePortalSetupIncomplete ? (
        <Card className="p-4 border border-border shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Finish organization setup</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Complete the remaining steps before production verification traffic. API usage should stay disabled until
                redirect URIs, QR keys, and verification settings are tested.
              </p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link to="/api-integration">Integration</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {enterpriseSetupSteps.map((step) => (
              <div
                key={step.id}
                className={`flex items-start gap-2 rounded-md border p-3 text-sm ${
                  step.complete ? "border-green-200/80 bg-green-50/30 dark:bg-green-950/20" : "border-border bg-card"
                }`}
              >
                {step.complete ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" aria-hidden />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{step.title}</p>
                  <Button size="sm" variant={step.complete ? "ghost" : "default"} className="mt-2 h-8 px-2" asChild>
                    <Link to={step.href}>{step.ctaLabel}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-4 border border-green-200 bg-green-50/40 dark:bg-green-950/20 dark:border-green-900 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>Setup complete. Monitor health metrics and the attention queue below.</span>
          </div>
        </Card>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Action required</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <KpiCard
            label="Setup incomplete"
            value={setupIncompleteCount}
            hint="Checklist steps remaining"
            footer={
              <Button variant="link" className="px-0 h-auto text-sm" asChild>
                <Link to={setupPrimaryRoute}>
                  {setupPrimaryRoute === "/api-integration"
                    ? "API integration"
                    : setupPrimaryRoute === "/qr-linking"
                      ? "QR linking"
                      : "Settings"}
                </Link>
              </Button>
            }
          />
          <KpiCard
            label="Active identity conflicts"
            value={activeConflicts}
            hint="Awaiting review"
            valueClassName="text-orange-700 dark:text-orange-400"
            footer={
              <Button variant="link" className="px-0 h-auto text-sm" asChild>
                <Link to="/linked-end-users">Linked end users</Link>
              </Button>
            }
          />
          <KpiCard
            label="User risk warnings"
            value={userRiskWarnings}
            hint="High / critical risk band"
            valueClassName="text-red-700 dark:text-red-400"
            footer={
              <Button variant="link" className="px-0 h-auto text-sm" asChild>
                <Link to="/linked-end-users">Review records</Link>
              </Button>
            }
          />
          <KpiCard
            label="Action-required invoices"
            value={actionRequiredInvoices}
            hint="Billing queue"
            footer={
              <Button variant="link" className="px-0 h-auto text-sm" asChild>
                <Link to="/billing">Billing</Link>
              </Button>
            }
          />
          <KpiCard
            label="Integration issues"
            value={integrationIssueSteps}
            hint="Incomplete integration steps"
            footer={
              <Button variant="link" className="px-0 h-auto text-sm" asChild>
                <Link to="/api-integration">API integration</Link>
              </Button>
            }
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Organization health</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <KpiCard
            label="Active linked users"
            value={enterpriseActiveEndUsers}
            hint="End users with active link"
            footer={
              <Button variant="link" className="px-0 h-auto text-sm" asChild>
                <Link to="/linked-end-users">Open directory</Link>
              </Button>
            }
          />
          <KpiCard
            label="Verification sessions"
            value={orgSessionSnap.total.toLocaleString()}
            hint="Current org window"
            footer={
              <Button variant="link" className="px-0 h-auto text-sm" asChild>
                <Link to="/verification-logs">Verification logs</Link>
              </Button>
            }
          />
          <KpiCard
            label="ID Proof Fail rate"
            value={`${orgSessionSnap.failRate.toFixed(1)}%`}
            hint="Failed ÷ non-pending outcomes"
            valueClassName="text-orange-700 dark:text-orange-400"
          />
          <KpiCard
            label="Billable verification spend"
            value={formatCurrency(enterpriseUsageSpend)}
            hint={`${enterpriseOrganization.usage.toLocaleString()} sessions this period`}
          />
          <KpiCard
            label="Credit position"
            value={formatCurrency(enterpriseCreditRemaining)}
            hint={
              creditOverage > 0
                ? `Overage exposure about ${formatCurrency(creditOverage)} vs included credit`
                : `${enterpriseCreditUtilizationPct.toFixed(1)}% of included credit used`
            }
            valueClassName={creditOverage > 0 ? "text-orange-700 dark:text-orange-400" : undefined}
            footer={
              <Button variant="link" className="px-0 h-auto text-sm" asChild>
                <Link to="/usage-credits">Usage & credits</Link>
              </Button>
            }
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Trends & activity</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 border border-border shadow-sm">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Verification session volume</h3>
                  <p className="text-xs text-muted-foreground">Recent daily trend</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={40} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number | string) => [`${Number(value).toLocaleString()}`, "Sessions"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="usage"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border border-border shadow-sm flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Plan & seats</h3>
                  <p className="text-xs text-muted-foreground">Managed under Team and Billing</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-4 flex-1 flex flex-col">
              <div>
                <p className="text-xs text-muted-foreground">Admin seats</p>
                <p className="text-lg font-semibold tabular-nums">
                  {enterpriseOrganization.seatsUsed} / {enterpriseOrganization.seatLimit}
                </p>
                <Button variant="link" className="px-0 h-auto text-sm mt-1" asChild>
                  <Link to="/team-roles">Team & roles</Link>
                </Button>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Included credit utilization</p>
                <Progress value={Math.min(enterpriseCreditUtilizationPct, 100)} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Period volume {enterpriseOrganization.usage.toLocaleString()} / {enterpriseUsageLimit.toLocaleString()}{" "}
                  sessions
                </p>
                <Progress value={Math.min(enterpriseUsagePct, 100)} className="h-2 mt-2" />
              </div>
              <Button className="w-full mt-auto" variant="outline" size="sm" asChild>
                <Link to="/billing">Billing & plan</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <Card className="border border-border shadow-sm">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Recent linked end-user activity</h3>
            <p className="text-xs text-muted-foreground">Snapshot from your directory</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/linked-end-users">View all</Link>
          </Button>
        </div>
        <ul className="divide-y divide-border">
          {recentActivity.map((activity) => (
            <li key={activity.id} className="px-4 py-3 flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-mono text-xs text-primary">
                {activity.clientUserId.replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase() || "—"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground">
                  <span className="font-mono text-xs">{activity.clientUserId}</span> — {activity.action}
                </p>
                <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </PortalPageFrame>
  );
}
