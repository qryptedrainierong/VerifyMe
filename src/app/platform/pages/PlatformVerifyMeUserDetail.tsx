import { ArrowLeft, ClipboardList, Users } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Button } from "../../shared/components/ui/button";
import { Card } from "../../shared/components/ui/card";
import { Input } from "../../shared/components/ui/input";
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
import type { PlatformEndUserAssociation } from "../data/platformUsersSample";
import { groupAssociationsByVerifymeUserId } from "../data/groupEndUsers";
import {
  getEndUserAssociationStoreVersion,
  getEndUserAssociations,
  setEndUserAssociations,
  subscribeEndUserAssociationListeners,
} from "../data/platformEndUserAssociationsSession";
import { displayClientUserId, maskEmail, rowStatusLabel } from "../utils/verifyMeUserFormatters";
import { RiskSummary } from "../../shared/components/RiskSummary";
import { computePlatformRiskSummary } from "../data/mockPlatformRisk";
import { getRiskHistoryForVerifymeId } from "../data/platformVerifymeUserRiskHistorySample";
import { GovernanceTimeline } from "../../shared/components/GovernanceTimeline";
import { auditLogsHref } from "../utils/auditLogsNavigation";

export function PlatformVerifyMeUserDetail() {
  const navigate = useNavigate();
  const { verifymeId: verifymeIdParam } = useParams();

  const storeVersion = useSyncExternalStore(
    subscribeEndUserAssociationListeners,
    getEndUserAssociationStoreVersion,
    getEndUserAssociationStoreVersion,
  );

  const usersData = useMemo(() => getEndUserAssociations(), [storeVersion]);

  const [detailTab, setDetailTab] = useState("profile");
  const [controlsFeedback, setControlsFeedback] = useState<string | null>(null);

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [disableTyped, setDisableTyped] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);

  const selectedUserLinks = useMemo(() => {
    if (!verifymeIdParam) return [];
    return usersData.filter((u) => u.verifymeId === verifymeIdParam);
  }, [usersData, verifymeIdParam]);

  const selectedRowGroup = useMemo(() => {
    if (selectedUserLinks.length === 0) return null;
    return groupAssociationsByVerifymeUserId(selectedUserLinks)[0] ?? null;
  }, [selectedUserLinks]);

  const platformRisk = useMemo(
    () => (selectedRowGroup ? computePlatformRiskSummary(selectedRowGroup) : null),
    [selectedRowGroup],
  );

  const controlsTarget = verifymeIdParam ?? null;

  const disableMatches =
    selectedRowGroup && disableTyped.trim().toLowerCase() === selectedRowGroup.verifymeId.toLowerCase();

  const linkCountForVerifymeId = (vmId: string) => usersData.filter((u) => u.verifymeId === vmId).length;

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

  const applyStatusByVerifymeId = (vmId: string, status: PlatformEndUserAssociation["status"]) => {
    setEndUserAssociations((prev) => prev.map((user) => (user.verifymeId === vmId ? { ...user, status } : user)));
  };

  if (!verifymeIdParam || !selectedRowGroup) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <p className="text-sm text-muted-foreground">VerifyMe user not found.</p>
        <Button variant="outline" onClick={() => navigate("/verifyme-users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to VerifyMe Users
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/verifyme-users")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to VerifyMe Users
          </Button>
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h1 className="font-mono text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {selectedRowGroup.verifymeId}
                </h1>
                <UnifiedBadge variant="status" value={rowStatusLabel(selectedRowGroup.rowStatus)} />
              </div>
              <p className="text-sm text-muted-foreground">
                Private account email (masked):{" "}
                <span className="font-mono text-foreground">{maskEmail(selectedRowGroup.email)}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link
                    to={auditLogsHref({ verifymeId: selectedRowGroup.verifymeId, entityType: "verifyme_user" })}
                    className="inline-flex items-center gap-2"
                  >
                    <ClipboardList className="h-4 w-4" />
                    View audit history
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-8">
          <Tabs
            value={detailTab}
            onValueChange={(v) => {
              setDetailTab(v);
              if (v !== "controls") setControlsFeedback(null);
            }}
            className="flex min-h-0 w-full flex-col"
          >
            <TabsList
              className="flex h-9 w-full min-w-0 shrink-0 flex-nowrap items-stretch justify-start gap-1 overflow-x-auto overflow-y-hidden bg-muted/40 p-1 [scrollbar-width:thin]"
              data-no-row-nav
            >
              <TabsTrigger value="profile" className="flex-none shrink-0 px-2 text-[11px] sm:text-[12px]">
                Profile & Status
              </TabsTrigger>
              <TabsTrigger value="platform-risk" className="flex-none shrink-0 px-2 text-[11px] sm:text-[12px]">
                Platform Risk
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
              <TabsTrigger value="risk-history" className="flex-none shrink-0 px-2 text-[11px] sm:text-[12px]">
                Risk History
              </TabsTrigger>
              <TabsTrigger value="controls" className="flex-none shrink-0 px-2 text-[11px] sm:text-[12px]">
                User Controls
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6 space-y-3 text-[13px]">
              <Card className="border border-border p-6 shadow-sm space-y-3">
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-[13px]">
                  <div>
                    <dt className="text-muted-foreground">VerifyMe ID</dt>
                    <dd className="font-mono font-medium text-foreground">{selectedRowGroup.verifymeId}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>
                      <UnifiedBadge variant="status" value={rowStatusLabel(selectedRowGroup.rowStatus)} />
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground">Private account email</dt>
                    <dd className="font-mono text-foreground">{maskEmail(selectedRowGroup.email)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Created</dt>
                    <dd>
                      {selectedUserLinks.length > 0
                        ? formatDate(
                            [...selectedUserLinks].sort((a, b) => a.created.localeCompare(b.created))[0]!.created,
                          )
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Last active</dt>
                    <dd>{formatRelativeTime(selectedRowGroup.lastActiveMax)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Linked organizations</dt>
                    <dd className="tabular-nums font-medium">{selectedRowGroup.memberships.length}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Verification sessions</dt>
                    <dd className="tabular-nums font-medium">
                      {selectedRowGroup.totalVerificationSessions.toLocaleString()}
                    </dd>
                  </div>
                </dl>
                <p className="text-[12px] text-muted-foreground border-t border-border pt-3">
                  Sensitive credentials are never shown in this portal.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="platform-risk" className="mt-6 space-y-4 text-[13px]">
              {platformRisk ? (
                <>
                  <RiskSummary
                    score={platformRisk.score}
                    level={platformRisk.level}
                    signals={platformRisk.signals}
                    recommendation={platformRisk.recommendation}
                  />
                  <Card className="border border-border p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Supporting metrics</p>
                    <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">Linked organizations (count)</dt>
                        <dd className="tabular-nums font-medium">{selectedRowGroup.memberships.length}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Verification sessions (total)</dt>
                        <dd className="tabular-nums font-medium">
                          {selectedRowGroup.totalVerificationSessions.toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Account status</dt>
                        <dd>
                          <UnifiedBadge variant="status" value={rowStatusLabel(selectedRowGroup.rowStatus)} />
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Last active (max across links)</dt>
                        <dd>{formatRelativeTime(selectedRowGroup.lastActiveMax)}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground">Device enrollment (summary)</dt>
                        <dd>
                          {selectedRowGroup.memberships[0]?.device?.status === "active"
                            ? "Active device on file"
                            : selectedRowGroup.memberships[0]?.device?.status === "pending_enrollment"
                              ? "Enrollment incomplete"
                              : "—"}
                        </dd>
                      </div>
                    </dl>
                    <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground border-t border-border pt-3">
                      Platform risk is universal for this VerifyMe User across linked organizations. Signals are aggregated —
                      other organizations are not named in factor labels.
                    </p>
                  </Card>
                </>
              ) : null}
            </TabsContent>

            <TabsContent value="devices" className="mt-6 space-y-4 text-[13px]">
              <Card className="border border-border p-6 shadow-sm">
                <p className="text-[12px] text-muted-foreground mb-4">
                  One active device per account. Replacing a device rotates binding for this user.
                </p>
                {(() => {
                  const dev = selectedRowGroup.memberships[0]?.device;
                  if (!dev) return <p className="text-muted-foreground">No device on file.</p>;
                  const bindingOk = dev.status === "active";
                  return (
                    <div className="rounded-lg border border-border p-4">
                      <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Active device
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] text-muted-foreground">Device</p>
                          <p className="font-medium">
                            {dev.label} · {dev.platform}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground">Enrollment</p>
                          <UnifiedBadge variant="status" value={dev.status === "active" ? "Active" : "Pending enrollment"} />
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground">Binding summary</p>
                          <p className="text-[13px]">{bindingOk ? "Bound · healthy" : "Enrollment incomplete"}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground">Registered</p>
                          <p>{formatDateTime(dev.registeredAt)}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-[11px] text-muted-foreground">Last verified</p>
                          <p>{dev.lastVerifiedAt ? formatDateTime(dev.lastVerifiedAt) : "—"}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </Card>
            </TabsContent>

            <TabsContent value="orgs" className="mt-6">
              <Card className="border border-border p-6 shadow-sm">
                <ul className="space-y-2 rounded-md border border-border bg-accent/5 p-3">
                  {selectedUserLinks
                    .slice()
                    .sort((a, b) => a.organization.localeCompare(b.organization))
                    .map((link) => (
                      <li
                        key={link.id}
                        className="border-b border-border/60 pb-2 text-[13px] leading-snug last:border-0 last:pb-0"
                      >
                        <span className="font-medium text-foreground">{link.organization}</span>
                        <br />
                        <span className="text-muted-foreground">Customer user ID:</span>{" "}
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
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-6 space-y-2 text-[13px]">
              <Card className="border border-border p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="text-muted-foreground text-[13px]">Verification sessions by linked organization.</p>
                  <Button variant="link" size="sm" className="h-auto px-0 text-[13px]" asChild>
                    <Link
                      to={auditLogsHref({
                        verifymeId: selectedRowGroup.verifymeId,
                        entityType: "verification_session",
                      })}
                    >
                      Matching audit events
                    </Link>
                  </Button>
                </div>
                <div className="mt-6">
                  <GovernanceTimeline
                    items={selectedUserLinks
                      .slice()
                      .sort((a, b) => (b.verificationSessions || 0) - (a.verificationSessions || 0))
                      .map((link) => {
                        const iso = link.lastActive
                          ? link.lastActive.includes("T")
                            ? link.lastActive + (link.lastActive.endsWith("Z") ? "" : "Z")
                            : link.lastActive + "T12:00:00Z"
                          : link.created + "T12:00:00Z";
                        return {
                          id: link.id,
                          timestamp: iso,
                          title: link.organization,
                          subtitle: `${link.verificationSessions.toLocaleString()} verification sessions logged this period.`,
                          meta: (
                            <span className="text-muted-foreground">
                              Last activity: {link.lastActive ? formatRelativeTime(link.lastActive) : "Never"}
                            </span>
                          ),
                        };
                      })}
                  />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="risk-history" className="mt-6 text-[13px]">
              <Card className="border border-border p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Risk History</p>
                    <p className="mt-2 text-[13px] text-muted-foreground">
                      Platform-wide risk trajectory for this VerifyMe User. Contributing signals are summarized in the
                      aggregate — other organizations are not named.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={auditLogsHref({ verifymeId: selectedRowGroup.verifymeId, riskEventsOnly: true })}>
                      View risk audit trail
                    </Link>
                  </Button>
                </div>
                <GovernanceTimeline
                  items={getRiskHistoryForVerifymeId(selectedRowGroup.verifymeId).map((e) => ({
                    id: e.id,
                    timestamp: e.timestamp,
                    title: (
                      <>
                        Risk band{" "}
                        <span className="text-muted-foreground">
                          {e.previousLevel} → {e.newLevel}
                        </span>
                      </>
                    ),
                    subtitle: e.contributingSignalsSummary,
                  }))}
                />
              </Card>
            </TabsContent>

            <TabsContent value="controls" className="mt-6 flex min-h-[280px] flex-col gap-4 text-[13px] outline-none">
              {controlsFeedback ? (
                <div className="flex flex-wrap items-start justify-between gap-2 rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2 text-[13px] text-green-800 dark:text-green-200">
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

              <Card className="space-y-3 border border-border p-6 shadow-sm">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Account status</p>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-[13px] sm:grid-cols-2">
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
                    <dd className="font-medium tabular-nums">{selectedRowGroup.memberships.length}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Verification sessions</dt>
                    <dd className="font-medium tabular-nums">
                      {selectedRowGroup.totalVerificationSessions.toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </Card>

              <Card className="space-y-3 border border-border p-6 shadow-sm">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Lifecycle controls</p>
                <p className="text-[12px] leading-relaxed text-muted-foreground">
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

              <Card className="space-y-3 border border-border p-6 shadow-sm">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Recovery / security controls
                </p>
                <p className="text-[12px] leading-relaxed text-muted-foreground">
                  Starts a recovery reset for this account. Recovery secrets are never shown or stored in this portal.
                </p>
                <div className="flex flex-wrap items-center gap-2">
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

              <Card className="space-y-3 border border-destructive/25 bg-destructive/5 p-6 shadow-sm">
                <p className="text-[11px] font-medium uppercase tracking-wide text-destructive">Restricted actions</p>
                <div>
                  <p className="text-[13px] font-medium text-foreground">Disable user</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
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
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent overlayClassName="z-[110]" className="z-[120] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Suspend user?</DialogTitle>
            <DialogDescription>
              Suspends VerifyMe access for{" "}
              <span className="font-mono">{selectedRowGroup?.verifymeId}</span> across linked organizations.
            </DialogDescription>
          </DialogHeader>
          <p className="rounded-md border border-border/80 bg-muted/30 px-3 py-2 text-[12px] text-muted-foreground">
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
                const n = linkCountForVerifymeId(controlsTarget);
                applyStatusByVerifymeId(controlsTarget, "suspended");
                setSuspendOpen(false);
                setControlsFeedback(`${controlsTarget} suspended across ${n} linked organization(s).`);
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
              <span className="font-mono">{selectedRowGroup?.verifymeId}</span> on all linked memberships.
            </DialogDescription>
          </DialogHeader>
          <p className="rounded-md border border-border/80 bg-muted/30 px-3 py-2 text-[12px] text-muted-foreground">
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
                const n = linkCountForVerifymeId(controlsTarget);
                applyStatusByVerifymeId(controlsTarget, "active");
                setReactivateOpen(false);
                setControlsFeedback(`${controlsTarget} reactivated across ${n} linked organization(s).`);
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
                <p>Disabling this VerifyMe user prevents verification activity and access recovery until restored.</p>
                <p>
                  Applies to <span className="font-mono">{selectedRowGroup?.verifymeId}</span>. This is not account deletion.
                  Type the exact VerifyMe ID below to confirm.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <p className="rounded-md border border-border/80 bg-muted/30 px-3 py-2 text-[12px] text-muted-foreground">
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
                const n = linkCountForVerifymeId(controlsTarget);
                applyStatusByVerifymeId(controlsTarget, "disabled");
                setDisableOpen(false);
                setDisableTyped("");
                setControlsFeedback(`${controlsTarget} disabled across ${n} linked organization(s).`);
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
              Requests a recovery reset for{" "}
              <span className="font-mono">{selectedRowGroup?.verifymeId}</span>. Recovery secrets are never shown in this portal.
            </DialogDescription>
          </DialogHeader>
          <p className="rounded-md border border-border/80 bg-muted/30 px-3 py-2 text-[12px] text-muted-foreground">
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
                setControlsFeedback(`Recovery reset request recorded for ${controlsTarget}.`);
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
              Returns <span className="font-mono">{selectedRowGroup?.verifymeId}</span> to active for all linked memberships.
            </DialogDescription>
          </DialogHeader>
          <p className="rounded-md border border-border/80 bg-muted/30 px-3 py-2 text-[12px] text-muted-foreground">
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
                const n = linkCountForVerifymeId(controlsTarget);
                applyStatusByVerifymeId(controlsTarget, "active");
                setRestoreOpen(false);
                setControlsFeedback(`${controlsTarget} restored to active across ${n} linked organization(s).`);
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
