/** Sample invoices for VerifyMe Admin Billing (mock only). */

export type InvoiceVisualStatus =
  | "paid"
  | "current"
  | "pending"
  | "overdue"
  | "failed"
  | "refund_requested"
  | "dispute_review";

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

/** Action-first, then most recently updated (sample UX default). */
export function sortInvoicesForDisplay(rows: PlatformBillingInvoiceRow[]): PlatformBillingInvoiceRow[] {
  return [...rows].sort((a, b) => {
    if (a.actionRequired !== b.actionRequired) return a.actionRequired ? -1 : 1;
    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
  });
}
