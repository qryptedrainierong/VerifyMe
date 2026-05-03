import { CheckCircle2, Circle, CreditCard, Users, AlertCircle, BarChart3 } from "lucide-react";
import { Link } from "react-router";
import { Card } from "../../shared/components/ui/card";
import { Button } from "../../shared/components/ui/button";
import { Progress } from "../../shared/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  enterpriseActiveEndUsers,
  enterpriseCreditRemaining,
  enterpriseCreditUtilizationPct,
  enterpriseEndUsers,
  enterpriseOrganization,
  enterprisePortalSetupIncomplete,
  enterpriseSetupSteps,
  enterpriseUsageTrend,
  enterpriseUsageSpend,
} from "../data/enterpriseSample";

export function EnterpriseDashboard() {
  const usageData = enterpriseUsageTrend;

  const recentActivity = enterpriseEndUsers.slice(0, 4).map((user, index) => ({
    id: index + 1,
    user: user.enterpriseUsername,
    action:
      user.status === "active" ? "Completed a billable verification session" : "Has a pending VerifyMe link",
    timestamp: `${2 + index * 2} hour${index === 0 ? "" : "s"} ago`,
  }));

  const alerts = [
    {
      id: 1,
      type: enterpriseCreditUtilizationPct >= 80 ? "warning" : "info",
      message:
        enterpriseCreditUtilizationPct >= 100
          ? "Your included credit is exhausted for this period"
          : `You're using ${enterpriseCreditUtilizationPct.toFixed(1)}% of your included credit`,
      action: "usage",
    },
    {
      id: 2,
      type: "info",
      message: "Your invoice for April is ready",
      action: "billing",
    },
  ];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="p-8 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-[28px] font-semibold text-foreground">Dashboard</h1>
        <p className="text-[15px] text-muted-foreground mt-1 max-w-3xl">
          Organization-level overview of credits, verification sessions, linked end users, and integration readiness
          (sample data).
        </p>
      </div>

      {enterprisePortalSetupIncomplete ? (
        <Card className="p-6 border-2 border-primary/30 bg-primary/5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-[18px] font-semibold text-foreground">Finish organization setup</h2>
            <p className="text-[14px] text-muted-foreground mt-1 max-w-3xl">
              VerifyMe Admin created your organization (profile, initial admin, plan & credits). Complete the steps below
              in this portal before relying on production verification traffic.
            </p>
            <p className="text-[13px] text-foreground mt-3 rounded-md border border-amber-200 bg-amber-50/80 px-3 py-2 dark:bg-amber-950/30 dark:border-amber-800">
              Verification API usage should remain <strong>disabled</strong> until redirect URI, QR keys, and
              verification settings are configured and tested (policy copy — not enforced in this UI build).
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {enterpriseSetupSteps.map((step) => (
              <Card
                key={step.id}
                className={`p-4 border shadow-sm ${step.complete ? "border-green-200/80 bg-green-50/30 dark:bg-green-950/20" : "border-border bg-card"}`}
              >
                <div className="flex items-start gap-3">
                  {step.complete ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" aria-hidden />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" aria-hidden />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-[15px] font-semibold text-foreground">{step.title}</h3>
                      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {step.complete ? "Complete" : "Incomplete"}
                      </span>
                    </div>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{step.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button size="sm" variant={step.complete ? "outline" : "default"} asChild>
                        <Link to={step.href}>{step.ctaLabel}</Link>
                      </Button>
                      <span className="text-[11px] text-muted-foreground">Opens: {step.href}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-4 border border-green-200 bg-green-50/40 dark:bg-green-950/20 dark:border-green-900">
          <div className="flex items-center gap-2 text-[14px] text-foreground">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <span>All setup steps are complete. Monitor usage and credits below.</span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-4 gap-6">
        <Card className="p-6 border border-border shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Admin seats</p>
            <p className="text-[32px] font-semibold text-foreground leading-none">{enterpriseOrganization.seatsUsed}</p>
            <p className="text-[13px] text-muted-foreground mt-2">
              of {enterpriseOrganization.seatLimit} seat limit
            </p>
          </div>
        </Card>

        <Card className="p-6 border border-border shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Linked end users</p>
            <p className="text-[32px] font-semibold text-foreground leading-none">{enterpriseEndUsers.length}</p>
            <p className="text-[13px] text-muted-foreground mt-2">{enterpriseActiveEndUsers} active</p>
          </div>
        </Card>

        <Card className="p-6 border border-border shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Plan and credits</p>
            <p className="text-[32px] font-semibold text-foreground leading-none">{enterpriseOrganization.plan}</p>
            <p className="text-[13px] text-muted-foreground mt-2">
              {formatCurrency(enterpriseOrganization.creditBalance)} credit balance
            </p>
          </div>
        </Card>

        <Card className="p-6 border border-border shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Verification sessions (period)</p>
            <p className="text-[32px] font-semibold text-foreground leading-none">
              {enterpriseOrganization.usage.toLocaleString()}
            </p>
            <p className="text-[13px] text-muted-foreground mt-2">
              {formatCurrency(enterpriseUsageSpend)} billable spend (sample)
            </p>
          </div>
        </Card>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`p-5 border shadow-sm ${
                alert.type === "warning"
                  ? "border-orange-200 bg-orange-50/50"
                  : "border-blue-200 bg-blue-50/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle
                    className={`w-5 h-5 ${
                      alert.type === "warning" ? "text-orange-600" : "text-blue-600"
                    }`}
                  />
                  <p className="text-[14px] text-foreground font-medium">{alert.message}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={alert.action === "usage" ? "/usage-credits" : "/billing"}>
                    {alert.action === "usage" ? "View usage and credits" : "View billing"}
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-semibold text-foreground">Verification session volume</h3>
                <p className="text-[13px] text-muted-foreground">Last 9 days (sample trend)</p>
              </div>
              <Button variant="outline" size="sm">Last 30 days</Button>
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={usageData}>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  key="xaxis"
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  key="yaxis"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  key="tooltip"
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number | string) => [`${Number(value).toLocaleString()} sessions`, "Volume"]}
                />
                <Line
                  key="usage-line"
                  type="monotone"
                  dataKey="usage"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <h3 className="text-[16px] font-semibold text-foreground">Credits</h3>
            <p className="text-[13px] text-muted-foreground">Wallet vs billable spend (sample)</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[13px] font-medium text-foreground">Billable verification spend</p>
                <p className="text-[13px] text-muted-foreground">
                  {formatCurrency(enterpriseUsageSpend)} / {formatCurrency(enterpriseOrganization.creditBalance)}
                </p>
              </div>
              <Progress value={Math.min(enterpriseCreditUtilizationPct, 100)} className="h-2" />
              <p className="text-[12px] text-orange-600 mt-1.5">{enterpriseCreditUtilizationPct.toFixed(1)}% of balance used</p>
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-muted-foreground">Period resets in</p>
                <p className="text-[12px] font-medium text-foreground">12 days</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-muted-foreground">Avg. daily sessions</p>
                <p className="text-[12px] font-medium text-foreground">6.9K</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-muted-foreground">Credit remaining</p>
                <p className="text-[12px] font-medium text-foreground">{formatCurrency(enterpriseCreditRemaining)}</p>
              </div>
            </div>

            <Button className="w-full" variant="outline" asChild>
              <Link to="/usage-credits">View usage and credits</Link>
            </Button>
          </div>
        </Card>
      </div>

      <Card className="border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[16px] font-semibold text-foreground">Recent activity</h3>
              <p className="text-[13px] text-muted-foreground">Verification and portal actions (sample)</p>
            </div>
            <Button variant="ghost" size="sm">View all</Button>
          </div>
        </div>
        <div className="divide-y divide-border">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[13px] font-medium text-primary">
                  {activity.user
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-[14px] text-foreground">
                  <span className="font-medium">{activity.user}</span> {activity.action}
                </p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
