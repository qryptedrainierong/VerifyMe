/** Sample invoices for VerifyMe Admin Billing (mock only). */

export type InvoiceVisualStatus =
  | "paid"
  | "current"
  | "pending"
  | "overdue"
  | "failed"
  | "refund_requested"
  | "dispute_review";

export type BillingActionStatus = "Failed" | "Overdue" | "Pending" | "Refund" | "Dispute" | "Overage";

export type BillingActionSeverity = "Critical" | "High" | "Medium" | "Low";

export type PlatformBillingInvoiceRow = {
  id: string;
  organization: string;
  organizationId: string;
  /** Human-readable billing period label */
  periodLabel: string;
  amount: number;
  status: InvoiceVisualStatus;
  /** True when an operator should review or retry payment */
  actionRequired: boolean;
  issuedDate: string;
  dueDate: string;
  lastUpdated: string;
};

export type BillingActionRequiredRow = {
  id: string;
  organization: string;
  organizationId: string;
  issue: string;
  amount: number;
  status: BillingActionStatus;
  severity: BillingActionSeverity;
  age: string;
  invoiceId?: string;
  priority: number;
};

export type BillingActivityRow = {
  id: string;
  event: string;
  organization: string;
  amount: number;
  time: string;
  timestamp: string;
};

export type BillingSnapshotMetrics = {
  outstandingAmount: number;
  overdueInvoices: number;
  failedPayments: number;
  creditOverageOrganizations: number;
  monthlyBillableVerificationSpend: number;
};

/** Fixed anchor for relative billing ages against seeded sample timestamps. */
const BILLING_ANCHOR_NOW_MS = Date.parse("2024-04-12T23:59:59Z");

const invoices: PlatformBillingInvoiceRow[] = [
  {
    id: "INV-2024-51402",
    organization: "Design Studio Pro",
    organizationId: "ORG-005",
    periodLabel: "Mar 2024",
    amount: 24500,
    status: "failed",
    actionRequired: true,
    issuedDate: "2024-03-01",
    dueDate: "2024-03-15",
    lastUpdated: "2024-04-08T09:12:00Z",
  },
  {
    id: "INV-2024-51403",
    organization: "Global Ventures",
    organizationId: "ORG-003",
    periodLabel: "Mar 2024",
    amount: 38900,
    status: "overdue",
    actionRequired: true,
    issuedDate: "2024-03-01",
    dueDate: "2024-03-20",
    lastUpdated: "2024-04-07T14:30:00Z",
  },
  {
    id: "INV-2024-51408",
    organization: "TechStart Inc.",
    organizationId: "ORG-002",
    periodLabel: "Apr 2024",
    amount: 8200,
    status: "pending",
    actionRequired: true,
    issuedDate: "2024-04-01",
    dueDate: "2024-04-14",
    lastUpdated: "2024-04-09T08:00:00Z",
  },
  {
    id: "INV-2024-51409",
    organization: "Innovation Labs",
    organizationId: "ORG-004",
    periodLabel: "Apr 2024",
    amount: 4100,
    status: "refund_requested",
    actionRequired: true,
    issuedDate: "2024-04-01",
    dueDate: "2024-04-18",
    lastUpdated: "2024-04-06T11:20:00Z",
  },
  {
    id: "INV-2024-51410",
    organization: "DataFlow Analytics",
    organizationId: "ORG-008",
    periodLabel: "Apr 2024",
    amount: 1200,
    status: "dispute_review",
    actionRequired: true,
    issuedDate: "2024-04-01",
    dueDate: "2024-04-12",
    lastUpdated: "2024-04-05T16:45:00Z",
  },
  {
    id: "INV-2024-51301",
    organization: "Acme Corporation",
    organizationId: "ORG-001",
    periodLabel: "Apr 2024",
    amount: 42100,
    status: "paid",
    actionRequired: false,
    issuedDate: "2024-04-01",
    dueDate: "2024-04-15",
    lastUpdated: "2024-04-09T06:00:00Z",
  },
  {
    id: "INV-2024-51302",
    organization: "CloudScale Systems",
    organizationId: "ORG-007",
    periodLabel: "Apr 2024",
    amount: 9800,
    status: "current",
    actionRequired: false,
    issuedDate: "2024-04-01",
    dueDate: "2024-04-18",
    lastUpdated: "2024-04-08T19:10:00Z",
  },
  {
    id: "INV-2024-51288",
    organization: "Finance Corp",
    organizationId: "ORG-006",
    periodLabel: "Mar 2024",
    amount: 50200,
    status: "paid",
    actionRequired: false,
    issuedDate: "2024-03-01",
    dueDate: "2024-03-18",
    lastUpdated: "2024-03-19T12:00:00Z",
  },
  {
    id: "INV-2024-51277",
    organization: "TechStart Inc.",
    organizationId: "ORG-002",
    periodLabel: "Mar 2024",
    amount: 7950,
    status: "paid",
    actionRequired: false,
    issuedDate: "2024-03-01",
    dueDate: "2024-03-14",
    lastUpdated: "2024-03-12T09:30:00Z",
  },
];

export function getPlatformBillingInvoices(): PlatformBillingInvoiceRow[] {
  return [...invoices];
}

function formatRelativeBillingAge(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  const diffMs = Math.max(0, BILLING_ANCHOR_NOW_MS - t);
  const min = Math.floor(diffMs / 60000);
  if (min < 60) return `${Math.max(1, min)}m`;
  const hr = Math.floor(diffMs / 3600000);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(diffMs / 86400000);
  if (day === 1) return "1d";
  return `${day}d`;
}

function actionStatusForInvoice(status: InvoiceVisualStatus): BillingActionStatus {
  const map: Record<InvoiceVisualStatus, BillingActionStatus> = {
    failed: "Failed",
    overdue: "Overdue",
    pending: "Pending",
    refund_requested: "Refund",
    dispute_review: "Dispute",
    paid: "Pending",
    current: "Pending",
  };
  return map[status];
}

function issueLabelForInvoice(invoice: PlatformBillingInvoiceRow): string {
  const map: Record<InvoiceVisualStatus, string> = {
    failed: "Failed payment",
    overdue: "Invoice overdue",
    pending: "Payment pending",
    refund_requested: "Refund requested",
    dispute_review: "Dispute under review",
    paid: "Payment received",
    current: "Invoice current",
  };
  return map[invoice.status];
}

function severityForInvoice(status: InvoiceVisualStatus): BillingActionSeverity {
  if (status === "failed") return "Critical";
  if (status === "overdue") return "High";
  if (status === "dispute_review") return "High";
  if (status === "refund_requested") return "Medium";
  if (status === "pending") return "Medium";
  return "Low";
}

function priorityForInvoice(status: InvoiceVisualStatus): number {
  const map: Record<InvoiceVisualStatus, number> = {
    failed: 1,
    overdue: 2,
    dispute_review: 3,
    refund_requested: 4,
    pending: 5,
    paid: 6,
    current: 7,
  };
  return map[status];
}

function isActionRequiredInvoice(invoice: PlatformBillingInvoiceRow): boolean {
  return (
    invoice.actionRequired ||
    invoice.status === "failed" ||
    invoice.status === "overdue" ||
    invoice.status === "pending" ||
    invoice.status === "refund_requested" ||
    invoice.status === "dispute_review"
  );
}

export function buildBillingActionRequiredRows(
  invoiceRows: PlatformBillingInvoiceRow[],
  creditOverageOrganizations: Array<{
    id: string;
    organizationName: string;
    amount: number;
    lastUpdated: string;
  }>,
): BillingActionRequiredRow[] {
  const invoiceActions = invoiceRows
    .filter(isActionRequiredInvoice)
    .map((invoice) => ({
      id: invoice.id,
      organization: invoice.organization,
      organizationId: invoice.organizationId,
      issue: issueLabelForInvoice(invoice),
      amount: invoice.amount,
      status: actionStatusForInvoice(invoice.status),
      severity: severityForInvoice(invoice.status),
      age: formatRelativeBillingAge(invoice.lastUpdated),
      invoiceId: invoice.id,
      priority: priorityForInvoice(invoice.status),
    }));

  const overageActions = creditOverageOrganizations.map((org) => ({
    id: `overage-${org.id}`,
    organization: org.organizationName,
    organizationId: org.id,
    issue: "Credit overage",
    amount: org.amount,
    status: "Overage" as const,
    severity: "Medium" as const,
    age: formatRelativeBillingAge(org.lastUpdated),
    priority: 6,
  }));

  return [...invoiceActions, ...overageActions].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return b.amount - a.amount;
  });
}

function activityEventForInvoice(invoice: PlatformBillingInvoiceRow): string {
  const map: Record<InvoiceVisualStatus, string> = {
    paid: "Payment received",
    current: "Invoice issued",
    pending: "Payment pending",
    overdue: "Invoice overdue",
    failed: "Failed payment",
    refund_requested: "Refund requested",
    dispute_review: "Dispute under review",
  };
  return map[invoice.status];
}

export function buildRecentBillingActivityRows(invoiceRows: PlatformBillingInvoiceRow[], limit = 5): BillingActivityRow[] {
  return [...invoiceRows]
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, limit)
    .map((invoice) => ({
      id: invoice.id,
      event: activityEventForInvoice(invoice),
      organization: invoice.organization,
      amount: invoice.amount,
      time: formatRelativeBillingAge(invoice.lastUpdated),
      timestamp: invoice.lastUpdated,
    }));
}

export function computeBillingSnapshotMetrics(
  invoiceRows: PlatformBillingInvoiceRow[],
  monthlyBillableVerificationSpend: number,
  creditOverageOrganizations: number,
): BillingSnapshotMetrics {
  const outstandingAmount = invoiceRows
    .filter((invoice) => ["failed", "overdue", "pending", "refund_requested", "dispute_review"].includes(invoice.status))
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  return {
    outstandingAmount,
    overdueInvoices: invoiceRows.filter((invoice) => invoice.status === "overdue").length,
    failedPayments: invoiceRows.filter((invoice) => invoice.status === "failed").length,
    creditOverageOrganizations,
    monthlyBillableVerificationSpend,
  };
}

/** Action-first, then most recently updated (sample UX default). */
export function sortInvoicesForDisplay(rows: PlatformBillingInvoiceRow[]): PlatformBillingInvoiceRow[] {
  return [...rows].sort((a, b) => {
    if (a.actionRequired !== b.actionRequired) return a.actionRequired ? -1 : 1;
    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
  });
}
