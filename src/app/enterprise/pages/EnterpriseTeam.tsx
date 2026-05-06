import { useMemo, useState } from "react";
import { UserPlus, Mail } from "lucide-react";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import { Button } from "../../shared/components/ui/button";
import { Card } from "../../shared/components/ui/card";
import { Input } from "../../shared/components/ui/input";
import { Label } from "../../shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shared/components/ui/select";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";
import { shouldIgnoreRowOpenClick } from "../../platform/utils/tableRowNav";

type EnterpriseRole =
  | "Owner"
  | "Admin"
  | "Operations"
  | "Technical / API Manager"
  | "Finance / Billing"
  | "Compliance / Auditor";

const enterpriseRoleOptions: EnterpriseRole[] = [
  "Owner",
  "Admin",
  "Operations",
  "Technical / API Manager",
  "Finance / Billing",
  "Compliance / Auditor",
];

export function EnterpriseTeam() {
  const [detail, setDetail] = useState<any | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ action: string; member: any } | null>(null);
  const [changeRole, setChangeRole] = useState<EnterpriseRole>("Admin");
  const teamMembers = [
    {
      name: "Sarah Johnson",
      email: "sarah@company.com",
      role: "Owner",
      department: "Marketing",
      status: "active",
      joined: "Jan 15, 2024",
      lastActive: "Online now",
    },
    {
      name: "Michael Chen",
      email: "michael@company.com",
      role: "Admin",
      department: "Engineering",
      status: "active",
      joined: "Jan 20, 2024",
      lastActive: "5 min ago",
    },
    {
      name: "Emily Davis",
      email: "emily@company.com",
      role: "Operations",
      department: "Design",
      status: "active",
      joined: "Feb 1, 2024",
      lastActive: "1 hour ago",
    },
    {
      name: "James Wilson",
      email: "james@company.com",
      role: "Compliance / Auditor",
      department: "Sales",
      status: "suspended",
      joined: "Dec 10, 2023",
      lastActive: "2 days ago",
    },
    {
      name: "Lisa Anderson",
      email: "lisa@company.com",
      role: "Finance / Billing",
      department: "Operations",
      status: "active",
      joined: "Nov 5, 2023",
      lastActive: "10 min ago",
    },
    {
      name: "David Brown",
      email: "david@company.com",
      role: "Technical / API Manager",
      department: "Engineering",
      status: "active",
      joined: "Feb 15, 2024",
      lastActive: "30 min ago",
    },
    {
      name: "Priya Kapoor",
      email: "priya@company.com",
      role: "Operations",
      department: "Support",
      status: "pending",
      joined: "Apr 2, 2024",
      lastActive: "Never",
    },
    {
      name: "Ramon Cruz",
      email: "ramon@company.com",
      role: "Admin",
      department: "Security",
      status: "disabled",
      joined: "Jan 3, 2024",
      lastActive: "Apr 12, 2024",
    },
  ];
  const stats = useMemo(
    () => ({
      total: teamMembers.length,
      active: teamMembers.filter((m) => m.status === "active").length,
      admins: teamMembers.filter((m) => m.role === "Owner" || m.role === "Admin").length,
      pending: teamMembers.filter((m) => m.status === "pending").length,
    }),
    [teamMembers],
  );

  return (
    <PortalPageFrame
      title="Team & Roles"
      description="Organization portal users: Owner, Admin, Operations, Technical / API Manager, Finance / Billing, Compliance / Auditor. Each member has one role at a time (MVP — no multi-role assignments)."
      headerActions={
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create User</DialogTitle>
              <DialogDescription>
                Add a new portal user to your organization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="colleague@company.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {enterpriseRoleOptions.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department (Optional)</Label>
                <Input id="department" placeholder="e.g., Engineering" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>
                <Mail className="w-4 h-4 mr-2" />
                    Create User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
      bodyClassName="max-w-7xl space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 shadow-sm">
          <p className="text-[13px] text-muted-foreground mb-1">Total Users</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight">{stats.total}</p>
        </Card>
        <Card className="p-4 shadow-sm">
          <p className="text-[13px] text-muted-foreground mb-1">Active Now</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-green-600">{stats.active}</p>
        </Card>
        <Card className="p-4 shadow-sm">
          <p className="text-[13px] text-muted-foreground mb-1">Admins</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight">{stats.admins}</p>
        </Card>
        <Card className="p-4 shadow-sm">
          <p className="text-[13px] text-muted-foreground mb-1">Pending Invites</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-yellow-600">{stats.pending}</p>
        </Card>
      </div>

      <Card className="border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-accent/40">
              <tr>
                <th className="p-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">User</th>
                <th className="p-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">Role</th>
                <th className="p-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">Department</th>
                <th className="p-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">Status</th>
                <th className="p-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">Last Active</th>
                <th className="p-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {teamMembers.map((row) => (
                <tr
                  key={row.email}
                  className="cursor-pointer hover:bg-accent/20"
                  onClick={(e) => {
                    if (shouldIgnoreRowOpenClick(e.target)) return;
                    setDetail(row);
                    setChangeRole(row.role as EnterpriseRole);
                  }}
                >
                  <td className="p-3">
                    <p className="font-medium">{row.name}</p>
                    <p className="text-[13px] text-muted-foreground">{row.email}</p>
                  </td>
                  <td className="p-3"><UnifiedBadge variant="role" value={row.role} size="sm" /></td>
                  <td className="p-3">{row.department}</td>
                  <td className="p-3"><UnifiedBadge variant="status" value={row.status} /></td>
                  <td className="p-3 text-muted-foreground">{row.lastActive}</td>
                  <td className="p-3 text-muted-foreground">{row.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>Team member detail</DialogTitle>
                <DialogDescription>Role, activity, and user controls.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div><p className="text-xs text-muted-foreground">Profile</p><p>{detail.name} · {detail.email}</p></div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Role & Permissions</p>
                  <Select value={changeRole} onValueChange={(v) => setChangeRole(v as EnterpriseRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{enterpriseRoleOptions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button size="sm" className="mt-2" onClick={() => setConfirmAction({ action: "change_role", member: detail })}>
                    Change role
                  </Button>
                </div>
                <div><p className="text-xs text-muted-foreground">Activity</p><p>{detail.lastActive}</p></div>
                <div className="flex flex-wrap gap-2">
                  {detail.status === "pending" && (
                    <Button variant="outline" size="sm" onClick={() => setConfirmAction({ action: "resend_invite", member: detail })}>
                      Resend invite
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setConfirmAction({ action: "suspend_access", member: detail })}>
                    Suspend access
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setConfirmAction({ action: "disable_access", member: detail })}>
                    Disable access
                  </Button>
                </div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setDetail(null)}>Close</Button></DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={confirmAction !== null} onOpenChange={(o) => !o && setConfirmAction(null)}>
        <DialogContent className="max-w-md">
          {confirmAction && (
            <>
              <DialogHeader>
                <DialogTitle>Confirm change</DialogTitle>
                <DialogDescription>{confirmAction.action.replace("_", " ")} for {confirmAction.member.email}?</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
                <Button onClick={() => setConfirmAction(null)}>Confirm</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PortalPageFrame>
  );
}
