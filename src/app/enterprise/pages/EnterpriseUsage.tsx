import { BarChart3, AlertCircle, Calendar } from "lucide-react";
import { Link } from "react-router";
import { Card } from "../../shared/components/ui/card";
import { Button } from "../../shared/components/ui/button";
import { Progress } from "../../shared/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shared/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  enterpriseCreditRemaining,
  enterpriseCreditUtilizationPct,
  enterpriseOrganization,
  enterpriseUsageTrend,
  enterpriseUsageLimit,
  enterpriseUsagePct,
  enterpriseUsageSpend,
} from "../data/enterpriseSample";

export function EnterpriseUsage() {
  const usageData = enterpriseUsageTrend.map((point) => ({ date: point.date, apiCalls: point.usage }));

  const usageMetrics = [
    {
      label: "Verification attempts",
      current: enterpriseOrganization.usage,
      limit: enterpriseUsageLimit,
      percentage: Math.round(enterpriseUsagePct),
      unit: "verifications",
      icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
      color: "bg-blue-500/10",
      warning: enterpriseCreditUtilizationPct >= 80,
      details: "OIDC-style verification sessions counted toward this period",
    },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="p-8 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-semibold text-foreground">Usage & Credits</h1>
          <p className="text-[15px] text-muted-foreground mt-1">
            Credit balance, monthly and top-up credits, deductions, verification pricing, OTP charges, and usage
            breakdown (sample data)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="current">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Period</SelectItem>
              <SelectItem value="last">Last Period</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      {/* Warning Banner */}
      {usageMetrics.some((m) => m.warning) && (
        <Card className="p-5 border border-orange-200 bg-orange-50/50 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[14px] font-medium text-foreground mb-1">
                You're approaching your included credit limit
              </p>
              <p className="text-[13px] text-muted-foreground">
                You have used {enterpriseCreditUtilizationPct.toFixed(1)}% of your included credit for this period
                ({formatCurrency(enterpriseUsageSpend)} of {formatCurrency(enterpriseOrganization.credit)}).
              </p>
            </div>
            <Button size="sm">Upgrade Plan</Button>
          </div>
        </Card>
      )}

      {/* Verification volume */}
      <Card className="p-8 border border-border shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-[18px] font-semibold text-foreground">Verification attempts</p>
              <p className="text-[13px] text-muted-foreground">Current billing period (sample)</p>
            </div>
          </div>
          <span className="inline-flex items-center px-3 py-1.5 rounded-md text-[12px] font-medium bg-orange-100 text-orange-700 border border-orange-200">
            {enterpriseCreditUtilizationPct >= 80 ? "Warning" : "Healthy"} - {enterpriseCreditUtilizationPct.toFixed(1)}% Credit Used
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[48px] font-semibold text-foreground leading-none">
                {formatNumber(enterpriseOrganization.usage)}
              </p>
              <p className="text-[15px] text-muted-foreground mt-2">
                of {formatNumber(enterpriseUsageLimit)} included verifications
              </p>
            </div>
            <p className="text-[32px] font-semibold text-orange-600">
              {enterpriseCreditUtilizationPct.toFixed(1)}%
            </p>
          </div>

          <div>
            <Progress
              value={Math.min(enterpriseCreditUtilizationPct, 100)}
              className="h-3"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[14px] text-muted-foreground">
              <span className="font-medium text-foreground">
                {formatNumber(Math.max(enterpriseUsageLimit - enterpriseOrganization.usage, 0))} verifications
              </span>{" "}
              remaining
            </p>
            <p className="text-[13px] text-muted-foreground">
              Spend: <span className="font-medium text-foreground">{formatCurrency(enterpriseUsageSpend)}</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Usage Trend Chart */}
      <Card className="border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[16px] font-semibold text-foreground">Verification volume over time</h3>
              <p className="text-[13px] text-muted-foreground">Billable verification attempts (sample trend)</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={320}>
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
                formatter={(value: any) => value.toLocaleString()}
              />
              <Line
                key="api-calls-line"
                type="monotone"
                dataKey="apiCalls"
                stroke="rgb(59, 130, 246)"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Verifications"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Billing Period Info */}
      <Card className="p-6 border border-border shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-semibold text-foreground mb-1">
              Current Billing Period
            </h3>
            <p className="text-[13px] text-muted-foreground mb-3">
              April 1, 2024 - April 30, 2024
            </p>
            <div className="flex items-center gap-6 text-[13px]">
              <div>
                <span className="text-muted-foreground">Days remaining:</span>
                <span className="font-medium text-foreground ml-2">21 days</span>
              </div>
              <div>
                <span className="text-muted-foreground">Resets on:</span>
                <span className="font-medium text-foreground ml-2">May 1, 2024</span>
              </div>
              <div>
                <span className="text-muted-foreground">Credit remaining:</span>
                <span className="font-medium text-foreground ml-2">{formatCurrency(enterpriseCreditRemaining)}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link to="/billing">View billing</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
