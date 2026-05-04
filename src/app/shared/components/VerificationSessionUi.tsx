import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { UnifiedBadge } from "./UnifiedBadge";
import {
  BILLABLE_OUTCOMES,
  channelLabel,
  isOutcomeBillable,
  lifecycleLabel,
  outcomeLabel,
  tokenExchangeLabel,
  type MockVerificationSession,
} from "../data/verificationSessionsMock";

export function VerificationBillingCallout() {
  return (
    <Card className="p-4 border border-border bg-muted/20 shadow-sm">
      <p className="text-[13px] font-semibold text-foreground mb-2">Billable outcomes</p>
      <ul className="text-[12px] text-muted-foreground space-y-1 list-disc list-inside mb-3">
        <li>
          <strong className="text-foreground">
            {BILLABLE_OUTCOMES.map((o) => outcomeLabel(o)).join(" and ")}
          </strong>{" "}
          are billable.
        </li>
        <li>
          <strong className="text-foreground">Expired</strong>, <strong className="text-foreground">Error</strong>,{" "}
          <strong className="text-foreground">Indeterminate</strong>, and <strong className="text-foreground">Cancelled</strong>{" "}
          are not billable.
        </li>
        <li>
          <strong className="text-foreground">Pending</strong> sessions are not billable until a final outcome is recorded.
        </li>
      </ul>
      <p className="text-[12px] text-muted-foreground leading-relaxed border-t border-border pt-3">
        Failed verifications are billable because VerifyMe delivered a conclusive security decision. Expired, error,
        indeterminate, and cancelled sessions are not billable because VerifyMe did not deliver a conclusive verification
        result suitable for billing.
      </p>
    </Card>
  );
}

export function BillableBadge({ billable }: { billable: boolean }) {
  return (
    <UnifiedBadge variant="status" value={billable ? "Billable" : "Not billable"} />
  );
}

export function OutcomeBadge({ outcome }: { outcome: MockVerificationSession["outcome"] }) {
  return <UnifiedBadge variant="status" value={outcomeLabel(outcome)} />;
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

export function VerificationSessionDetailBody({
  session,
  variant,
}: {
  session: MockVerificationSession;
  variant: DetailVariant;
}) {
  const billable = isOutcomeBillable(session.outcome);

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
            <p className="text-[11px] font-mono text-muted-foreground">{session.organizationId}</p>
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
          <p className="text-[11px] text-muted-foreground uppercase">Customer name</p>
          <p>{session.customerName}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] text-muted-foreground uppercase">VerifyMe identity (masked)</p>
          <p className="font-mono">{session.maskedVerifyMeUserId ?? "—"}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase">Channel</p>
          <p>{channelLabel(session.channel)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[11px] text-muted-foreground uppercase">Lifecycle</span>
        <UnifiedBadge variant="status" value={lifecycleLabel(session.status)} />
        <span className="text-[11px] text-muted-foreground uppercase">Outcome</span>
        <OutcomeBadge outcome={session.outcome} />
        <span className="text-[11px] text-muted-foreground uppercase">Billable</span>
        <BillableBadge billable={billable} />
      </div>

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
        <p className="text-[11px] text-muted-foreground uppercase">Verification method (summary)</p>
        <p className="text-muted-foreground">End-user completes steps in the VerifyMe mobile app; this portal shows flow milestones only.</p>
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
            id_token issued: <strong className="text-foreground">{session.idTokenIssued ? "Yes" : "No"}</strong> (only{" "}
            <code className="text-[11px]">openid</code> scope in MVP; raw token not shown)
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
        Sensitive verification material (passcode, OTP contents, biometric samples, generated verification token value,
        Encrypted_Auth_Cred, Transaction_Code, raw authorization code, client_secret, private keys, and raw id_token) is
        never displayed in admin portals.
      </p>

      {variant === "organization" && (
        <p className="text-[11px] text-muted-foreground">
          Organization view is scoped to this tenant only. Full VerifyMe user email, global profile, and other
          organizations are not shown.
        </p>
      )}
    </div>
  );
}
