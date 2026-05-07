import { useMemo } from "react";
import { useNavigate } from "react-router";
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
import { enterpriseTeamRoleOptions, enterpriseTeamSample } from "../data/enterpriseTeamSample";

export function EnterpriseTeam() {
  const navigate = useNavigate();
  const teamMembers = enterpriseTeamSample;
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
      description="Organization portal users: Owner, Admin, Operations, Technical / API Manager, Finance / Billing, Compliance / Auditor. Each member has one role at a time."
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
              <DialogDescription>Add a new portal user to your organization.</DialogDescription>
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
                    {enterpriseTeamRoleOptions.map((role) => (
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-border shadow-sm">
          <p className="text-xs text-muted-foreground">Total users</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight">{stats.total}</p>
        </Card>
        <Card className="p-4 border border-border shadow-sm">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-green-700 dark:text-green-400">
            {stats.active}
          </p>
        </Card>
        <Card className="p-4 border border-border shadow-sm">
          <p className="text-xs text-muted-foreground">Admins</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight">{stats.admins}</p>
        </Card>
        <Card className="p-4 border border-border shadow-sm">
          <p className="text-xs text-muted-foreground">Pending invites</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-amber-700 dark:text-amber-400">
            {stats.pending}
          </p>
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
                <th className="p-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">Last active</th>
                <th className="p-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {teamMembers.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer hover:bg-accent/20"
                  onClick={(e) => {
                    if (shouldIgnoreRowOpenClick(e.target)) return;
                    navigate(`/team-roles/${row.id}`);
                  }}
                >
                  <td className="p-3">
                    <p className="font-medium">{row.fullName}</p>
                    <p className="text-[13px] text-muted-foreground">{row.email}</p>
                  </td>
                  <td className="p-3">
                    <UnifiedBadge variant="role" value={row.role} size="sm" />
                  </td>
                  <td className="p-3">{row.department}</td>
                  <td className="p-3">
                    <UnifiedBadge variant="status" value={row.status} />
                  </td>
                  <td className="p-3 text-muted-foreground">{row.lastActive}</td>
                  <td className="p-3 text-muted-foreground">{row.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PortalPageFrame>
  );
}
