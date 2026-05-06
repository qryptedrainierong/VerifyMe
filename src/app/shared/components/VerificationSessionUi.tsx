import { Link } from "react-router";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { UnifiedBadge } from "./UnifiedBadge";
import { UserRiskStatusBadge, type RiskLevelLabel } from "./RiskSummary";
import {
  channelLabel,
  deriveIdProofResult,
  idProofResultLabel,
  isSessionBillable,
  nameConsistencyLabel,
  sessionStatusLabel,
  billingStatusLabel,
  tokenExchangeLabel,
  type MockVerificationSession,
} from "../data/verificationSessionsMock";

export function VerificationBillingCallout() {
  return (
    <Card className="p-4 border border-border bg-muted/20 shadow-sm">
      <p className="text-[13px] font-semibold text-foreground mb-2">Billable ID proof results</p>
      <ul className="text-[12px] text-muted-foreground space-y-1 list-disc list-inside mb-3">
        <li>
          <strong className="text-foreground">
            {idProofResultLabel("id_proof_pass")} and {idProofResultLabel("id_proof_fail")}
          </strong>{" "}
          are billable when a proof attempt completed.
        </li>
        <li>
          <strong className="text-foreground">Unavailable</strong> (e.g. Pending, Awaiting verification, Expired, Error,
          Cancelled) and <strong className="text-foreground">Indeterminate</strong> proof classification are{" "}
          <strong className="text-foreground">not billable</strong>.
        </li>
        <li>
          Session status and ID proof result are separate: a session may complete as <strong className="text-foreground">Not verified</strong>{" "}
          because <strong className="text-foreground">ID Proof Fail</strong> — not because of a generic system &quot;Failed&quot; label alone.
        </li>
      </ul>
      <p className="text-[12px] text-muted-foreground leading-relaxed border-t border-border pt-3">
        <strong className="text-foreground">ID Proof Fail</strong> means the user attempted verification but did not successfully
        prove identity. Risk status is separate from the current proof result.
      </p>
    </Card>
  );
}

export function BillableBadge({ billable }: { billable: boolean }) {
  return (
    <UnifiedBadge variant="status" value={billable ? "Billable" : "Not billable"} />
  );
}

/** ID proof result (not session operational status). */
export function OutcomeBadge({ session }: { session: MockVerificationSession }) {
  return <UnifiedBadge variant="status" value={idProofResultLabel(deriveIdProofResult(session))} />;
}

export function ProcessStatusBadge({ session }: { session: MockVerificationSession }) {
  return <UnifiedBadge variant="status" value={sessionStatusLabel(session)} />;
}

export function SessionTimelineList({ events }: { events: MockVerificationSession["timeline"] }) {
  return (
    <ol className="space-y-2 border-l border-border pl-3 ml-1">
      {events.map((ev, i) => (
        <li key={`${ev.at}-${i}`} className="text-[13px]">
          <span className="text-muted-foreground text-[11px] block font-mono">
            {new Date(ev.at).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
          <span className="text-foreground">{ev.label}</span>
        </li>
      ))}
    </ol>
  );
}

type DetailVariant = "platform" | "organization";

export type SessionUserRiskPreview = {
  level: RiskLevelLabel;
  /** Platform Admin only; omit in Organization Admin payloads. */
  score?: number;
};

export function VerificationSessionDetailBody({
  session,
  variant,
  userRiskPreview,
  verifymeUserDetailHref,
}: {
  session: MockVerificationSession;
  variant: DetailVariant;
  /** VerifyMe User platform risk (not link-level). Omit when unknown or redacted VerifyMe ID. */
  userRiskPreview?: SessionUserRiskPreview | null;
  /** Platform Admin only: deep link to VerifyMe User detail for full risk review. */
  verifymeUserDetailHref?: string | null;
}) {
  const billable = isSessionBillable(session);

  return (
    <div className="space-y-4 text-[13px] max-h-[70vh] overflow-y-auto pr-1">
      <div>
        <p className="text-[11px] text-muted-foreground uppercase">Session</p>
        <p className="font-mono text-[14px] font-medium">{session.sessionId}</p>
      </div>

      {variant === "platform" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] text-muted-foreground uppercase">Organization</p>
            <p>{session.organizationName}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground uppercase">client_id</p>
            <p className="font-mono text-[12px] break-all">{session.clientId}</p>
          </div>
        </div>
      )}

      {variant === "organization" && (
        <div>
          <p className="text-[11px] text-muted-foreground uppercase">client_id</p>
          <p className="font-mono text-[12px] break-all">{session.clientId}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] text-muted-foreground uppercase">client_user_id</p>
          <p className="font-mono">{session.clientUserId}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase">Customer display name (org)</p>
          <p>{session.customerDisplayName?.trim() ? session.customerDisplayName : "—"}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Customer display information is provided by the organization for reference only. VerifyMe verifies the linked
            user, not the displayed name.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] text-muted-foreground uppercase">VerifyMe ID</p>
          <p className="font-mono">{session.maskedVerifymeId ?? "—"}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase">Channel</p>
          <p>{channelLabel(session.channel)}</p>
        </div>
      </div>

      {session.nameConsistency && session.nameConsistency !== "not_evaluated" ? (
        <div>
          <p className="text-[11px] text-muted-foreground uppercase">Name consistency</p>
          <p className="text-[13px]">{nameConsistencyLabel(session.nameConsistency)}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Contextual signal for this session only — not proof of identity.
          </p>
        </div>
      ) : null}

      <div className="rounded-md border border-border bg-muted/10 px-3 py-2 text-[12px] leading-relaxed text-muted-foreground">
        <p>
          <strong className="text-foreground">Session status</strong> is the operational state.{" "}
          <strong className="text-foreground">ID proof result</strong> is whether identity was proved for this session.
        </p>
      </div>

      {userRiskPreview ? (
        <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">User risk status</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <UserRiskStatusBadge level={userRiskPreview.level} />
            {variant === "platform" && userRiskPreview.score != null ? (
              <span className="text-[13px] text-muted-foreground">
                User risk score:{" "}
                <span className="font-mono font-semibold tabular-nums text-foreground">{userRiskPreview.score}</span>
              </span>
            ) : null}
            {variant === "platform" && verifymeUserDetailHref ? (
              <Link to={verifymeUserDetailHref} className="text-[13px] font-medium text-primary underline-offset-4 hover:underline">
                Open VerifyMe User (full platform risk)
              </Link>
            ) : null}
          </div>
          {variant === "organization" ? (
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              User risk status is a platform-derived safety indicator. Organization Admin views do not show cross-organization
              details or full risk factors.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Session status</p>
          <div className="mt-1">
            <ProcessStatusBadge session={session} />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">ID proof result</p>
          <div className="mt-1">
            <OutcomeBadge session={session} />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Billing</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <BillableBadge billable={billable} />
            <span className="text-[12px] text-muted-foreground">{billingStatusLabel(session)}</span>
          </div>
        </div>
      </div>

      {session.sessionContextRiskLevel ? (
        <div className="rounded-md border border-border/80 bg-card px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Context: user risk</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <UserRiskStatusBadge level={session.sessionContextRiskLevel} />
            <span className="text-[12px] text-muted-foreground">
              Risk status is separate from the current proof result.
            </span>
          </div>
        </div>
      ) : null}

      {session.operatorScenarioNote?.trim() ? (
        <div className="rounded-md border border-primary/20 bg-primary/[0.04] px-3 py-2 text-[12px] text-foreground">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">Scenario note</p>
          <p className="mt-1 leading-relaxed">{session.operatorScenarioNote}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] text-muted-foreground uppercase">Cost</p>
          <p>
            {session.currency} {session.cost.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase">Attempts</p>
          <p>
            {session.attemptsUsed} / {session.maxAttempts}
          </p>
        </div>
      </div>

      <div>
        <p className="text-[11px] text-muted-foreground uppercase">Verification method</p>
        <p className="text-muted-foreground">End-user completes steps in VerifyMe; milestones only.</p>
      </div>

      <div>
        <p className="text-[11px] text-muted-foreground uppercase">redirect_uri</p>
        <code className="text-[11px] font-mono break-all block bg-muted p-2 rounded">{session.redirectUri}</code>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] text-muted-foreground uppercase">state (preview)</p>
          <code className="font-mono text-[12px]">{session.statePreview}</code>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase">nonce (preview)</p>
          <code className="font-mono text-[12px]">{session.noncePreview}</code>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] text-muted-foreground uppercase">Created</p>
          <p>{new Date(session.createdAt).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase">Completed</p>
          <p>{session.completedAt ? new Date(session.completedAt).toLocaleString() : "—"}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase">Expires</p>
          <p>{new Date(session.expiresAt).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase">Updated</p>
          <p>{new Date(session.updatedAt).toLocaleString()}</p>
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-[12px] font-semibold text-foreground mb-2">OIDC-style completion</p>
        <ul className="space-y-1 text-[13px] text-muted-foreground">
          <li>
            Authorization code issued:{" "}
            <strong className="text-foreground">{session.authorizationCodeIssued ? "Yes" : "No"}</strong> (value not
            shown)
          </li>
          <li>
            Token exchange:{" "}
            <strong className="text-foreground">{tokenExchangeLabel(session.tokenExchangeStatus)}</strong>
          </li>
          <li>
            id_token issued: <strong className="text-foreground">{session.idTokenIssued ? "Yes" : "No"}</strong> (
            <code className="text-[11px]">openid</code> scope only; raw token not shown)
          </li>
        </ul>
      </div>

      {session.failureReason && (
        <div className="rounded-md border border-amber-200 bg-amber-50/80 dark:bg-amber-950/30 px-3 py-2 text-[12px] text-amber-950 dark:text-amber-100">
          <strong className="text-foreground">Context:</strong> {session.failureReason}
        </div>
      )}

      <Separator />

      <div>
        <p className="text-[12px] font-semibold text-foreground mb-2">Timeline (safe milestones)</p>
        <SessionTimelineList events={session.timeline} />
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border pt-3">
        Secrets and raw tokens are never shown in admin portals.
      </p>

      {variant === "organization" && (
        <p className="text-[11px] text-muted-foreground">
          Scoped to this organization only; other organizations are not shown.
        </p>
      )}
    </div>
  );
}
