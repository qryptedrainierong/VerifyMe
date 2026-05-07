import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../../shared/components/ui/button";
import { Card } from "../../shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/components/ui/tabs";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shared/components/ui/select";
import {
  enterpriseTeamSample,
  enterpriseTeamRoleOptions,
  type EnterpriseTeamMember,
  type EnterpriseTeamMemberStatus,
  type EnterpriseTeamRole,
} from "../data/enterpriseTeamSample";

export function EnterpriseTeamMemberDetail() {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const [tab, setTab] = useState("profile");
  const seed = useMemo(() => enterpriseTeamSample.find((m) => m.id === memberId), [memberId]);
  const [memberState, setMemberState] = useState<EnterpriseTeamMember | null>(seed ?? null);
  useEffect(() => setMemberState(seed ?? null), [seed]);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [changeRole, setChangeRole] = useState<EnterpriseTeamRole>("Admin");

  const member = memberState;
  if (!member) {
    return <div className="p-8 text-sm text-muted-foreground">Team member not found.</div>;
  }

  const auditHint = "This action will be recorded in audit logs in a production deployment.";

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/team-roles")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Team & Roles
          </Button>
          <h1 className="text-3xl font-semibold">{member.fullName}</h1>
          <p className="text-sm text-muted-foreground">{member.email}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <UnifiedBadge variant="role" value={member.role} />
            <UnifiedBadge variant="status" value={member.status} />
            <UnifiedBadge variant="integration" value={`MFA: ${member.mfaStatus.replace(/_/g, " ")}`} />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-8">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-6 flex flex-wrap h-auto gap-1">
              <TabsTrigger value="profile">Profile & Status</TabsTrigger>
              <TabsTrigger value="role">Role & Permissions</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="controls">User Controls</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <Card className="p-6 border border-border shadow-sm">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Full name</dt>
                    <dd className="font-medium">{member.fullName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd>{member.email}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Department</dt>
                    <dd>{member.department}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Joined</dt>
                    <dd>{member.joined}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Last activity</dt>
                    <dd>{member.lastActive}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Last login</dt>
                    <dd>{member.lastLoginAt ?? "Never"}</dd>
                  </div>
                </dl>
              </Card>
            </TabsContent>
            <TabsContent value="role">
              <Card className="p-6 border border-border shadow-sm space-y-4">
                <p className="text-sm">
                  <span className="font-medium">Current role:</span> {member.role}
                </p>
                <p className="text-sm text-muted-foreground">{member.permissionsSummary}</p>
                <p className="text-xs text-muted-foreground">Each organization user has one role at a time.</p>
                <div className="flex flex-wrap items-end gap-2">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">New role</p>
                    <Select value={changeRole} onValueChange={(v) => setChangeRole(v as EnterpriseTeamRole)}>
                      <SelectTrigger className="w-[240px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {enterpriseTeamRoleOptions.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button size="sm" onClick={() => setConfirmAction("change_role")} disabled={changeRole === member.role}>
                    Change role
                  </Button>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="security">
              <Card className="p-6 border border-border shadow-sm space-y-2 text-sm">
                <p>
                  <span className="font-medium">MFA:</span> {member.mfaStatus.replace(/_/g, " ")}
                </p>
                <p>
                  <span className="font-medium">Last login:</span> {member.lastLoginAt ?? "Never"}
                </p>
                <p className="text-xs text-muted-foreground pt-2">
                  Passwords and recovery secrets are never shown in this portal.
                </p>
              </Card>
            </TabsContent>
            <TabsContent value="activity">
              <Card className="p-6 border border-border shadow-sm">
                <ul className="space-y-2 text-sm">
                  {member.recentActivity.length === 0 ? (
                    <li className="text-muted-foreground">No recent activity recorded for this account.</li>
                  ) : (
                    member.recentActivity.map((item, i) => <li key={i}>{item}</li>)
                  )}
                </ul>
              </Card>
            </TabsContent>
            <TabsContent value="controls">
              <Card className="p-6 border border-border shadow-sm space-y-3">
                <div className="flex flex-wrap gap-2">
                  {member.status === "pending" && (
                    <Button variant="outline" size="sm" onClick={() => setConfirmAction("resend_invite")}>
                      Resend invite
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmAction("suspend_access")}
                    disabled={member.status !== "active"}
                  >
                    Suspend access
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setConfirmAction("disable_access")}
                    disabled={member.status === "disabled"}
                  >
                    Disable access
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{auditHint}</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={confirmAction !== null} onOpenChange={(o) => !o && setConfirmAction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "change_role" && "Change role?"}
              {confirmAction === "resend_invite" && "Resend invite?"}
              {confirmAction === "suspend_access" && "Suspend access?"}
              {confirmAction === "disable_access" && "Disable access?"}
            </DialogTitle>
            <DialogDescription className="space-y-2 text-left">
              {confirmAction === "change_role" && (
                <>
                  <p>
                    Assign <strong>{changeRole}</strong> to {member.email}. Previous permissions no longer apply.
                  </p>
                  <p className="text-xs">{auditHint}</p>
                </>
              )}
              {confirmAction === "resend_invite" && (
                <>
                  <p>Send another invitation email to {member.email}.</p>
                  <p className="text-xs">{auditHint}</p>
                </>
              )}
              {confirmAction === "suspend_access" && (
                <>
                  <p>This user cannot sign in until access is reactivated.</p>
                  <p className="text-xs">{auditHint}</p>
                </>
              )}
              {confirmAction === "disable_access" && (
                <>
                  <p>Disabling access blocks sign-in until an administrator re-enables the account.</p>
                  <p className="text-xs">{auditHint}</p>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmAction === "disable_access" ? "destructive" : "default"}
              onClick={() => {
                if (confirmAction === "change_role") {
                  setMemberState((prev) => (prev ? { ...prev, role: changeRole } : prev));
                }
                if (confirmAction === "suspend_access") {
                  setMemberState((prev) => (prev ? { ...prev, status: "suspended" as EnterpriseTeamMemberStatus } : prev));
                }
                if (confirmAction === "disable_access") {
                  setMemberState((prev) => (prev ? { ...prev, status: "disabled" as EnterpriseTeamMemberStatus } : prev));
                }
                setConfirmAction(null);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
