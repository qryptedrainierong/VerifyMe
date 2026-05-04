import { Building2, Plus, Search, Filter, ArrowUpDown } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../shared/components/ui/button";
import { Input } from "../../shared/components/ui/input";
import { Card } from "../../shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shared/components/ui/select";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import { CreateOrganizationDialog, type NewOrganizationInput } from "./components/CreateOrganizationDialog";
import {
  buildInitialOrganizations,
  formatIntegrationStatus,
  formatLifecycleStatus,
  getVerificationSpend,
  planDefaults,
  type IntegrationStatus,
  type OrganizationLifecycleStatus,
  type PlatformOrganization,
} from "../data/platformOrganizationsSample";
import {
  getPlatformOrganizationStoreVersion,
  mergeOrganizationWithSessionOverride,
  registerPlatformOrganizationOverride,
  subscribePlatformOrganizationListeners,
} from "../data/platformOrganizationSessionOverrides";

export function PlatformOrganizations() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | PlatformOrganization["plan"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | OrganizationLifecycleStatus>("all");
  const [integrationFilter, setIntegrationFilter] = useState<"all" | IntegrationStatus>("all");
  const [organizations, setOrganizations] = useState<PlatformOrganization[]>(buildInitialOrganizations());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const organizationStoreVersion = useSyncExternalStore(
    subscribePlatformOrganizationListeners,
    getPlatformOrganizationStoreVersion,
    getPlatformOrganizationStoreVersion,
  );

  const organizationsDisplay = useMemo(
    () => organizations.map((org) => mergeOrganizationWithSessionOverride(org)),
    [organizations, organizationStoreVersion],
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const filteredOrganizations = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return organizationsDisplay.filter((org) => {
      const haystack = [
        org.organizationName,
        org.legalName,
        org.organizationCode,
        org.primaryClientId,
        org.domain,
        org.id,
        org.country,
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = normalizedQuery.length === 0 || haystack.includes(normalizedQuery);
      return (
        matchesSearch
        && (planFilter === "all" || org.plan === planFilter)
        && (statusFilter === "all" || org.status === statusFilter)
        && (integrationFilter === "all" || org.integrationStatus === integrationFilter)
      );
    });
  }, [organizationsDisplay, searchQuery, planFilter, statusFilter, integrationFilter]);

  const overviewStats = useMemo(() => {
    const totalOrganizations = organizationsDisplay.length;
    const activeOrganizations = organizationsDisplay.filter((org) => org.status === "active").length;
    const totalCredits = organizationsDisplay.reduce((sum, org) => sum + org.creditBalance, 0);
    const totalSpent = organizationsDisplay.reduce((sum, org) => sum + getVerificationSpend(org), 0);

    return {
      totalOrganizations,
      activeOrganizations,
      utilizationRate: totalCredits > 0 ? (totalSpent / totalCredits) * 100 : 0,
      totalCreditRemaining: Math.max(totalCredits - totalSpent, 0),
    };
  }, [organizationsDisplay]);

  const getNextOrganizationId = (currentOrganizations: PlatformOrganization[]) => {
    const maxId = currentOrganizations.reduce((max, org) => {
      const value = Number(org.id.replace("ORG-", ""));
      return Number.isNaN(value) ? max : Math.max(max, value);
    }, 0);
    return `ORG-${String(maxId + 1).padStart(3, "0")}`;
  };

  const mapFormToOrganization = (
    input: NewOrganizationInput,
    currentOrganizations: PlatformOrganization[],
  ): PlatformOrganization => {
    const fallbackDomain = input.adminEmail.split("@")[1] ?? "new-org.local";
    const domain = fallbackDomain.toLowerCase();
    const planMetrics = planDefaults[input.plan];
    const walletCredits = input.initialCredits + input.topUpCredits;
    const primaryClientId = `${input.organizationCode}_CALLCENTER_SANDBOX_001`;

    return {
      id: getNextOrganizationId(currentOrganizations),
      organizationName: input.organizationName,
      legalName: input.legalName,
      domain,
      organizationCode: input.organizationCode,
      primaryClientId,
      organizationType: input.organizationType,
      industry: input.industry,
      companySize: input.companySize,
      country: input.country,
      timezone: input.timezone,
      currency: input.currency,
      plan: input.plan,
      seatLimit: input.seatLimit,
      seatsUsed: 1,
      usage: 0,
      creditBalance: walletCredits,
      monthlyIncludedCredits: planMetrics.monthlyIncludedCredits,
      topUpCredits: input.topUpCredits,
      pricePerVerification: input.pricePerVerification,
      emailOtpBillingEnabled: input.emailOtpBillingEnabled,
      paymentStanding: "current",
      status: "pending_setup",
      integrationStatus: "not_configured",
      created: new Date().toISOString().slice(0, 10),
    };
  };

  const handleCreateOrganization = (input: NewOrganizationInput) => {
    setOrganizations((prev) => {
      const organization = mapFormToOrganization(input, prev);
      registerPlatformOrganizationOverride(organization);
      return [organization, ...prev];
    });
    setSuccessMessage(
      `${input.organizationName} was created. Organization status is pending_setup and integration is not_configured. `
        + "The organization admin completes remaining setup in the Organization Admin Portal.",
    );
  };

  const lifecycleOptions: OrganizationLifecycleStatus[] = [
    "draft",
    "pending_setup",
    "active",
    "suspended",
    "disabled",
    "archived",
  ];

  const integrationOptions: IntegrationStatus[] = [
    "not_configured",
    "missing_redirect_uri",
    "missing_keys",
    "ready_for_testing",
    "sandbox_active",
    "production_active",
    "error",
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 border-b border-border">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Organizations</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create and manage organizations: plans, credits, verification sessions, client apps, redirect URIs, QR
              linking, and integration readiness
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Create Organization
          </Button>
        </div>
        {successMessage && (
          <div className="mb-4 rounded-md border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm text-green-700 dark:text-green-300">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
          <Card className="p-4 border border-border/70 shadow-none min-h-[92px]">
            <p className="text-xs text-muted-foreground">Total organizations</p>
            <p className="text-xl font-semibold text-foreground mt-1">{formatNumber(overviewStats.totalOrganizations)}</p>
          </Card>
          <Card className="p-4 border border-border/70 shadow-none min-h-[92px]">
            <p className="text-xs text-muted-foreground">Active organizations</p>
            <p className="text-xl font-semibold text-foreground mt-1">{formatNumber(overviewStats.activeOrganizations)}</p>
          </Card>
          <Card className="p-4 border border-border/70 shadow-none min-h-[92px]">
            <p className="text-xs text-muted-foreground">Credit utilization (billable sessions)</p>
            <p className="text-xl font-semibold text-foreground mt-1">{overviewStats.utilizationRate.toFixed(1)}%</p>
          </Card>
          <Card className="p-4 border border-border/70 shadow-none min-h-[92px]">
            <p className="text-xs text-muted-foreground">Credits remaining</p>
            <p className="text-xl font-semibold text-foreground mt-1">{formatCurrency(overviewStats.totalCreditRemaining)}</p>
          </Card>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[240px] md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, code, client_id, domain…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-md border-border bg-input-background pl-9 text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <Select value={planFilter} onValueChange={(value) => setPlanFilter(value as typeof planFilter)}>
            <SelectTrigger className="h-10 w-[170px] rounded-md text-sm">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All plans</SelectItem>
              <SelectItem value="Enterprise">Enterprise</SelectItem>
              <SelectItem value="Professional">Professional</SelectItem>
              <SelectItem value="Starter">Starter</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
            <SelectTrigger className="h-10 w-[190px] rounded-md text-sm">
              <SelectValue placeholder="Organization status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organization statuses</SelectItem>
              {lifecycleOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {formatLifecycleStatus(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={integrationFilter}
            onValueChange={(value) => setIntegrationFilter(value as typeof integrationFilter)}
          >
            <SelectTrigger className="h-10 w-[210px] rounded-md text-sm">
              <SelectValue placeholder="Integration status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All integration status</SelectItem>
              {integrationOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {formatIntegrationStatus(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-md"
            onClick={() => {
              setSearchQuery("");
              setPlanFilter("all");
              setStatusFilter("all");
              setIntegrationFilter("all");
            }}
            aria-label="Clear filters"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Card className="m-8 border border-border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px]">
              <thead className="border-b border-border bg-accent/5 sticky top-0 z-10">
                <tr>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                    <button type="button" className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Organization name
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                    Organization code
                  </th>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                    Primary client_id
                  </th>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                    Plan
                  </th>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                    Credit balance
                  </th>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                    Organization status
                  </th>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                    Integration
                  </th>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                    Country / timezone
                  </th>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                    <button type="button" className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Created
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrganizations.map((org) => (
                  <tr
                    key={org.id}
                    className="hover:bg-accent/5 transition-colors cursor-pointer"
                    onClick={(event) => {
                      const target = event.target;
                      if (target instanceof HTMLElement) {
                        if (
                          target.closest(
                            [
                              "button",
                              "a",
                              "input",
                              "textarea",
                              "select",
                              "label",
                              "[role='button']",
                              "[role='checkbox']",
                              "[role='switch']",
                              "[role='combobox']",
                              "[role='menu']",
                              "[role='menuitem']",
                              "[role='listbox']",
                              "[role='option']",
                              "[role='tab']",
                              "[data-no-row-nav]",
                            ].join(", "),
                          )
                        ) {
                          return;
                        }
                      }
                      navigate(`/organizations/${org.id}`);
                    }}
                  >
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium text-foreground truncate">{org.organizationName}</p>
                          <p className="text-[12px] text-muted-foreground truncate">
                            {org.domain} <span className="mx-1">·</span> {org.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top whitespace-nowrap">
                      <code className="text-[12px] bg-muted px-1.5 py-0.5 rounded font-mono">{org.organizationCode}</code>
                    </td>
                    <td className="p-4 align-top max-w-[200px]">
                      <code className="text-[11px] break-all text-foreground">{org.primaryClientId}</code>
                    </td>
                    <td className="p-4 align-top whitespace-nowrap">
                      <UnifiedBadge variant="plan" value={org.plan} />
                    </td>
                    <td className="p-4 align-top whitespace-nowrap">
                      <p className="text-[14px] text-foreground tabular-nums font-medium">
                        {formatCurrency(org.creditBalance)}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Wallet (monetary credits)</p>
                    </td>
                    <td className="p-4 align-top whitespace-nowrap">
                      <UnifiedBadge variant="status" value={formatLifecycleStatus(org.status)} />
                    </td>
                    <td className="p-4 align-top whitespace-nowrap max-w-[160px]">
                      <UnifiedBadge variant="integration" value={formatIntegrationStatus(org.integrationStatus)} />
                    </td>
                    <td className="p-4 align-top text-[13px] text-foreground">
                      <p>{org.country}</p>
                      <p className="text-[11px] text-muted-foreground font-mono truncate max-w-[180px]" title={org.timezone}>
                        {org.timezone}
                      </p>
                    </td>
                    <td className="p-4 align-top whitespace-nowrap">
                      <p className="text-[14px] text-foreground">
                        {new Date(org.created).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </td>
                  </tr>
                ))}
                {filteredOrganizations.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-10 text-center">
                      <p className="text-sm font-medium text-foreground">No organizations found</p>
                      <p className="text-xs text-muted-foreground mt-1">Try adjusting search or filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <CreateOrganizationDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        existingOrganizationCodes={organizationsDisplay.map((org) => org.organizationCode)}
        onSubmit={handleCreateOrganization}
      />
    </div>
  );
}
