import { BarChart3, AlertCircle, Calendar, CreditCard } from "lucide-react";
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
  enterpriseUsageSpend,
} from "../data/enterpriseSample";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";

export function EnterpriseUsage() {
  const usageData = enterpriseUsageTrend.map((point) => ({ date: point.date, sessions: point.usage }));

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
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <PortalPageFrame
      title="Usage & credits"
      description="Credit balance (monetary wallet), plan, billable verification sessions, delivery add-ons, and how outcomes map to credits."
      headerActions={
        <div className="flex flex-wrap items-center gap-3">
          <Select defaultValue="current">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current period</SelectItem>
              <SelectItem value="last">Last period</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export report</Button>
        </div>
      }
      bodyClassName="space-y-6"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5 border border-border shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CreditCard className="w-4 h-4" />
            <p className="text-[12px] font-medium uppercase tracking-wide">Credit balance</p>
          </div>
          <p className="text-[22px] font-semibold tabular-nums">{formatCurrency(enterpriseOrganization.creditBalance)}</p>
          <p className="text-[12px] text-muted-foreground mt-1">Wallet (monetary credits)</p>
        </Card>
        <Card className="p-5 border border-border shadow-sm">
          <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Monthly included credits</p>
          <p className="text-[22px] font-semibold tabular-nums">
            {formatCurrency(enterpriseOrganization.monthlyIncludedCredits)}
          </p>
          <p className="text-[12px] text-muted-foreground mt-1">From your plan allocation</p>
        </Card>
        <Card className="p-5 border border-border shadow-sm">
          <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Top-up credits</p>
          <p className="text-[22px] font-semibold tabular-nums">{formatCurrency(enterpriseOrganization.topUpCredits)}</p>
          <p className="text-[12px] text-muted-foreground mt-1">Roll forward with the account</p>
        </Card>
        <Card className="p-5 border border-border shadow-sm">
          <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Price per billable verification</p>
          <p className="text-[22px] font-semibold tabular-nums">{formatCurrency(enterpriseOrganization.pricePerVerification)}</p>
          <p className="text-[12px] text-muted-foreground mt-1">Per billable session outcome</p>
        </Card>
      </div>

      <Card className="p-5 border border-border shadow-sm">
        <h3 className="text-[15px] font-semibold text-foreground mb-2">Delivery add-ons</h3>
        <p className="text-[14px] text-muted-foreground mb-1">
          Email delivery add-on billing:{" "}
          <strong className="text-foreground">{enterpriseOrganization.emailOtpBillingEnabled ? "On" : "Off"}</strong> for
          this organization.
        </p>
        <p className="text-[13px] text-muted-foreground">
          SMS delivery (future): billed per send when the add-on is available.
        </p>
      </Card>

      <Card className="p-5 border border-border shadow-sm">
        <h3 className="text-[15px] font-semibold text-foreground mb-2">Billable outcomes</h3>
        <ul className="text-[13px] text-muted-foreground space-y-1 list-disc list-inside">
          <li>ID Proof Pass — billable</li>
          <li>ID Proof Fail — billable</li>
          <li>Expired / Error / Indeterminate / Cancelled / Pending / Awaiting verification — not billable</li>
        </ul>
      </Card>

      {enterpriseCreditUtilizationPct >= 80 && (
        <Card className="p-5 border border-orange-200 bg-orange-50/50 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[14px] font-medium text-foreground mb-1">Approaching credit utilization threshold</p>
              <p className="text-[13px] text-muted-foreground">
                {enterpriseCreditUtilizationPct.toFixed(1)}% of credit balance applied to billable verification spend (
                {formatCurrency(enterpriseUsageSpend)} of {formatCurrency(enterpriseOrganization.creditBalance)}).
              </p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link to="/billing">View billing</Link>
            </Button>
          </div>
        </Card>
      )}

      <Card className="border border-border p-6 shadow-sm sm:p-8">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-[18px] font-semibold text-foreground">Verification sessions</p>
              <p className="text-[13px] text-muted-foreground">
                Billable verification volume for this period. Credits above are monetary wallet value —
                verification volume (period) is tracked separately from credits.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center px-3 py-1.5 rounded-md text-[12px] font-medium bg-orange-100 text-orange-700 border border-orange-200">
            {enterpriseCreditUtilizationPct >= 80 ? "Watch credits" : "Healthy"} — {enterpriseCreditUtilizationPct.toFixed(1)}% of balance used
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="text-[48px] font-semibold text-foreground leading-none">
                {formatNumber(enterpriseOrganization.usage)}
              </p>
              <p className="text-[15px] text-muted-foreground mt-2">
                Compared to period verification volume baseline ({formatNumber(enterpriseUsageLimit)} sessions)
              </p>
            </div>
            <p className="text-[32px] font-semibold text-orange-600">{enterpriseCreditUtilizationPct.toFixed(1)}%</p>
          </div>

          <Progress value={Math.min(enterpriseCreditUtilizationPct, 100)} className="h-3" />

          <p className="text-[12px] text-muted-foreground border-t border-border pt-3">
            The bar reflects billable spend vs monetary credit balance. Period verification volume is reported separately
            from credits.
          </p>

          <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
            <p className="text-[14px] text-muted-foreground">
              <span className="font-medium text-foreground">
                {formatNumber(Math.max(enterpriseUsageLimit - enterpriseOrganization.usage, 0))} sessions
              </span>{" "}
              below current period baseline (not a credit limit)
            </p>
            <p className="text-[13px] text-muted-foreground">
              Billable spend: <span className="font-medium text-foreground">{formatCurrency(enterpriseUsageSpend)}</span>
            </p>
          </div>
        </div>
      </Card>

      <Card className="border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <h3 className="text-[16px] font-semibold text-foreground">Verification sessions over time</h3>
          <p className="text-[13px] text-muted-foreground">Billable-oriented volume trend</p>
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
                formatter={(value: number | string) => [Number(value).toLocaleString(), "Sessions"]}
              />
              <Line
                key="sessions-line"
                type="monotone"
                dataKey="sessions"
                stroke="rgb(59, 130, 246)"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Sessions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6 border border-border shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-semibold text-foreground mb-1">Current period</h3>
            <p className="text-[13px] text-muted-foreground mb-3">April 1, 2024 — April 30, 2024</p>
            <div className="flex flex-wrap items-center gap-6 text-[13px]">
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
              <div>
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-medium text-foreground ml-2">{enterpriseOrganization.plan}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link to="/billing">View billing</Link>
          </Button>
        </div>
      </Card>
    </PortalPageFrame>
  );
}
