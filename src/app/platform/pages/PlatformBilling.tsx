import { Download, Filter, Search, TrendingUp } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shared/components/ui/select";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import { buildInitialOrganizations, getVerificationSpend } from "../data/platformOrganizationsSample";
import {
  getPlatformBillingInvoices,
  sortInvoicesForDisplay,
  type PlatformBillingInvoiceRow,
} from "../data/platformBillingInvoicesMock";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";
import { shouldIgnoreRowOpenClick } from "../utils/tableRowNav";

export function PlatformBilling() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<PlatformBillingInvoiceRow | null>(null);
  const [invoiceListMode, setInvoiceListMode] = useState<"action" | "all">("action");
  const [refundConfirmOpen, setRefundConfirmOpen] = useState(false);
  const [reminderConfirmOpen, setReminderConfirmOpen] = useState(false);
  const [reviewedConfirmOpen, setReviewedConfirmOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const organizations = useMemo(() => buildInitialOrganizations(), []);
  const monthlyVerificationSpend = organizations.reduce((sum, org) => sum + getVerificationSpend(org), 0);
  const activeOrganizations = organizations.length;

  const plans = [
    {
      name: "Enterprise",
      organizations: organizations.filter((org) => org.plan === "Enterprise").length,
      monthlySpend: organizations
        .filter((org) => org.plan === "Enterprise")
        .reduce((sum, org) => sum + getVerificationSpend(org), 0),
      growth: 18.5,
    },
    {
      name: "Professional",
      organizations: organizations.filter((org) => org.plan === "Professional").length,
      monthlySpend: organizations
        .filter((org) => org.plan === "Professional")
        .reduce((sum, org) => sum + getVerificationSpend(org), 0),
      growth: 12.3,
    },
    {
      name: "Starter",
      organizations: organizations.filter((org) => org.plan === "Starter").length,
      monthlySpend: organizations
        .filter((org) => org.plan === "Starter")
        .reduce((sum, org) => sum + getVerificationSpend(org), 0),
      growth: 8.7,
    },
  ];

  const invoiceSource = useMemo(() => getPlatformBillingInvoices(), []);
  const sortedInvoices = useMemo(() => sortInvoicesForDisplay(invoiceSource), [invoiceSource]);

  const filteredInvoices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sortedInvoices.filter((inv) => {
      if (invoiceListMode === "action" && !inv.actionRequired) return false;
      if (q.length === 0) return true;
      return (
        inv.id.toLowerCase().includes(q) ||
        inv.organization.toLowerCase().includes(q) ||
        inv.organizationId.toLowerCase().includes(q) ||
        inv.periodLabel.toLowerCase().includes(q)
      );
    });
  }, [sortedInvoices, searchQuery, invoiceListMode]);

  const billingAlerts = invoiceSource
    .filter(
      (invoice) =>
        invoice.actionRequired ||
        invoice.status === "failed" ||
        invoice.status === "overdue" ||
        invoice.status === "pending",
    )
    .slice(0, 8)
    .map((invoice, index) => ({
      id: index + 1,
      type: invoice.status,
      organization: invoice.organization,
      message:
        invoice.status === "failed"
          ? "Payment failed — retry or contact billing"
          : invoice.status === "overdue"
            ? "Invoice overdue"
            : invoice.status === "refund_requested"
              ? "Refund requested"
              : invoice.status === "dispute_review"
                ? "Dispute under review"
                : "Pending payment",
      amount: invoice.amount,
      severity: invoice.status === "failed" ? "critical" : invoice.status === "overdue" ? "high" : "medium",
      time: `${index + 1} hour${index === 0 ? "" : "s"} ago`,
    }));

  const recentBillingActivity = sortInvoicesForDisplay(invoiceSource)
    .slice(0, 6)
    .map((invoice, index) => ({
      id: invoice.id,
      action:
        invoice.status === "paid"
          ? "Invoice paid"
          : invoice.status === "pending"
            ? "Invoice issued"
            : invoice.status === "overdue"
              ? "Payment reminder"
              : invoice.status === "failed"
                ? "Payment retry"
                : "Billing update",
      organization: invoice.organization,
      amount: invoice.amount,
      time: `${10 + index * 15} min ago`,
    }));
  const failedPayments = invoiceSource.filter((invoice) => invoice.status === "failed").length;
  const overdueInvoices = invoiceSource.filter((invoice) => invoice.status === "overdue").length;
  const overdueValue = invoiceSource
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

  const billingStatusLabel = (invoice: PlatformBillingInvoiceRow) => {
    const m: Record<PlatformBillingInvoiceRow["status"], string> = {
      paid: "Paid",
      current: "Current",
      pending: "Pending",
      overdue: "Overdue",
      failed: "Failed",
      refund_requested: "Refund requested",
      dispute_review: "Dispute review",
    };
    return m[invoice.status];
  };

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
    });

  return (
    <>
      <PortalPageFrame
        title="Billing & Credits"
        description="Invoices, payment standing, and verification-related charges."
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
          <p className="text-xs text-muted-foreground">Monthly verification spend</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{formatCurrency(monthlyVerificationSpend)}</p>
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

      {/* Invoices Table */}
      <Card className="border border-border shadow-sm">
        <div className="border-b border-border p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-[15px] font-semibold text-foreground">Invoices</h3>
              <p className="text-[13px] text-muted-foreground">
                Start with invoices that require action; open a row for reminders, refunds, or dispute review.
              </p>
            </div>
            <Select
              value={invoiceListMode}
              onValueChange={(v) => setInvoiceListMode(v as "action" | "all")}
            >
              <SelectTrigger className="h-10 w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="action">Requires action</SelectItem>
                <SelectItem value="all">All invoices</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoice id, organization, period…"
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
          <table className="w-full min-w-[1000px]">
            <thead className="border-b border-border bg-accent/5">
              <tr>
                <th className="p-4 text-left text-[13px] font-medium text-muted-foreground">Invoice ID</th>
                <th className="p-4 text-left text-[13px] font-medium text-muted-foreground">Organization</th>
                <th className="p-4 text-left text-[13px] font-medium text-muted-foreground">Period</th>
                <th className="p-4 text-left text-[13px] font-medium text-muted-foreground">Amount</th>
                <th className="p-4 text-left text-[13px] font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left text-[13px] font-medium text-muted-foreground">Action required</th>
                <th className="p-4 text-left text-[13px] font-medium text-muted-foreground">Issued</th>
                <th className="p-4 text-left text-[13px] font-medium text-muted-foreground">Due</th>
                <th className="p-4 text-left text-[13px] font-medium text-muted-foreground">Last updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-sm text-muted-foreground">
                    No invoices match your filters.
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
                  </td>
                  <td className="p-4 text-[14px] text-muted-foreground">{invoice.periodLabel}</td>
                  <td className="p-4">
                    <p className="text-[14px] font-semibold text-foreground">{formatCurrency(invoice.amount)}</p>
                  </td>
                  <td className="p-4">
                    <UnifiedBadge variant="billing" value={billingStatusLabel(invoice)} />
                  </td>
                  <td className="p-4">
                    {invoice.actionRequired ? (
                      <UnifiedBadge variant="status" value="Yes" />
                    ) : (
                      <span className="text-[13px] text-muted-foreground">No</span>
                    )}
                  </td>
                  <td className="p-4 text-[14px] text-foreground">{formatDate(invoice.issuedDate)}</td>
                  <td className="p-4 text-[14px] text-foreground">{formatDate(invoice.dueDate)}</td>
                  <td className="p-4 text-[12px] text-muted-foreground">{formatDateTime(invoice.lastUpdated)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Plans Overview */}
      <Card className="border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <h3 className="text-[15px] font-semibold text-foreground">Plans Overview</h3>
          <p className="text-[13px] text-muted-foreground">Monthly verification spend by plan tier</p>
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
                    <p className="text-[12px] text-muted-foreground mb-1">Monthly spend</p>
                    <p className="text-[22px] font-semibold text-foreground">
                      {formatCurrency(plan.monthlySpend)}
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
            </div>
          ))}
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
                : "Invoice details"}
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
                <p>
                  <span className="text-muted-foreground">Period:</span> {selectedInvoice.periodLabel}
                </p>
                <p>
                  <span className="text-muted-foreground">Amount:</span> {formatCurrency(selectedInvoice.amount)}
                </p>
                <p>
                  <span className="text-muted-foreground">Issued:</span> {formatDate(selectedInvoice.issuedDate)}
                </p>
                <p>
                  <span className="text-muted-foreground">Due:</span> {formatDate(selectedInvoice.dueDate)}
                </p>
                <p>
                  <span className="text-muted-foreground">Last updated:</span> {formatDateTime(selectedInvoice.lastUpdated)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Payment references and bank identifiers are not shown here.
                </p>
              </div>
              <div className="space-y-2 border-t border-border pt-4">
                <p className="text-xs font-medium text-muted-foreground">Billing controls</p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setReminderConfirmOpen(true)}>
                    Send payment reminder…
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setRefundConfirmOpen(true)}>
                    Request refund…
                  </Button>
                  {selectedInvoice.status === "dispute_review" ? (
                    <Button type="button" variant="secondary" size="sm" onClick={() => setReviewedConfirmOpen(true)}>
                      Mark reviewed…
                    </Button>
                  ) : null}
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
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                Queues a payment reminder for the organization&apos;s billing contact when delivery is configured.
              </span>
              <span className="block rounded-md border border-border/80 bg-muted/30 px-3 py-2 text-[12px] text-muted-foreground">
                This action will be recorded in audit logs.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setReminderConfirmOpen(false);
                const id = selectedInvoice?.id ?? "invoice";
                setSelectedInvoice(null);
                setActionMessage(`Payment reminder queued for ${id}.`);
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
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                Submits a refund request for operations to process. No payment identifiers are shown in this portal.
              </span>
              <span className="block rounded-md border border-border/80 bg-muted/30 px-3 py-2 text-[12px] text-muted-foreground">
                This action will be recorded in audit logs.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setRefundConfirmOpen(false);
                const id = selectedInvoice?.id ?? "invoice";
                setSelectedInvoice(null);
                setActionMessage(`Refund request recorded for ${id}.`);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={reviewedConfirmOpen} onOpenChange={setReviewedConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark dispute reviewed?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">Marks this dispute as reviewed for the operations queue.</span>
              <span className="block rounded-md border border-border/80 bg-muted/30 px-3 py-2 text-[12px] text-muted-foreground">
                This action will be recorded in audit logs.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setReviewedConfirmOpen(false);
                const id = selectedInvoice?.id ?? "invoice";
                setSelectedInvoice(null);
                setActionMessage(`Dispute marked reviewed for ${id}.`);
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
