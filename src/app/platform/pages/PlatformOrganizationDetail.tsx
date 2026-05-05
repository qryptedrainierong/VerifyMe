import { ArrowLeft, Building2 } from "lucide-react";
import { useMemo, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../../shared/components/ui/button";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import {
  getPlatformOrganizationForDetail,
  getPlatformOrganizationStoreVersion,
  subscribePlatformOrganizationListeners,
} from "../data/platformOrganizationSessionOverrides";
import {
  formatIntegrationStatus,
  formatLifecycleStatus,
  type PlatformOrganization,
} from "../data/platformOrganizationsSample";
import { platformEndUserAssociations } from "../data/platformUsersSample";
import { OrganizationDetailTabs } from "./components/OrganizationDetailTabs";

type OrganizationProfile = {
  owner: { name: string; email: string; phone: string };
  billingEmail: string;
  address: string;
};

const profileByOrgId: Record<string, OrganizationProfile> = {
  "ORG-001": {
    owner: {
      name: "John Smith",
      email: "john@acme.com",
      phone: "+1 (555) 123-4567",
    },
    billingEmail: "billing@acme.com",
    address: "123 Market St, San Francisco, CA 94103",
  },
};

function profileForOrganization(org: PlatformOrganization): OrganizationProfile {
  return (
    profileByOrgId[org.id] ?? {
      owner: {
        name: "Primary admin",
        email: `admin@${org.domain}`,
        phone: "+1 (555) 000-0100",
      },
      billingEmail: `billing@${org.domain}`,
      address: "Address on file",
    }
  );
}

export function PlatformOrganizationDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const organizationStoreVersion = useSyncExternalStore(
    subscribePlatformOrganizationListeners,
    getPlatformOrganizationStoreVersion,
    getPlatformOrganizationStoreVersion,
  );

  const organization = useMemo(
    () => getPlatformOrganizationForDetail(id),
    [id, organizationStoreVersion],
  );
  const profile = organization ? profileForOrganization(organization) : null;

  const organizationEndUsers = organization
    ? platformEndUserAssociations.filter((user) => user.organizationId === organization.id)
    : [];

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  if (!organization || !profile) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-4 p-8">
        <p className="text-sm text-muted-foreground">Organization not found.</p>
        <Button variant="outline" onClick={() => navigate("/organizations")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Organizations
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border bg-card px-6 py-6 sm:px-8 sm:py-7">
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/organizations")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Organizations
          </Button>
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {organization.organizationName}
                </h1>
                <UnifiedBadge variant="plan" value={organization.plan} />
                <UnifiedBadge variant="status" value={formatLifecycleStatus(organization.status)} />
                <UnifiedBadge variant="integration" value={formatIntegrationStatus(organization.integrationStatus)} />
              </div>
              <p className="text-[14px] text-muted-foreground">
                {organization.organizationCode} · {organization.primaryClientId}
              </p>
              <p className="text-[13px] text-muted-foreground mt-1">
                {organization.domain} · {organization.country} · Created {formatDate(organization.created)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <OrganizationDetailTabs organization={organization} profile={profile} organizationEndUsers={organizationEndUsers} />
    </div>
  );
}
