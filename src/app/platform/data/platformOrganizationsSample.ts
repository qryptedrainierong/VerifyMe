export type PlatformOrganization = {
  id: string;
  name: string;
  domain: string;
  plan: "Starter" | "Professional" | "Enterprise";
  seats: number;
  seatsUsed: number;
  usage: number;
  credit: number;
  billingStatus: "current" | "overdue" | "failed";
  status: "active" | "trial" | "suspended";
  created: string;
};

/** Cost per verification API call; spend = usage × this value (matches organizations dashboard). */
export const verificationApiCallCost = 0.05;

export const planDefaults: Record<
  PlatformOrganization["plan"],
  { seats: number; usage: number; credit: number }
> = {
  Starter: { seats: 1, usage: 8000, credit: 10 },
  Professional: { seats: 3, usage: 45000, credit: 50 },
  Enterprise: { seats: 10, usage: 120000, credit: 500 },
};

const rawOrganizations: PlatformOrganization[] = [
  {
    id: "ORG-001",
    name: "Acme Corporation",
    domain: "acme.com",
    plan: "Enterprise",
    seats: 400,
    seatsUsed: 8,
    usage: 7200,
    credit: 500,
    billingStatus: "current",
    status: "active",
    created: "2024-01-15",
  },
  {
    id: "ORG-002",
    name: "TechStart Inc.",
    domain: "techstart.io",
    plan: "Professional",
    seats: 100,
    seatsUsed: 2,
    usage: 640,
    credit: 50,
    billingStatus: "current",
    status: "active",
    created: "2024-02-03",
  },
  {
    id: "ORG-003",
    name: "Global Ventures",
    domain: "globalventures.com",
    plan: "Enterprise",
    seats: 400,
    seatsUsed: 10,
    usage: 9400,
    credit: 500,
    billingStatus: "overdue",
    status: "active",
    created: "2023-12-08",
  },
  {
    id: "ORG-004",
    name: "Innovation Labs",
    domain: "innovationlabs.co",
    plan: "Starter",
    seats: 25,
    seatsUsed: 1,
    usage: 120,
    credit: 10,
    billingStatus: "current",
    status: "trial",
    created: "2024-03-22",
  },
  {
    id: "ORG-005",
    name: "Design Studio Pro",
    domain: "designstudio.io",
    plan: "Professional",
    seats: 150,
    seatsUsed: 3,
    usage: 920,
    credit: 50,
    billingStatus: "failed",
    status: "active",
    created: "2024-01-28",
  },
  {
    id: "ORG-006",
    name: "Finance Corp",
    domain: "financecorp.com",
    plan: "Enterprise",
    seats: 300,
    seatsUsed: 9,
    usage: 8600,
    credit: 500,
    billingStatus: "current",
    status: "active",
    created: "2023-11-12",
  },
  {
    id: "ORG-007",
    name: "CloudScale Systems",
    domain: "cloudscale.io",
    plan: "Professional",
    seats: 75,
    seatsUsed: 2,
    usage: 780,
    credit: 50,
    billingStatus: "current",
    status: "active",
    created: "2024-02-14",
  },
  {
    id: "ORG-008",
    name: "DataFlow Analytics",
    domain: "dataflow.com",
    plan: "Starter",
    seats: 25,
    seatsUsed: 1,
    usage: 180,
    credit: 10,
    billingStatus: "current",
    status: "active",
    created: "2024-03-05",
  },
];

export function applyPlanDefaultsToOrganization(
  organization: PlatformOrganization,
): PlatformOrganization {
  const planMetrics = planDefaults[organization.plan];
  return {
    ...organization,
    seats: planMetrics.seats,
    seatsUsed: Math.min(organization.seatsUsed, planMetrics.seats),
    credit: planMetrics.credit,
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

export function getUsageSpend(usage: number): number {
  return usage * verificationApiCallCost;
}
