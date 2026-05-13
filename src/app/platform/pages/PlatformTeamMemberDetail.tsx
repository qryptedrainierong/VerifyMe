import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Button } from "../../shared/components/ui/button";
import { Card } from "../../shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/components/ui/tabs";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import { platformTeamSample, type PlatformTeamStatus } from "../data/platformTeamSample";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../shared/components/ui/dialog";
import { Input } from "../../shared/components/ui/input";
import { auditLogsHref } from "../utils/auditLogsNavigation";
import { usePlatformRole } from "../context/PlatformRoleContext";
import { canPerformPlatformAction, platformRoleLabel } from "../utils/platformRolePermissions";

export function PlatformTeamMemberDetail() {
  const { role } = usePlatformRole();
  const navigate = useNavigate();
  const { platformAdminId } = useParams();
  const [tab, setTab] = useState("profile");
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [typedConfirm, setTypedConfirm] = useState("");
  const seed = useMemo(() => platformTeamSample.find((m) => m.platformAdminId === platformAdminId), [platformAdminId]);
  const [memberState, setMemberState] = useState(seed ?? null);
  useEffect(() => setMemberState(seed ?? null), [seed]);
  const member = memberState;

  if (!member) {
    return <div className="p-8">Platform admin user not found.</div>;
  }

  const canMutateMember = canPerformPlatformAction(role, "manage_platform_team");

  const disableConfirmOk = typedConfirm.trim().toLowerCase() === member.platformAdminId.toLowerCase() || typedConfirm.trim().toLowerCase() === member.email.toLowerCase();
  const statusActions: Array<{ label: string; key: string; disabled?: boolean }> = [
    { label: "Suspend access", key: "suspend", disabled: member.status !== "active" || !canMutateMember },
    { label: "Reactivate access", key: "reactivate", disabled: member.status !== "suspended" || !canMutateMember },
    { label: "Disable account", key: "disable", disabled: member.status === "disabled" || !canMutateMember },
    { label: "Reset MFA", key: "reset_mfa", disabled: !canMutateMember },
    { label: "Force sign out", key: "force_sign_out", disabled: !canMutateMember },
  ];

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/platform-team")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Platform Team & Access
          </Button>
          <h1 className="text-3xl font-semibold">{member.fullName}</h1>
          <p className="text-sm text-muted-foreground">{member.email} · {member.platformAdminId}</p>
          <div className="mt-3 flex gap-2">
            <UnifiedBadge variant="role" value={member.role} />
            <UnifiedBadge variant="status" value={member.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Signed in as <span className="font-medium text-foreground">{platformRoleLabel(role)}</span> (preview). Member
            controls respect this preview role; production enforcement remains on the server.
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-8">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile & Status</TabsTrigger>
              <TabsTrigger value="role">Role & Permissions</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="activity">Access Activity</TabsTrigger>
              <TabsTrigger value="audit">Audit History</TabsTrigger>
              <TabsTrigger value="controls">User Controls</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <Card className="p-6"><dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-muted-foreground">Full name</dt><dd>{member.fullName}</dd></div>
                <div><dt className="text-muted-foreground">Email</dt><dd>{member.email}</dd></div>
                <div><dt className="text-muted-foreground">Platform Admin ID</dt><dd className="font-mono">{member.platformAdminId}</dd></div>
                <div><dt className="text-muted-foreground">Role</dt><dd>{member.role}</dd></div>
                <div><dt className="text-muted-foreground">Status</dt><dd>{member.status}</dd></div>
                <div><dt className="text-muted-foreground">Created at</dt><dd>{member.createdAt}</dd></div>
                <div><dt className="text-muted-foreground">Invited by</dt><dd>{member.invitedBy}</dd></div>
                <div><dt className="text-muted-foreground">Last login</dt><dd>{member.lastLoginAt ?? "Never"}</dd></div>
                <div><dt className="text-muted-foreground">Last activity</dt><dd>{member.lastActivityAt ?? "Never"}</dd></div>
              </dl></Card>
            </TabsContent>
            <TabsContent value="role">
              <Card className="p-6 space-y-3">
                <p className="text-sm"><strong>Current role:</strong> {member.role}</p>
                <p className="text-sm text-muted-foreground">{member.permissionsSummary}</p>
                <p className="text-sm"><strong>Restricted areas:</strong> {member.restrictedAreas.length > 0 ? member.restrictedAreas.join(", ") : "Not available"}</p>
                <Button size="sm" disabled={!canMutateMember} onClick={() => setConfirmAction("change_role")}>
                  Change role
                </Button>
              </Card>
            </TabsContent>
            <TabsContent value="security">
              <Card className="p-6 space-y-2 text-sm">
                <p><strong>MFA status:</strong> {member.mfaStatus}</p>
                <p><strong>Last login:</strong> {member.lastLoginAt ?? "Never"}</p>
                <p><strong>Active sessions:</strong> {member.activeSessionCount}</p>
                <p><strong>Last known device/browser:</strong> {member.lastKnownDeviceSummary}</p>
                <p><strong>Last known IP:</strong> {member.lastKnownIp ?? "Not available"}</p>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!canMutateMember}
                    onClick={() => setConfirmAction("reset_mfa")}
                  >
                    Reset MFA
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!canMutateMember}
                    onClick={() => setConfirmAction("force_sign_out")}
                  >
                    Force sign out
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!canMutateMember}
                    onClick={() => setConfirmAction("reset_recovery")}
                  >
                    Reset password / recovery flow
                  </Button>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="activity">
              <Card className="p-6"><ul className="space-y-2 text-sm">
                {member.recentActivity.map((item, i) => <li key={i}>{item}</li>)}
                <li>login</li>
                <li>failed login</li>
                <li>MFA reset requested</li>
                <li>role changed</li>
                <li>accessed audit logs</li>
                <li>reviewed risk</li>
                <li>rotated client secret</li>
              </ul></Card>
            </TabsContent>
            <TabsContent value="audit">
              <Card className="p-6">
                <Button asChild variant="outline">
                  <Link to={auditLogsHref({ entityType: "platform_admin", platformAdminId: member.platformAdminId })}>
                    View audit history
                  </Link>
                </Button>
              </Card>
            </TabsContent>
            <TabsContent value="controls">
              <Card className="p-6 space-y-3">
                {member.role === "Super Admin" && (
                  <p className="text-sm rounded border border-amber-300 bg-amber-50 px-3 py-2">
                    Warning: this is a Super Admin account.
                  </p>
                )}
                {!canMutateMember ? (
                  <p className="text-xs text-muted-foreground">
                    Mutations are disabled for the current preview role (for example Compliance / Auditor or Platform Admin
                    team limits).
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {statusActions.map((a) => (
                    <Button key={a.key} variant={a.key === "disable" ? "destructive" : "outline"} size="sm" disabled={a.disabled} onClick={() => setConfirmAction(a.key)}>
                      {a.label}
                    </Button>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Dialog open={confirmAction !== null} onOpenChange={(o) => !o && setConfirmAction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm action</DialogTitle>
            <DialogDescription>
              This action will be recorded in audit logs.
            </DialogDescription>
          </DialogHeader>
          {confirmAction === "disable" ? (
            <div className="space-y-2">
              <p className="text-sm">Type platform admin ID or email to confirm disable:</p>
              <Input value={typedConfirm} onChange={(e) => setTypedConfirm(e.target.value)} placeholder={`${member.platformAdminId} or ${member.email}`} />
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button disabled={confirmAction === "disable" ? !disableConfirmOk : false} onClick={() => {
              if (confirmAction === "suspend") setMemberState((prev) => (prev ? { ...prev, status: "suspended" as PlatformTeamStatus } : prev));
              if (confirmAction === "reactivate") setMemberState((prev) => (prev ? { ...prev, status: "active" as PlatformTeamStatus } : prev));
              if (confirmAction === "disable") setMemberState((prev) => (prev ? { ...prev, status: "disabled" as PlatformTeamStatus } : prev));
              setTypedConfirm("");
              setConfirmAction(null);
            }}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

