import { useState } from "react";
import { Link } from "react-router";
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
import { AuditHintText } from "../../shared/components/AuditHintText";
import { Button } from "../../shared/components/ui/button";
import { Card } from "../../shared/components/ui/card";
import { Badge } from "../../shared/components/ui/badge";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";
import { usePlatformRole } from "../context/PlatformRoleContext";
import { usePlatformOperatorExperience } from "../context/PlatformOperatorExperienceContext";
import { buildPlatformOperatorProfile, formatOperatorTimestamp, platformOperatorActiveSessions } from "../data/platformOperatorProfile";
import { canPerformOperatorSecurityAction } from "../utils/platformRolePermissions";

function sessionStatusBadge(status: string) {
  if (status === "current") {
    return <Badge className="border-transparent bg-emerald-600 text-white hover:bg-emerald-600/90">Current</Badge>;
  }
  if (status === "revoked") {
    return <Badge variant="outline">Revoked</Badge>;
  }
  return <Badge variant="secondary">Active</Badge>;
}

export function PlatformSecurity() {
  const { role } = usePlatformRole();
  const profile = buildPlatformOperatorProfile(role);
  const {
    securityActionFeedback,
    revokedSessionIds,
    revokeSession,
    signOutAllOtherSessions,
    setSecurityActionFeedback,
  } = usePlatformOperatorExperience();

  const canResetMfa = canPerformOperatorSecurityAction(role, "reset_mfa");
  const canPasswordReset = canPerformOperatorSecurityAction(role, "request_password_reset");
  const canRevokeOther = canPerformOperatorSecurityAction(role, "revoke_other_session");
  const canSignOutOthers = canPerformOperatorSecurityAction(role, "sign_out_all_other_sessions");

  const [mfaOpen, setMfaOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);
  const [signOutAllOpen, setSignOutAllOpen] = useState(false);

  const sessions = platformOperatorActiveSessions.map((s) => ({
    ...s,
    status: revokedSessionIds.has(s.id) ? ("revoked" as const) : s.status === "current" ? ("current" as const) : ("active" as const),
  }));

  return (
    <PortalPageFrame
      title="Security settings"
      description="Authentication posture and active sessions for this platform operator account. No secrets or credentials are shown here."
      bodyClassName="space-y-6"
    >
      {securityActionFeedback ? (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">{securityActionFeedback}</p>
      ) : null}

      <Card className="border border-border p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Authentication</h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex flex-wrap justify-between gap-2 border-b border-border py-2">
            <span className="text-muted-foreground">MFA status</span>
            <span className="font-medium capitalize text-foreground">{profile.mfaStatus}</span>
          </div>
          <div className="flex flex-wrap justify-between gap-2 border-b border-border py-2">
            <span className="text-muted-foreground">Password last changed</span>
            <span className="font-medium text-foreground tabular-nums">{formatOperatorTimestamp(profile.passwordLastChangedAt)}</span>
          </div>
          <div className="flex flex-wrap justify-between gap-2 py-2">
            <span className="text-muted-foreground">Recovery</span>
            <span className="font-medium capitalize text-foreground">{profile.recoveryStatus}</span>
          </div>
        </div>
        <p className="mt-3 text-[12px] text-muted-foreground leading-relaxed">
          Organization security policy controls lockout, MFA enrollment, and allowed authentication methods in production.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={!canResetMfa} onClick={() => canResetMfa && setMfaOpen(true)}>
            Reset MFA
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={!canPasswordReset} onClick={() => canPasswordReset && setPwdOpen(true)}>
            Request password reset
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/platform-preferences">Review recovery settings</Link>
          </Button>
        </div>
        {!canResetMfa ? (
          <p className="mt-2 text-[11px] text-muted-foreground">Credential changes are not available for this preview role.</p>
        ) : null}
        <div className="mt-3">
          <AuditHintText />
        </div>
      </Card>

      <Card className="border border-border p-5 shadow-sm" id="active-sessions">
        <h2 className="text-sm font-semibold text-foreground">Active sessions</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">Device and location are summarized; IP addresses are approximate.</p>
        <ul className="mt-4 space-y-3">
          {sessions.map((s) => (
            <li key={s.id} className="rounded-md border border-border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{s.label}</p>
                  <p className="text-[12px] text-muted-foreground">{s.browserDevice}</p>
                  <p className="text-[12px] text-muted-foreground">{s.locationSummary}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">
                    Last activity {formatOperatorTimestamp(s.lastActivityAt)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {sessionStatusBadge(s.status)}
                  {!s.isCurrent && s.status !== "revoked" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={!canRevokeOther}
                      onClick={() => canRevokeOther && setRevokeTarget(s.id)}
                    >
                      Revoke session
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="destructive" size="sm" disabled={!canSignOutOthers} onClick={() => canSignOutOthers && setSignOutAllOpen(true)}>
            Sign out all other sessions
          </Button>
        </div>
        <div className="mt-3">
          <AuditHintText />
        </div>
      </Card>

      <Card className="border border-border p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Security activity</h2>
        <ul className="mt-3 space-y-3">
          {profile.securityEvents.map((e) => (
            <li key={e.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
              <p className="text-sm font-medium text-foreground">{e.kind}</p>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{e.summary}</p>
              <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">{formatOperatorTimestamp(e.timestamp)}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="border border-border p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Governance notice</h2>
        <AuditHintText className="mt-2" text="Successful authentication changes and session revocations are recorded in audit logs in production environments." />
      </Card>

      <AlertDialog open={mfaOpen} onOpenChange={setMfaOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset MFA enrollment?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              This will start a new MFA enrollment flow for this operator. You will need a second factor to complete sign-in afterward.
              <AuditHintText className="text-xs" />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setMfaOpen(false);
                setSecurityActionFeedback("MFA reset queued in this preview. Production requires identity service integration and audit.");
                window.setTimeout(() => setSecurityActionFeedback(null), 6000);
              }}
            >
              Confirm reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={pwdOpen} onOpenChange={setPwdOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request password reset?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              A reset link or operator workflow will be issued according to policy. Passwords are never shown in the admin portal.
              <AuditHintText className="text-xs" />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setPwdOpen(false);
                setSecurityActionFeedback("Password reset requested in this preview only. Requires backend email or IdP flow.");
                window.setTimeout(() => setSecurityActionFeedback(null), 6000);
              }}
            >
              Confirm request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={revokeTarget !== null} onOpenChange={(o) => !o && setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke this session?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              The selected device will need to sign in again. The current session is not affected.
              <AuditHintText className="text-xs" />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (revokeTarget) revokeSession(revokeTarget);
                setRevokeTarget(null);
              }}
            >
              Revoke session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={signOutAllOpen} onOpenChange={setSignOutAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out all other sessions?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              Every session except this browser will be ended. Operators on other devices must authenticate again.
              <AuditHintText className="text-xs" />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setSignOutAllOpen(false);
                signOutAllOtherSessions();
              }}
            >
              Sign out others
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PortalPageFrame>
  );
}
