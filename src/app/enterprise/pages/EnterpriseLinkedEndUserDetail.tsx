import { useMemo, useState, useSyncExternalStore } from "react";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../../shared/components/ui/button";
import { Card } from "../../shared/components/ui/card";
import { Separator } from "../../shared/components/ui/separator";
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
import { UserRiskStatusBadge } from "../../shared/components/RiskSummary";
import {
  createMockInvite,
  inviteStatusLabel,
  isInviteExpiredByClock,
  linkStatusLabel,
  nameConsistencyBadgeClass,
  nameConsistencyLabel,
  orgVerificationOutcomeLabel,
  type OrganizationUserRecord,
} from "../data/enterpriseLinkedEndUsersMock";
import {
  getLinkedEndUserRecordById,
  getLinkedEndUsersStoreVersion,
  subscribeLinkedEndUsersListeners,
  updateLinkedEndUserRecord,
} from "../data/enterpriseLinkedEndUsersSession";
import { userRiskLevelForOrgAdmin } from "../../platform/data/mockPlatformRisk";
import {
  getEndUserAssociationStoreVersion,
  getEndUserAssociations,
  subscribeEndUserAssociationListeners,
} from "../../platform/data/platformEndUserAssociationsSession";

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

function recordDisplayLabel(r: OrganizationUserRecord): string {
  return r.customerDisplayName?.trim() || r.clientUserId;
}

export function EnterpriseLinkedEndUserDetail() {
  const navigate = useNavigate();
  const { recordId } = useParams();
  const [tab, setTab] = useState("summary");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ action: string } | null>(null);

  const linkedVersion = useSyncExternalStore(
    subscribeLinkedEndUsersListeners,
    getLinkedEndUsersStoreVersion,
    getLinkedEndUsersStoreVersion,
  );
  const assocVersion = useSyncExternalStore(
    subscribeEndUserAssociationListeners,
    getEndUserAssociationStoreVersion,
    getEndUserAssociationStoreVersion,
  );
  const record = useMemo(() => getLinkedEndUserRecordById(recordId), [recordId, linkedVersion]);
  const platformAssociations = useMemo(() => getEndUserAssociations(), [assocVersion]);

  if (!record) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground">Record not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/linked-end-users")}>
          Back to Linked End Users
        </Button>
      </div>
    );
  }

  const auditHint = "This action will be recorded in audit logs.";
  const liveInvite = getLinkedEndUserRecordById(recordId) ?? record;
  const inv = liveInvite.invite;
  const riskLevel = userRiskLevelForOrgAdmin(liveInvite.platformRiskVerifymeId, platformAssociations);
  const inviteExpired =
    liveInvite.invite != null &&
    (liveInvite.inviteStatus === "expired" || isInviteExpiredByClock(liveInvite.invite));

  const openInvitePanel = () => {
    const cur = getLinkedEndUserRecordById(recordId) ?? record;
    if (cur.invite) {
      setInviteOpen(true);
      return;
    }
    const inv = createMockInvite(cur.clientUserId, `inv_gen_${Date.now().toString(36).slice(-8)}`);
    updateLinkedEndUserRecord(cur.id, {
      invite: inv,
      inviteStatus: "pending",
      linkStatus: cur.linkStatus === "unlinked" ? "pending" : cur.linkStatus,
      invitedAt: new Date().toISOString(),
    });
    setInviteOpen(true);
  };

  const applyAction = (action: string) => {
    const cur = getLinkedEndUserRecordById(recordId);
    if (!cur) return;
    switch (action) {
      case "suspend":
        if (cur.linkStatus === "linked") {
          updateLinkedEndUserRecord(cur.id, { linkStatus: "suspended" });
        }
        break;
      case "reactivate":
        if (cur.linkStatus === "suspended") {
          updateLinkedEndUserRecord(cur.id, { linkStatus: "linked" });
        }
        break;
      case "revoke":
        updateLinkedEndUserRecord(cur.id, {
          linkStatus: "revoked",
          inviteStatus: "superseded",
          maskedVerifymeId: null,
          invite: null,
        });
        break;
      case "disable":
        updateLinkedEndUserRecord(cur.id, { linkStatus: "disabled" });
        break;
      case "reinvite":
        updateLinkedEndUserRecord(cur.id, {
          linkStatus: "pending",
          inviteStatus: "pending",
          invitedAt: new Date().toISOString(),
          invite: createMockInvite(cur.clientUserId, `inv_re_${cur.clientUserId}_${Date.now().toString(36).slice(-4)}`),
        });
        break;
      default:
        break;
    }
    setConfirmAction(null);
  };

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/linked-end-users")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Linked End Users
          </Button>
          <h1 className="text-2xl font-semibold">{recordDisplayLabel(liveInvite)}</h1>
          <p className="text-sm text-muted-foreground font-mono">{liveInvite.clientUserId}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <UnifiedBadge variant="status" value={linkStatusLabel(liveInvite.linkStatus)} />
            <UnifiedBadge variant="status" value={inviteStatusLabel(liveInvite.inviteStatus)} />
            {liveInvite.linkStatus === "conflict" && liveInvite.conflictReviewed && (
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Reviewed</span>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-8 space-y-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex flex-wrap h-auto gap-1 mb-6">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="customer">Customer Context</TabsTrigger>
              <TabsTrigger value="link">Link & Invite</TabsTrigger>
              <TabsTrigger value="name">Name Consistency</TabsTrigger>
              <TabsTrigger value="risk">User Risk Status</TabsTrigger>
              <TabsTrigger value="verification">Verification Activity</TabsTrigger>
              <TabsTrigger value="controls">Controls</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <Card className="p-6 border border-border shadow-sm space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Organization-scoped linked end-user record. VerifyMe legal name and email are not shown in this portal.
                </p>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase">client_user_id</dt>
                    <dd className="font-mono">{liveInvite.clientUserId}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase">VerifyMe ID (masked)</dt>
                    <dd className="font-mono">{liveInvite.maskedVerifymeId ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase">Link status</dt>
                    <dd>
                      <UnifiedBadge variant="status" value={linkStatusLabel(liveInvite.linkStatus)} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase">Last verified</dt>
                    <dd>{formatDateTime(liveInvite.lastVerifiedAt)}</dd>
                  </div>
                </dl>
              </Card>
            </TabsContent>

            <TabsContent value="customer">
              <Card className="p-6 border border-border shadow-sm space-y-3 text-sm">
                <p className="text-xs text-muted-foreground">
                  Customer fields are provided by your organization for reference only. They are not verified identity
                  attributes.
                </p>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase">Customer display name</dt>
                    <dd>{liveInvite.customerDisplayName?.trim() || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase">Customer reference</dt>
                    <dd>{liveInvite.customerReference?.trim() || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase">Notification channel (reference)</dt>
                    <dd>{liveInvite.notificationPlaceholder ?? "—"}</dd>
                  </div>
                </dl>
              </Card>
            </TabsContent>

            <TabsContent value="link">
              <Card className="p-6 border border-border shadow-sm space-y-3 text-sm">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase">Invite status</dt>
                    <dd>
                      <UnifiedBadge variant="status" value={inviteStatusLabel(liveInvite.inviteStatus)} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase">Created</dt>
                    <dd>{formatDate(liveInvite.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase">Invited</dt>
                    <dd>{formatDateTime(liveInvite.invitedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase">Verification count (org)</dt>
                    <dd>{liveInvite.verificationCount}</dd>
                  </div>
                </dl>
                {inviteExpired && (
                  <p className="text-xs text-amber-800 dark:text-amber-200 rounded-md border border-amber-200 bg-amber-50/80 dark:bg-amber-950/30 px-3 py-2">
                    Invite is expired or past <code className="text-xs">expires_at</code>. Issue a new invite before the
                    end-user can link.
                  </p>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="name">
              <Card className="p-6 border border-border shadow-sm space-y-2 text-sm">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${nameConsistencyBadgeClass(liveInvite.nameMatchStatus)}`}
                >
                  {nameConsistencyLabel(liveInvite.nameMatchStatus)}
                </span>
                <p className="text-xs text-muted-foreground pt-2">
                  Derived from comparison between organization-provided context and VerifyMe profile. Risk signal only — not
                  proof of identity. Raw comparison values are not shown.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="risk">
              <Card className="p-6 border border-border shadow-sm space-y-3 text-sm">
                <p className="text-xs text-muted-foreground">
                  Summary band for the linked VerifyMe User. No cross-organization detail or platform risk factor list in
                  this portal.
                </p>
                {riskLevel ? (
                  <UserRiskStatusBadge level={riskLevel} />
                ) : (
                  <p className="text-muted-foreground">Not available for this record.</p>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="verification">
              <Card className="p-6 border border-border shadow-sm">
                <ul className="space-y-2 text-sm">
                  {liveInvite.recentOutcomes.length === 0 ? (
                    <li className="text-muted-foreground">No recent verification outcomes for this organization.</li>
                  ) : (
                    liveInvite.recentOutcomes.map((o, i) => (
                      <li key={i} className="flex justify-between gap-2">
                        <span>{orgVerificationOutcomeLabel(o.outcome)}</span>
                        <span className="text-muted-foreground text-xs">{formatDateTime(o.at)}</span>
                      </li>
                    ))
                  )}
                </ul>
              </Card>
            </TabsContent>

            <TabsContent value="controls">
              <Card className="p-6 border border-border shadow-sm space-y-6">
                <div>
                  <p className="text-sm font-medium mb-2">Invite</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={openInvitePanel}>
                      Generate / view invite
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmAction({ action: "reinvite" })}
                      disabled={liveInvite.linkStatus === "linked" && liveInvite.inviteStatus !== "expired"}
                    >
                      Re-invite
                    </Button>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Link lifecycle</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={liveInvite.linkStatus !== "linked"}
                      onClick={() => setConfirmAction({ action: "suspend" })}
                    >
                      Suspend link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={liveInvite.linkStatus !== "suspended"}
                      onClick={() => setConfirmAction({ action: "reactivate" })}
                    >
                      Reactivate link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={liveInvite.linkStatus !== "linked"}
                      onClick={() => setConfirmAction({ action: "revoke" })}
                    >
                      Revoke link
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={liveInvite.linkStatus === "disabled"}
                      onClick={() => setConfirmAction({ action: "disable" })}
                    >
                      Disable link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={liveInvite.linkStatus !== "conflict"}
                      onClick={() => setConflictOpen(true)}
                    >
                      Conflict review
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{auditHint}</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invite link & QR</DialogTitle>
            <DialogDescription>
              Invite metadata for <span className="text-foreground font-medium">{recordDisplayLabel(liveInvite)}</span>
            </DialogDescription>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-[11px] text-muted-foreground uppercase">Invite status</span>
              <UnifiedBadge variant="status" value={inviteStatusLabel(liveInvite.inviteStatus)} />
            </div>
          </DialogHeader>
          {inv ? (
            <>
              <div className="space-y-3 text-[13px]">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase">invite_id</p>
                  <code className="text-[12px] font-mono break-all">{inv.inviteId}</code>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase">invite_url</p>
                  <code className="text-[12px] font-mono break-all block bg-muted p-2 rounded">{inv.inviteUrl}</code>
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
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Raw one-time tokens, OTP, passcodes, and full QR payloads are never shown here.
                </p>
              </div>
              <DialogFooter className="gap-2 flex-col sm:flex-row">
                {inviteExpired && (
                  <Button
                    type="button"
                    onClick={() => {
                      applyAction("reinvite");
                      setInviteOpen(false);
                    }}
                  >
                    Re-invite
                  </Button>
                )}
                <Button variant="outline" onClick={() => setInviteOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">No invite on file. Use Generate / view invite from Controls.</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={conflictOpen} onOpenChange={setConflictOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Conflict review
            </DialogTitle>
            <DialogDescription>Review-only flow with confirmation and audit expectations.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-[13px]">
            <div className="rounded-md border border-orange-200 bg-orange-50/80 px-3 py-2 text-orange-950 dark:bg-orange-950/30 dark:border-orange-900 dark:text-orange-100">
              <strong className="text-foreground">Reason:</strong> This client_user_id may be linked to a different VerifyMe
              ID than expected.
            </div>
            <dl className="grid grid-cols-1 gap-3">
              <div>
                <dt className="text-[11px] font-medium text-muted-foreground uppercase">client_user_id</dt>
                <dd className="font-mono">{liveInvite.clientUserId}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium text-muted-foreground uppercase">Current VerifyMe ID (masked)</dt>
                <dd className="font-mono">{liveInvite.maskedVerifymeId ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium text-muted-foreground uppercase">Conflicting VerifyMe ID (masked)</dt>
                <dd className="font-mono">{liveInvite.conflictingMaskedVerifymeId ?? "—"}</dd>
              </div>
            </dl>
            <p className="text-xs text-muted-foreground">{auditHint}</p>
          </div>
          <DialogFooter className="gap-2 flex-col-reverse sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setConflictOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                updateLinkedEndUserRecord(liveInvite.id, { conflictReviewed: true });
                setConflictOpen(false);
              }}
            >
              Mark as reviewed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmAction !== null} onOpenChange={(o) => !o && setConfirmAction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm action</DialogTitle>
            <DialogDescription className="text-left space-y-2">
              {confirmAction?.action === "suspend" && <p>Suspend this link for your organization?</p>}
              {confirmAction?.action === "reactivate" && <p>Reactivate this link?</p>}
              {confirmAction?.action === "revoke" && (
                <p>Revoke the link? The end-user must complete linking again before verification can proceed.</p>
              )}
              {confirmAction?.action === "disable" && (
                <p>Disable this link? Re-enablement typically requires administrator review.</p>
              )}
              {confirmAction?.action === "reinvite" && <p>Issue a new invite for this client_user_id?</p>}
              <p className="text-xs text-muted-foreground">{auditHint}</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmAction?.action === "disable" ? "destructive" : "default"}
              onClick={() => confirmAction && applyAction(confirmAction.action)}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
