import { Search, Filter, MoreVertical, ArrowUpDown, ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../shared/components/ui/dropdown-menu";
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
import { groupAssociationsByVerifymeUsername, type GroupedEndUserRowStatus } from "../data/groupEndUsers";
import { buildInitialOrganizations } from "../data/platformOrganizationsSample";

function maskVerifymeIdentity(username: string): string {
  const u = username.trim();
  if (u.length <= 4) return "vmid••••";
  return `vmid••••${u.slice(-4)}`;
}

function mockDeviceSecureState(username: string): { enrolledDevices: number; summary: string; trustLabel: string } {
  const n = (username.length % 3) + 2;
  return {
    enrolledDevices: n,
    summary: `${n} device(s) enrolled for step-up and session binding (sample).`,
    trustLabel: username.length % 2 === 0 ? "Healthy" : "Review suggested",
  };
}

export function PlatformUsers() {
  const [searchParams] = useSearchParams();
  const urlOrganizationId = searchParams.get("organizationId");

  const [searchQuery, setSearchQuery] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("all-orgs");
  const [statusFilter, setStatusFilter] = useState("all-status");
  const [usersData, setUsersData] = useState(platformEndUserAssociations);
  const [message, setMessage] = useState<string | null>(null);
  const [detailUsername, setDetailUsername] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState("profile");
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});

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
        user.verifymeUsername.toLowerCase().includes(query) ||
        user.enterpriseUsername.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.organization.toLowerCase().includes(query) ||
        user.organizationId.toLowerCase().includes(query) ||
        maskVerifymeIdentity(user.verifymeUsername).toLowerCase().includes(query);
      const matchesOrg =
        organizationFilter === "all-orgs" || user.organizationId === organizationFilter;
      const matchesStatus = statusFilter === "all-status" || user.status === statusFilter;
      return matchesQuery && matchesOrg && matchesStatus;
    });
  }, [usersData, searchQuery, organizationFilter, statusFilter]);

  const groupedUsers = useMemo(() => {
    const usernames = new Set(qualifyingAssociations.map((a) => a.verifymeUsername));
    const allGrouped = groupAssociationsByVerifymeUsername(usersData);
    return allGrouped.filter((g) => usernames.has(g.verifymeUsername));
  }, [usersData, qualifyingAssociations]);

  const selectedUserLinks = useMemo(() => {
    if (!detailUsername) return [];
    return usersData.filter((u) => u.verifymeUsername === detailUsername);
  }, [usersData, detailUsername]);

  const selectedRowGroup = useMemo(() => {
    if (selectedUserLinks.length === 0) return null;
    return groupAssociationsByVerifymeUsername(selectedUserLinks)[0] ?? null;
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

  const getEnterpriseUsername = (enterpriseUsername: string, organizationId: string) => {
    const value = enterpriseUsername.trim();
    return value.length > 0 ? value : `org_user_${organizationId.toLowerCase()}`;
  };

  const toggleExpanded = (verifymeUsername: string) => {
    setExpandedUsers((prev) => ({ ...prev, [verifymeUsername]: !prev[verifymeUsername] }));
  };

  const openDetail = (username: string, tab: string) => {
    setDetailUsername(username);
    setDetailTab(tab);
  };

  const closeDetail = () => {
    setDetailUsername(null);
    setDetailTab("profile");
    setSuspendOpen(false);
    setReactivateOpen(false);
    setDisableOpen(false);
    setDisableTyped("");
    setResetOpen(false);
    setRestoreOpen(false);
  };

  const applyStatusToUser = (verifymeUsername: string, status: PlatformEndUserAssociation["status"]) => {
    setUsersData((prev) =>
      prev.map((user) => (user.verifymeUsername === verifymeUsername ? { ...user, status } : user)),
    );
  };

  const applyPendingReset = (verifymeUsername: string) => {
    setUsersData((prev) =>
      prev.map((user) =>
        user.verifymeUsername === verifymeUsername
          ? { ...user, status: "pending" as const, lastActive: null }
          : user,
      ),
    );
  };

  const detailOpen = detailUsername !== null;
  const controlsTarget = detailUsername;

  const disableMatches =
    controlsTarget && disableTyped.trim().toLowerCase() === controlsTarget.toLowerCase();

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 border-b border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-semibold text-foreground">VerifyMe Users</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              Manage global VerifyMe user accounts, email and device status, linked organizations, recovery, and
              verification history (design-time sample data).
            </p>
          </div>
        </div>
        {urlOrganizationId ? (
          <p className="text-[12px] text-muted-foreground mb-3 leading-relaxed">
            URL filter: <span className="font-mono text-foreground">{urlOrganizationId}</span>
            {!knownOrgIds.has(urlOrganizationId) ? (
              <> — not found in sample organizations; showing all until you pick a valid org.</>
            ) : (
              <> — list filtered to this organization when present in sample data.</>
            )}
          </p>
        ) : null}
        {message ? (
          <div className="mb-4 rounded-md border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm text-green-700 dark:text-green-300">
            {message}
          </div>
        ) : null}

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-md min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search username, email, org, masked VerifyMe ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-background"
            />
          </div>

          <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
            <SelectTrigger className="w-[200px] h-10">
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
            <SelectTrigger className="w-[180px] h-10">
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
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Card className="m-8 border border-border shadow-sm">
          <div className="overflow-x-auto min-w-[900px]">
            <table className="w-full">
              <thead className="border-b border-border bg-accent/5">
                <tr>
                  <th className="text-left p-4 text-[13px] font-medium text-muted-foreground min-w-[320px]">
                    <button type="button" className="flex items-center gap-1 hover:text-foreground transition-colors">
                      VerifyMe Username
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                    <button type="button" className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Email
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                    <button type="button" className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Verification Sessions
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                    <button type="button" className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Last Active
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-[13px] font-medium text-muted-foreground w-[60px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {groupedUsers.map((group) => {
                  const isExpanded = !!expandedUsers[group.verifymeUsername];
                  const memberships = group.memberships;
                  return (
                    <Fragment key={group.verifymeUsername}>
                      <tr className="hover:bg-accent/5 transition-colors">
                        <td className="p-4 align-top">
                          <button
                            type="button"
                            className="w-full flex items-center gap-2 text-left"
                            onClick={() => toggleExpanded(group.verifymeUsername)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                            )}
                            <span className="text-[14px] font-medium text-foreground font-mono">
                              {group.verifymeUsername}
                            </span>
                          </button>
                        </td>
                        <td className="p-4 align-top">
                          <p className="text-[14px] text-foreground">{group.email}</p>
                        </td>
                        <td className="p-4 align-top">
                          <UnifiedBadge variant="status" value={rowStatusLabel(group.rowStatus)} />
                        </td>
                        <td className="p-4 align-top">
                          <p className="text-[14px] font-medium text-foreground tabular-nums">
                            {group.totalVerificationSessions.toLocaleString()}
                          </p>
                        </td>
                        <td className="p-4 align-top">
                          <p className="text-[14px] text-foreground">{formatRelativeTime(group.lastActiveMax)}</p>
                        </td>
                        <td className="p-4 align-top">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openDetail(group.verifymeUsername, "profile")}>
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDetail(group.verifymeUsername, "controls")}>
                                Open User Controls
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                      {isExpanded &&
                        memberships.map((m) => (
                          <tr key={m.id} className="bg-accent/5">
                            <td className="py-2 pr-4 pl-10 align-top">
                              <p className="text-[12px] font-mono text-foreground">
                                {getEnterpriseUsername(m.enterpriseUsername, m.organizationId)}
                              </p>
                            </td>
                            <td className="py-2 px-4 align-top">
                              <p className="text-[12px] text-foreground">{m.organization}</p>
                              <p className="text-[11px] font-mono text-muted-foreground">{m.organizationId}</p>
                            </td>
                            <td className="py-2 px-4 align-top">
                              <UnifiedBadge variant="status" value={rowStatusLabel(m.status)} />
                            </td>
                            <td className="py-2 px-4 align-top">
                              <p className="text-[12px] font-mono text-muted-foreground tabular-nums">
                                {m.verificationSessions.toLocaleString()} sessions
                              </p>
                            </td>
                            <td className="py-2 px-4 align-top">
                              <p className="text-[12px] text-foreground">{formatRelativeTime(m.lastActive)}</p>
                            </td>
                            <td className="py-2 px-4" />
                          </tr>
                        ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          if (!open) closeDetail();
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>VerifyMe user</DialogTitle>
            <DialogDescription>
              {selectedRowGroup
                ? `${selectedRowGroup.verifymeUsername} · ${selectedRowGroup.email}`
                : "User details"}
            </DialogDescription>
          </DialogHeader>
          {selectedRowGroup ? (
            <Tabs value={detailTab} onValueChange={setDetailTab} className="w-full">
              <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/40 p-1">
                <TabsTrigger value="profile" className="text-[12px]">
                  Profile & Status
                </TabsTrigger>
                <TabsTrigger value="devices" className="text-[12px]">
                  Devices / Secure State
                </TabsTrigger>
                <TabsTrigger value="orgs" className="text-[12px]">
                  Linked Organizations
                </TabsTrigger>
                <TabsTrigger value="activity" className="text-[12px]">
                  Verification Activity
                </TabsTrigger>
                <TabsTrigger value="controls" className="text-[12px]">
                  User Controls
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-4 space-y-3 text-[13px] m-0">
                <p>
                  <span className="text-muted-foreground">VerifyMe username:</span>{" "}
                  <span className="font-mono">{selectedRowGroup.verifymeUsername}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Masked identity:</span>{" "}
                  <span className="font-mono">{maskVerifymeIdentity(selectedRowGroup.verifymeUsername)}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Email:</span> {selectedRowGroup.email}
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

              <TabsContent value="devices" className="mt-4 space-y-3 text-[13px] m-0">
                {(() => {
                  const d = mockDeviceSecureState(selectedRowGroup.verifymeUsername);
                  return (
                    <>
                      <p>
                        <span className="text-muted-foreground">Device enrollment:</span> {d.summary}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Registered devices (count only):</span>{" "}
                        <span className="tabular-nums font-medium">{d.enrolledDevices}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Trust summary:</span> {d.trustLabel}
                      </p>
                      <p className="text-[12px] text-muted-foreground border border-border rounded-md p-3 bg-muted/20">
                        No biometric templates, raw device keys, or recovery payloads are displayed.
                      </p>
                    </>
                  );
                })()}
              </TabsContent>

              <TabsContent value="orgs" className="mt-4 m-0">
                <ul className="space-y-2 border border-border rounded-md p-3 bg-accent/5">
                  {selectedUserLinks
                    .slice()
                    .sort((a, b) => a.organization.localeCompare(b.organization))
                    .map((link) => (
                      <li key={link.id} className="text-[13px] leading-snug">
                        <span className="font-medium text-foreground">{link.organization}</span>
                        <span className="text-muted-foreground font-mono text-[12px] ml-1">({link.organizationId})</span>
                        <br />
                        <span className="text-muted-foreground">Org username:</span>{" "}
                        <span className="font-mono">
                          {getEnterpriseUsername(link.enterpriseUsername, link.organizationId)}
                        </span>
                        {" · "}
                        <span className="text-muted-foreground">Link status:</span>{" "}
                        <UnifiedBadge variant="status" value={rowStatusLabel(link.status)} />
                        {" · "}
                        <span className="text-muted-foreground">Sessions (org-scoped sample):</span>{" "}
                        <span className="tabular-nums">{link.verificationSessions.toLocaleString()}</span>
                      </li>
                    ))}
                </ul>
              </TabsContent>

              <TabsContent value="activity" className="mt-4 m-0 space-y-2 text-[13px]">
                <p className="text-muted-foreground">
                  Organization-scoped verification session counts (sample). Last activity reflects last successful
                  session signal, not raw tokens.
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

              <TabsContent value="controls" className="mt-4 space-y-4 m-0 text-[13px]">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Current user status:</span>
                  <UnifiedBadge variant="status" value={rowStatusLabel(selectedRowGroup.rowStatus)} />
                </div>
                <p className="text-[12px] text-muted-foreground border border-border/80 rounded-md bg-muted/30 px-3 py-2">
                  This action will be recorded in audit logs.
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedRowGroup.rowStatus === "active" || selectedRowGroup.rowStatus === "pending" ? (
                    <Button type="button" variant="destructive" onClick={() => setSuspendOpen(true)}>
                      Suspend user
                    </Button>
                  ) : null}
                  {selectedRowGroup.rowStatus === "suspended" ? (
                    <Button type="button" onClick={() => setReactivateOpen(true)}>
                      Reactivate user
                    </Button>
                  ) : null}
                  {selectedRowGroup.rowStatus === "disabled" ? (
                    <Button type="button" onClick={() => setRestoreOpen(true)}>
                      Restore access
                    </Button>
                  ) : null}
                  {selectedRowGroup.rowStatus === "active" || selectedRowGroup.rowStatus === "pending" ? (
                    <Button type="button" variant="outline" onClick={() => setDisableOpen(true)}>
                      Disable user
                    </Button>
                  ) : null}
                  {selectedRowGroup.rowStatus === "active" || selectedRowGroup.rowStatus === "pending" ? (
                    <Button type="button" variant="outline" onClick={() => setResetOpen(true)}>
                      Reset recovery / credentials
                    </Button>
                  ) : null}
                </div>
                <p className="text-[12px] text-muted-foreground">
                  Reset recovery is a mock future action: confirming sets links to pending review and clears last-active
                  timestamps in sample data only.
                </p>
              </TabsContent>
            </Tabs>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={closeDetail}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Suspend user?</DialogTitle>
            <DialogDescription>
              Suspends VerifyMe access for <span className="font-mono">{controlsTarget}</span> across linked
              organizations (mock).
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
                const n = usersData.filter((u) => u.verifymeUsername === controlsTarget).length;
                applyStatusToUser(controlsTarget, "suspended");
                setSuspendOpen(false);
                setMessage(`${controlsTarget} suspended across ${n} linked organization(s).`);
              }}
            >
              Confirm suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reactivateOpen} onOpenChange={setReactivateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reactivate user?</DialogTitle>
            <DialogDescription>
              Restores active status for <span className="font-mono">{controlsTarget}</span> on all linked memberships
              (mock).
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
                const n = usersData.filter((u) => u.verifymeUsername === controlsTarget).length;
                applyStatusToUser(controlsTarget, "active");
                setReactivateOpen(false);
                setMessage(`${controlsTarget} reactivated across ${n} linked organization(s).`);
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disable user</DialogTitle>
            <DialogDescription>
              Disabling blocks verification for <span className="font-mono">{controlsTarget}</span> (mock — not
              delete). Type the VerifyMe username to confirm.
            </DialogDescription>
          </DialogHeader>
          <p className="text-[12px] text-muted-foreground border border-border/80 rounded-md bg-muted/30 px-3 py-2">
            This action will be recorded in audit logs.
          </p>
          <div className="space-y-2 py-1">
            <label className="text-[13px]" htmlFor="disable-user-confirm">
              VerifyMe username
            </label>
            <Input
              id="disable-user-confirm"
              autoComplete="off"
              className="font-mono"
              placeholder={controlsTarget ?? ""}
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
                const n = usersData.filter((u) => u.verifymeUsername === controlsTarget).length;
                applyStatusToUser(controlsTarget, "disabled");
                setDisableOpen(false);
                setDisableTyped("");
                setMessage(`${controlsTarget} disabled across ${n} linked organization(s).`);
              }}
            >
              Confirm disable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset recovery / credentials?</DialogTitle>
            <DialogDescription>
              Mock future action: sets all organization links for{" "}
              <span className="font-mono">{controlsTarget}</span> to pending and clears last-active timestamps.
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
                const n = usersData.filter((u) => u.verifymeUsername === controlsTarget).length;
                applyPendingReset(controlsTarget);
                setResetOpen(false);
                setMessage(`Recovery reset initiated for ${controlsTarget} (${n} link(s)) — mock only.`);
              }}
            >
              Confirm reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Restore access?</DialogTitle>
            <DialogDescription>
              Returns <span className="font-mono">{controlsTarget}</span> to active for all linked memberships (mock).
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
                const n = usersData.filter((u) => u.verifymeUsername === controlsTarget).length;
                applyStatusToUser(controlsTarget, "active");
                setRestoreOpen(false);
                setMessage(`${controlsTarget} restored to active across ${n} linked organization(s).`);
              }}
            >
              Confirm restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
