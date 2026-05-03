import { Users, CreditCard, AlertCircle, BarChart3 } from "lucide-react";
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
  enterpriseUsageTrend,
  enterpriseUsageSpend,
} from "../data/enterpriseSample";

export function EnterpriseDashboard() {
  const usageData = enterpriseUsageTrend;

  const recentActivity = enterpriseEndUsers.slice(0, 4).map((user, index) => ({
    id: index + 1,
    user: user.enterpriseUsername,
    action:
      user.status === "active" ? "Completed an identity verification session" : "Has a pending VerifyMe link",
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
          Organization-level overview of credit balance, verification attempts, success and failure results, OTP events,
          recent activity, and integration status (sample data).
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="p-6 border border-border shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Team seats</p>
            <p className="text-[32px] font-semibold text-foreground leading-none">{enterpriseOrganization.seatsUsed}</p>
            <p className="text-[13px] text-muted-foreground mt-2">Organization portal users</p>
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
              {formatCurrency(enterpriseOrganization.creditBalance)} included credit
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
            <p className="text-[13px] text-muted-foreground mb-1">Verifications this month</p>
            <p className="text-[32px] font-semibold text-foreground leading-none">
              {enterpriseOrganization.usage.toLocaleString()}
            </p>
            <p className="text-[13px] text-muted-foreground mt-2">
              {formatCurrency(enterpriseUsageSpend)} verification spend
            </p>
          </div>
        </Card>
      </div>

      {/* Alerts */}
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
        {/* Usage Trend Chart */}
        <Card className="col-span-2 border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-semibold text-foreground">Verification volume</h3>
                <p className="text-[13px] text-muted-foreground">Completed verification attempts over the last 9 days (sample)</p>
              </div>
              <Button variant="outline" size="sm">Last 30 Days</Button>
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
                  formatter={(value: any) => [`${value.toLocaleString()} verifications`, "Volume"]}
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

        {/* Credit Progress */}
        <Card className="border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <h3 className="text-[16px] font-semibold text-foreground">Credit Status</h3>
            <p className="text-[13px] text-muted-foreground">Current billing period</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[13px] font-medium text-foreground">Verification Spend</p>
                <p className="text-[13px] text-muted-foreground">
                  {formatCurrency(enterpriseUsageSpend)} / {formatCurrency(enterpriseOrganization.creditBalance)} included credit
                </p>
              </div>
              <Progress value={Math.min(enterpriseCreditUtilizationPct, 100)} className="h-2" />
              <p className="text-[12px] text-orange-600 mt-1.5">{enterpriseCreditUtilizationPct.toFixed(1)}% credit used</p>
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-muted-foreground">Resets in</p>
                <p className="text-[12px] font-medium text-foreground">12 days</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-muted-foreground">Avg. daily verifications</p>
                <p className="text-[12px] font-medium text-foreground">6.9K</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-muted-foreground">Credit remaining</p>
                <p className="text-[12px] font-medium text-foreground">{formatCurrency(enterpriseCreditRemaining)}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-muted-foreground">Credit utilization</p>
                <p className="text-[12px] font-medium text-foreground">{enterpriseCreditUtilizationPct.toFixed(1)}%</p>
              </div>
            </div>

            <Button className="w-full" variant="outline" asChild>
              <Link to="/usage-credits">View usage and credits</Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Team Activity */}
      <Card className="border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[16px] font-semibold text-foreground">Recent activity</h3>
              <p className="text-[13px] text-muted-foreground">Verification and portal actions (sample)</p>
            </div>
            <Button variant="ghost" size="sm">View All</Button>
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
