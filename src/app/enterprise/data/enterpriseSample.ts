import {
  getSampleOrganizationById,
  getVerificationSpend,
  planDefaults,
} from "../../platform/data/platformOrganizationsSample";
import { platformEndUserAssociations } from "../../platform/data/platformUsersSample";

const associatedOrganization = getSampleOrganizationById("ORG-001");

if (!associatedOrganization) {
  throw new Error("Associated enterprise organization sample is missing.");
}

export const enterpriseOrganization = associatedOrganization;
export const enterpriseUsageLimit = planDefaults[enterpriseOrganization.plan].usage;
export const enterpriseUsageSpend = getVerificationSpend(enterpriseOrganization);
export const enterpriseCreditRemaining = Math.max(enterpriseOrganization.credit - enterpriseUsageSpend, 0);
export const enterpriseCreditUtilizationPct =
  enterpriseOrganization.credit > 0 ? (enterpriseUsageSpend / enterpriseOrganization.credit) * 100 : 0;
export const enterpriseUsagePct =
  enterpriseUsageLimit > 0 ? (enterpriseOrganization.usage / enterpriseUsageLimit) * 100 : 0;

export const enterpriseEndUsers = platformEndUserAssociations.filter(
  (user) => user.organizationId === enterpriseOrganization.id,
);
export const enterpriseActiveEndUsers = enterpriseEndUsers.filter((user) => user.status === "active").length;

export const enterpriseUsageTrend = Array.from({ length: 9 }, (_, index) => ({
  date: `Apr ${index + 1}`,
  usage: Math.round((enterpriseOrganization.usage / 9) * (0.88 + index * 0.03)),
}));

export const enterpriseInvoices = [
  {
    id: `INV-${enterpriseOrganization.id}-0424`,
    date: "Apr 1, 2024",
    amount: enterpriseUsageSpend,
    status:
      enterpriseOrganization.billingStatus === "current"
        ? "success"
        : enterpriseOrganization.billingStatus === "overdue"
          ? "pending"
          : "failed",
    period: "Apr 2024",
  },
  {
    id: `INV-${enterpriseOrganization.id}-0324`,
    date: "Mar 1, 2024",
    amount: Math.round(enterpriseUsageSpend * 0.87),
    status: "success",
    period: "Mar 2024",
  },
  {
    id: `INV-${enterpriseOrganization.id}-0224`,
    date: "Feb 1, 2024",
    amount: Math.round(enterpriseUsageSpend * 0.81),
    status: "success",
    period: "Feb 2024",
  },
];
