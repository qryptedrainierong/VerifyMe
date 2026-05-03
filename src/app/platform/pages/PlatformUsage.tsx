import { BarChart3, TrendingUp, Users, AlertCircle, Database, Activity } from "lucide-react";
import { useMemo } from "react";
import { Card } from "../../shared/components/ui/card";
import { Button } from "../../shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shared/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { buildInitialOrganizations, getVerificationSpend } from "../data/platformOrganizationsSample";
import { platformEndUserAssociations } from "../data/platformUsersSample";

export function PlatformUsage() {
  const organizations = useMemo(() => buildInitialOrganizations(), []);
  const totalUsage = organizations.reduce((sum, org) => sum + org.usage, 0);
  const avgUsagePerOrg = organizations.length > 0 ? totalUsage / organizations.length : 0;
  const activeEndUsers = platformEndUserAssociations.filter((user) => user.status === "active").length;
  const orgsOverCreditBudget = organizations.filter((org) => getVerificationSpend(org) > org.creditBalance).length;
  const usageTrendData = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => ({
    date: `Apr ${index + 1}`,
    sessions: Math.round((totalUsage / 9) * (0.88 + index * 0.03)),
  }));
  const topOrganizations = [...organizations]
    .sort((a, b) => b.usage - a.usage)
    .map((org) => ({
      name: org.organizationName,
      usage: org.usage,
    }));

  const apiCallsByType = [
    { type: "Successful Verification", value: 8801640, percentage: 92, color: "bg-green-500" },
    { type: "Failed Verification", value: 765360, percentage: 8, color: "bg-red-500" },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  const formatLargeNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <div className="p-8 space-y-6 max-w-[1800px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-foreground">Usage Analytics</h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            Monitor verification sessions, credits, and linked end users across organizations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30days">
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="p-6 border border-border shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-[12px] text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +18.2%
            </span>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Verification sessions</p>
            <p className="text-[32px] font-semibold text-foreground leading-none">
              {formatNumber(totalUsage)}
            </p>
            <p className="text-[12px] text-muted-foreground mt-2">Platform-wide (sample period)</p>
          </div>
        </Card>

        <Card className="p-6 border border-border shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-[12px] text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +12.4%
            </span>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Avg sessions per organization</p>
            <p className="text-[32px] font-semibold text-foreground leading-none">{formatNumber(Math.round(avgUsagePerOrg))}</p>
            <p className="text-[12px] text-muted-foreground mt-2">Per day (sample)</p>
          </div>
        </Card>

        <Card className="p-6 border border-border shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-[12px] text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +8.7%
            </span>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Active linked end users</p>
            <p className="text-[32px] font-semibold text-foreground leading-none">{formatNumber(activeEndUsers)}</p>
            <p className="text-[12px] text-muted-foreground mt-2">Across all organizations</p>
          </div>
        </Card>

        <Card className="p-6 border border-border shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-[12px] text-red-600 font-medium">Critical</span>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Over credit budget</p>
            <p className="text-[32px] font-semibold text-foreground leading-none">{orgsOverCreditBudget}</p>
            <p className="text-[12px] text-muted-foreground mt-2">Spend exceeds wallet credits</p>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Usage Over Time */}
        <Card className="border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-foreground">Usage Over Time</h3>
                <p className="text-[13px] text-muted-foreground">Daily verification session trends</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">7D</Button>
                <Button variant="ghost" size="sm">30D</Button>
                <Button variant="outline" size="sm">90D</Button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={usageTrendData}>
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
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip
                  key="tooltip"
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => formatLargeNumber(value)}
                />
                <Line
                  key="sessions-line"
                  type="monotone"
                  dataKey="sessions"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  name="Sessions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Organizations by Usage */}
        <Card className="border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-foreground">
                  Top organizations by verification sessions
                </h3>
                <p className="text-[13px] text-muted-foreground">Highest session volume (sample)</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topOrganizations} layout="vertical">
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis
                  key="xaxis"
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <YAxis
                  key="yaxis"
                  type="category"
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <Tooltip
                  key="tooltip"
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => formatLargeNumber(value)}
                />
                <Bar
                  key="usage-bar"
                  dataKey="usage"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                  name="Sessions"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Verification Breakdown by Type */}
      <Card className="border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <h3 className="text-[15px] font-semibold text-foreground">Verification Type</h3>
          <p className="text-[13px] text-muted-foreground">Successful vs failed verifications</p>
        </div>
        <div className="p-6">
          <div className="space-y-5">
            {apiCallsByType.map((item) => (
              <div key={item.type}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <p className="text-[14px] font-medium text-foreground">{item.type}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-[14px] text-muted-foreground">
                      {formatLargeNumber(item.value)} sessions
                    </p>
                    <p className="text-[13px] font-medium text-foreground w-12 text-right">
                      {item.percentage}%
                    </p>
                  </div>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Organization Filter Section */}
      <Card className="border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-foreground">Filter by Organization</h3>
              <p className="text-[13px] text-muted-foreground">
                View usage data for specific organizations
              </p>
            </div>
            <Select defaultValue="all-orgs">
              <SelectTrigger className="w-[240px] h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-orgs">All Organizations</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>{org.organizationName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="p-6">
          <p className="text-[14px] text-muted-foreground text-center">
            Select an organization to view detailed usage analytics
          </p>
        </div>
      </Card>
    </div>
  );
}
