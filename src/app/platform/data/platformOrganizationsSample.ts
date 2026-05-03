export type OrganizationLifecycleStatus =
  | "draft"
  | "pending_setup"
  | "active"
  | "suspended"
  | "disabled"
  | "archived";

export type IntegrationStatus =
  | "not_configured"
  | "missing_redirect_uri"
  | "missing_keys"
  | "ready_for_testing"
  | "sandbox_active"
  | "production_active"
  | "error";

export type PlatformOrganization = {
  id: string;
  name: string;
  legalName: string;
  domain: string;
  organizationCode: string;
  primaryClientId: string;
  country: string;
  timezone: string;
  currency: string;
  plan: "Starter" | "Professional" | "Enterprise";
  seats: number;
  seatsUsed: number;
  /** Billable verification sessions in current period (sample) */
  usage: number;
  /** Wallet balance (USD sample) */
  credit: number;
  monthlyIncludedCredits: number;
  topUpCredits: number;
  pricePerVerification: number;
  emailOtpBillingEnabled: boolean;
  billingStatus: "current" | "overdue" | "failed";
  status: OrganizationLifecycleStatus;
  integrationStatus: IntegrationStatus;
  created: string;
};

/** Legacy default cost per billable verification when org has no custom price. */
export const verificationApiCallCost = 0.05;

export const planDefaults: Record<
  PlatformOrganization["plan"],
  { seats: number; usage: number; credit: number; monthlyIncludedCredits: number }
> = {
  Starter: { seats: 25, usage: 8000, credit: 10, monthlyIncludedCredits: 10 },
  Professional: { seats: 100, usage: 45000, credit: 50, monthlyIncludedCredits: 50 },
  Enterprise: { seats: 400, usage: 120000, credit: 500, monthlyIncludedCredits: 500 },
};

const rawOrganizations: PlatformOrganization[] = [
  {
    id: "ORG-001",
    name: "Acme Corporation",
    legalName: "Acme Corporation Inc.",
    domain: "acme.com",
    organizationCode: "ACME",
    primaryClientId: "ACME_CALLCENTER_PROD_001",
    country: "United States",
    timezone: "America/Los_Angeles",
    currency: "USD",
    plan: "Enterprise",
    seats: 400,
    seatsUsed: 8,
    usage: 7200,
    credit: 500,
    monthlyIncludedCredits: 500,
    topUpCredits: 0,
    pricePerVerification: 0.05,
    emailOtpBillingEnabled: true,
    billingStatus: "current",
    status: "active",
    integrationStatus: "production_active",
    created: "2024-01-15",
  },
  {
    id: "ORG-002",
    name: "TechStart Inc.",
    legalName: "TechStart Incorporated",
    domain: "techstart.io",
    organizationCode: "TECHSTART",
    primaryClientId: "TECHSTART_CALLCENTER_SANDBOX_001",
    country: "Singapore",
    timezone: "Asia/Singapore",
    currency: "USD",
    plan: "Professional",
    seats: 100,
    seatsUsed: 2,
    usage: 640,
    credit: 50,
    monthlyIncludedCredits: 50,
    topUpCredits: 10,
    pricePerVerification: 0.06,
    emailOtpBillingEnabled: true,
    billingStatus: "current",
    status: "active",
    integrationStatus: "sandbox_active",
    created: "2024-02-03",
  },
  {
    id: "ORG-003",
    name: "Global Ventures",
    legalName: "Global Ventures Ltd.",
    domain: "globalventures.com",
    organizationCode: "GLOBAL",
    primaryClientId: "GLOBAL_MESSAGING_PROD_001",
    country: "United Kingdom",
    timezone: "Europe/London",
    currency: "USD",
    plan: "Enterprise",
    seats: 400,
    seatsUsed: 10,
    usage: 9400,
    credit: 500,
    monthlyIncludedCredits: 500,
    topUpCredits: 0,
    pricePerVerification: 0.05,
    emailOtpBillingEnabled: false,
    billingStatus: "overdue",
    status: "active",
    integrationStatus: "missing_redirect_uri",
    created: "2023-12-08",
  },
  {
    id: "ORG-004",
    name: "Innovation Labs",
    legalName: "Innovation Labs LLC",
    domain: "innovationlabs.co",
    organizationCode: "INNO",
    primaryClientId: "INNO_CALLCENTER_PROD_001",
    country: "United States",
    timezone: "America/New_York",
    currency: "USD",
    plan: "Starter",
    seats: 25,
    seatsUsed: 1,
    usage: 120,
    credit: 10,
    monthlyIncludedCredits: 10,
    topUpCredits: 0,
    pricePerVerification: 0.08,
    emailOtpBillingEnabled: true,
    billingStatus: "current",
    status: "pending_setup",
    integrationStatus: "not_configured",
    created: "2024-03-22",
  },
  {
    id: "ORG-005",
    name: "Design Studio Pro",
    legalName: "Design Studio Pro GmbH",
    domain: "designstudio.io",
    organizationCode: "DESIGN",
    primaryClientId: "DESIGN_CALLCENTER_PROD_001",
    country: "Germany",
    timezone: "Europe/Berlin",
    currency: "EUR",
    plan: "Professional",
    seats: 150,
    seatsUsed: 3,
    usage: 920,
    credit: 50,
    monthlyIncludedCredits: 50,
    topUpCredits: 0,
    pricePerVerification: 0.05,
    emailOtpBillingEnabled: true,
    billingStatus: "failed",
    status: "suspended",
    integrationStatus: "error",
    created: "2024-01-28",
  },
  {
    id: "ORG-006",
    name: "Finance Corp",
    legalName: "Finance Corp",
    domain: "financecorp.com",
    organizationCode: "FINANCE",
    primaryClientId: "FINANCE_CALLCENTER_PROD_001",
    country: "United States",
    timezone: "America/Chicago",
    currency: "USD",
    plan: "Enterprise",
    seats: 300,
    seatsUsed: 9,
    usage: 8600,
    credit: 500,
    monthlyIncludedCredits: 500,
    topUpCredits: 250,
    pricePerVerification: 0.04,
    emailOtpBillingEnabled: true,
    billingStatus: "current",
    status: "active",
    integrationStatus: "ready_for_testing",
    created: "2023-11-12",
  },
  {
    id: "ORG-007",
    name: "CloudScale Systems",
    legalName: "CloudScale Systems Inc.",
    domain: "cloudscale.io",
    organizationCode: "CLOUD",
    primaryClientId: "CLOUD_MESSAGING_PROD_001",
    country: "Australia",
    timezone: "Australia/Sydney",
    currency: "USD",
    plan: "Professional",
    seats: 75,
    seatsUsed: 2,
    usage: 780,
    credit: 50,
    monthlyIncludedCredits: 50,
    topUpCredits: 0,
    pricePerVerification: 0.05,
    emailOtpBillingEnabled: true,
    billingStatus: "current",
    status: "active",
    integrationStatus: "missing_keys",
    created: "2024-02-14",
  },
  {
    id: "ORG-008",
    name: "DataFlow Analytics",
    legalName: "DataFlow Analytics Pte Ltd",
    domain: "dataflow.com",
    organizationCode: "DATAFLOW",
    primaryClientId: "DATAFLOW_CALLCENTER_PROD_001",
    country: "Singapore",
    timezone: "Asia/Singapore",
    currency: "SGD",
    plan: "Starter",
    seats: 25,
    seatsUsed: 1,
    usage: 180,
    credit: 10,
    monthlyIncludedCredits: 10,
    topUpCredits: 0,
    pricePerVerification: 0.05,
    emailOtpBillingEnabled: true,
    billingStatus: "current",
    status: "draft",
    integrationStatus: "not_configured",
    created: "2024-03-05",
  },
];

export function applyPlanDefaultsToOrganization(organization: PlatformOrganization): PlatformOrganization {
  const planMetrics = planDefaults[organization.plan];
  return {
    ...organization,
    seats: planMetrics.seats,
    seatsUsed: Math.min(organization.seatsUsed, planMetrics.seats),
    credit: planMetrics.credit,
    monthlyIncludedCredits: planMetrics.monthlyIncludedCredits,
  };
}

export function buildInitialOrganizations(): PlatformOrganization[] {
  return rawOrganizations.map(applyPlanDefaultsToOrganization);
}

export function getSampleOrganizationById(id: string | undefined): PlatformOrganization | undefined {
  if (!id) {
    return undefined;
  }
  return buildInitialOrganizations().find((org) => org.id === id);
}

/** Spend from billable verification volume using org-specific unit price. */
export function getVerificationSpend(organization: Pick<PlatformOrganization, "usage" | "pricePerVerification">): number {
  return organization.usage * organization.pricePerVerification;
}

/** @deprecated Prefer getVerificationSpend(organization) */
export function getUsageSpend(usage: number, unitPrice: number = verificationApiCallCost): number {
  return usage * unitPrice;
}

export function formatIntegrationStatus(status: IntegrationStatus): string {
  const labels: Record<IntegrationStatus, string> = {
    not_configured: "Not configured",
    missing_redirect_uri: "Missing redirect URI",
    missing_keys: "Missing keys",
    ready_for_testing: "Ready for testing",
    sandbox_active: "Sandbox active",
    production_active: "Production active",
    error: "Error",
  };
  return labels[status];
}

export function formatLifecycleStatus(status: OrganizationLifecycleStatus): string {
  const labels: Record<OrganizationLifecycleStatus, string> = {
    draft: "Draft",
    pending_setup: "Pending setup",
    active: "Active",
    suspended: "Suspended",
    disabled: "Disabled",
    archived: "Archived",
  };
  return labels[status];
}
