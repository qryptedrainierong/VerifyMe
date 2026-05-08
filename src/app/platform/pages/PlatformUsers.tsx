import { Search, Filter, ArrowUpDown } from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useSearchParams } from "react-router";
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
import type { PlatformEndUserAssociation } from "../data/platformUsersSample";
import { groupAssociationsByVerifymeUserId, type GroupedEndUserRowStatus } from "../data/groupEndUsers";
import { buildInitialOrganizations } from "../data/platformOrganizationsSample";
import {
  getEndUserAssociationStoreVersion,
  getEndUserAssociations,
  subscribeEndUserAssociationListeners,
} from "../data/platformEndUserAssociationsSession";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";
import { shouldIgnoreRowOpenClick } from "../utils/tableRowNav";
import { maskEmail, rowStatusLabel } from "../utils/verifyMeUserFormatters";
import { UserRiskStatusBadge } from "../../shared/components/RiskSummary";
import { computePlatformRiskSummary } from "../data/mockPlatformRisk";
import { ScopedFilterBanner } from "../../shared/components/ScopedFilterBanner";
import { HelperCallout } from "../../shared/components/HelperCallout";

export function PlatformUsers() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlOrganizationId = searchParams.get("organizationId");

  const storeVersion = useSyncExternalStore(
    subscribeEndUserAssociationListeners,
    getEndUserAssociationStoreVersion,
    getEndUserAssociationStoreVersion,
  );

  const usersData = useMemo(() => getEndUserAssociations(), [storeVersion]);

  const [searchQuery, setSearchQuery] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("all-orgs");
  const [statusFilter, setStatusFilter] = useState("all-status");

  const knownOrgIds = useMemo(() => new Set(buildInitialOrganizations().map((o) => o.id)), []);

  useEffect(() => {
    if (urlOrganizationId && knownOrgIds.has(urlOrganizationId)) {
      setOrganizationFilter(urlOrganizationId);
    }
  }, [urlOrganizationId, knownOrgIds]);

  const qualifyingAssociations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return usersData.filter((user) => {
      const matchesQuery =
        query.length === 0 ||
        user.verifymeId.toLowerCase().includes(query) ||
        user.clientUserId.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        maskEmail(user.email).toLowerCase().includes(query) ||
        user.organization.toLowerCase().includes(query) ||
        user.organizationId.toLowerCase().includes(query);
      const matchesOrg =
        organizationFilter === "all-orgs" || user.organizationId === organizationFilter;
      const matchesStatus = statusFilter === "all-status" || user.status === statusFilter;
      return matchesQuery && matchesOrg && matchesStatus;
    });
  }, [usersData, searchQuery, organizationFilter, statusFilter]);

  const groupedUsers = useMemo(() => {
    const ids = new Set(qualifyingAssociations.map((a) => a.verifymeUserId));
    const allGrouped = groupAssociationsByVerifymeUserId(usersData);
    return allGrouped.filter((g) => ids.has(g.verifymeUserId));
  }, [usersData, qualifyingAssociations]);

  const organizationOptions = useMemo(() => {
    const unique = new Map<string, string>();
    usersData.forEach((user) => unique.set(user.organizationId, user.organization));
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
  }, [usersData]);

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString + "Z");
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins} min ago (UTC)`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago (UTC)`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago (UTC)`;
  };

  const rowLabel = (status: GroupedEndUserRowStatus | PlatformEndUserAssociation["status"]) =>
    rowStatusLabel(status);

  return (
    <PortalPageFrame
      variant="fill"
      rootClassName="h-full"
      title="VerifyMe Users"
      description="VerifyMe ID, masked account email, links per organization, and verification activity."
      headerExtra={
        <>
          <HelperCallout className="leading-relaxed">
            Use <span className="font-medium text-foreground">VerifyMe Users</span> for platform-level identity posture,
            account status, and cross-organization activity. Use <span className="font-medium text-foreground">Identity Links</span>{" "}
            when investigating organization-specific `client_user_id` link quality or conflict workflows.
          </HelperCallout>
          {urlOrganizationId ? (
            <ScopedFilterBanner
              entityLabel="organization"
              scopedValue={urlOrganizationId}
              isKnown={knownOrgIds.has(urlOrganizationId)}
              unknownHelperText="Organization was not found in configured organizations."
            />
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search VerifyMe ID, client_user_id, email, org…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full min-w-0 bg-background pl-10"
              />
            </div>

            <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
              <SelectTrigger className="h-10 w-[200px]">
                <SelectValue placeholder="All Organizations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-orgs">All Organizations</SelectItem>
                {organizationOptions.map((organization) => (
                  <SelectItem key={organization.id} value={organization.id}>
                    {organization.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              aria-label="Clear filters"
              onClick={() => {
                setSearchQuery("");
                setOrganizationFilter("all-orgs");
                setStatusFilter("all-status");
              }}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </>
      }
    >
      <Card className="border border-border shadow-sm">
        <div className="min-w-[880px] overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-accent/5">
              <tr>
                <th className="min-w-[112px] p-3 text-left text-[12px] font-medium text-muted-foreground">
                  <button type="button" className="flex items-center gap-1 transition-colors hover:text-foreground">
                    VerifyMe ID
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="p-3 text-left text-[12px] font-medium text-muted-foreground">
                  <button type="button" className="flex items-center gap-1 transition-colors hover:text-foreground">
                    Account email (masked)
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="p-3 text-left text-[12px] font-medium text-muted-foreground">Status</th>
                <th className="p-3 text-left text-[12px] font-medium text-muted-foreground">Linked orgs</th>
                <th className="p-3 text-left text-[12px] font-medium text-muted-foreground">Risk status</th>
                <th className="p-3 text-left text-[12px] font-medium text-muted-foreground">
                  <button type="button" className="flex items-center gap-1 transition-colors hover:text-foreground">
                    Last active
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {groupedUsers.map((group) => (
                <tr
                  key={group.verifymeUserId}
                  className="cursor-pointer transition-colors hover:bg-accent/10"
                  onClick={(e) => {
                    if (shouldIgnoreRowOpenClick(e.target)) return;
                    navigate(`/verifyme-users/${encodeURIComponent(group.verifymeId)}`);
                  }}
                >
                  <td className="p-3 align-middle">
                    <span className="block max-w-[200px] min-w-0 truncate font-mono text-[15px] font-semibold tracking-tight text-foreground">
                      {group.verifymeId}
                    </span>
                  </td>
                  <td className="p-3 align-middle">
                    <p className="font-mono text-[13px] text-foreground">{maskEmail(group.email)}</p>
                  </td>
                  <td className="p-3 align-middle">
                    <UnifiedBadge variant="status" value={rowLabel(group.rowStatus)} />
                  </td>
                  <td className="p-3 align-middle tabular-nums text-[13px] text-foreground">
                    {group.memberships.length}
                  </td>
                  <td className="p-3 align-middle">
                    <UserRiskStatusBadge level={computePlatformRiskSummary(group).level} />
                  </td>
                  <td className="p-3 align-middle">
                    <p className="text-[13px] text-foreground">{formatRelativeTime(group.lastActiveMax)}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PortalPageFrame>
  );
}
