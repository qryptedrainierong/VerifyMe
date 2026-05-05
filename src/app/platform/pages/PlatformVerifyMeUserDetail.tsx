import { ArrowLeft, Users } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router";
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

export function PlatformVerifyMeUserDetail() {
  const navigate = useNavigate();
  const { verifymeUserId } = useParams();

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
    if (!verifymeUserId) return [];
    return usersData.filter((u) => u.verifymeUserId === verifymeUserId);
  }, [usersData, verifymeUserId]);

  const selectedRowGroup = useMemo(() => {
    if (selectedUserLinks.length === 0) return null;
    return groupAssociationsByVerifymeUserId(selectedUserLinks)[0] ?? null;
  }, [selectedUserLinks]);

  const controlsTarget = verifymeUserId ?? null;

  const disableMatches =
    selectedRowGroup && disableTyped.trim().toLowerCase() === selectedRowGroup.verifymeId.toLowerCase();

  const displayVerifymeIdForMessages = (id: string) =>
    usersData.find((u) => u.verifymeUserId === id)?.verifymeId ?? id;

  const linkCountForUser = (id: string) => usersData.filter((u) => u.verifymeUserId === id).length;

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

  const applyStatusToUser = (userId: string, status: PlatformEndUserAssociation["status"]) => {
    setEndUserAssociations((prev) =>
      prev.map((user) => (user.verifymeUserId === userId ? { ...user, status } : user)),
    );
  };

  if (!verifymeUserId || !selectedRowGroup) {
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
              <p className="mt-1 text-xs text-muted-foreground">
                Internal id: <span className="font-mono">{selectedRowGroup.verifymeUserId}</span>
              </p>
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

            <TabsContent value="profile" className="mt-6 space-y-3 text-[13px]">
              <Card className="border border-border p-6 shadow-sm">
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
                  <span className="font-medium tabular-nums">
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
                <p className="rounded-md border border-border bg-muted/20 p-3 text-[12px] text-muted-foreground">
                  Passcodes, OTPs, biometrics, tokens, recovery secrets, and transaction codes are never shown in VerifyMe
                  Admin.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="devices" className="mt-6 space-y-4 text-[13px]">
              <Card className="border border-border p-6 shadow-sm">
                <p className="rounded-md border border-border bg-muted/20 p-3 text-[12px] leading-relaxed text-muted-foreground">
                  In the current MVP, each VerifyMe user is limited to a single active device. Registering a new device
                  replaces the existing device and rotates the associated secure state.
                </p>
                <p className="text-[12px] text-muted-foreground">
                  This account is currently limited to one active device (MVP). Setting up a new device will replace the
                  existing device.
                </p>
                {(() => {
                  const dev = selectedRowGroup.memberships[0]?.device;
                  if (!dev) return <p className="text-muted-foreground">No device sample.</p>;
                  return (
                    <div className="mt-4 rounded-lg border border-border p-4">
                      <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Registered device
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                    </div>
                  );
                })()}
                <p className="rounded-md border border-border bg-muted/20 p-3 text-[12px] text-muted-foreground">
                  No biometric templates, raw device keys, Encrypted_Auth_Cred, Transaction_Code, or generated tokens are
                  displayed.
                </p>
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
                        <span className="ml-1 font-mono text-[12px] text-muted-foreground">({link.organizationId})</span>
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
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-6 space-y-2 text-[13px]">
              <Card className="border border-border p-6 shadow-sm">
                <p className="text-muted-foreground">
                  Organization-scoped verification session counts (sample). Last activity reflects the latest session signal,
                  not raw tokens.
                </p>
                <div className="mt-4 divide-y divide-border rounded-md border border-border">
                  {selectedUserLinks
                    .slice()
                    .sort((a, b) => b.verificationSessions - a.verificationSessions)
                    .map((link) => (
                      <div key={link.id} className="flex flex-wrap justify-between gap-2 p-3">
                        <div>
                          <p className="font-medium text-foreground">{link.organization}</p>
                          <p className="font-mono text-[11px] text-muted-foreground">{link.organizationId}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium tabular-nums">{link.verificationSessions.toLocaleString()} sessions</p>
                          <p className="text-[12px] text-muted-foreground">
                            Last active: {link.lastActive ? formatRelativeTime(link.lastActive) : "Never"}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
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
                    <dt className="text-muted-foreground">Verification sessions (sample)</dt>
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
                  Mock-only flow. Confirms a controlled recovery reset request — no recovery secrets are displayed or stored
                  in this UI.
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
                <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto" disabled>
                  Transfer organization links (future)
                </Button>
                <p className="text-[11px] text-muted-foreground">Not implemented in this mock.</p>
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
              <span className="font-mono">{selectedRowGroup?.verifymeId}</span> across linked organizations (mock).
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
                <p>Disabling this VerifyMe user prevents verification activity and access recovery until restored.</p>
                <p>
                  Applies to <span className="font-mono">{selectedRowGroup?.verifymeId}</span> (mock — not delete). Type the
                  exact VerifyMe ID below to confirm.
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
