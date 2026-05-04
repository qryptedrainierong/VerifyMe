import {
  Users,
  Building2,
  DollarSign,
  Database,
  AlertTriangle,
  TrendingUp,
  Clock,
  AlertCircle,
  CreditCard,
  Activity,
  ListChecks,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router";
import { Card } from "../../shared/components/ui/card";
import { Button } from "../../shared/components/ui/button";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { buildInitialOrganizations, getVerificationSpend } from "../data/platformOrganizationsSample";
import { platformEndUserAssociations } from "../data/platformUsersSample";
import { getVerificationSessionsMock } from "../../shared/data/verificationSessionsMock";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";

export function PlatformDashboard() {
  const organizations = useMemo(() => buildInitialOrganizations(), []);
  const sessionSnapshot = useMemo(() => {
    const sessions = getVerificationSessionsMock();
    const settled = sessions.filter((s) => s.outcome !== "pending");
    const failed = settled.filter((s) => s.outcome === "failed").length;
    const failRate = settled.length > 0 ? (failed / settled.length) * 100 : 0;
    const billable = sessions.filter((s) => s.billable).length;
    const nonBillable = sessions.filter((s) => !s.billable).length;
    return { total: sessions.length, failRate, billable, nonBillable };
  }, []);
  const totalOrganizations = organizations.length;
  const totalUsage = organizations.reduce((sum, org) => sum + org.usage, 0);
  const totalRevenue = organizations.reduce((sum, org) => sum + getVerificationSpend(org), 0);
  const totalEndUsers = platformEndUserAssociations.length;

  const usageData = [
    { month: "Oct", value: 245000 },
    { month: "Nov", value: 312000 },
    { month: "Dec", value: 289000 },
    { month: "Jan", value: 378000 },
    { month: "Feb", value: 425000 },
    { month: "Mar", value: 492000 },
  ];

  const revenueData = [
    { month: "Oct", revenue: 245000, forecast: 240000 },
    { month: "Nov", revenue: 298000, forecast: 280000 },
    { month: "Dec", revenue: 312000, forecast: 310000 },
    { month: "Jan", revenue: 356000, forecast: 350000 },
    { month: "Feb", revenue: 402000, forecast: 395000 },
    { month: "Mar", revenue: 478000, forecast: 445000 },
  ];

  const alerts = useMemo(
    () =>
      organizations
        .map((org, index) => {
          const usageRatio = org.creditBalance > 0 ? getVerificationSpend(org) / org.creditBalance : 0;
          if (org.paymentStanding === "failed") {
            return {
              id: index + 1,
              type: "payment",
              org: org.organizationName,
              message: "Payment failed — update payment method",
              severity: "critical",
              time: "45 min ago",
            };
          }
          if (org.paymentStanding === "overdue") {
            return {
              id: index + 1,
              type: "payment",
              org: org.organizationName,
              message: "Invoice overdue — follow-up required",
              severity: "high",
              time: "2 hours ago",
            };
          }
          if (usageRatio >= 0.9) {
            return {
              id: index + 1,
              type: "credit",
              org: org.organizationName,
              message: `Credit utilization at ${(usageRatio * 100).toFixed(0)}%`,
              severity: usageRatio >= 1 ? "high" : "medium",
              time: "1 hour ago",
            };
          }
          return null;
        })
        .filter((alert): alert is NonNullable<typeof alert> => alert !== null)
        .slice(0, 4),
    [organizations],
  );

  const recentActivity = useMemo(
    () =>
      organizations.slice(0, 6).map((org, index) => ({
        id: index + 1,
        action:
          index % 3 === 0
            ? "Verification volume threshold reviewed"
            : index % 3 === 1
              ? "Organization payment standing reviewed"
              : "Plan credits and email add-on pricing audited",
        org: org.organizationName,
        user: `ops@${org.domain}`,
        time: `${5 + index * 12} min ago`,
      })),
    [organizations],
  );

  return (
    <div className="p-8 space-y-6 max-w-[1800px]">
      <div>
        <h1 className="text-[24px] font-semibold text-foreground">Dashboard</h1>
        <p className="text-[14px] text-muted-foreground mt-1 max-w-4xl">
          Platform-wide overview of organizations, VerifyMe users, verification activity, billable events, credit usage,
          and system health (sample metrics for UI design).
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="p-6 border border-border shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-[12px] text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +12.5%
            </span>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Total Organizations</p>
            <p className="text-[32px] font-semibold text-foreground leading-none">{totalOrganizations}</p>
            <p className="text-[12px] text-muted-foreground mt-2">Current sample dataset</p>
          </div>
        </Card>

        <Card className="p-6 border border-border shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-[12px] text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +8.3%
            </span>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">VerifyMe users</p>
            <p className="text-[32px] font-semibold text-foreground leading-none">{totalEndUsers}</p>
            <p className="text-[12px] text-muted-foreground mt-2">Across all organizations</p>
          </div>
        </Card>

        <Card className="p-6 border border-border shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-[12px] text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +18.7%
            </span>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Billable revenue (sample)</p>
            <p className="text-[32px] font-semibold text-foreground leading-none">
              ${Math.round(totalRevenue).toLocaleString()}
            </p>
            <p className="text-[12px] text-muted-foreground mt-2">From billable verification sessions (sample)</p>
          </div>
        </Card>

        <Card className="p-6 border border-border shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-[12px] text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +24.1%
            </span>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Verification volume</p>
            <p className="text-[32px] font-semibold text-foreground leading-none">
              {Math.round(totalUsage).toLocaleString()}
            </p>
            <p className="text-[12px] text-muted-foreground mt-2">Billable-style events this month (sample)</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <ListChecks className="w-4 h-4 text-primary" />
            <p className="text-[13px] font-semibold text-foreground">Verification sessions (sample)</p>
          </div>
          <p className="text-[28px] font-semibold">{sessionSnapshot.total}</p>
          <p className="text-[12px] text-muted-foreground mt-1">Mock sessions in design dataset</p>
          <Button variant="link" className="px-0 h-auto mt-2" asChild>
            <Link to="/verification-sessions">Open verification sessions</Link>
          </Button>
        </Card>
        <Card className="p-4 border border-border shadow-sm">
          <p className="text-[13px] font-semibold text-foreground mb-2">Failed rate (settled)</p>
          <p className="text-[28px] font-semibold text-orange-700">{sessionSnapshot.failRate.toFixed(1)}%</p>
          <p className="text-[12px] text-muted-foreground mt-1">Failed ÷ non-pending outcomes</p>
        </Card>
        <Card className="p-4 border border-border shadow-sm">
          <p className="text-[13px] font-semibold text-foreground mb-2">Billable vs not</p>
          <p className="text-[22px] font-semibold">
            {sessionSnapshot.billable}{" "}
            <span className="text-muted-foreground text-[14px] font-normal">/ {sessionSnapshot.nonBillable}</span>
          </p>
          <p className="text-[12px] text-muted-foreground mt-1">By final outcome (sample)</p>
        </Card>
        <Card className="p-4 border border-border shadow-sm">
          <p className="text-[13px] font-semibold text-foreground mb-2">Verification Service</p>
          <UnifiedBadge variant="integration" value="Operational (design)" />
          <p className="text-[12px] text-muted-foreground mt-2">No live health check in this UI build</p>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card className="border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-foreground">Platform alerts</h3>
                <p className="text-[13px] text-muted-foreground">Credits, payments, and verification risk signals</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View All Alerts</Button>
          </div>
        </div>
        <div className="divide-y divide-border">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-6 flex items-start gap-4 hover:bg-accent/5 transition-colors">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                alert.severity === 'critical' ? 'bg-red-500' :
                alert.severity === 'high' ? 'bg-orange-500' :
                'bg-yellow-500'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {alert.type === 'credit' && <AlertCircle className="w-4 h-4 text-orange-600" />}
                      {alert.type === 'payment' && <CreditCard className="w-4 h-4 text-red-600" />}
                      {alert.type === 'inactive' && <Activity className="w-4 h-4 text-yellow-600" />}
                      <span className="text-[14px] font-medium text-foreground">{alert.org}</span>
                    </div>
                    <p className="text-[13px] text-muted-foreground">{alert.message}</p>
                  </div>
                  <span className="text-[12px] text-muted-foreground whitespace-nowrap">{alert.time}</span>
                </div>
              </div>
              <Button variant="ghost" size="sm">Resolve</Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Usage Trend Chart */}
        <Card className="border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-foreground">Verification activity</h3>
                <p className="text-[13px] text-muted-foreground">Organization-wide verification attempts over time (sample)</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">1M</Button>
                <Button variant="ghost" size="sm">3M</Button>
                <Button variant="outline" size="sm">6M</Button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={usageData}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  key="xaxis"
                  dataKey="month"
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
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => [`${(value / 1000).toFixed(0)}K events`, 'Verifications']}
                />
                <Area
                  key="area"
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorUsage)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue Trend Chart */}
        <Card className="border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-foreground">Billable revenue trend</h3>
                <p className="text-[13px] text-muted-foreground">Credits, verification fees, and OTP charges (sample)</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">1M</Button>
                <Button variant="ghost" size="sm">3M</Button>
                <Button variant="outline" size="sm">6M</Button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueData}>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  key="xaxis"
                  dataKey="month"
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
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  key="tooltip"
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Line
                  key="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  name="Actual"
                />
                <Line
                  key="forecast"
                  type="monotone"
                  dataKey="forecast"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Forecast"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Platform Activity */}
      <Card className="border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-foreground">Recent platform activity</h3>
                <p className="text-[13px] text-muted-foreground">Verification, credits, and admin actions (sample)</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View Full Log</Button>
          </div>
        </div>
        <div className="divide-y divide-border">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-5 flex items-center gap-4 hover:bg-accent/5 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                <div>
                  <p className="text-[13px] font-medium text-foreground">{activity.action}</p>
                </div>
                <div>
                  <p className="text-[13px] text-foreground">{activity.org}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[12px] text-muted-foreground">{activity.user}</p>
                  <p className="text-[12px] text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
