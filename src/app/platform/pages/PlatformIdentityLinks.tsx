import { Search, Filter } from "lucide-react";
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
import {
  getIdentityLinksStoreVersion,
  getIdentityLinkRows,
  subscribeIdentityLinksListeners,
} from "../data/platformIdentityLinksSession";
import type { IdentityLinkConflictStatus, IdentityLinkStatus, NameMatchStatus } from "../data/platformIdentityLinksSample";
import { buildInitialOrganizations } from "../data/platformOrganizationsSample";
import {
  getEndUserAssociationStoreVersion,
  getEndUserAssociations,
  subscribeEndUserAssociationListeners,
} from "../data/platformEndUserAssociationsSession";
import { computePlatformRiskSummaryForVerifymeId } from "../data/mockPlatformRisk";
import { UserRiskStatusBadge } from "../../shared/components/RiskSummary";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";
import { shouldIgnoreRowOpenClick } from "../utils/tableRowNav";

function linkStatusLabel(s: IdentityLinkStatus): string {
  const map: Record<IdentityLinkStatus, string> = {
    unlinked: "Unlinked",
    linked: "Linked",
    pending: "Pending",
    suspended: "Suspended",
    revoked: "Revoked",
    disabled: "Disabled",
  };
  return map[s];
}

function conflictLabel(c: IdentityLinkConflictStatus): string {
  const map: Record<IdentityLinkConflictStatus, string> = {
    none: "None",
    pending_review: "Pending review",
    resolved: "Resolved",
  };
  return map[c];
}

function nameMatchLabel(s: NameMatchStatus): string {
  const map: Record<NameMatchStatus, string> = {
    not_provided: "Not provided",
    not_checked: "Not checked",
    strong_match: "Strong match",
    partial_match: "Partial match",
    mismatch: "Mismatch",
  };
  return map[s];
}

export function PlatformIdentityLinks() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlOrganizationId = searchParams.get("organizationId");

  const version = useSyncExternalStore(
    subscribeIdentityLinksListeners,
    getIdentityLinksStoreVersion,
    getIdentityLinksStoreVersion,
  );

  const rows = useMemo(() => getIdentityLinkRows(), [version]);

  const assocVersion = useSyncExternalStore(
    subscribeEndUserAssociationListeners,
    getEndUserAssociationStoreVersion,
    getEndUserAssociationStoreVersion,
  );
  const platformAssociations = useMemo(() => getEndUserAssociations(), [assocVersion]);

  const [searchQuery, setSearchQuery] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("all-orgs");
  const [statusFilter, setStatusFilter] = useState<"all" | IdentityLinkStatus>("all");
  const [conflictFilter, setConflictFilter] = useState<"all" | IdentityLinkConflictStatus>("all");

  const knownOrgIds = useMemo(() => new Set(buildInitialOrganizations().map((o) => o.id)), []);

  useEffect(() => {
    if (urlOrganizationId && knownOrgIds.has(urlOrganizationId)) {
      setOrganizationFilter(urlOrganizationId);
    }
  }, [urlOrganizationId, knownOrgIds]);

  const organizationOptions = useMemo(() => {
    const m = new Map<string, string>();
    rows.forEach((r) => m.set(r.organizationId, r.organizationName));
    return Array.from(m.entries()).map(([id, name]) => ({ id, name }));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQ =
        q.length === 0 ||
        r.clientUserId.toLowerCase().includes(q) ||
        r.organizationName.toLowerCase().includes(q) ||
        r.organizationId.toLowerCase().includes(q) ||
        r.customerDisplayName.toLowerCase().includes(q) ||
        r.verifymeId.toLowerCase().includes(q);
      const matchesOrg = organizationFilter === "all-orgs" || r.organizationId === organizationFilter;
      const matchesStatus = statusFilter === "all" || r.linkStatus === statusFilter;
      const matchesConflict = conflictFilter === "all" || r.conflictStatus === conflictFilter;
      return matchesQ && matchesOrg && matchesStatus && matchesConflict;
    });
  }, [rows, searchQuery, organizationFilter, statusFilter, conflictFilter]);

  const summary = useMemo(() => {
    const base = filtered;
    return {
      total: base.length,
      linked: base.filter((r) => r.linkStatus === "linked").length,
      pending: base.filter((r) => r.linkStatus === "pending").length,
      suspendedDisabled: base.filter((r) =>
        ["suspended", "disabled", "revoked"].includes(r.linkStatus),
      ).length,
      conflicts: base.filter((r) => r.conflictStatus === "pending_review").length,
    };
  }, [filtered]);

  const formatDate = (iso: string) =>
    new Date(iso + (iso.includes("T") ? "" : "T00:00:00Z")).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
    });

  return (
    <PortalPageFrame
      variant="fill"
      rootClassName="h-full"
      title="Identity Links"
      description="Organization customer identifiers linked to VerifyMe accounts (sample)."
      headerExtra={
        <>
          {urlOrganizationId ? (
            <p className="text-xs text-muted-foreground sm:text-sm">
              URL filter: <span className="font-mono text-foreground">{urlOrganizationId}</span>
              {!knownOrgIds.has(urlOrganizationId)
                ? " — unknown organization id in sample set; adjust filters manually."
                : " — applied when recognized in sample organizations."}
            </p>
          ) : null}
        </>
      }
      bodyClassName="space-y-6"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Total links</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{summary.total}</p>
        </Card>
        <Card className="border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Linked</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{summary.linked}</p>
        </Card>
        <Card className="border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{summary.pending}</p>
        </Card>
        <Card className="border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Suspended / disabled / revoked</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{summary.suspendedDisabled}</p>
        </Card>
        <Card className="border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Conflicts (pending review)</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{summary.conflicts}</p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search client_user_id, org, VerifyMe ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 bg-background pl-10"
          />
        </div>
        <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
          <SelectTrigger className="h-10 w-[200px]">
            <SelectValue placeholder="Organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-orgs">All organizations</SelectItem>
            {organizationOptions.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="h-10 w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="linked">Linked</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="unlinked">Unlinked</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={conflictFilter} onValueChange={(v) => setConflictFilter(v as typeof conflictFilter)}>
          <SelectTrigger className="h-10 w-[180px]">
            <SelectValue placeholder="Conflict" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All conflict states</SelectItem>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="pending_review">Pending review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10"
          onClick={() => {
            setSearchQuery("");
            setOrganizationFilter("all-orgs");
            setStatusFilter("all");
            setConflictFilter("all");
          }}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Card className="overflow-hidden border border-border shadow-sm">
        <div className="min-w-[1120px] overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="border-b border-border bg-accent/5">
              <tr>
                <th className="p-3 text-left font-medium text-muted-foreground">Organization</th>
                <th className="p-3 text-left font-medium text-muted-foreground">client_user_id</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Customer</th>
                <th className="p-3 text-left font-medium text-muted-foreground">VerifyMe ID</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Link status</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Conflict status</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Name consistency</th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  <span className="block">User risk</span>
                  <span className="block text-[10px] font-normal normal-case text-muted-foreground">(VerifyMe User)</span>
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">Last verified</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Created / linked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="cursor-pointer transition-colors hover:bg-accent/10"
                  onClick={(e) => {
                    if (shouldIgnoreRowOpenClick(e.target)) return;
                    navigate(`/identity-links/${encodeURIComponent(r.id)}`);
                  }}
                >
                  <td className="p-3 align-top">
                    <p className="font-medium text-foreground">{r.organizationName}</p>
                  </td>
                  <td className="p-3 align-top font-mono text-[12px]">{r.clientUserId}</td>
                  <td className="p-3 align-top">{r.customerDisplayName}</td>
                  <td className="p-3 align-top font-mono text-[12px]">{r.verifymeId}</td>
                  <td className="p-3 align-top">
                    <UnifiedBadge variant="status" value={linkStatusLabel(r.linkStatus)} />
                  </td>
                  <td className="p-3 align-top">
                    <UnifiedBadge variant="status" value={conflictLabel(r.conflictStatus)} />
                  </td>
                  <td className="p-3 align-top">
                    <UnifiedBadge variant="status" value={nameMatchLabel(r.nameMatchStatus)} />
                  </td>
                  <td className="p-3 align-top">
                    {(() => {
                      const ur = computePlatformRiskSummaryForVerifymeId(r.verifymeId, platformAssociations);
                      return ur ? (
                        <UserRiskStatusBadge level={ur.level} />
                      ) : (
                        <span className="text-[12px] text-muted-foreground">—</span>
                      );
                    })()}
                  </td>
                  <td className="p-3 align-top text-muted-foreground">
                    {r.lastVerified ? formatDateTime(r.lastVerified) : "—"}
                  </td>
                  <td className="p-3 align-top text-muted-foreground">{formatDate(r.createdLinkedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PortalPageFrame>
  );
}
