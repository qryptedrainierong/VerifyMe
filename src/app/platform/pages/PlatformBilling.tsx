import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  CreditCard,
  Download,
  Search,
  MoreVertical,
  ArrowUpDown,
} from "lucide-react";
import { useState } from "react";
import { useMemo } from "react";
import { Card } from "../../shared/components/ui/card";
import { Button } from "../../shared/components/ui/button";
import { Input } from "../../shared/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../shared/components/ui/dropdown-menu";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import { buildInitialOrganizations, getVerificationSpend } from "../data/platformOrganizationsSample";

export function PlatformBilling() {
  const [searchQuery, setSearchQuery] = useState("");
  const organizations = useMemo(() => buildInitialOrganizations(), []);
  const mrr = organizations.reduce((sum, org) => sum + getVerificationSpend(org), 0);
  const activeSubscriptions = organizations.length;

  const plans = [
    {
      name: "Enterprise",
      organizations: organizations.filter((org) => org.plan === "Enterprise").length,
      mrr: organizations
        .filter((org) => org.plan === "Enterprise")
        .reduce((sum, org) => sum + getVerificationSpend(org), 0),
      growth: 18.5,
    },
    {
      name: "Professional",
      organizations: organizations.filter((org) => org.plan === "Professional").length,
      mrr: organizations
        .filter((org) => org.plan === "Professional")
        .reduce((sum, org) => sum + getVerificationSpend(org), 0),
      growth: 12.3,
    },
    {
      name: "Starter",
      organizations: organizations.filter((org) => org.plan === "Starter").length,
      mrr: organizations
        .filter((org) => org.plan === "Starter")
        .reduce((sum, org) => sum + getVerificationSpend(org), 0),
      growth: 8.7,
    },
  ];

  const invoices = organizations.map((org, index) => ({
    id: `INV-2024-${String(412 + index)}`,
    organization: org.name,
    organizationId: org.id,
    amount: Math.round(getVerificationSpend(org)),
    date: "2024-04-01",
    dueDate: "2024-04-15",
    status: org.billingStatus === "current" ? "paid" : org.billingStatus,
  }));

  const billingAlerts = invoices
    .filter((invoice) => invoice.status === "failed" || invoice.status === "overdue" || invoice.status === "pending")
    .map((invoice, index) => ({
      id: index + 1,
      type: invoice.status,
      organization: invoice.organization,
      message:
        invoice.status === "failed"
          ? "Payment failed - requires retry"
          : invoice.status === "overdue"
            ? "Invoice overdue and needs follow-up"
            : "Invoice pending payment confirmation",
      amount: invoice.amount,
      severity: invoice.status === "failed" ? "critical" : invoice.status === "overdue" ? "high" : "medium",
      time: `${index + 1} hour${index === 0 ? "" : "s"} ago`,
    }));

  const recentBillingActivity = invoices.slice(0, 6).map((invoice, index) => ({
    id: invoice.id,
    action:
      invoice.status === "paid"
        ? "Invoice paid"
        : invoice.status === "pending"
          ? "Invoice generated"
          : invoice.status === "overdue"
            ? "Payment reminder sent"
            : "Payment retry initiated",
    organization: invoice.organization,
    amount: invoice.amount,
    time: `${10 + index * 15} min ago`,
  }));
  const failedPayments = invoices.filter((invoice) => invoice.status === "failed").length;
  const overdueInvoices = invoices.filter((invoice) => invoice.status === "overdue").length;
  const overdueValue = invoices
    .filter((invoice) => invoice.status === "overdue")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="p-8 space-y-6 max-w-[1800px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-foreground">Billing & Credits</h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            Plan credits, top-ups, per-organization pricing, verification charges, OTP billing, and credit transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>Generate Invoices</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="p-6 border border-border shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-[12px] text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +15.8%
            </span>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Monthly Recurring Revenue</p>
            <p className="text-[32px] font-semibold text-foreground leading-none">{formatCurrency(mrr)}</p>
            <p className="text-[12px] text-muted-foreground mt-2">+$65K vs last month</p>
          </div>
        </Card>

        <Card className="p-6 border border-border shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-[12px] text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +8.2%
            </span>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Active Subscriptions</p>
            <p className="text-[32px] font-semibold text-foreground leading-none">{formatNumber(activeSubscriptions)}</p>
            <p className="text-[12px] text-muted-foreground mt-2">Across all plans</p>
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
            <p className="text-[13px] text-muted-foreground mb-1">Failed Payments</p>
            <p className="text-[32px] font-semibold text-foreground leading-none">{failedPayments}</p>
            <p className="text-[12px] text-muted-foreground mt-2">Needs immediate action</p>
          </div>
        </Card>

        <Card className="p-6 border border-border shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-[12px] text-orange-600 font-medium">Attention</span>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Overdue Invoices</p>
            <p className="text-[32px] font-semibold text-foreground leading-none">{overdueInvoices}</p>
            <p className="text-[12px] text-muted-foreground mt-2">Total value: {formatCurrency(overdueValue)}</p>
          </div>
        </Card>
      </div>

      {/* Plans Overview */}
      <Card className="border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <h3 className="text-[15px] font-semibold text-foreground">Plans Overview</h3>
          <p className="text-[13px] text-muted-foreground">Revenue breakdown by subscription tier</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.name} className="p-5 border border-border rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-[15px] font-semibold text-foreground">{plan.name}</h4>
                  <span className="text-[12px] text-green-600 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +{plan.growth}%
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[12px] text-muted-foreground mb-1">Organizations</p>
                    <p className="text-[22px] font-semibold text-foreground">
                      {formatNumber(plan.organizations)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] text-muted-foreground mb-1">Monthly Revenue</p>
                    <p className="text-[22px] font-semibold text-foreground">
                      {formatCurrency(plan.mrr)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Recent Billing Activity */}
      <Card className="border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-foreground">Recent Billing Activity</h3>
              <p className="text-[13px] text-muted-foreground">Latest billing timeline events</p>
            </div>
            <Button variant="outline" size="sm">View Timeline</Button>
          </div>
        </div>
        <div className="divide-y divide-border">
          {recentBillingActivity.map((item) => (
            <div key={item.id} className="p-5 flex items-center gap-4 hover:bg-accent/5 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                <p className="text-[13px] font-medium text-foreground">{item.action}</p>
                <p className="text-[13px] text-foreground">{item.organization}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[12px] text-muted-foreground">{formatCurrency(item.amount)}</p>
                  <p className="text-[12px] text-muted-foreground">{item.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Billing Alerts */}
      <Card className="border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-foreground">Billing Alerts</h3>
              <p className="text-[13px] text-muted-foreground">Issues requiring attention</p>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </div>
        <div className="divide-y divide-border">
          {billingAlerts.map((alert) => (
            <div key={alert.id} className="p-5 flex items-start gap-4 hover:bg-accent/5 transition-colors">
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  alert.severity === "critical"
                    ? "bg-red-500"
                    : alert.severity === "high"
                    ? "bg-orange-500"
                    : "bg-yellow-500"
                }`}
              />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[14px] font-medium text-foreground">{alert.organization}</p>
                      <span className="text-[12px] text-muted-foreground">•</span>
                      <p className="text-[14px] font-medium text-foreground">
                        {formatCurrency(alert.amount)}
                      </p>
                    </div>
                    <p className="text-[13px] text-muted-foreground">{alert.message}</p>
                  </div>
                  <span className="text-[12px] text-muted-foreground whitespace-nowrap">
                    {alert.time}
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm">Resolve</Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Invoices Table */}
      <Card className="border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-semibold text-foreground">Recent Invoices</h3>
              <p className="text-[13px] text-muted-foreground">All invoices and payment statuses</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-background max-w-md"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-accent/5">
              <tr>
                <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Invoice ID
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Organization
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Amount
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Date
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Due Date
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left p-4 text-[13px] font-medium text-muted-foreground w-[60px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-accent/5 transition-colors">
                  <td className="p-4">
                    <p className="text-[14px] font-mono text-foreground">{invoice.id}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-[14px] text-foreground">{invoice.organization}</p>
                    <p className="text-[12px] text-muted-foreground font-mono">
                      {invoice.organizationId}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-[14px] font-semibold text-foreground">
                      {formatCurrency(invoice.amount)}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-[14px] text-foreground">{formatDate(invoice.date)}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-[14px] text-foreground">{formatDate(invoice.dueDate)}</p>
                  </td>
                  <td className="p-4">
                    <UnifiedBadge
                      variant="billing"
                      value={invoice.status === "paid"
                        ? "Paid"
                        : invoice.status === "pending"
                        ? "Pending"
                        : invoice.status === "overdue"
                        ? "Overdue"
                        : "Failed"}
                    />
                  </td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Invoice</DropdownMenuItem>
                        <DropdownMenuItem>Download PDF</DropdownMenuItem>
                        <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                        <DropdownMenuItem>Refund</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
