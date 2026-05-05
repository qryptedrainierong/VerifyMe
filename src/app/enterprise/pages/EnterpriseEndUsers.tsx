import { useMemo, useState, useSyncExternalStore, type FormEvent } from "react";
import {
  AlertTriangle,
  BookOpen,
  Download,
  Link2,
  MoreVertical,
  Plus,
  Search,
  Upload,
  UserPlus,
} from "lucide-react";
import { Button } from "../../shared/components/ui/button";
import { Input } from "../../shared/components/ui/input";
import { Card } from "../../shared/components/ui/card";
import { Label } from "../../shared/components/ui/label";
import { Textarea } from "../../shared/components/ui/textarea";
import { Separator } from "../../shared/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../shared/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shared/components/ui/select";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../shared/components/ui/tooltip";
import {
  bulkImportPreviewMock,
  createMockInvite,
  csvTemplateContent,
  getInitialOrganizationUserRecords,
  inviteApiSampleRequest,
  inviteApiSampleResponse,
  inviteStatusLabel,
  isInviteExpiredByClock,
  linkStatusLabel,
  nameConsistencyBadgeClass,
  nameConsistencyLabel,
  orgVerificationOutcomeLabel,
  type NameMatchStatus,
  type OrganizationLinkStatus,
  type OrganizationUserRecord,
} from "../data/enterpriseLinkedEndUsersMock";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";
import { UserRiskStatusBadge } from "../../shared/components/RiskSummary";
import {
  getEndUserAssociationStoreVersion,
  getEndUserAssociations,
  subscribeEndUserAssociationListeners,
} from "../../platform/data/platformEndUserAssociationsSession";
import { userRiskLevelForOrgAdmin } from "../../platform/data/mockPlatformRisk";

type RecentFilter = "all" | "invited_recent" | "verified_recent";

type BulkPreviewRow = (typeof bulkImportPreviewMock.previewRows)[number];

function recordDisplayLabel(r: OrganizationUserRecord): string {
  return r.customerDisplayName?.trim() || r.clientUserId;
}

function bulkRowStatusLabel(row: BulkPreviewRow) {
  switch (row.rowStatus) {
    case "valid":
      return "Valid";
    case "duplicate":
      return "Duplicate client_user_id";
    case "already_linked":
      return "Already linked";
    case "invalid":
      return "Invalid";
    default:
      return row.rowStatus;
  }
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

function isWithinDays(iso: string | null, days: number) {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t < days * 86400000;
}

export function EnterpriseEndUsers() {
  const [records, setRecords] = useState<OrganizationUserRecord[]>(() => getInitialOrganizationUserRecords());

  const assocVersion = useSyncExternalStore(
    subscribeEndUserAssociationListeners,
    getEndUserAssociationStoreVersion,
    getEndUserAssociationStoreVersion,
  );
  const platformAssociations = useMemo(() => getEndUserAssociations(), [assocVersion]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrganizationLinkStatus>("all");
  const [recentFilter, setRecentFilter] = useState<RecentFilter>("all");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [apiGuideOpen, setApiGuideOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<OrganizationUserRecord | null>(null);
  const [inviteRecord, setInviteRecord] = useState<OrganizationUserRecord | null>(null);
  const [conflictRecord, setConflictRecord] = useState<OrganizationUserRecord | null>(null);

  const [addForm, setAddForm] = useState({
    clientUserId: "",
    customerDisplayName: "",
    customerReference: "",
    contact: "",
  });

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records.filter((r) => {
      const matchSearch =
        q.length === 0
        || r.clientUserId.toLowerCase().includes(q)
        || (r.customerDisplayName ?? "").toLowerCase().includes(q)
        || (r.customerReference ?? "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || r.linkStatus === statusFilter;
      let matchRecent = true;
      if (recentFilter === "invited_recent") {
        matchRecent = isWithinDays(r.invitedAt, 14);
      } else if (recentFilter === "verified_recent") {
        matchRecent = isWithinDays(r.lastVerifiedAt, 30);
      }
      return matchSearch && matchStatus && matchRecent;
    });
  }, [records, searchQuery, statusFilter, recentFilter]);

  const stats = useMemo(() => {
    const total = records.length;
    const linked = records.filter((r) => r.linkStatus === "linked").length;
    const pendingInvites = records.filter(
      (r) => r.linkStatus === "pending" || (r.inviteStatus === "pending" && r.linkStatus !== "linked"),
    ).length;
    const suspendedDisabled = records.filter((r) => r.linkStatus === "suspended" || r.linkStatus === "disabled").length;
    const conflicts = records.filter((r) => r.linkStatus === "conflict").length;
    return { total, linked, pendingInvites, suspendedDisabled, conflicts };
  }, [records]);

  const bumpMessage = (msg: string) => {
    setSuccessMessage(msg);
    window.setTimeout(() => setSuccessMessage(null), 5000);
  };

  const updateRecord = (id: string, patch: Partial<OrganizationUserRecord>) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const openInvitePanel = (r: OrganizationUserRecord) => {
    if (r.invite) {
      setInviteRecord(r);
      return;
    }
    const inv = createMockInvite(r.clientUserId, `inv_gen_${Date.now().toString(36).slice(-8)}`);
    const next: OrganizationUserRecord = {
      ...r,
      invite: inv,
      inviteStatus: "pending",
      linkStatus: r.linkStatus === "unlinked" ? "pending" : r.linkStatus,
      invitedAt: new Date().toISOString(),
    };
    setRecords((prev) => prev.map((x) => (x.id === r.id ? next : x)));
    setInviteRecord(next);
    bumpMessage("New invite generated (mock). Share the link or QR from this panel.");
  };

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    const clientUserId = addForm.clientUserId.trim();
    if (!clientUserId) return;
    const customerDisplayName = addForm.customerDisplayName.trim() || null;
    const customerReference = addForm.customerReference.trim() || null;
    const nameMatchStatus: NameMatchStatus = customerDisplayName ? "not_checked" : "not_provided";
    const inviteId = `inv_acme_${clientUserId.replace(/[^a-z0-9]/gi, "_")}_${Date.now().toString(36).slice(-5)}`;
    const row: OrganizationUserRecord = {
      id: `ou-${Date.now()}`,
      clientUserId,
      customerDisplayName,
      customerReference,
      nameMatchStatus,
      platformRiskVerifymeId: null,
      linkStatus: "pending",
      inviteStatus: "pending",
      maskedVerifymeId: null,
      lastVerifiedAt: null,
      invitedAt: new Date().toISOString(),
      createdAt: new Date().toISOString().slice(0, 10),
      verificationCount: 0,
      notificationPlaceholder: addForm.contact.trim() || null,
      invite: createMockInvite(clientUserId, inviteId),
      recentOutcomes: [],
    };
    setRecords((prev) => [row, ...prev]);
    setAddOpen(false);
    setAddForm({ clientUserId: "", customerDisplayName: "", customerReference: "", contact: "" });
    bumpMessage(
      `Record created for ${recordDisplayLabel(row)}. Invite URL (mock): ${row.invite?.inviteUrl}. The end-user must complete linking in the VerifyMe mobile app.`,
    );
  };

  const handleBulkImport = () => {
    const now = Date.now();
    const imported: OrganizationUserRecord[] = [
      {
        id: `ou-bulk-${now}-1`,
        clientUserId: "CUST-CSV-001",
        customerDisplayName: "CSV Import One",
        customerReference: "Bulk import (mock)",
        nameMatchStatus: "not_checked",
        linkStatus: "pending",
        inviteStatus: "pending",
        maskedVerifymeId: null,
        lastVerifiedAt: null,
        invitedAt: new Date().toISOString(),
        createdAt: new Date().toISOString().slice(0, 10),
        verificationCount: 0,
        notificationPlaceholder: null,
        invite: createMockInvite("CUST-CSV-001", `inv_bulk_${now}a`),
        recentOutcomes: [],
      },
      {
        id: `ou-bulk-${now}-2`,
        clientUserId: "CUST-CSV-002",
        customerDisplayName: null,
        customerReference: "REF-BULK-CSV-002",
        nameMatchStatus: "not_provided",
        linkStatus: "pending",
        inviteStatus: "pending",
        maskedVerifymeId: null,
        lastVerifiedAt: null,
        invitedAt: new Date().toISOString(),
        createdAt: new Date().toISOString().slice(0, 10),
        verificationCount: 0,
        notificationPlaceholder: null,
        invite: createMockInvite("CUST-CSV-002", `inv_bulk_${now}b`),
        recentOutcomes: [],
      },
    ];
    setRecords((prev) => [...imported, ...prev]);
    setBulkOpen(false);
    bumpMessage(
      `Imported ${imported.length} valid records (mock). Already linked and other skipped rows were not imported. Invite links generated for pending rows.`,
    );
  };

  const downloadCsvTemplate = () => {
    const blob = new Blob([csvTemplateContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "verifyme_bulk_invite_template.csv";
    a.click();
    URL.revokeObjectURL(url);
    bumpMessage("CSV template downloaded.");
  };

  const exportRecordsCsv = () => {
    const header =
      "client_user_id,customer_display_name,customer_reference,link_status,invite_status,last_verified_at,name_match_status";
    const lines = records.map(
      (r) =>
        `${r.clientUserId},${JSON.stringify(r.customerDisplayName ?? "")},${JSON.stringify(r.customerReference ?? "")},${r.linkStatus},${r.inviteStatus},${r.lastVerifiedAt ?? ""},${r.nameMatchStatus ?? ""}`,
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "linked_end_users_export.csv";
    a.click();
    URL.revokeObjectURL(url);
    bumpMessage("Export downloaded (mock snapshot).");
  };

  const exportInviteLinks = () => {
    const pending = records.filter((r) => r.invite?.inviteUrl);
    const header = "client_user_id,invite_id,invite_url,expires_at";
    const lines = pending.map((r) => `${r.clientUserId},${r.invite!.inviteId},${r.invite!.inviteUrl},${r.invite!.expiresAt}`);
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invite_links_export.csv";
    a.click();
    URL.revokeObjectURL(url);
    bumpMessage("Invite links export downloaded (mock).");
  };

  const applyRowAction = (r: OrganizationUserRecord, action: string) => {
    switch (action) {
      case "suspend":
        if (r.linkStatus === "linked") {
          updateRecord(r.id, { linkStatus: "suspended" });
          bumpMessage(`${recordDisplayLabel(r)} suspended for this organization.`);
        }
        break;
      case "reactivate":
        if (r.linkStatus === "suspended") {
          updateRecord(r.id, { linkStatus: "linked" });
          bumpMessage(`${recordDisplayLabel(r)} reactivated.`);
        }
        break;
      case "revoke":
        updateRecord(r.id, {
          linkStatus: "revoked",
          inviteStatus: "superseded",
          maskedVerifymeId: null,
          invite: null,
        });
        bumpMessage(`Link revoked for ${recordDisplayLabel(r)}.`);
        break;
      case "disable":
        updateRecord(r.id, { linkStatus: "disabled" });
        bumpMessage(`${recordDisplayLabel(r)} disabled (requires admin review to re-enable).`);
        break;
      case "reinvite":
        updateRecord(r.id, {
          linkStatus: "pending",
          inviteStatus: "pending",
          invitedAt: new Date().toISOString(),
          invite: createMockInvite(r.clientUserId, `inv_re_${r.clientUserId}_${Date.now().toString(36).slice(-4)}`),
        });
        bumpMessage(`New invite issued for ${recordDisplayLabel(r)} (mock).`);
        break;
      default:
        break;
    }
  };

  const markConflictReviewedAndClose = () => {
    if (!conflictRecord) return;
    updateRecord(conflictRecord.id, { conflictReviewed: true });
    setConflictRecord(null);
    bumpMessage("Conflict marked as reviewed (mock). Link state unchanged — production would route to support workflows.");
  };

  return (
    <PortalPageFrame
      title="Linked End Users"
      description="Manage your Organization’s customer records linked to VerifyMe identities. Your Organization creates and invites records; the end-user completes linking only through the VerifyMe mobile app."
      headerActions={
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add End-user
          </Button>
          <Button variant="outline" onClick={() => setBulkOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Invite
          </Button>
          <Button variant="outline" onClick={() => setApiGuideOpen(true)}>
            <BookOpen className="mr-2 h-4 w-4" />
            Invite API Guide
          </Button>
          <Button variant="outline" onClick={exportRecordsCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      }
      headerExtra={
        successMessage ? (
          <div className="rounded-md border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm text-green-800 dark:text-green-300">
            {successMessage}
          </div>
        ) : null
      }
      bodyClassName="space-y-6"
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Card className="p-4 border border-border shadow-sm">
          <p className="text-[12px] text-muted-foreground uppercase tracking-wide">Total records</p>
          <p className="text-2xl font-semibold mt-1">{stats.total}</p>
        </Card>
        <Card className="p-4 border border-border shadow-sm">
          <p className="text-[12px] text-muted-foreground uppercase tracking-wide">Linked</p>
          <p className="text-2xl font-semibold mt-1 text-green-700">{stats.linked}</p>
        </Card>
        <Card className="p-4 border border-border shadow-sm">
          <p className="text-[12px] text-muted-foreground uppercase tracking-wide">Pending invites</p>
          <p className="text-2xl font-semibold mt-1 text-amber-700">{stats.pendingInvites}</p>
        </Card>
        <Card className="p-4 border border-border shadow-sm">
          <p className="text-[12px] text-muted-foreground uppercase tracking-wide">Suspended / disabled</p>
          <p className="text-2xl font-semibold mt-1 text-red-700">{stats.suspendedDisabled}</p>
        </Card>
        <Card className="p-4 border border-border shadow-sm">
          <p className="text-[12px] text-muted-foreground uppercase tracking-wide">Conflicts</p>
          <p className="text-2xl font-semibold mt-1 text-orange-700">{stats.conflicts}</p>
        </Card>
      </div>

      <Card className="p-5 border border-border bg-muted/20">
        <div className="flex items-start gap-2 mb-2">
          <Link2 className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <h2 className="text-[15px] font-semibold text-foreground">Link lifecycle</h2>
        </div>
        <ul className="text-[13px] text-muted-foreground space-y-1.5 list-disc list-inside">
          <li>
            <strong className="text-foreground">Unlinked</strong> — record exists, but no active invite has been issued.
            Suggested actions: use <strong className="text-foreground">Generate / view invite link</strong> or{" "}
            <strong className="text-foreground">Re-invite</strong> from the row menu.
          </li>
          <li>
            <strong className="text-foreground">Pending</strong> — invite issued; not yet accepted in the VerifyMe app.
          </li>
          <li>
            <strong className="text-foreground">Linked</strong> — end-user completed linking in the VerifyMe mobile app.
          </li>
          <li>
            <strong className="text-foreground">Suspended</strong> — temporary block for this organization.
          </li>
          <li>
            <strong className="text-foreground">Revoked</strong> — link removed; user must re-link.
          </li>
          <li>
            <strong className="text-foreground">Disabled</strong> — stronger block; requires admin review to re-enable.
          </li>
          <li>
            <strong className="text-foreground">Conflict</strong> — same client_user_id appears linked to a different
            VerifyMe ID conflict; needs review.
          </li>
        </ul>
      </Card>

      <Card className="border border-border bg-muted/15 p-4 shadow-sm">
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Privacy:</strong> VerifyMe does not show end-user legal names in this portal.
          Agents see optional <strong className="text-foreground">customer display name</strong> (organization-provided
          reference only) and a <strong className="text-foreground">name consistency</strong> risk signal — never both names
          side-by-side with VerifyMe profile data.
        </p>
      </Card>

      <div className="flex flex-col lg:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search client_user_id, display name, or reference…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-[200px] h-10">
            <SelectValue placeholder="Link status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All link statuses</SelectItem>
            <SelectItem value="unlinked">Unlinked</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="linked">Linked</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
            <SelectItem value="conflict">Conflict</SelectItem>
          </SelectContent>
        </Select>
        <Select value={recentFilter} onValueChange={(v) => setRecentFilter(v as RecentFilter)}>
          <SelectTrigger className="w-[220px] h-10">
            <SelectValue placeholder="Activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All activity</SelectItem>
            <SelectItem value="invited_recent">Recently invited (sample)</SelectItem>
            <SelectItem value="verified_recent">Recently verified (sample)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-[12px] leading-relaxed text-muted-foreground max-w-3xl">
        User risk status is a platform-derived safety indicator for the linked VerifyMe User. Organization Admin views do not
        show cross-organization details, platform-wide risk factors, or full risk scores.
      </p>

      <Card className="border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1380px] text-sm">
            <thead className="border-b border-border bg-accent/40">
              <tr>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">client_user_id</th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">
                  Customer display name
                </th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help border-b border-dotted border-muted-foreground">
                        Name consistency
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-left">
                      Derived from comparison between organization-provided name and VerifyMe profile. Used as a risk signal
                      only.
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help border-b border-dotted border-muted-foreground">User risk status</span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-left">
                      Summary band for the VerifyMe User (platform-wide). Not link risk. No cross-tenant detail in this portal.
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Link status</th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Invite status</th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">VerifyMe ID (masked)</th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Last verified</th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Created / invited</th>
                <th className="text-right p-3 font-semibold text-muted-foreground uppercase text-[11px] w-[72px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-accent/30">
                  <td className="p-3 font-mono text-[13px]">{r.clientUserId}</td>
                  <td className="p-3 font-medium text-foreground">{r.customerDisplayName?.trim() || "—"}</td>
                  <td className="p-3 align-top">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${nameConsistencyBadgeClass(r.nameMatchStatus)}`}
                    >
                      {nameConsistencyLabel(r.nameMatchStatus)}
                    </span>
                  </td>
                  <td className="p-3 align-top">
                    {(() => {
                      const lvl = userRiskLevelForOrgAdmin(r.platformRiskVerifymeId, platformAssociations);
                      return lvl ? <UserRiskStatusBadge level={lvl} /> : <span className="text-muted-foreground">—</span>;
                    })()}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1 items-start">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <UnifiedBadge variant="status" value={linkStatusLabel(r.linkStatus)} />
                        {r.linkStatus === "conflict" && r.conflictReviewed && (
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Reviewed</span>
                        )}
                      </div>
                      {r.linkStatus === "unlinked" && (
                        <span className="text-[11px] text-muted-foreground">
                          Generate invite or Re-invite from the menu.
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <UnifiedBadge variant="status" value={inviteStatusLabel(r.inviteStatus)} />
                  </td>
                  <td className="p-3 font-mono text-[12px] text-muted-foreground">{r.maskedVerifymeId ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{formatDateTime(r.lastVerifiedAt)}</td>
                  <td className="p-3 text-muted-foreground">
                    <span className="block">{formatDate(r.createdAt)}</span>
                    {r.invitedAt && (
                      <span className="block text-[11px]">Invited {formatDateTime(r.invitedAt)}</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem onClick={() => setDetailRecord(r)}>View details</DropdownMenuItem>
                        {(r.linkStatus === "pending"
                          || r.linkStatus === "unlinked"
                          || r.linkStatus === "revoked"
                          || r.linkStatus === "conflict") && (
                          <DropdownMenuItem onClick={() => openInvitePanel(r)}>
                            Generate / view invite link
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => applyRowAction(r, "reinvite")}
                          disabled={
                            r.linkStatus === "linked"
                            || !(
                              ["revoked", "unlinked", "pending", "conflict"].includes(r.linkStatus)
                              || r.inviteStatus === "expired"
                            )
                          }
                        >
                          Re-invite
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => applyRowAction(r, "suspend")}
                          disabled={r.linkStatus !== "linked"}
                        >
                          Suspend
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => applyRowAction(r, "reactivate")}
                          disabled={r.linkStatus !== "suspended"}
                        >
                          Reactivate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => applyRowAction(r, "revoke")}
                          disabled={r.linkStatus !== "linked"}
                        >
                          Revoke link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => applyRowAction(r, "disable")} disabled={r.linkStatus === "disabled"}>
                          Disable
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setConflictRecord(r)}
                          disabled={r.linkStatus !== "conflict"}
                        >
                          Resolve conflict
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground sm:px-8">No records match your filters.</p>
        )}
      </Card>

      {/* Add End-user */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add end-user</DialogTitle>
            <DialogDescription>
              Creates an organization-side customer record and a pending invite. This does not create a VerifyMe
              account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <p className="text-[13px] rounded-md border border-amber-200 bg-amber-50/80 px-3 py-2 text-amber-950 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-100">
              Creating this record does not create a VerifyMe account. The end-user must open the invite link or
              QR/deep link and complete onboarding and linking in the VerifyMe mobile app.
            </p>
            <div className="space-y-2">
              <Label htmlFor="cid">client_user_id *</Label>
              <Input
                id="cid"
                className="font-mono"
                value={addForm.clientUserId}
                onChange={(e) => setAddForm((f) => ({ ...f, clientUserId: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cdn">Customer display name</Label>
              <Input
                id="cdn"
                value={addForm.customerDisplayName}
                onChange={(e) => setAddForm((f) => ({ ...f, customerDisplayName: e.target.value }))}
                placeholder="Optional"
              />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Optional. Used only as an agent visual reference during verification. VerifyMe does not treat this as
                verified identity.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cref">Customer reference</Label>
              <Textarea
                id="cref"
                rows={2}
                value={addForm.customerReference}
                onChange={(e) => setAddForm((f) => ({ ...f, customerReference: e.target.value }))}
                placeholder="Optional — CRM key, account fragment, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Notification email or phone (optional, design placeholder)</Label>
              <Input
                id="contact"
                placeholder="Not sent in this UI build"
                value={addForm.contact}
                onChange={(e) => setAddForm((f) => ({ ...f, contact: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Plus className="w-4 h-4 mr-2" />
                Create record & invite (mock)
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk invite */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk invite</DialogTitle>
            <DialogDescription>
              For initial deployment when inviting many existing customers. Bulk invite creates organization-side records
              and invite links. End-users still complete linking in the VerifyMe mobile app.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">Drop CSV here (mock)</p>
              <p className="text-xs text-muted-foreground mt-1">No file parsing in this build — use preview below.</p>
            </div>
            <Button type="button" variant="outline" onClick={downloadCsvTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download CSV template
            </Button>
            <div>
              <p className="text-[12px] font-medium text-muted-foreground uppercase mb-2">Expected columns</p>
              <code className="text-[12px] bg-muted px-2 py-1 rounded font-mono">
                client_user_id,customer_display_name,customer_reference
              </code>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Customer display name is optional and used only for agent reference.
              </p>
            </div>
            <Separator />
            <p className="text-[14px] font-semibold">Mock validation preview</p>
            <p className="text-[12px] text-muted-foreground">
              Import skips <strong className="text-foreground">already linked</strong> rows — the client_user_id already
              has an active VerifyMe link for this organization.
            </p>
            <div className="flex flex-wrap gap-3 text-[13px]">
              <span className="text-green-700 dark:text-green-400">Valid: {bulkImportPreviewMock.valid}</span>
              <span className="text-amber-700 dark:text-amber-400">Duplicate client_user_id: {bulkImportPreviewMock.duplicateClientUserId}</span>
              <span className="text-sky-800 dark:text-sky-300 font-medium">Already linked: {bulkImportPreviewMock.alreadyLinked}</span>
              <span className="text-red-700 dark:text-red-400">Invalid: {bulkImportPreviewMock.invalid}</span>
            </div>
            <div className="border border-border rounded-md overflow-hidden">
              <table className="w-full text-[12px]">
                <thead className="bg-accent/40">
                  <tr>
                    <th className="text-left p-2">client_user_id</th>
                    <th className="text-left p-2">customer_display_name</th>
                    <th className="text-left p-2">customer_reference</th>
                    <th className="text-left p-2">Validation</th>
                    <th className="text-left p-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkImportPreviewMock.previewRows.map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="p-2 font-mono">{row.clientUserId || "—"}</td>
                      <td className="p-2">{row.customerDisplayName ?? "—"}</td>
                      <td className="p-2">{row.customerReference?.trim() ? row.customerReference : "—"}</td>
                      <td className="p-2">
                        <UnifiedBadge variant="status" value={bulkRowStatusLabel(row)} />
                      </td>
                      <td className="p-2 text-muted-foreground text-[11px] leading-snug">
                        {"note" in row && row.note
                          ? row.note
                          : row.rowStatus === "duplicate"
                            ? "Duplicate rows within this CSV file."
                            : row.rowStatus === "already_linked"
                              ? "The client_user_id already has an active VerifyMe link for this organization."
                              : row.rowStatus === "invalid"
                                ? "Missing or malformed required fields."
                                : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <DialogFooter className="gap-2 flex-wrap">
            <Button type="button" variant="outline" onClick={exportInviteLinks}>
              Export invite links
            </Button>
            <Button type="button" variant="outline" onClick={() => setBulkOpen(false)}>
              Close
            </Button>
            <Button type="button" onClick={handleBulkImport}>
              Import valid records (mock)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite API guide */}
      <Dialog open={apiGuideOpen} onOpenChange={setApiGuideOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Automated Invite API</DialogTitle>
            <DialogDescription>
              Your enterprise systems can call the invite API when a new customer record is created (design contract —
              mock only).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-[13px]">
            <p className="text-muted-foreground leading-relaxed">
              This endpoint is intended to be triggered by the organization when a new customer is created or becomes
              eligible to use VerifyMe. The organization creates or invites the customer record; the end-user still
              completes linking in the VerifyMe mobile app. The API does not create a VerifyMe account silently.
            </p>
            <p>
              <strong className="text-foreground">Endpoint (concept):</strong>{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-[12px]">POST /organization-users/invites</code>
            </p>
            <div>
              <p className="font-medium text-foreground mb-1">Sample request</p>
              <pre className="bg-muted rounded-md p-3 text-[12px] overflow-x-auto font-mono">{inviteApiSampleRequest}</pre>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                <code className="font-mono text-[11px]">customer_display_name</code> is organization-provided visual context
                only and is not verified by VerifyMe.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Sample response</p>
              <pre className="bg-muted rounded-md p-3 text-[12px] overflow-x-auto font-mono">{inviteApiSampleResponse}</pre>
            </div>
            <Separator />
            <p className="font-medium text-foreground">Behavior cases (reference)</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>New client_user_id → create record + invite</li>
              <li>Already pending → return existing invite or regenerate per policy</li>
              <li>Already linked → return already_linked</li>
              <li>Linked to different VerifyMe user → conflict</li>
              <li>Suspended or disabled → blocked unless reactivated by an admin</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApiGuideOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite / QR panel */}
      <Dialog open={inviteRecord !== null} onOpenChange={(o) => !o && setInviteRecord(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {inviteRecord?.invite && (() => {
            const inv = inviteRecord.invite;
            const inviteExpired =
              inviteRecord.inviteStatus === "expired" || isInviteExpiredByClock(inv);
            return (
            <>
              <DialogHeader>
                <DialogTitle>Invite link & QR</DialogTitle>
                <DialogDescription>
                  Invite metadata for{" "}
                  <span className="text-foreground font-medium">{recordDisplayLabel(inviteRecord)}</span>
                </DialogDescription>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-[11px] text-muted-foreground uppercase">Invite status</span>
                  <UnifiedBadge variant="status" value={inviteStatusLabel(inviteRecord.inviteStatus)} />
                  {inviteExpired && inviteRecord.inviteStatus !== "expired" && (
                    <UnifiedBadge variant="status" value="Past expires_at" />
                  )}
                </div>
              </DialogHeader>
              <div className="space-y-3 text-[13px]">
                {inviteExpired && (
                  <div className="rounded-md border border-amber-200 bg-amber-50/90 px-3 py-2 text-amber-950 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-100 text-[12px] leading-relaxed">
                    <strong className="text-foreground">Expired invites cannot be accepted.</strong> Generate a new invite
                    link so the end-user can complete linking in the VerifyMe mobile app.
                  </div>
                )}
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase">invite_id</p>
                  <code className="text-[12px] font-mono break-all">{inv.inviteId}</code>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase">invite_url</p>
                  <code className="text-[12px] font-mono break-all block bg-muted p-2 rounded">{inv.inviteUrl}</code>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase">QR payload status</p>
                  <p>{inv.qrPayloadStatus}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase">issued_at</p>
                    <p>{inv.issuedAt}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase">expires_at</p>
                    <p className="font-mono text-[12px]">{inv.expiresAt}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase">nonce (preview)</p>
                  <code className="font-mono">{inv.noncePreview}</code>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase">client_id</p>
                  <code className="font-mono text-[12px]">{inv.clientId}</code>
                </div>
                <Separator />
                <p className="text-muted-foreground leading-relaxed">
                  If the VerifyMe app is installed, the invite opens the app. If not, the user is guided to install, then
                  continues. If the user has no VerifyMe account, they sign up then link. If already linked to the same
                  organization and customer, no duplicate link is created. If linked to a different VerifyMe user, status
                  becomes <strong className="text-foreground">conflict</strong>.
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  This panel does not show VerifyMe email, raw one-time tokens, OTP, passcode, biometric data,{" "}
                  Encrypted_Auth_Cred, Transaction_Code, or raw encrypted QR payload contents — only masked previews and
                  routing metadata.
                </p>
              </div>
              <DialogFooter className="gap-2 flex-col sm:flex-row">
                {inviteExpired && (
                  <Button
                    type="button"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      if (!inviteRecord) return;
                      applyRowAction(inviteRecord, "reinvite");
                      setInviteRecord(null);
                    }}
                  >
                    Re-invite
                  </Button>
                )}
                <Button variant="outline" onClick={() => setInviteRecord(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Detail */}
      <Dialog open={detailRecord !== null} onOpenChange={(o) => !o && setDetailRecord(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {detailRecord && (
            <>
              <DialogHeader>
                <DialogTitle>End-user details</DialogTitle>
                <DialogDescription>Organization-scoped view — no full VerifyMe profile.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-[13px]">
                <p className="rounded-md border border-border/80 bg-muted/30 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                  Customer display information is provided by the organization for reference only. VerifyMe verifies the
                  linked user, not the displayed name.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase">client_user_id</p>
                    <p className="font-mono">{detailRecord.clientUserId}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase">Customer display name</p>
                    <p>{detailRecord.customerDisplayName?.trim() || "—"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase">Name consistency</p>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${nameConsistencyBadgeClass(detailRecord.nameMatchStatus)}`}
                    >
                      {nameConsistencyLabel(detailRecord.nameMatchStatus)}
                    </span>
                    <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                      Risk signal only — not proof of identity.
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase">Customer reference</p>
                    <p>{detailRecord.customerReference?.trim() || "—"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase">Link status</p>
                    <UnifiedBadge variant="status" value={linkStatusLabel(detailRecord.linkStatus)} />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase">Invite status</p>
                    <UnifiedBadge variant="status" value={inviteStatusLabel(detailRecord.inviteStatus)} />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase">VerifyMe ID (masked)</p>
                  <p className="font-mono">{detailRecord.maskedVerifymeId ?? "—"}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    Not shown: VerifyMe email, full VerifyMe profile, other linked organizations, passcode, OTP, biometric
                    data, raw one-time token, Encrypted_Auth_Cred, Transaction_Code, or raw encrypted QR payload.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase">Linked date</p>
                    <p>{detailRecord.linkStatus === "linked" ? formatDate(detailRecord.invitedAt) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase">Last verified</p>
                    <p>{formatDateTime(detailRecord.lastVerifiedAt)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase">Verification count (org)</p>
                  <p>{detailRecord.verificationCount}</p>
                </div>
                <Separator />
                <p className="font-medium text-foreground">Recent verification outcomes (this organization)</p>
                <ul className="space-y-1">
                  {detailRecord.recentOutcomes.length === 0 && (
                    <li className="text-muted-foreground">No recent outcomes.</li>
                  )}
                  {detailRecord.recentOutcomes.map((o, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span>{orgVerificationOutcomeLabel(o.outcome)}</span>
                      <span className="text-muted-foreground text-[12px]">{formatDateTime(o.at)}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  This drawer is organization-scoped only. Other organizations, full VerifyMe account data, and secure
                  verification values are not shown.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailRecord(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Conflict resolve */}
      <Dialog open={conflictRecord !== null} onOpenChange={(o) => !o && setConflictRecord(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Resolve conflict
            </DialogTitle>
            <DialogDescription>
              Review-only (mock). Production would require audit trails and VerifyMe support coordination.
            </DialogDescription>
          </DialogHeader>
          {conflictRecord && (
            <div className="space-y-4 text-[13px]">
              <div className="rounded-md border border-orange-200 bg-orange-50/80 px-3 py-2 text-orange-950 dark:bg-orange-950/30 dark:border-orange-900 dark:text-orange-100">
                <strong className="text-foreground">Reason:</strong> This client_user_id appears linked to a different
                VerifyMe ID.
              </div>
              <dl className="grid grid-cols-1 gap-3">
                <div>
                  <dt className="text-[11px] font-medium text-muted-foreground uppercase">client_user_id</dt>
                  <dd className="font-mono">{conflictRecord.clientUserId}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium text-muted-foreground uppercase">Customer display name</dt>
                  <dd>{conflictRecord.customerDisplayName?.trim() || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium text-muted-foreground uppercase">Name consistency</dt>
                  <dd>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${nameConsistencyBadgeClass(conflictRecord.nameMatchStatus)}`}
                    >
                      {nameConsistencyLabel(conflictRecord.nameMatchStatus)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium text-muted-foreground uppercase">Current VerifyMe ID (masked)</dt>
                  <dd className="font-mono">{conflictRecord.maskedVerifymeId ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium text-muted-foreground uppercase">Conflicting VerifyMe ID (masked)</dt>
                  <dd className="font-mono">{conflictRecord.conflictingMaskedVerifymeId ?? "vm_**** (mock)"}</dd>
                </div>
              </dl>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Full VerifyMe email, global profile, OTP, passcode, biometric data, tokens, Encrypted_Auth_Cred, and
                Transaction_Code are never shown in this portal.
              </p>
              <div className="space-y-2">
                <p className="text-[11px] font-medium text-muted-foreground uppercase">Future actions (disabled)</p>
                <div className="flex flex-col gap-2">
                  <Button type="button" variant="secondary" className="justify-start" disabled>
                    Reassign link (future)
                  </Button>
                  <Button type="button" variant="secondary" className="justify-start" disabled>
                    Force re-link after review (future)
                  </Button>
                  <Button type="button" variant="secondary" className="justify-start" disabled>
                    Escalate to VerifyMe support (mock)
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 flex-col-reverse sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setConflictRecord(null)}>
              Cancel
            </Button>
            <Button onClick={markConflictReviewedAndClose}>Mark as reviewed / close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalPageFrame>
  );
}
