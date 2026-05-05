import { Search, Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../shared/components/ui/dialog";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import {
  platformIdentityLinks,
  type IdentityLinkConflictStatus,
  type IdentityLinkStatus,
  type PlatformIdentityLinkRow,
} from "../data/platformIdentityLinksSample";
import { buildInitialOrganizations } from "../data/platformOrganizationsSample";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";

function linkStatusLabel(s: IdentityLinkStatus): string {
  const map: Record<IdentityLinkStatus, string> = {
    linked: "Linked",
    pending: "Pending",
    suspended: "Suspended",
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

export function PlatformIdentityLinks() {
  const [searchParams] = useSearchParams();
  const urlOrganizationId = searchParams.get("organizationId");

  const [rows, setRows] = useState(platformIdentityLinks);
  const [searchQuery, setSearchQuery] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("all-orgs");
  const [statusFilter, setStatusFilter] = useState<"all" | IdentityLinkStatus>("all");
  const [conflictFilter, setConflictFilter] = useState<"all" | IdentityLinkConflictStatus>("all");
  const [detailRow, setDetailRow] = useState<PlatformIdentityLinkRow | null>(null);
  const [reviewRow, setReviewRow] = useState<PlatformIdentityLinkRow | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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
        r.maskedVerifymeId.toLowerCase().includes(q);
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
      suspendedDisabled: base.filter((r) => r.linkStatus === "suspended" || r.linkStatus === "disabled").length,
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
    <>
      <PortalPageFrame
        variant="fill"
        rootClassName="h-full"
        title="Identity Links"
        description={
          <>
            Platform-wide view of organization <span className="font-mono text-foreground">client_user_id</span> to
            VerifyMe identity links. Values are sample data only; no secrets or raw payloads are shown.
          </>
        }
        headerExtra={
          <>
            {urlOrganizationId ? (
              <p className="text-xs text-muted-foreground sm:text-sm">
                URL filter: <span className="font-mono text-foreground">{urlOrganizationId}</span>
                {!knownOrgIds.has(urlOrganizationId)
                  ? " — unknown organization id in sample set; adjust filters manually."
                  : " — applied when recognized in sample organizations."}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground sm:text-sm">
                Optional <span className="font-mono">?organizationId=…</span> pre-selects organization when recognized
                (design-phase).
              </p>
            )}
            {message ? (
              <div className="rounded-md border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm text-green-700 dark:text-green-300">
                {message}
              </div>
            ) : null}
          </>
        }
        bodyClassName="space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4 border border-border shadow-sm">
            <p className="text-[12px] text-muted-foreground">Total links</p>
            <p className="text-[22px] font-semibold tabular-nums">{summary.total}</p>
          </Card>
          <Card className="p-4 border border-border shadow-sm">
            <p className="text-[12px] text-muted-foreground">Linked</p>
            <p className="text-[22px] font-semibold tabular-nums">{summary.linked}</p>
          </Card>
          <Card className="p-4 border border-border shadow-sm">
            <p className="text-[12px] text-muted-foreground">Pending</p>
            <p className="text-[22px] font-semibold tabular-nums">{summary.pending}</p>
          </Card>
          <Card className="p-4 border border-border shadow-sm">
            <p className="text-[12px] text-muted-foreground">Suspended / disabled</p>
            <p className="text-[22px] font-semibold tabular-nums">{summary.suspendedDisabled}</p>
          </Card>
          <Card className="p-4 border border-border shadow-sm">
            <p className="text-[12px] text-muted-foreground">Conflicts (pending review)</p>
            <p className="text-[22px] font-semibold tabular-nums">{summary.conflicts}</p>
          </Card>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search client_user_id, org, masked VerifyMe ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
            <SelectTrigger className="w-[200px] h-10">
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
            <SelectTrigger className="w-[160px] h-10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="linked">Linked</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={conflictFilter} onValueChange={(v) => setConflictFilter(v as typeof conflictFilter)}>
            <SelectTrigger className="w-[180px] h-10">
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
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <Card className="border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-w-[960px]">
            <table className="w-full text-[13px]">
              <thead className="border-b border-border bg-accent/5">
                <tr>
                  <th className="text-left p-3 font-medium text-muted-foreground">Organization</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">client_user_id</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">VerifyMe ID (masked)</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Link status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Conflict status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Last verified</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Created / linked</th>
                  <th className="text-left p-3 font-medium text-muted-foreground w-[200px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-accent/5">
                    <td className="p-3 align-top">
                      <p className="font-medium text-foreground">{r.organizationName}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">{r.organizationId}</p>
                    </td>
                    <td className="p-3 font-mono text-[12px] align-top">{r.clientUserId}</td>
                    <td className="p-3 align-top">{r.customerDisplayName}</td>
                    <td className="p-3 font-mono text-[12px] align-top">{r.maskedVerifymeId}</td>
                    <td className="p-3 align-top">
                      <UnifiedBadge variant="status" value={linkStatusLabel(r.linkStatus)} />
                    </td>
                    <td className="p-3 align-top">
                      <UnifiedBadge variant="status" value={conflictLabel(r.conflictStatus)} />
                    </td>
                    <td className="p-3 text-muted-foreground align-top">
                      {r.lastVerified ? formatDateTime(r.lastVerified) : "—"}
                    </td>
                    <td className="p-3 text-muted-foreground align-top">{formatDate(r.createdLinkedAt)}</td>
                    <td className="p-3 align-top">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => setDetailRow(r)}>
                          View details
                        </Button>
                        {r.conflictStatus === "pending_review" ? (
                          <Button variant="secondary" size="sm" onClick={() => setReviewRow(r)}>
                            Review conflict
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </PortalPageFrame>

      <Dialog open={detailRow !== null} onOpenChange={(o) => !o && setDetailRow(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Link details</DialogTitle>
            <DialogDescription>Read-only sample row — no secrets.</DialogDescription>
          </DialogHeader>
          {detailRow ? (
            <div className="space-y-2 text-[13px]">
              <p>
                <span className="text-muted-foreground">Organization:</span> {detailRow.organizationName} (
                {detailRow.organizationId})
              </p>
              <p>
                <span className="text-muted-foreground">client_user_id:</span>{" "}
                <span className="font-mono">{detailRow.clientUserId}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Customer:</span> {detailRow.customerDisplayName}
              </p>
              <p>
                <span className="text-muted-foreground">VerifyMe ID (masked):</span>{" "}
                <span className="font-mono">{detailRow.maskedVerifymeId}</span>
              </p>
              <p className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground">Link status:</span>
                <UnifiedBadge variant="status" value={linkStatusLabel(detailRow.linkStatus)} />
              </p>
              <p className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground">Conflict:</span>
                <UnifiedBadge variant="status" value={conflictLabel(detailRow.conflictStatus)} />
              </p>
              <p>
                <span className="text-muted-foreground">Last verified:</span>{" "}
                {detailRow.lastVerified ? formatDateTime(detailRow.lastVerified) : "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Created / linked:</span> {formatDate(detailRow.createdLinkedAt)}
              </p>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailRow(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reviewRow !== null} onOpenChange={(o) => !o && setReviewRow(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review conflict (mock)</DialogTitle>
            <DialogDescription>
              Mark this link conflict as reviewed in sample data. Production would route through compliance workflows.
            </DialogDescription>
          </DialogHeader>
          {reviewRow ? (
            <p className="text-[13px] text-muted-foreground">
              Link <span className="font-mono text-foreground">{reviewRow.id}</span> —{" "}
              {reviewRow.customerDisplayName} / {reviewRow.organizationName}
            </p>
          ) : null}
          <p className="text-[12px] text-muted-foreground border border-border/80 rounded-md bg-muted/30 px-3 py-2">
            This action will be recorded in audit logs.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewRow(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!reviewRow) return;
                setRows((prev) =>
                  prev.map((x) => (x.id === reviewRow.id ? { ...x, conflictStatus: "resolved" as const } : x)),
                );
                setReviewRow(null);
                setMessage(`Conflict for ${reviewRow.clientUserId} marked reviewed (mock).`);
              }}
            >
              Confirm review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
