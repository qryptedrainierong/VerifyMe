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

/** Mock payment / invoice standing (separate from organization lifecycle). */
export type PaymentStanding = "current" | "overdue" | "failed";

export type PlatformOrganization = {
  id: string;
  organizationName: string;
  legalName: string;
  domain: string;
  organizationCode: string;
  primaryClientId: string;
  organizationType: string;
  industry: string;
  companySize: string;
  country: string;
  timezone: string;
  currency: string;
  plan: "Starter" | "Professional" | "Enterprise";
  seatLimit: number;
  seatsUsed: number;
  /** Billable verification sessions in current period (sample). */
  usage: number;
  /** Wallet balance — monetary credits (sample currency per org). */
  creditBalance: number;
  monthlyIncludedCredits: number;
  topUpCredits: number;
  pricePerVerification: number;
  emailOtpBillingEnabled: boolean;
  paymentStanding: PaymentStanding;
  status: OrganizationLifecycleStatus;
  integrationStatus: IntegrationStatus;
  created: string;
  /** Optional: set when mock session overrides or governance actions update this row (ISO 8601). */
  sessionUpdatedAt?: string;
};

/** Legacy default cost per billable verification when org has no custom price. */
export const verificationApiCallCost = 0.05;

export const planDefaults: Record<
  PlatformOrganization["plan"],
  { seatLimit: number; usage: number; creditBalance: number; monthlyIncludedCredits: number }
> = {
  Starter: { seatLimit: 25, usage: 8000, creditBalance: 10, monthlyIncludedCredits: 10 },
  Professional: { seatLimit: 100, usage: 45000, creditBalance: 50, monthlyIncludedCredits: 50 },
  Enterprise: { seatLimit: 400, usage: 120000, creditBalance: 250, monthlyIncludedCredits: 250 },
};

const rawOrganizations: PlatformOrganization[] = [
  {
    id: "ORG-001",
    organizationName: "Acme Corporation",
    legalName: "Acme Corporation Inc.",
    domain: "acme.com",
    organizationCode: "ACME",
    primaryClientId: "ACME_CALLCENTER_PROD_001",
    organizationType: "Enterprise",
    industry: "Financial Services",
    companySize: "501-1000",
    country: "United States",
    timezone: "America/Los_Angeles",
    currency: "USD",
    plan: "Enterprise",
    seatLimit: 400,
    seatsUsed: 8,
    usage: 7200,
    creditBalance: 250,
    monthlyIncludedCredits: 250,
    topUpCredits: 0,
    pricePerVerification: 0.05,
    emailOtpBillingEnabled: true,
    paymentStanding: "current",
    status: "active",
    integrationStatus: "production_active",
    created: "2024-01-15",
  },
  {
    id: "ORG-002",
    organizationName: "TechStart Inc.",
    legalName: "TechStart Incorporated",
    domain: "techstart.io",
    organizationCode: "TECHSTART",
    primaryClientId: "TECHSTART_CALLCENTER_SANDBOX_001",
    organizationType: "SME",
    industry: "Technology/IT Services",
    companySize: "51-200",
    country: "Singapore",
    timezone: "Asia/Singapore",
    currency: "USD",
    plan: "Professional",
    seatLimit: 100,
    seatsUsed: 2,
    usage: 640,
    creditBalance: 50,
    monthlyIncludedCredits: 50,
    topUpCredits: 10,
    pricePerVerification: 0.06,
    emailOtpBillingEnabled: true,
    paymentStanding: "current",
    status: "active",
    integrationStatus: "sandbox_active",
    created: "2024-02-03",
  },
  {
    id: "ORG-003",
    organizationName: "Global Ventures",
    legalName: "Global Ventures Ltd.",
    domain: "globalventures.com",
    organizationCode: "GLOBAL",
    primaryClientId: "GLOBAL_MESSAGING_PROD_001",
    organizationType: "Enterprise",
    industry: "BPO/Call Center",
    companySize: "1001-5000",
    country: "United Kingdom",
    timezone: "Europe/London",
    currency: "USD",
    plan: "Enterprise",
    seatLimit: 400,
    seatsUsed: 10,
    usage: 9400,
    creditBalance: 250,
    monthlyIncludedCredits: 250,
    topUpCredits: 0,
    pricePerVerification: 0.05,
    emailOtpBillingEnabled: false,
    paymentStanding: "overdue",
    status: "active",
    integrationStatus: "missing_redirect_uri",
    created: "2023-12-08",
  },
  {
    id: "ORG-004",
    organizationName: "Innovation Labs",
    legalName: "Innovation Labs LLC",
    domain: "innovationlabs.co",
    organizationCode: "INNO",
    primaryClientId: "INNO_CALLCENTER_PROD_001",
    organizationType: "Startup",
    industry: "Technology/IT Services",
    companySize: "1-50",
    country: "United States",
    timezone: "America/New_York",
    currency: "USD",
    plan: "Starter",
    seatLimit: 25,
    seatsUsed: 1,
    usage: 120,
    creditBalance: 10,
    monthlyIncludedCredits: 10,
    topUpCredits: 0,
    pricePerVerification: 0.08,
    emailOtpBillingEnabled: true,
    paymentStanding: "current",
    status: "pending_setup",
    integrationStatus: "not_configured",
    created: "2024-03-22",
  },
  {
    id: "ORG-005",
    organizationName: "Design Studio Pro",
    legalName: "Design Studio Pro GmbH",
    domain: "designstudio.io",
    organizationCode: "DESIGN",
    primaryClientId: "DESIGN_CALLCENTER_PROD_001",
    organizationType: "SME",
    industry: "Other",
    companySize: "51-200",
    country: "Germany",
    timezone: "Europe/Berlin",
    currency: "EUR",
    plan: "Professional",
    seatLimit: 150,
    seatsUsed: 3,
    usage: 920,
    creditBalance: 50,
    monthlyIncludedCredits: 50,
    topUpCredits: 0,
    pricePerVerification: 0.05,
    emailOtpBillingEnabled: true,
    paymentStanding: "failed",
    status: "suspended",
    integrationStatus: "error",
    created: "2024-01-28",
  },
  {
    id: "ORG-006",
    organizationName: "Finance Corp",
    legalName: "Finance Corp",
    domain: "financecorp.com",
    organizationCode: "FINANCE",
    primaryClientId: "FINANCE_CALLCENTER_PROD_001",
    organizationType: "Enterprise",
    industry: "Financial Services",
    companySize: "201-500",
    country: "United States",
    timezone: "America/Chicago",
    currency: "USD",
    plan: "Enterprise",
    seatLimit: 300,
    seatsUsed: 9,
    usage: 8600,
    creditBalance: 250,
    monthlyIncludedCredits: 250,
    topUpCredits: 250,
    pricePerVerification: 0.04,
    emailOtpBillingEnabled: true,
    paymentStanding: "current",
    status: "active",
    integrationStatus: "ready_for_testing",
    created: "2023-11-12",
  },
  {
    id: "ORG-007",
    organizationName: "CloudScale Systems",
    legalName: "CloudScale Systems Inc.",
    domain: "cloudscale.io",
    organizationCode: "CLOUD",
    primaryClientId: "CLOUD_MESSAGING_PROD_001",
    organizationType: "Enterprise",
    industry: "Technology/IT Services",
    companySize: "51-200",
    country: "Australia",
    timezone: "Australia/Sydney",
    currency: "USD",
    plan: "Professional",
    seatLimit: 75,
    seatsUsed: 2,
    usage: 780,
    creditBalance: 50,
    monthlyIncludedCredits: 50,
    topUpCredits: 0,
    pricePerVerification: 0.05,
    emailOtpBillingEnabled: true,
    paymentStanding: "current",
    status: "active",
    integrationStatus: "missing_keys",
    created: "2024-02-14",
  },
  {
    id: "ORG-008",
    organizationName: "DataFlow Analytics",
    legalName: "DataFlow Analytics Pte Ltd",
    domain: "dataflow.com",
    organizationCode: "DATAFLOW",
    primaryClientId: "DATAFLOW_CALLCENTER_PROD_001",
    organizationType: "SME",
    industry: "Financial Services",
    companySize: "1-50",
    country: "Singapore",
    timezone: "Asia/Singapore",
    currency: "SGD",
    plan: "Starter",
    seatLimit: 25,
    seatsUsed: 1,
    usage: 180,
    creditBalance: 10,
    monthlyIncludedCredits: 10,
    topUpCredits: 0,
    pricePerVerification: 0.05,
    emailOtpBillingEnabled: true,
    paymentStanding: "current",
    status: "draft",
    integrationStatus: "not_configured",
    created: "2024-03-05",
  },
];

export function applyPlanDefaultsToOrganization(organization: PlatformOrganization): PlatformOrganization {
  return {
    ...organization,
    seatsUsed: Math.min(organization.seatsUsed, organization.seatLimit),
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
export function getVerificationSpend(
  organization: Pick<PlatformOrganization, "usage" | "pricePerVerification">,
): number {
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
