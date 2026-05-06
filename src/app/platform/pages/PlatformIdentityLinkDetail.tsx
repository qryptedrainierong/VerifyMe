import { ArrowLeft, ClipboardList, Link2 } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Button } from "../../shared/components/ui/button";
import { Card } from "../../shared/components/ui/card";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import {
  getIdentityLinkById,
  getIdentityLinksStoreVersion,
  subscribeIdentityLinksListeners,
  updateIdentityLinkRow,
} from "../data/platformIdentityLinksSession";
import type {
  IdentityLinkConflictStatus,
  IdentityLinkStatus,
  NameMatchStatus,
} from "../data/platformIdentityLinksSample";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../shared/components/ui/alert-dialog";
import { UserRiskStatusBadge } from "../../shared/components/RiskSummary";
import {
  computePlatformRiskSummaryForVerifymeId,
} from "../data/mockPlatformRisk";
import {
  getEndUserAssociationStoreVersion,
  getEndUserAssociations,
  subscribeEndUserAssociationListeners,
} from "../data/platformEndUserAssociationsSession";
import {
  getConflictHistoryForIdentityLinkId,
  type IdentityLinkConflictHistoryEntryKind,
} from "../data/platformIdentityLinkConflictHistorySample";
import { GovernanceTimeline } from "../../shared/components/GovernanceTimeline";
import { auditLogsHref } from "../utils/auditLogsNavigation";

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

function conflictHistoryStepLabel(kind: IdentityLinkConflictHistoryEntryKind): string {
  const map: Record<IdentityLinkConflictHistoryEntryKind, string> = {
    detected: "Conflict detected",
    review_opened: "Review opened",
    reviewed: "Reviewed",
    resolved: "Conflict resolved",
  };
  return map[kind];
}

function nameMatchStatusLabel(status: NameMatchStatus): string {
  const map: Record<NameMatchStatus, string> = {
    not_provided: "Not provided",
    not_checked: "Not checked",
    strong_match: "Strong match",
    partial_match: "Partial match",
    mismatch: "Mismatch",
  };
  return map[status];
}

export function PlatformIdentityLinkDetail() {
  const navigate = useNavigate();
  const { identityLinkId } = useParams();

  const version = useSyncExternalStore(
    subscribeIdentityLinksListeners,
    getIdentityLinksStoreVersion,
    getIdentityLinksStoreVersion,
  );

  const row = useMemo(() => getIdentityLinkById(identityLinkId), [identityLinkId, version]);

  const assocVersion = useSyncExternalStore(
    subscribeEndUserAssociationListeners,
    getEndUserAssociationStoreVersion,
    getEndUserAssociationStoreVersion,
  );
  const platformAssociations = useMemo(() => getEndUserAssociations(), [assocVersion]);

  const userRisk = useMemo(
    () => (row ? computePlatformRiskSummaryForVerifymeId(row.verifymeId, platformAssociations) : null),
    [row, platformAssociations],
  );

  const [conflictReviewOpen, setConflictReviewOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  if (!identityLinkId || !row) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <p className="text-sm text-muted-foreground">Identity link not found.</p>
        <Button variant="outline" onClick={() => navigate("/identity-links")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Identity Links
        </Button>
      </div>
    );
  }

  const hasActiveConflict = row.conflictStatus === "pending_review";
  const conflictPrimaryText = row.conflictReason?.trim() || row.riskNotes?.trim() || null;

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/identity-links")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Identity Links
          </Button>
          {message ? (
            <div className="mb-4 rounded-md border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm text-green-700 dark:text-green-300">
              {message}
            </div>
          ) : null}
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Link2 className="h-7 w-7 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 font-mono text-sm font-medium text-foreground break-all">{row.clientUserId}</p>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{row.organizationName}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <UnifiedBadge variant="status" value={linkStatusLabel(row.linkStatus)} />
                <UnifiedBadge variant="status" value={conflictLabel(row.conflictStatus)} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link
                    to={auditLogsHref({ identityLinkId: row.id, governanceCategory: "Identity" })}
                    className="inline-flex items-center gap-2"
                  >
                    <ClipboardList className="h-4 w-4" />
                    View audit history
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to={auditLogsHref({ identityLinkId: row.id, conflictEventsOnly: true })}>
                    Conflict audit trail only
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-8 space-y-6">
          <Card
            className={`border p-6 shadow-sm ${hasActiveConflict ? "border-orange-500/40 bg-orange-500/[0.04]" : "border-border"}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Conflict review / resolution</p>
            {hasActiveConflict ? (
              <div className="mt-4 space-y-4 text-sm">
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Conflict status</dt>
                    <dd className="mt-1">
                      <UnifiedBadge variant="status" value={conflictLabel(row.conflictStatus)} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Review status</dt>
                    <dd className="mt-1 font-medium">Awaiting review</dd>
                  </div>
                </dl>
                {conflictPrimaryText ? (
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Conflict reason</p>
                    <p className="mt-1 leading-relaxed text-foreground">{conflictPrimaryText}</p>
                  </div>
                ) : null}
                {row.inviteRiskNotes?.trim() ? (
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Invite context</p>
                    <p className="mt-1 text-muted-foreground">{row.inviteRiskNotes}</p>
                  </div>
                ) : null}
                <Button type="button" variant="default" onClick={() => setConflictReviewOpen(true)}>
                  Review conflict…
                </Button>
                <p className="text-[12px] text-muted-foreground">
                  Confirmation is required. Resolutions are recorded for audit.
                </p>
              </div>
            ) : row.conflictStatus === "resolved" ? (
              <div className="mt-4 space-y-3 text-sm">
                <p className="text-muted-foreground">
                  <UnifiedBadge variant="status" value={conflictLabel(row.conflictStatus)} />
                </p>
                {row.conflictResolution?.trim() ? (
                  <div>
                    <p className="text-[11px] font-medium uppercase text-muted-foreground">Resolution notes</p>
                    <p className="mt-1 leading-relaxed">{row.conflictResolution}</p>
                  </div>
                ) : null}
                {(row.conflictReviewedBy || row.conflictReviewedAt) && (
                  <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-[13px]">
                    {row.conflictReviewedBy ? (
                      <div>
                        <dt className="text-muted-foreground">Reviewed by</dt>
                        <dd>{row.conflictReviewedBy}</dd>
                      </div>
                    ) : null}
                    {row.conflictReviewedAt ? (
                      <div>
                        <dt className="text-muted-foreground">Reviewed at</dt>
                        <dd>{formatDateTime(row.conflictReviewedAt)}</dd>
                      </div>
                    ) : null}
                  </dl>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No active conflict for this link.</p>
            )}
          </Card>

          <Card className="border border-border p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Link summary</p>
            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Link status</dt>
                <dd className="mt-1">
                  <UnifiedBadge variant="status" value={linkStatusLabel(row.linkStatus)} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Organization</dt>
                <dd className="font-medium">{row.organizationName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Customer user ID</dt>
                <dd className="font-mono">{row.clientUserId}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">VerifyMe ID</dt>
                <dd className="font-mono font-medium">{row.verifymeId}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">VerifyMe account status</dt>
                <dd>
                  <UnifiedBadge variant="status" value={row.verifymeAccountStatus} />
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Device status</dt>
                <dd>{row.deviceStatusSummary}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Linked date</dt>
                <dd>{formatDate(row.createdLinkedAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Last verified</dt>
                <dd>{row.lastVerified ? formatDateTime(row.lastVerified) : "—"}</dd>
              </div>
            </dl>
          </Card>

          <Card className="border border-border p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Organization customer</p>
            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Customer display name</dt>
                <dd>{row.customerDisplayName?.trim() ? row.customerDisplayName : "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Customer reference</dt>
                <dd>{row.customerReference?.trim() ? row.customerReference : "—"}</dd>
              </div>
            </dl>
            <p className="mt-4 text-[12px] text-muted-foreground">Display names and references are supplied by the organization.</p>
          </Card>

          <Card className="border border-border p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name consistency</p>
            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Outcome</dt>
                <dd className="mt-1">
                  <UnifiedBadge variant="status" value={nameMatchStatusLabel(row.nameMatchStatus)} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Match confidence</dt>
                <dd className="tabular-nums">
                  {row.nameMatchScore != null ? row.nameMatchScore.toFixed(2) : "—"}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
              Name consistency is a risk and conflict signal only. It is not proof of legal identity and must not be treated as
              a verification outcome.
            </p>
          </Card>

          <Card className="border border-border p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">VerifyMe reference</p>
            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">VerifyMe ID</dt>
                <dd className="font-mono font-medium">{row.verifymeId}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">VerifyMe account status</dt>
                <dd>
                  <UnifiedBadge variant="status" value={row.verifymeAccountStatus} />
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="border border-border p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Related user risk</p>
            <p className="mt-2 text-[12px] text-muted-foreground">
              Risk score and level belong to the <strong className="text-foreground">VerifyMe User</strong> (platform-wide). This
              link does not have a separate link risk score.
            </p>
            {userRisk ? (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <UserRiskStatusBadge level={userRisk.level} />
                <span className="text-sm text-muted-foreground">
                  User risk score:{" "}
                  <span className="font-mono font-semibold tabular-nums text-foreground">{userRisk.score}</span>
                </span>
                <Link to={`/verifyme-users/${encodeURIComponent(row.verifymeId)}`}>
                  <Button variant="outline" size="sm" type="button">
                    Open VerifyMe User
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No platform risk snapshot is available for this VerifyMe user yet.
              </p>
            )}
          </Card>

          <Card className="border border-border p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Conflict history</p>
                <p className="mt-2 max-w-xl text-[13px] text-muted-foreground">
                  Operational timeline for detection, review, and resolution.
                </p>
              </div>
            </div>
            <div className="pt-6">
              <GovernanceTimeline
                items={getConflictHistoryForIdentityLinkId(row.id).map((h) => ({
                  id: h.id,
                  timestamp: h.timestamp,
                  title: conflictHistoryStepLabel(h.kind),
                  subtitle: (
                    <>
                      {h.summary}
                      {h.resolutionNotes ? (
                        <span className="block mt-2 text-[12px] text-muted-foreground">Resolution: {h.resolutionNotes}</span>
                      ) : null}
                    </>
                  ),
                  meta: h.reviewer ? <span>Reviewer: {h.reviewer}</span> : null,
                }))}
              />
            </div>
          </Card>

          <details className="rounded-lg border border-border bg-muted/10 p-4 text-[12px] text-muted-foreground">
            <summary className="cursor-pointer font-medium text-foreground">Technical details</summary>
            <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Link ID</dt>
                <dd className="font-mono text-foreground">{row.id}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Organization ID</dt>
                <dd className="font-mono text-foreground">{row.organizationId}</dd>
              </div>
            </dl>
          </details>
        </div>
      </div>

      <AlertDialog open={conflictReviewOpen} onOpenChange={setConflictReviewOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Resolve conflict for this link?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                Applies to customer user ID <span className="font-mono">{row.clientUserId}</span> at {row.organizationName}.
              </span>
              <span className="block rounded-md border border-border/80 bg-muted/30 px-3 py-2 text-[12px] text-muted-foreground">
                This action will be recorded in audit logs.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const reviewedAt = new Date().toISOString();
                updateIdentityLinkRow(row.id, {
                  conflictStatus: "resolved",
                  conflictReviewedBy: "VerifyMe platform",
                  conflictReviewedAt: reviewedAt,
                  conflictResolution: "Conflict reviewed and cleared in VerifyMe Admin.",
                });
                setConflictReviewOpen(false);
                setMessage(`Conflict resolved for ${row.clientUserId}.`);
              }}
            >
              Confirm resolution
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
