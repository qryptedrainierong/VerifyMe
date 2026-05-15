import { Download, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Card } from "../../shared/components/ui/card";
import { Button } from "../../shared/components/ui/button";
import { Input } from "../../shared/components/ui/input";
import { Badge } from "../../shared/components/ui/badge";
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
  buildBillingActionRequiredRows,
  buildRecentBillingActivityRows,
  computeBillingSnapshotMetrics,
  getPlatformBillingInvoices,
  sortInvoicesForDisplay,
  type BillingActionRequiredRow,
  type BillingActionSeverity,
  type BillingActionStatus,
  type PlatformBillingInvoiceRow,
} from "../data/platformBillingInvoicesMock";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";
import { shouldIgnoreRowOpenClick } from "../utils/tableRowNav";
import { ScopedFilterBanner } from "../../shared/components/ScopedFilterBanner";
import { SummaryStatCard } from "../../shared/components/SummaryStatCard";
import { TableEmptyStateRow } from "../../shared/components/TableEmptyStateRow";
import { AuditHintText } from "../../shared/components/AuditHintText";
import { cn } from "../../shared/components/ui/utils";
import { usePlatformRole } from "../context/PlatformRoleContext";
import { canPerformPlatformAction, isReadOnlyPreviewRole } from "../utils/platformRolePermissions";

const INVOICES_PER_PAGE = 10;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function billingStatusLabel(invoice: PlatformBillingInvoiceRow) {
  const map: Record<PlatformBillingInvoiceRow["status"], string> = {
    paid: "Paid",
    current: "Current",
    pending: "Payment pending",
    overdue: "Invoice overdue",
    failed: "Failed payment",
    refund_requested: "Refund requested",
    dispute_review: "Dispute under review",
  };
  return map[invoice.status];
}

function actionStatusBadgeClass(status: BillingActionStatus) {
  switch (status) {
    case "Failed":
      return "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/45 dark:text-red-200";
    case "Overdue":
      return "border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-900/45 dark:bg-orange-950/35 dark:text-orange-100";
    case "Pending":
      return "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/45 dark:bg-amber-950/35 dark:text-amber-100";
    case "Refund":
      return "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/45 dark:bg-sky-950/35 dark:text-sky-100";
    case "Dispute":
      return "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900/45 dark:bg-violet-950/35 dark:text-violet-100";
    case "Overage":
      return "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-900 dark:border-fuchsia-900/45 dark:bg-fuchsia-950/35 dark:text-fuchsia-100";
    default:
      return "border-border bg-muted text-foreground";
  }
}

function severityBadgeClass(severity: BillingActionSeverity) {
  switch (severity) {
    case "Critical":
      return "border-red-400/80 bg-red-50 font-semibold text-red-900 dark:border-red-900/60 dark:bg-red-950/45 dark:text-red-100";
    case "High":
      return "border-orange-300/80 bg-orange-50 text-orange-950 dark:bg-orange-950/35 dark:text-orange-50";
    case "Medium":
      return "border-amber-200 bg-amber-50 text-amber-950 dark:bg-amber-950/35 dark:text-amber-100";
  }
  return "border-border bg-muted text-muted-foreground";
}

export function PlatformBilling() {
  const { role } = usePlatformRole();
  const isComplianceReadOnly = isReadOnlyPreviewRole(role);
  const canManageBilling = canPerformPlatformAction(role, "manage_billing");
  const canExportAudit = canPerformPlatformAction(role, "export_audit");
  const [searchParams, setSearchParams] = useSearchParams();
  const urlOrganizationId = searchParams.get("organizationId");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<PlatformBillingInvoiceRow | null>(null);
  const [invoiceListMode, setInvoiceListMode] = useState<"action" | "all">("action");
  const [invoicePage, setInvoicePage] = useState(1);
  const [refundConfirmOpen, setRefundConfirmOpen] = useState(false);
  const [reminderConfirmOpen, setReminderConfirmOpen] = useState(false);
  const [reviewedConfirmOpen, setReviewedConfirmOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const organizations = useMemo(() => buildInitialOrganizations(), []);
  const knownOrgIds = useMemo(() => new Set(organizations.map((organization) => organization.id)), [organizations]);
  const effectiveOrganizationId = urlOrganizationId && knownOrgIds.has(urlOrganizationId) ? urlOrganizationId : null;
  const scopedOrganizations = useMemo(
    () => (effectiveOrganizationId ? organizations.filter((organization) => organization.id === effectiveOrganizationId) : organizations),
    [organizations, effectiveOrganizationId],
  );

  const invoiceSource = useMemo(() => getPlatformBillingInvoices(), []);
  const scopedInvoiceSource = useMemo(
    () => (effectiveOrganizationId ? invoiceSource.filter((invoice) => invoice.organizationId === effectiveOrganizationId) : invoiceSource),
    [invoiceSource, effectiveOrganizationId],
  );
  const sortedInvoices = useMemo(() => sortInvoicesForDisplay(scopedInvoiceSource), [scopedInvoiceSource]);

  const creditOverageOrganizations = useMemo(
    () =>
      scopedOrganizations
        .filter((organization) => getVerificationSpend(organization) > organization.creditBalance)
        .map((organization) => ({
          id: organization.id,
          organizationName: organization.organizationName,
          amount: getVerificationSpend(organization) - organization.creditBalance,
          lastUpdated: organization.sessionUpdatedAt ?? `${organization.created}T12:00:00Z`,
        })),
    [scopedOrganizations],
  );

  const monthlyVerificationSpend = scopedOrganizations.reduce((sum, organization) => sum + getVerificationSpend(organization), 0);

  const snapshot = useMemo(
    () =>
      computeBillingSnapshotMetrics(
        scopedInvoiceSource,
        monthlyVerificationSpend,
        creditOverageOrganizations.length,
      ),
    [scopedInvoiceSource, monthlyVerificationSpend, creditOverageOrganizations.length],
  );

  const actionRequiredRows = useMemo(
    () => buildBillingActionRequiredRows(scopedInvoiceSource, creditOverageOrganizations),
    [scopedInvoiceSource, creditOverageOrganizations],
  );

  const recentBillingActivity = useMemo(() => buildRecentBillingActivityRows(scopedInvoiceSource, 5), [scopedInvoiceSource]);

  const filteredInvoices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sortedInvoices.filter((invoice) => {
      if (invoiceListMode === "action" && !invoice.actionRequired) return false;
      if (q.length === 0) return true;
      return (
        invoice.id.toLowerCase().includes(q) ||
        invoice.organization.toLowerCase().includes(q) ||
        invoice.organizationId.toLowerCase().includes(q) ||
        invoice.periodLabel.toLowerCase().includes(q)
      );
    });
  }, [sortedInvoices, searchQuery, invoiceListMode]);

  const totalInvoicePages = Math.max(1, Math.ceil(filteredInvoices.length / INVOICES_PER_PAGE));
  const safeInvoicePage = Math.min(invoicePage, totalInvoicePages);
  const invoiceStartIndex = (safeInvoicePage - 1) * INVOICES_PER_PAGE;
  const invoiceEndIndex = Math.min(invoiceStartIndex + INVOICES_PER_PAGE, filteredInvoices.length);
  const visibleInvoices = filteredInvoices.slice(invoiceStartIndex, invoiceEndIndex);

  const openInvoiceById = (invoiceId?: string) => {
    if (!invoiceId) return;
    const invoice = scopedInvoiceSource.find((row) => row.id === invoiceId);
    if (invoice) setSelectedInvoice(invoice);
  };

  const openActionRow = (row: BillingActionRequiredRow) => {
    if (row.invoiceId) {
      openInvoiceById(row.invoiceId);
      return;
    }
    const invoice = scopedInvoiceSource.find((item) => item.organizationId === row.organizationId);
    if (invoice) setSelectedInvoice(invoice);
  };

  const actionLabel = (primary: string, readOnly: string) => (isComplianceReadOnly ? readOnly : primary);

  return (
    <>
      <PortalPageFrame
        title="Billing & Credits"
        description="Invoices, payment standing, and verification-related charges."
        headerExtra={
          urlOrganizationId ? (
            <ScopedFilterBanner
              entityLabel="organization"
              scopedValue={urlOrganizationId}
              isKnown={knownOrgIds.has(urlOrganizationId)}
              unknownHelperText="Organization was not found in configured organizations."
              onClear={() =>
                setSearchParams(
                  (prev) => {
                    const next = new URLSearchParams(prev);
                    next.delete("organizationId");
                    return next;
                  },
                  { replace: true },
                )
              }
            />
          ) : null
        }
        headerActions={
          <div className="flex items-center gap-2">
            {canExportAudit ? (
              <Button variant="outline" size="sm" type="button" className="h-8 text-xs">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export Report
              </Button>
            ) : null}
            {canManageBilling ? (
              <Button size="sm" type="button" className="h-8 text-xs">
                Generate Invoices
              </Button>
            ) : null}
          </div>
        }
        bodyClassName="space-y-4 px-5 pb-5 pt-3 sm:px-7"
      >
        {actionMessage ? (
          <div className="rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2 text-xs text-green-700 dark:text-green-300">
            {actionMessage}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-5">
          <SummaryStatCard
            className="p-3 shadow-none"
            label="Outstanding amount"
            value={formatCurrency(snapshot.outstandingAmount)}
          />
          <SummaryStatCard
            className="p-3 shadow-none"
            label="Overdue invoices"
            value={snapshot.overdueInvoices}
          />
          <SummaryStatCard
            className="p-3 shadow-none"
            label="Failed payments"
            value={snapshot.failedPayments}
          />
          <SummaryStatCard
            className="p-3 shadow-none"
            label="Credit overage organizations"
            value={snapshot.creditOverageOrganizations}
          />
          <SummaryStatCard
            className="p-3 shadow-none"
            label="Monthly billable verification spend"
            value={formatCurrency(snapshot.monthlyBillableVerificationSpend)}
          />
        </div>

        <Card className="overflow-hidden border border-border/70 shadow-none">
          <div className="border-b border-border/60 px-3 py-2.5">
            <h3 className="text-sm font-semibold text-foreground">Action Required</h3>
            <p className="text-[11px] text-muted-foreground">Invoices and credit issues requiring follow-up.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-[12px]">
              <thead className="border-b border-border/60 bg-muted/25">
                <tr>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-muted-foreground">Organization</th>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-muted-foreground">Issue</th>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-muted-foreground">Amount</th>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-muted-foreground">Status</th>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-muted-foreground">Age</th>
                  <th className="px-2.5 py-1.5 text-right text-[10px] font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {actionRequiredRows.length === 0 ? (
                  <TableEmptyStateRow colSpan={6} title="No billing items match the current filters." className="py-6" />
                ) : null}
                {actionRequiredRows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-2.5 py-1.5 align-middle">
                      <p className="font-medium text-foreground">{row.organization}</p>
                    </td>
                    <td className="px-2.5 py-1.5 align-middle text-muted-foreground">{row.issue}</td>
                    <td className="px-2.5 py-1.5 align-middle tabular-nums font-medium text-foreground">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="px-2.5 py-1.5 align-middle">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className={cn("h-5 px-1.5 text-[10px] font-medium", actionStatusBadgeClass(row.status))}>
                          {row.status}
                        </Badge>
                        <Badge variant="outline" className={cn("h-5 px-1.5 text-[10px] font-medium", severityBadgeClass(row.severity))}>
                          {row.severity}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-2.5 py-1.5 align-middle tabular-nums text-[11px] text-muted-foreground">{row.age}</td>
                    <td className="px-2.5 py-1.5 align-middle text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {row.invoiceId ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[11px]"
                            onClick={() => openInvoiceById(row.invoiceId)}
                          >
                            {actionLabel("Open invoice", "View invoice")}
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[11px]"
                          onClick={() => openActionRow(row)}
                        >
                          {actionLabel("Review billing", "Review history")}
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-[11px]" asChild>
                          <Link to={`/organizations/${encodeURIComponent(row.organizationId)}`}>
                            {actionLabel("View organization", "View organization")}
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border/60 px-3 py-2">
            <button
              type="button"
              className="text-[11px] font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-primary hover:underline"
              onClick={() => {
                setInvoiceListMode("all");
                setInvoicePage(1);
              }}
            >
              View all billing activity →
            </button>
          </div>
        </Card>

        <Card className="overflow-hidden border border-border/70 shadow-none">
          <div className="border-b border-border/60 px-3 py-2.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Invoices</h3>
                <p className="text-[11px] text-muted-foreground">
                  Operational invoice queue with payment standing and follow-up state.
                </p>
              </div>
              <Select
                value={invoiceListMode}
                onValueChange={(value) => {
                  setInvoiceListMode(value as "action" | "all");
                  setInvoicePage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[11.5rem] text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="action">Action required</SelectItem>
                  <SelectItem value="all">All invoices</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative mt-2 max-w-sm">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                placeholder="Search invoice, organization, period…"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setInvoicePage(1);
                }}
                className="h-8 border-border/70 bg-background/80 py-0 pl-8 text-[12px] shadow-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-3 py-2">
            <p className="text-[11px] tabular-nums text-muted-foreground">
              {filteredInvoices.length === 0
                ? "No matching invoices"
                : `${invoiceStartIndex + 1}–${invoiceEndIndex} of ${filteredInvoices.length}`}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="h-7 px-2 text-xs"
                disabled={safeInvoicePage === 1}
                onClick={() => setInvoicePage((page) => Math.max(1, page - 1))}
              >
                Previous
              </Button>
              <span className="px-1 text-[11px] tabular-nums text-muted-foreground">
                {safeInvoicePage} / {totalInvoicePages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="h-7 px-2 text-xs"
                disabled={safeInvoicePage === totalInvoicePages || filteredInvoices.length === 0}
                onClick={() => setInvoicePage((page) => Math.min(totalInvoicePages, page + 1))}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-[12px]">
              <thead className="border-b border-border/60 bg-muted/25">
                <tr>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-muted-foreground">Invoice</th>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-muted-foreground">Organization</th>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-muted-foreground">Amount</th>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-muted-foreground">Status</th>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-muted-foreground">Due date</th>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-muted-foreground">Action required</th>
                  <th className="px-2.5 py-1.5 text-right text-[10px] font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {visibleInvoices.length === 0 ? (
                  <TableEmptyStateRow colSpan={7} title="No billing items match the current filters." className="py-6" />
                ) : null}
                {visibleInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="cursor-pointer transition-colors hover:bg-muted/30"
                    onClick={(event) => {
                      if (shouldIgnoreRowOpenClick(event.target)) return;
                      setSelectedInvoice(invoice);
                    }}
                  >
                    <td className="px-2.5 py-1.5 align-middle font-mono text-[11px] text-foreground">{invoice.id}</td>
                    <td className="px-2.5 py-1.5 align-middle text-foreground">{invoice.organization}</td>
                    <td className="px-2.5 py-1.5 align-middle tabular-nums font-medium text-foreground">
                      {formatCurrency(invoice.amount)}
                    </td>
                    <td className="px-2.5 py-1.5 align-middle">
                      <UnifiedBadge variant="billing" value={billingStatusLabel(invoice)} size="sm" />
                    </td>
                    <td className="px-2.5 py-1.5 align-middle text-muted-foreground">{formatDate(invoice.dueDate)}</td>
                    <td className="px-2.5 py-1.5 align-middle">
                      {invoice.actionRequired ? (
                        <Badge variant="outline" className="h-5 border-amber-200 bg-amber-50 px-1.5 text-[10px] font-medium text-amber-950">
                          Action required
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">No</span>
                      )}
                    </td>
                    <td className="px-2.5 py-1.5 align-middle text-right">
                      <button
                        type="button"
                        className="text-[10px] font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-primary hover:underline"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedInvoice(invoice);
                        }}
                      >
                        {actionLabel("Open invoice", "View details")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden border border-border/70 shadow-none">
          <div className="border-b border-border/60 px-3 py-2.5">
            <h3 className="text-sm font-semibold text-foreground">Recent billing activity</h3>
            <p className="text-[11px] text-muted-foreground">Latest payment and invoice events.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[12px]">
              <thead className="border-b border-border/60 bg-muted/25">
                <tr>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-muted-foreground">Event</th>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-muted-foreground">Organization</th>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-muted-foreground">Amount</th>
                  <th className="px-2.5 py-1.5 text-right text-[10px] font-medium text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {recentBillingActivity.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-2.5 py-1.5 align-middle font-medium text-foreground">{item.event}</td>
                    <td className="px-2.5 py-1.5 align-middle text-foreground">{item.organization}</td>
                    <td className="px-2.5 py-1.5 align-middle tabular-nums text-muted-foreground">{formatCurrency(item.amount)}</td>
                    <td className="px-2.5 py-1.5 align-middle text-right tabular-nums text-[11px] text-muted-foreground">
                      {item.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </PortalPageFrame>

      <Dialog open={selectedInvoice !== null} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="flex max-h-[min(90vh,880px)] flex-col gap-0 overflow-hidden sm:max-w-3xl">
          <DialogHeader className="shrink-0 space-y-1 border-b border-border pb-3 text-left">
            <DialogTitle>{selectedInvoice?.id ?? "Invoice"}</DialogTitle>
            <DialogDescription>
              {selectedInvoice
                ? `${selectedInvoice.organization} · ${formatCurrency(selectedInvoice.amount)} · ${billingStatusLabel(selectedInvoice)}`
                : "Invoice details"}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice ? (
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-1 py-4 text-sm">
              <section className="rounded-md border border-border/70 bg-muted/15 p-3">
                <p className="text-xs font-medium text-muted-foreground">Summary</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <UnifiedBadge variant="billing" value={billingStatusLabel(selectedInvoice)} size="sm" />
                  {selectedInvoice.actionRequired ? (
                    <Badge variant="outline" className="h-5 border-amber-200 bg-amber-50 px-1.5 text-[10px] font-medium text-amber-950">
                      Action required
                    </Badge>
                  ) : null}
                </div>
              </section>

              <section className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Amount / period</p>
                <p className="text-foreground">{formatCurrency(selectedInvoice.amount)}</p>
                <p className="text-muted-foreground">{selectedInvoice.periodLabel}</p>
              </section>

              <section className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Status and action required</p>
                <p className="text-foreground">{billingStatusLabel(selectedInvoice)}</p>
                <p className="text-muted-foreground">
                  {selectedInvoice.actionRequired
                    ? "Follow-up is required before this invoice can be closed."
                    : "No operator follow-up is required for this invoice."}
                </p>
              </section>

              <section className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Organization</p>
                <p className="text-foreground">{selectedInvoice.organization}</p>
                <Button type="button" variant="link" className="h-auto p-0 text-xs" asChild>
                  <Link to={`/organizations/${encodeURIComponent(selectedInvoice.organizationId)}`}>
                    {actionLabel("View organization billing", "View organization record")}
                  </Link>
                </Button>
              </section>

              <section className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Billing activity</p>
                <p className="text-muted-foreground">
                  Issued {formatDate(selectedInvoice.issuedDate)} · Due {formatDate(selectedInvoice.dueDate)} · Last updated{" "}
                  {formatDateTime(selectedInvoice.lastUpdated)}
                </p>
              </section>

              {canManageBilling ? (
                <section className="space-y-2 border-t border-border pt-4">
                  <p className="text-xs font-medium text-muted-foreground">Controls</p>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setReminderConfirmOpen(true)}>
                      Send reminder
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setRefundConfirmOpen(true)}>
                      Request refund
                    </Button>
                    {selectedInvoice.status === "dispute_review" ? (
                      <Button type="button" variant="secondary" size="sm" onClick={() => setReviewedConfirmOpen(true)}>
                        Mark for review
                      </Button>
                    ) : null}
                  </div>
                </section>
              ) : (
                <p className="border-t border-border pt-4 text-xs text-muted-foreground">
                  {isComplianceReadOnly
                    ? "Billing controls are read-only for this preview role. Use View and Review history actions from the tables."
                    : "Billing actions are not available for this preview role."}
                </p>
              )}

              <section className="space-y-1 border-t border-border pt-4 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Technical details</p>
                <p>Invoice id: {selectedInvoice.id}</p>
                <p>Organization id: {selectedInvoice.organizationId}</p>
                <p>Payment references and bank identifiers are not shown in this portal.</p>
              </section>
            </div>
          ) : null}
          <DialogFooter className="shrink-0 border-t border-border px-0 pt-3">
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
              <AuditHintText className="block" />
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
              <AuditHintText className="block" />
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
            <AlertDialogTitle>Mark for review?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">Marks this dispute for review in the operations queue.</span>
              <AuditHintText className="block" />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setReviewedConfirmOpen(false);
                const id = selectedInvoice?.id ?? "invoice";
                setSelectedInvoice(null);
                setActionMessage(`Dispute marked for review for ${id}.`);
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
