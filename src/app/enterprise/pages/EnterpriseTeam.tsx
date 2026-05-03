import { UserPlus, Mail, MoreVertical } from "lucide-react";
import { DataTable } from "../../shared/components/DataTable";
import { StatusBadge } from "../../shared/components/StatusBadge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../shared/components/ui/dropdown-menu";

type EnterpriseRole =
  | "Super Admin"
  | "Admin"
  | "Operations"
  | "Technical / API Manager"
  | "Finance / Billing"
  | "Compliance / Auditor";

const enterpriseRoleOptions: EnterpriseRole[] = [
  "Super Admin",
  "Admin",
  "Operations",
  "Technical / API Manager",
  "Finance / Billing",
  "Compliance / Auditor",
];

export function EnterpriseTeam() {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      email: "sarah@company.com",
      role: "Super Admin",
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
      status: "inactive",
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
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-semibold text-foreground">Users</h2>
          <p className="text-[15px] text-muted-foreground mt-1">
            Manage your organization's portal users and roles
          </p>
        </div>
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 shadow-sm">
          <p className="text-[13px] text-muted-foreground mb-1">Total Users</p>
          <p className="text-[24px] font-semibold">24</p>
        </Card>
        <Card className="p-4 shadow-sm">
          <p className="text-[13px] text-muted-foreground mb-1">Active Now</p>
          <p className="text-[24px] font-semibold text-green-600">18</p>
        </Card>
        <Card className="p-4 shadow-sm">
          <p className="text-[13px] text-muted-foreground mb-1">Admins</p>
          <p className="text-[24px] font-semibold">3</p>
        </Card>
        <Card className="p-4 shadow-sm">
          <p className="text-[13px] text-muted-foreground mb-1">Pending Invites</p>
          <p className="text-[24px] font-semibold text-yellow-600">2</p>
        </Card>
      </div>

      {/* Team Table */}
      <DataTable
        columns={[
          {
            key: "name",
            label: "User",
            render: (row) => (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[14px] font-medium text-primary">
                    {row.name.split(" ").map((n: string) => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <p className="text-[14px] font-medium">{row.name}</p>
                  <p className="text-[13px] text-muted-foreground">{row.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: "role",
            label: "Role",
            render: (row) => (
              <UnifiedBadge variant="role" value={row.role} size="sm" />
            ),
          },
          { key: "department", label: "Department" },
          {
            key: "status",
            label: "Status",
            render: (row) => <StatusBadge status={row.status as any} />,
          },
          { 
            key: "lastActive", 
            label: "Last Active",
            render: (row) => (
              <span className="text-[13px] text-muted-foreground">{row.lastActive}</span>
            ),
          },
          { 
            key: "joined", 
            label: "Joined",
            render: (row) => (
              <span className="text-[13px] text-muted-foreground">{row.joined}</span>
            ),
          },
          {
            key: "actions",
            label: "",
            render: () => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit Role</DropdownMenuItem>
                  <DropdownMenuItem>Send Message</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
        data={teamMembers}
      />
    </div>
  );
}
