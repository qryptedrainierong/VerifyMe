import { Download, Filter, Search, ArrowUpDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Card } from "../../shared/components/ui/card";
import { Button } from "../../shared/components/ui/button";
import { Input } from "../../shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../shared/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../shared/components/ui/alert-dialog";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import { buildInitialOrganizations, getVerificationSpend } from "../data/platformOrganizationsSample";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";
import { shouldIgnoreRowOpenClick } from "../utils/tableRowNav";

type InvoiceRow = {
  id: string;
  organization: string;
  organizationId: string;
  amount: number;
  date: string;
  dueDate: string;
  status: string;
};

export function PlatformBilling() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRow | null>(null);
  const [refundConfirmOpen, setRefundConfirmOpen] = useState(false);
  const [reminderConfirmOpen, setReminderConfirmOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const organizations = useMemo(() => buildInitialOrganizations(), []);
  const mrr = organizations.reduce((sum, org) => sum + getVerificationSpend(org), 0);
  const activeOrganizations = organizations.length;

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

  const invoices: InvoiceRow[] = organizations.map((org, index) => ({
    id: `INV-2024-${String(412 + index)}`,
    organization: org.organizationName,
    organizationId: org.id,
    amount: Math.round(getVerificationSpend(org)),
    date: "2024-04-01",
    dueDate: "2024-04-15",
    status: org.paymentStanding === "current" ? "paid" : org.paymentStanding,
  }));

  const filteredInvoices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return invoices.filter(
      (inv) =>
        q.length === 0 ||
        inv.id.toLowerCase().includes(q) ||
        inv.organization.toLowerCase().includes(q) ||
        inv.organizationId.toLowerCase().includes(q),
    );
  }, [invoices, searchQuery]);

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

  const billingStatusLabel = (invoice: InvoiceRow) =>
    invoice.status === "paid"
      ? "Paid"
      : invoice.status === "pending"
        ? "Pending"
        : invoice.status === "overdue"
          ? "Overdue"
          : "Failed";

  return (
    <>
      <PortalPageFrame
        title="Billing & Credits"
        description="Plan credits, top-ups, per-organization pricing, verification charges, OTP billing, and credit transactions."
        headerActions={
          <>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button>Generate Invoices</Button>
          </>
        }
        bodyClassName="space-y-6"
      >
      {actionMessage ? (
        <div className="rounded-md border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm text-green-700 dark:text-green-300">
          {actionMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{formatCurrency(mrr)}</p>
        </Card>
        <Card className="border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Active organizations</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{formatNumber(activeOrganizations)}</p>
        </Card>
        <Card className="border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Failed payments</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{failedPayments}</p>
        </Card>
        <Card className="border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Overdue invoices</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{overdueInvoices}</p>
          <p className="mt-1 text-xs text-muted-foreground">Outstanding {formatCurrency(overdueValue)}</p>
        </Card>
      </div>

      {/* Plans Overview */}
      <Card className="border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <h3 className="text-[15px] font-semibold text-foreground">Plans Overview</h3>
          <p className="text-[13px] text-muted-foreground">Revenue breakdown by plan tier</p>
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
        <div className="border-b border-border p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-foreground">Recent Invoices</h3>
              <p className="text-[13px] text-muted-foreground">Click a row for invoice detail and billing controls (mock).</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 max-w-md bg-background pl-10"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0"
              aria-label="Clear search"
              onClick={() => setSearchQuery("")}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-accent/5">
              <tr>
                <th className="p-4 text-left text-[13px] font-medium text-muted-foreground">
                  <span className="flex items-center gap-1">
                    Invoice ID
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="p-4 text-left text-[13px] font-medium text-muted-foreground">
                  <span className="flex items-center gap-1">
                    Organization
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="p-4 text-left text-[13px] font-medium text-muted-foreground">
                  <span className="flex items-center gap-1">
                    Amount
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="p-4 text-left text-[13px] font-medium text-muted-foreground">
                  <span className="flex items-center gap-1">
                    Date
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="p-4 text-left text-[13px] font-medium text-muted-foreground">
                  <span className="flex items-center gap-1">
                    Due date
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="p-4 text-left text-[13px] font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                    No invoices match your search.
                  </td>
                </tr>
              ) : null}
              {filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="cursor-pointer transition-colors hover:bg-accent/10"
                  onClick={(e) => {
                    if (shouldIgnoreRowOpenClick(e.target)) return;
                    setSelectedInvoice(invoice);
                  }}
                >
                  <td className="p-4">
                    <p className="font-mono text-[14px] text-foreground">{invoice.id}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-[14px] text-foreground">{invoice.organization}</p>
                    <p className="font-mono text-[12px] text-muted-foreground">{invoice.organizationId}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-[14px] font-semibold text-foreground">{formatCurrency(invoice.amount)}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-[14px] text-foreground">{formatDate(invoice.date)}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-[14px] text-foreground">{formatDate(invoice.dueDate)}</p>
                  </td>
                  <td className="p-4">
                    <UnifiedBadge variant="billing" value={billingStatusLabel(invoice)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PortalPageFrame>

      <Dialog open={selectedInvoice !== null} onOpenChange={(o) => !o && setSelectedInvoice(null)}>
        <DialogContent className="flex max-h-[min(90vh,880px)] flex-col gap-0 overflow-hidden sm:max-w-3xl">
          <DialogHeader className="shrink-0 space-y-1 border-b border-border pb-4 text-left">
            <DialogTitle>{selectedInvoice?.id ?? "Invoice"}</DialogTitle>
            <DialogDescription>
              {selectedInvoice
                ? `${selectedInvoice.organization} · ${formatCurrency(selectedInvoice.amount)} · ${billingStatusLabel(selectedInvoice)}`
                : "Invoice detail (mock data)."}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice ? (
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-1 py-4 text-sm">
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <p className="text-xs font-medium text-muted-foreground">Summary</p>
                <div className="mt-2">
                  <UnifiedBadge variant="billing" value={billingStatusLabel(selectedInvoice)} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Details</p>
                <p>
                  <span className="text-muted-foreground">Organization:</span> {selectedInvoice.organization}
                </p>
                <p className="font-mono text-xs text-muted-foreground">{selectedInvoice.organizationId}</p>
                <p>
                  <span className="text-muted-foreground">Amount:</span> {formatCurrency(selectedInvoice.amount)}
                </p>
                <p>
                  <span className="text-muted-foreground">Issued:</span> {formatDate(selectedInvoice.date)}
                </p>
                <p>
                  <span className="text-muted-foreground">Due:</span> {formatDate(selectedInvoice.dueDate)}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Payment references, card tokens, and bank identifiers are never shown in VerifyMe Admin (mock UI).
                </p>
              </div>
              <div className="space-y-2 border-t border-border pt-4">
                <p className="text-xs font-medium text-muted-foreground">Billing controls</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Refunds and reminders require confirmation. Actions below are mock / future backend integration.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setReminderConfirmOpen(true)}>
                    Send payment reminder (mock)…
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setRefundConfirmOpen(true)}>
                    Request refund (mock / future)…
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter className="shrink-0 border-t border-border px-0 pt-4">
            <Button type="button" variant="outline" onClick={() => setSelectedInvoice(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={reminderConfirmOpen} onOpenChange={setReminderConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send payment reminder?</AlertDialogTitle>
            <AlertDialogDescription>
              Mock only — no email is sent. In production this would queue a reminder for the billing contact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setReminderConfirmOpen(false);
                const id = selectedInvoice?.id ?? "invoice";
                setSelectedInvoice(null);
                setActionMessage(`Payment reminder queued for ${id} (mock).`);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={refundConfirmOpen} onOpenChange={setRefundConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request refund?</AlertDialogTitle>
            <AlertDialogDescription>
              Mock / future — billing operations are not executed in this prototype. Confirm to record intent only.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setRefundConfirmOpen(false);
                const id = selectedInvoice?.id ?? "invoice";
                setSelectedInvoice(null);
                setActionMessage(`Refund request recorded for ${id} (mock / future).`);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
