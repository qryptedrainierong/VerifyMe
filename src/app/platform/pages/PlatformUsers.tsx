import { Search, Filter, ArrowUpDown } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/components/ui/tabs";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import { platformEndUserAssociations, type PlatformEndUserAssociation } from "../data/platformUsersSample";
import { groupAssociationsByVerifymeUserId, type GroupedEndUserRowStatus } from "../data/groupEndUsers";
import { buildInitialOrganizations } from "../data/platformOrganizationsSample";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  if (!local || local.length <= 1) return `***@${domain}`;
  return `${local[0]}***@${domain}`;
}

function displayClientUserId(clientUserId: string, organizationId: string): string {
  const v = clientUserId.trim();
  return v.length > 0 ? v : `(unassigned · ${organizationId})`;
}

/** Clicks on these targets should not open the user detail panel from a table row. */
function shouldIgnoreRowOpenClick(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return (
    target.closest(
      "button,a,input,textarea,select,label,[role='button'],[role='menu'],[role='menuitem'],[role='listbox'],[role='option'],[role='tab'],[data-no-row-nav]",
    ) !== null
  );
}

export function PlatformUsers() {
  const [searchParams] = useSearchParams();
  const urlOrganizationId = searchParams.get("organizationId");

  const [searchQuery, setSearchQuery] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("all-orgs");
  const [statusFilter, setStatusFilter] = useState("all-status");
  const [usersData, setUsersData] = useState(platformEndUserAssociations);
  const [detailVerifymeUserId, setDetailVerifymeUserId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState("profile");
  /** Shown at top of User Controls tab after a control action completes */
  const [controlsFeedback, setControlsFeedback] = useState<string | null>(null);

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [disableTyped, setDisableTyped] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);

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
        user.verifymeUserId.toLowerCase().includes(query) ||
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

  const selectedUserLinks = useMemo(() => {
    if (!detailVerifymeUserId) return [];
    return usersData.filter((u) => u.verifymeUserId === detailVerifymeUserId);
  }, [usersData, detailVerifymeUserId]);

  const selectedRowGroup = useMemo(() => {
    if (selectedUserLinks.length === 0) return null;
    return groupAssociationsByVerifymeUserId(selectedUserLinks)[0] ?? null;
  }, [selectedUserLinks]);

  const organizationOptions = useMemo(() => {
    const unique = new Map<string, string>();
    usersData.forEach((user) => unique.set(user.organizationId, user.organization));
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
  }, [usersData]);

  const formatDate = (dateString: string) =>
    new Date(dateString + "Z").toLocaleDateString("en-US", {
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

  const rowStatusLabel = (status: GroupedEndUserRowStatus | PlatformEndUserAssociation["status"]) => {
    if (status === "active") return "Active";
    if (status === "pending") return "Pending";
    if (status === "suspended") return "Suspended";
    return "Disabled";
  };

  const openDetail = (verifymeUserId: string, tab: string) => {
    setControlsFeedback(null);
    setDetailVerifymeUserId(verifymeUserId);
    setDetailTab(tab);
  };

  const closeDetail = () => {
    setDetailVerifymeUserId(null);
    setDetailTab("profile");
    setControlsFeedback(null);
    setSuspendOpen(false);
    setReactivateOpen(false);
    setDisableOpen(false);
    setDisableTyped("");
    setResetOpen(false);
    setRestoreOpen(false);
  };

  const applyStatusToUser = (verifymeUserId: string, status: PlatformEndUserAssociation["status"]) => {
    setUsersData((prev) =>
      prev.map((user) => (user.verifymeUserId === verifymeUserId ? { ...user, status } : user)),
    );
  };

  const detailOpen = detailVerifymeUserId !== null;
  const controlsTarget = detailVerifymeUserId;

  const disableMatches =
    selectedRowGroup && disableTyped.trim().toLowerCase() === selectedRowGroup.verifymeId.toLowerCase();

  const displayVerifymeIdForMessages = (verifymeUserId: string) =>
    usersData.find((u) => u.verifymeUserId === verifymeUserId)?.verifymeId ?? verifymeUserId;

  const linkCountForUser = (verifymeUserId: string) =>
    usersData.filter((u) => u.verifymeUserId === verifymeUserId).length;

  return (
    <>
      <PortalPageFrame
        variant="fill"
        rootClassName="h-full"
        title="VerifyMe Users"
        description="Global VerifyMe user accounts: public VerifyMe ID, private account email, linked organizations, device state, and verification activity (sample data)."
        headerExtra={
          <>
            {urlOrganizationId ? (
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                URL filter: <span className="font-mono text-foreground">{urlOrganizationId}</span>
                {!knownOrgIds.has(urlOrganizationId) ? (
                  <> — not found in sample organizations; showing all until you pick a valid org.</>
                ) : (
                  <> — list filtered to this organization when present in sample data.</>
                )}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[200px] max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search VerifyMe ID, client_user_id, email, org…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 bg-background pl-10"
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
          <div className="overflow-x-auto min-w-[880px]">
            <table className="w-full">
              <thead className="border-b border-border bg-accent/5">
                <tr>
                  <th className="text-left p-3 text-[12px] font-medium text-muted-foreground min-w-[112px]">
                    <button type="button" className="flex items-center gap-1 hover:text-foreground transition-colors">
                      VerifyMe ID
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-3 text-[12px] font-medium text-muted-foreground">
                    <button type="button" className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Account email (masked)
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-3 text-[12px] font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-[12px] font-medium text-muted-foreground">Linked orgs</th>
                  <th className="text-left p-3 text-[12px] font-medium text-muted-foreground">
                    <button type="button" className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Verification sessions
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-3 text-[12px] font-medium text-muted-foreground">
                    <button type="button" className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Last active
                      <ArrowUpDown className="w-3 h-3" />
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
                      openDetail(group.verifymeUserId, "profile");
                    }}
                  >
                    <td className="p-3 align-middle">
                      <span className="text-[15px] font-semibold tracking-tight text-foreground font-mono truncate block min-w-0 max-w-[200px]">
                        {group.verifymeId}
                      </span>
                    </td>
                    <td className="p-3 align-middle">
                      <p className="text-[13px] text-foreground font-mono">{maskEmail(group.email)}</p>
                    </td>
                    <td className="p-3 align-middle">
                      <UnifiedBadge variant="status" value={rowStatusLabel(group.rowStatus)} />
                    </td>
                    <td className="p-3 align-middle tabular-nums text-[13px] text-foreground">
                      {group.memberships.length}
                    </td>
                    <td className="p-3 align-middle">
                      <p className="text-[13px] font-medium text-foreground tabular-nums">
                        {group.totalVerificationSessions.toLocaleString()}
                      </p>
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

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          if (!open) closeDetail();
        }}
      >
        <DialogContent className="flex max-h-[min(94vh,calc(100dvh-1rem))] w-full max-w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden border bg-background p-0 shadow-lg sm:max-w-4xl lg:max-w-5xl top-3 left-1/2 -translate-x-1/2 translate-y-0 sm:top-4">
          <div className="shrink-0 space-y-2 border-b border-border px-6 pb-4 pt-6 pr-14">
            <DialogHeader className="space-y-2 p-0 text-left sm:text-left">
              <DialogTitle>VerifyMe user</DialogTitle>
              <DialogDescription>
                {selectedRowGroup
                  ? `${selectedRowGroup.verifymeId} · ${maskEmail(selectedRowGroup.email)}`
                  : "User details"}
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
            {selectedRowGroup ? (
            <Tabs
              value={detailTab}
              onValueChange={(v) => {
                setDetailTab(v);
                if (v !== "controls") setControlsFeedback(null);
              }}
              className="flex w-full min-h-0 flex-col"
            >
              <TabsList
                className="flex h-9 w-full min-w-0 shrink-0 flex-nowrap items-stretch justify-start gap-1 overflow-x-auto overflow-y-hidden bg-muted/40 p-1 [scrollbar-width:thin]"
                data-no-row-nav
              >
                <TabsTrigger value="profile" className="flex-none shrink-0 px-2 text-[11px] sm:text-[12px]">
                  Profile & Status
                </TabsTrigger>
                <TabsTrigger value="devices" className="flex-none shrink-0 px-2 text-[11px] sm:text-[12px]">
                  Device / Secure State
                </TabsTrigger>
                <TabsTrigger value="orgs" className="flex-none shrink-0 px-2 text-[11px] sm:text-[12px]">
                  Linked Organizations
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex-none shrink-0 px-2 text-[11px] sm:text-[12px]">
                  Verification Activity
                </TabsTrigger>
                <TabsTrigger value="controls" className="flex-none shrink-0 px-2 text-[11px] sm:text-[12px]">
                  User Controls
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-4 space-y-3 text-[13px] m-0">
                <p>
                  <span className="text-muted-foreground">VerifyMe ID:</span>{" "}
                  <span className="font-mono font-medium">{selectedRowGroup.verifymeId}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Internal user id (verifyme_user_id):</span>{" "}
                  <span className="font-mono text-[12px] text-muted-foreground">{selectedRowGroup.verifymeUserId}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Private account email:</span> {selectedRowGroup.email}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  Email is for login, recovery, and OTP delivery — not a public display identity.
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-muted-foreground">Account status:</span>
                  <UnifiedBadge variant="status" value={rowStatusLabel(selectedRowGroup.rowStatus)} />
                </p>
                <p>
                  <span className="text-muted-foreground">Verification sessions (all orgs, sample):</span>{" "}
                  <span className="tabular-nums font-medium">
                    {selectedRowGroup.totalVerificationSessions.toLocaleString()}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Last active (latest):</span>{" "}
                  {formatRelativeTime(selectedRowGroup.lastActiveMax)}
                </p>
                <p>
                  <span className="text-muted-foreground">First link created:</span>{" "}
                  {selectedUserLinks.length > 0
                    ? formatDate(
                        [...selectedUserLinks].sort((a, b) => a.created.localeCompare(b.created))[0]!.created,
                      )
                    : "—"}
                </p>
                <p className="text-[12px] text-muted-foreground border border-border rounded-md p-3 bg-muted/20">
                  Passcodes, OTPs, biometrics, tokens, recovery secrets, and transaction codes are never shown in VerifyMe
                  Admin.
                </p>
              </TabsContent>

              <TabsContent value="devices" className="mt-4 space-y-4 text-[13px] m-0">
                <p className="text-[12px] text-muted-foreground leading-relaxed border border-border rounded-md p-3 bg-muted/20">
                  In the current MVP, each VerifyMe user is limited to a single active device. Registering a new device
                  replaces the existing device and rotates the associated secure state. Future versions may support multiple
                  devices per user, subject to additional security controls and policies.
                </p>
                <p className="text-[12px] text-muted-foreground">
                  This account is currently limited to one active device (MVP). Setting up a new device will replace the
                  existing device.
                </p>
                {(() => {
                  const dev = selectedRowGroup.memberships[0]?.device;
                  if (!dev) return <p className="text-muted-foreground">No device sample.</p>;
                  return (
                    <Card className="border border-border p-4 shadow-sm">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-3">Registered device</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-[11px] text-muted-foreground">Device label</p>
                          <p className="font-medium">{dev.label}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground">Platform</p>
                          <p>{dev.platform}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground">Status</p>
                          <UnifiedBadge variant="status" value={dev.status === "active" ? "Active" : "Pending enrollment"} />
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground">Secure state</p>
                          <p className="text-[13px]">{dev.secureStateSummary}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground">Registered at</p>
                          <p>{formatDateTime(dev.registeredAt)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground">Last verified</p>
                          <p>{dev.lastVerifiedAt ? formatDateTime(dev.lastVerifiedAt) : "—"}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })()}
                <p className="text-[12px] text-muted-foreground border border-border rounded-md p-3 bg-muted/20">
                  No biometric templates, raw device keys, Encrypted_Auth_Cred, Transaction_Code, or generated tokens are
                  displayed.
                </p>
              </TabsContent>

              <TabsContent value="orgs" className="mt-4 m-0">
                <ul className="space-y-2 border border-border rounded-md p-3 bg-accent/5">
                  {selectedUserLinks
                    .slice()
                    .sort((a, b) => a.organization.localeCompare(b.organization))
                    .map((link) => (
                      <li key={link.id} className="text-[13px] leading-snug border-b border-border/60 last:border-0 pb-2 last:pb-0">
                        <span className="font-medium text-foreground">{link.organization}</span>
                        <span className="text-muted-foreground font-mono text-[12px] ml-1">({link.organizationId})</span>
                        <br />
                        <span className="text-muted-foreground">client_user_id:</span>{" "}
                        <span className="font-mono">{displayClientUserId(link.clientUserId, link.organizationId)}</span>
                        <br />
                        <span className="text-muted-foreground">Link status:</span>{" "}
                        <UnifiedBadge variant="status" value={rowStatusLabel(link.status)} />
                        {" · "}
                        <span className="text-muted-foreground">Last verified / activity:</span>{" "}
                        {link.lastActive ? formatRelativeTime(link.lastActive) : "Never"}
                      </li>
                    ))}
                </ul>
              </TabsContent>

              <TabsContent value="activity" className="mt-4 m-0 space-y-2 text-[13px]">
                <p className="text-muted-foreground">
                  Organization-scoped verification session counts (sample). Last activity reflects the latest session
                  signal, not raw tokens.
                </p>
                <div className="border border-border rounded-md divide-y divide-border">
                  {selectedUserLinks
                    .slice()
                    .sort((a, b) => b.verificationSessions - a.verificationSessions)
                    .map((link) => (
                      <div key={link.id} className="p-3 flex flex-wrap justify-between gap-2">
                        <div>
                          <p className="font-medium text-foreground">{link.organization}</p>
                          <p className="text-[11px] font-mono text-muted-foreground">{link.organizationId}</p>
                        </div>
                        <div className="text-right">
                          <p className="tabular-nums font-medium">{link.verificationSessions.toLocaleString()} sessions</p>
                          <p className="text-[12px] text-muted-foreground">
                            Last active: {link.lastActive ? formatRelativeTime(link.lastActive) : "Never"}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="controls" className="mt-4 m-0 text-[13px] flex-1 min-h-[280px] flex flex-col gap-4 outline-none">
                {controlsFeedback ? (
                  <div className="rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2 text-[13px] text-green-800 dark:text-green-200 flex flex-wrap items-start justify-between gap-2">
                    <span>{controlsFeedback}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 shrink-0 text-[12px]"
                      onClick={() => setControlsFeedback(null)}
                    >
                      Dismiss
                    </Button>
                  </div>
                ) : null}

                <Card className="border border-border p-4 shadow-sm space-y-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Account status</p>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                    <div>
                      <dt className="text-muted-foreground">VerifyMe ID</dt>
                      <dd className="font-mono font-semibold text-foreground">{selectedRowGroup.verifymeId}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Current status</dt>
                      <dd>
                        <UnifiedBadge variant="status" value={rowStatusLabel(selectedRowGroup.rowStatus)} />
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Private account email</dt>
                      <dd className="font-mono text-foreground">{maskEmail(selectedRowGroup.email)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Linked organizations</dt>
                      <dd className="tabular-nums font-medium">{selectedRowGroup.memberships.length}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Verification sessions (sample)</dt>
                      <dd className="tabular-nums font-medium">
                        {selectedRowGroup.totalVerificationSessions.toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </Card>

                <Card className="border border-border p-4 shadow-sm space-y-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Lifecycle controls</p>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    Each action opens a confirmation step. Passcodes, OTPs, biometrics, generated tokens, Encrypted_Auth_Cred,
                    Transaction_Code, and raw recovery secrets are never shown here.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRowGroup.rowStatus === "active" || selectedRowGroup.rowStatus === "pending" ? (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        setControlsFeedback(null);
                        setSuspendOpen(true);
                      }}
                    >
                      Suspend user
                    </Button>
                    ) : null}
                    {selectedRowGroup.rowStatus === "suspended" ? (
                      <Button
                        type="button"
                        onClick={() => {
                          setControlsFeedback(null);
                          setReactivateOpen(true);
                        }}
                      >
                        Reactivate user
                      </Button>
                    ) : null}
                    {selectedRowGroup.rowStatus === "disabled" ? (
                      <Button
                        type="button"
                        onClick={() => {
                          setControlsFeedback(null);
                          setRestoreOpen(true);
                        }}
                      >
                        Restore user access
                      </Button>
                    ) : null}
                  </div>
                </Card>

                <Card className="border border-border p-4 shadow-sm space-y-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Recovery / security controls
                  </p>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    Mock-only flow. Confirms a controlled recovery reset request — no recovery secrets are displayed or
                    stored in this UI.
                  </p>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={selectedRowGroup.rowStatus === "disabled"}
                      onClick={() => {
                        setControlsFeedback(null);
                        setResetOpen(true);
                      }}
                    >
                      Start recovery reset
                    </Button>
                    {selectedRowGroup.rowStatus === "disabled" ? (
                      <span className="text-[12px] text-muted-foreground">Unavailable while the account is disabled.</span>
                    ) : null}
                  </div>
                </Card>

                <Card className="border border-destructive/25 bg-destructive/5 p-4 shadow-sm space-y-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-destructive">Restricted actions</p>
                  <div>
                    <p className="text-[13px] font-medium text-foreground">Disable user</p>
                    <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                      Blocks verification and recovery until access is restored. Delete user is not available in VerifyMe
                      Admin.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={selectedRowGroup.rowStatus === "disabled"}
                    onClick={() => {
                      setControlsFeedback(null);
                      setDisableTyped("");
                      setDisableOpen(true);
                    }}
                  >
                    Disable user
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto" disabled>
                    Transfer organization links (future)
                  </Button>
                  <p className="text-[11px] text-muted-foreground">Not implemented in this mock.</p>
                </Card>
              </TabsContent>
            </Tabs>
            ) : (
              <p className="text-sm text-muted-foreground">No user selected.</p>
            )}
          </div>
          <div className="shrink-0 border-t border-border bg-muted/15 px-6 py-3">
            <DialogFooter className="gap-2 p-0 sm:justify-end">
              <Button variant="outline" onClick={closeDetail}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent overlayClassName="z-[110]" className="z-[120] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Suspend user?</DialogTitle>
            <DialogDescription>
              Suspends VerifyMe access for{" "}
              <span className="font-mono">{selectedRowGroup?.verifymeId}</span> across linked organizations (mock).
            </DialogDescription>
          </DialogHeader>
          <p className="text-[12px] text-muted-foreground border border-border/80 rounded-md bg-muted/30 px-3 py-2">
            This action will be recorded in audit logs.
          </p>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setSuspendOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (!controlsTarget) return;
                const n = linkCountForUser(controlsTarget);
                applyStatusToUser(controlsTarget, "suspended");
                setSuspendOpen(false);
                setControlsFeedback(
                  `${displayVerifymeIdForMessages(controlsTarget)} suspended across ${n} linked organization(s) (mock).`,
                );
              }}
            >
              Confirm suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reactivateOpen} onOpenChange={setReactivateOpen}>
        <DialogContent overlayClassName="z-[110]" className="z-[120] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reactivate user?</DialogTitle>
            <DialogDescription>
              Restores active status for{" "}
              <span className="font-mono">{selectedRowGroup?.verifymeId}</span> on all linked memberships (mock).
            </DialogDescription>
          </DialogHeader>
          <p className="text-[12px] text-muted-foreground border border-border/80 rounded-md bg-muted/30 px-3 py-2">
            This action will be recorded in audit logs.
          </p>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setReactivateOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!controlsTarget) return;
                const n = linkCountForUser(controlsTarget);
                applyStatusToUser(controlsTarget, "active");
                setReactivateOpen(false);
                setControlsFeedback(
                  `${displayVerifymeIdForMessages(controlsTarget)} reactivated across ${n} linked organization(s) (mock).`,
                );
              }}
            >
              Confirm reactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={disableOpen}
        onOpenChange={(o) => {
          setDisableOpen(o);
          if (!o) setDisableTyped("");
        }}
      >
        <DialogContent overlayClassName="z-[110]" className="z-[120] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disable user</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 text-left">
                <p>
                  Disabling this VerifyMe user prevents verification activity and access recovery until restored.
                </p>
                <p>
                  Applies to <span className="font-mono">{selectedRowGroup?.verifymeId}</span> (mock — not delete). Type
                  the exact VerifyMe ID below to confirm.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <p className="text-[12px] text-muted-foreground border border-border/80 rounded-md bg-muted/30 px-3 py-2">
            This action will be recorded in audit logs.
          </p>
          <div className="space-y-2 py-1">
            <label className="text-[13px]" htmlFor="disable-user-confirm">
              VerifyMe ID
            </label>
            <Input
              id="disable-user-confirm"
              autoComplete="off"
              className="font-mono"
              placeholder={selectedRowGroup?.verifymeId ?? ""}
              value={disableTyped}
              onChange={(e) => setDisableTyped(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setDisableOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!disableMatches}
              onClick={() => {
                if (!controlsTarget) return;
                const n = linkCountForUser(controlsTarget);
                applyStatusToUser(controlsTarget, "disabled");
                setDisableOpen(false);
                setDisableTyped("");
                setControlsFeedback(
                  `${displayVerifymeIdForMessages(controlsTarget)} disabled across ${n} linked organization(s) (mock).`,
                );
              }}
            >
              Confirm disable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent overlayClassName="z-[110]" className="z-[120] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset recovery flow?</DialogTitle>
            <DialogDescription>
              This mock action represents a controlled recovery reset. No recovery secrets are displayed. Applies to{" "}
              <span className="font-mono">{selectedRowGroup?.verifymeId}</span>.
            </DialogDescription>
          </DialogHeader>
          <p className="text-[12px] text-muted-foreground border border-border/80 rounded-md bg-muted/30 px-3 py-2">
            This action will be recorded in audit logs.
          </p>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!controlsTarget) return;
                setResetOpen(false);
                setControlsFeedback(
                  `Recovery reset request recorded for ${displayVerifymeIdForMessages(controlsTarget)} (mock — no secrets returned).`,
                );
              }}
            >
              Confirm recovery reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <DialogContent overlayClassName="z-[110]" className="z-[120] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Restore user access?</DialogTitle>
            <DialogDescription>
              Returns <span className="font-mono">{selectedRowGroup?.verifymeId}</span> to active for all linked memberships
              (mock).
            </DialogDescription>
          </DialogHeader>
          <p className="text-[12px] text-muted-foreground border border-border/80 rounded-md bg-muted/30 px-3 py-2">
            This action will be recorded in audit logs.
          </p>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setRestoreOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!controlsTarget) return;
                const n = linkCountForUser(controlsTarget);
                applyStatusToUser(controlsTarget, "active");
                setRestoreOpen(false);
                setControlsFeedback(
                  `${displayVerifymeIdForMessages(controlsTarget)} restored to active across ${n} linked organization(s) (mock).`,
                );
              }}
            >
              Confirm restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
