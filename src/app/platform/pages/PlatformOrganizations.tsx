import { Building2, Plus, Search, Filter, MoreVertical, ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../shared/components/ui/dropdown-menu";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import { CreateOrganizationDialog, type NewOrganizationInput } from "./components/CreateOrganizationDialog";
import {
  buildInitialOrganizations,
  getUsageSpend,
  planDefaults,
  type PlatformOrganization,
} from "../data/platformOrganizationsSample";

export function PlatformOrganizations() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | PlatformOrganization["plan"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | PlatformOrganization["status"]>("all");
  const [billingFilter, setBillingFilter] = useState<"all" | PlatformOrganization["billingStatus"]>("all");
  const [organizations, setOrganizations] = useState<PlatformOrganization[]>(buildInitialOrganizations());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const filteredOrganizations = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return organizations.filter(
      (org) =>
        (normalizedQuery.length === 0
          || org.name.toLowerCase().includes(normalizedQuery)
          || org.domain.toLowerCase().includes(normalizedQuery))
        && (planFilter === "all" || org.plan === planFilter)
        && (statusFilter === "all" || org.status === statusFilter)
        && (billingFilter === "all" || org.billingStatus === billingFilter),
    );
  }, [organizations, searchQuery, planFilter, statusFilter, billingFilter]);

  const overviewStats = useMemo(() => {
    const totalOrganizations = organizations.length;
    const activeOrganizations = organizations.filter((org) => org.status === "active").length;
    const totalCredits = organizations.reduce((sum, org) => sum + org.credit, 0);
    const totalSpent = organizations.reduce((sum, org) => sum + getUsageSpend(org.usage), 0);

    return {
      totalOrganizations,
      activeOrganizations,
      utilizationRate: totalCredits > 0 ? (totalSpent / totalCredits) * 100 : 0,
      totalCreditRemaining: Math.max(totalCredits - totalSpent, 0),
    };
  }, [organizations]);

  const getNextOrganizationId = (currentOrganizations: PlatformOrganization[]) => {
    const maxId = currentOrganizations.reduce((max, org) => {
      const value = Number(org.id.replace("ORG-", ""));
      return Number.isNaN(value) ? max : Math.max(max, value);
    }, 0);
    return `ORG-${String(maxId + 1).padStart(3, "0")}`;
  };

  const mapCompanySizeToManagerSeatsUsed = (companySize: string, seats: number) => {
    const sizeFromText = companySize.match(/\d+/);
    if (!sizeFromText) {
      return Math.round(seats * 0.2);
    }
    return Math.min(Number(sizeFromText[0]), seats);
  };

  const mapFormToOrganization = (
    input: NewOrganizationInput,
    currentOrganizations: PlatformOrganization[],
  ): PlatformOrganization => {
    const fallbackDomain = input.adminEmail.split("@")[1] ?? "new-org.local";
    const domain = (input.supportEmail.split("@")[1] ?? fallbackDomain).toLowerCase();
    const planMetrics = planDefaults[input.plan];
    const seatsUsed = mapCompanySizeToManagerSeatsUsed(input.companySize, planMetrics.seats);

    return {
      id: getNextOrganizationId(currentOrganizations),
      name: input.displayName,
      domain,
      plan: input.plan,
      seats: planMetrics.seats,
      seatsUsed,
      usage: planMetrics.usage,
      credit: planMetrics.credit,
      billingStatus: "current",
      status: input.status,
      created: input.trialStartDate,
    };
  };

  const handleCreateOrganization = (input: NewOrganizationInput) => {
    setOrganizations((prev) => {
      const organization = mapFormToOrganization(input, prev);
      return [organization, ...prev];
    });
    setSuccessMessage(`${input.displayName} was created successfully.`);
  };

  const handleViewDetails = (organizationId: string) => {
    navigate(`/organizations/${organizationId}`);
  };

  const handleViewAsClient = (organizationName: string) => {
    setSuccessMessage(`Opening ${organizationName} in client view.`);
  };

  const handleToggleOrganizationStatus = (organizationId: string) => {
    setOrganizations((prev) =>
      prev.map((organization) => {
        if (organization.id !== organizationId) {
          return organization;
        }
        const nextStatus = organization.status === "suspended" ? "active" : "suspended";
        return { ...organization, status: nextStatus };
      }),
    );
    const target = organizations.find((organization) => organization.id === organizationId);
    if (target) {
      setSuccessMessage(
        target.status === "suspended"
          ? `${target.name} was reactivated.`
          : `${target.name} was suspended.`,
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-8 border-b border-border">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Organizations</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage all customer organizations and subscriptions
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
            <p className="text-xs text-muted-foreground">Total Organizations</p>
            <p className="text-xl font-semibold text-foreground mt-1">{formatNumber(overviewStats.totalOrganizations)}</p>
          </Card>
          <Card className="p-4 border border-border/70 shadow-none min-h-[92px]">
            <p className="text-xs text-muted-foreground">Active Organizations</p>
            <p className="text-xl font-semibold text-foreground mt-1">{formatNumber(overviewStats.activeOrganizations)}</p>
          </Card>
          <Card className="p-4 border border-border/70 shadow-none min-h-[92px]">
            <p className="text-xs text-muted-foreground">Credit Utilization</p>
            <p className="text-xl font-semibold text-foreground mt-1">{overviewStats.utilizationRate.toFixed(1)}%</p>
          </Card>
          <Card className="p-4 border border-border/70 shadow-none min-h-[92px]">
            <p className="text-xs text-muted-foreground">Credit Remaining</p>
            <p className="text-xl font-semibold text-foreground mt-1">{formatCurrency(overviewStats.totalCreditRemaining)}</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[240px] md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by organization name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-md border-border bg-input-background pl-9 text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <Select value={planFilter} onValueChange={(value) => setPlanFilter(value as typeof planFilter)}>
            <SelectTrigger className="h-10 w-[170px] rounded-md text-sm">
              <SelectValue placeholder="All Plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="Enterprise">Enterprise</SelectItem>
              <SelectItem value="Professional">Professional</SelectItem>
              <SelectItem value="Starter">Starter</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
            <SelectTrigger className="h-10 w-[170px] rounded-md text-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>

          <Select value={billingFilter} onValueChange={(value) => setBillingFilter(value as typeof billingFilter)}>
            <SelectTrigger className="h-10 w-[190px] rounded-md text-sm">
              <SelectValue placeholder="All Billing Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Billing Status</SelectItem>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
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
              setBillingFilter("all");
            }}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Card className="m-8 border border-border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-accent/5 sticky top-0 z-10">
                <tr>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Organization Name
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Plan
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Seats
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Usage & Credit
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                    Billing Status
                  </th>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                    Status
                  </th>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Created Date
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase w-[60px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrganizations.map((org) => (
                  <tr
                    key={org.id}
                    className="hover:bg-accent/5 transition-colors cursor-pointer"
                    onClick={() => navigate(`/organizations/${org.id}`)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium text-foreground truncate">
                            {org.name}
                          </p>
                          <p className="text-[12px] text-muted-foreground truncate">
                            {org.domain} <span className="mx-1">•</span> {org.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <UnifiedBadge variant="plan" value={org.plan} />
                    </td>
                    <td className="p-4 align-top">
                      <div>
                        <p className="text-[14px] text-foreground">
                          {formatNumber(org.seatsUsed)} / {formatNumber(org.seats)}
                        </p>
                        <p className="text-[12px] text-muted-foreground">users</p>
                        <div className="w-24 h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              org.seatsUsed > org.seats
                                ? "bg-red-500"
                                : org.seatsUsed / org.seats > 0.9
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min((org.seatsUsed / org.seats) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      {(() => {
                        const spent = getUsageSpend(org.usage);
                        const ratio = org.credit > 0 ? spent / org.credit : 0;
                        const indicatorWidth = `${Math.min(ratio * 100, 100)}%`;
                        const indicatorColor = ratio > 1 ? "bg-red-500" : ratio > 0.8 ? "bg-yellow-500" : "bg-green-500";
                        const remainingCredit = Math.max(org.credit - spent, 0);

                        return (
                          <div className="w-[180px]">
                            <p className="text-[14px] text-foreground tabular-nums leading-5">
                              {formatCurrency(spent)} / {formatCurrency(org.credit)}
                            </p>
                            <p className="mt-1 text-[11px] text-muted-foreground tabular-nums leading-4">
                              {remainingCredit > 0
                                ? `${formatCurrency(remainingCredit)} credit remaining`
                                : "Credit exhausted"}
                            </p>
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div className={`h-full ${indicatorColor}`} style={{ width: indicatorWidth }} />
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <UnifiedBadge
                        variant="billing"
                        value={org.billingStatus === "current"
                          ? "Current"
                          : org.billingStatus === "overdue"
                          ? "Overdue"
                          : "Failed"}
                      />
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <UnifiedBadge
                        variant="status"
                        value={org.status === "active"
                          ? "Active"
                          : org.status === "trial"
                          ? "Trial"
                          : "Suspended"}
                      />
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <p className="text-[14px] text-foreground">
                        {new Date(org.created).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </td>
                    <td className="p-4 align-top">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(org.id);
                            }}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewAsClient(org.name);
                            }}
                          >
                            View as Client
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleOrganizationStatus(org.id);
                            }}
                          >
                            {org.status === "suspended" ? "Activate" : "Suspend"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredOrganizations.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-10 text-center">
                      <p className="text-sm font-medium text-foreground">No organizations found</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Try adjusting search keywords or clearing filters.
                      </p>
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
        existingOrganizationNames={organizations.map((org) => org.name)}
        onSubmit={handleCreateOrganization}
      />
    </div>
  );
}
