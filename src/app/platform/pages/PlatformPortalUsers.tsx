import { UserPlus, Search, Filter, MoreVertical, ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../../shared/components/ui/button";
import { Input } from "../../shared/components/ui/input";
import { Card } from "../../shared/components/ui/card";
import { Label } from "../../shared/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../shared/components/ui/dialog";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import { platformPortalUsers, type PlatformPortalUser } from "../data/platformUsersSample";

const statusLabel: Record<PlatformPortalUser["status"], "Active" | "Invited" | "Suspended"> = {
  active: "Active",
  invited: "Invited",
  suspended: "Suspended",
};

const roleOptions: PlatformPortalUser["role"][] = [
  "Owner",
  "Admin",
  "Operations Manager",
  "Support / Customer Success",
  "Finance / Billing Admin",
  "Security / Compliance Admin",
];

const roleAccess: Record<
PlatformPortalUser["role"],
{ summary: string; can: string[]; cannot: string[] }
> = {
  Owner: {
    summary: "Full control over VerifyMe platform operations, policy, billing, and access.",
    can: [
      "Create, edit, and deactivate organization accounts",
      "View all organization data and verification activity",
      "Access organization portals via view-as mode",
      "Configure system-wide security, policies, and integrations",
      "Manage billing rules and verification pricing",
      "Assign roles to platform users",
    ],
    cannot: [],
  },
  Admin: {
    summary: "Operational control for enterprise lifecycle and monitoring.",
    can: [
      "Manage enterprise accounts with limited editing",
      "Monitor transaction streams and verification logs",
      "Handle support tickets",
      "View analytics dashboards",
    ],
    cannot: ["Change core system configurations", "Change billing rules and pricing"],
  },
  "Operations Manager": {
    summary: "Day-to-day monitoring and investigation role.",
    can: [
      "Monitor live verification traffic",
      "Investigate failed verifications",
      "Generate operational reports",
      "Flag suspicious activity",
    ],
    cannot: ["Modify enterprise accounts", "Change system configurations"],
  },
  "Support / Customer Success": {
    summary: "Enterprise-facing support and onboarding role.",
    can: [
      "Respond to enterprise issues",
      "Support enterprise onboarding",
      "Guide configuration changes safely",
      "Access logs for troubleshooting",
    ],
    cannot: ["Edit sensitive security settings", "Change billing rules and pricing"],
  },
  "Finance / Billing Admin": {
    summary: "Billing and credit management role.",
    can: [
      "Manage plans, invoices, and credit top-ups",
      "Track verification and OTP-related billing",
      "Generate billing reports",
    ],
    cannot: ["Access verification data content", "Change system security configurations"],
  },
  "Security / Compliance Admin": {
    summary: "Security governance, audit, and compliance role.",
    can: [
      "Audit logs and access history",
      "Manage compliance policy controls (PDPA, GDPR)",
      "Investigate fraud and misuse",
      "Approve sensitive actions",
    ],
    cannot: ["Manage pricing and billing rules directly"],
  },
};

export function PlatformPortalUsers() {
  const [usersData, setUsersData] = useState<PlatformPortalUser[]>(platformPortalUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | PlatformPortalUser["role"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | PlatformPortalUser["status"]>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<PlatformPortalUser["role"]>("Operations Manager");
  const [selectedUser, setSelectedUser] = useState<PlatformPortalUser | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editingRoleUserId, setEditingRoleUserId] = useState<string | null>(null);
  const [nextRole, setNextRole] = useState<PlatformPortalUser["role"]>("Operations Manager");
  const [message, setMessage] = useState<string | null>(null);
  const ownerCount = useMemo(() => usersData.filter((user) => user.role === "Owner").length, [usersData]);

  const users = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return usersData.filter((user) => {
      const matchesQuery =
        query.length === 0
        || user.name.toLowerCase().includes(query)
        || user.email.toLowerCase().includes(query)
        || user.organizationScope.toLowerCase().includes(query);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [usersData, searchQuery, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    const totalUsers = usersData.length;
    const activeUsers = usersData.filter((user) => user.status === "active").length;
    const adminUsers = usersData.filter((user) => user.role === "Owner" || user.role === "Admin").length;
    const pendingInvites = usersData.filter((user) => user.status === "invited").length;
    return { totalUsers, activeUsers, adminUsers, pendingInvites };
  }, [usersData]);

  const formatDate = (dateString: string) =>
    new Date(`${dateString}T00:00:00Z`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(`${dateString}Z`);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMins < 60) return `${diffMins} min ago (UTC)`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago (UTC)`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago (UTC)`;
  };

  const resetCreateForm = () => {
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("Operations Manager");
  };

  const getNextUserId = () => {
    const maxId = usersData.reduce((max, user) => {
      const value = Number(user.id.replace("PLT-", ""));
      return Number.isNaN(value) ? max : Math.max(max, value);
    }, 0);
    return `PLT-${String(maxId + 1).padStart(3, "0")}`;
  };

  const handleCreateUser = () => {
    const name = newUserName.trim();
    const email = newUserEmail.trim().toLowerCase();
    if (!name || !email.includes("@")) {
      setMessage("Enter a valid name and email address.");
      return;
    }
    if (newUserRole === "Owner" && ownerCount >= 1) {
      setMessage("Only one Owner is allowed.");
      return;
    }

    const createdDate = new Date().toISOString().slice(0, 10);
    const createdUser: PlatformPortalUser = {
      id: getNextUserId(),
      name,
      email,
      role: newUserRole,
      status: "invited",
      organizationScope: "All Organizations",
      created: createdDate,
      lastLogin: null,
    };

    setUsersData((prev) => [createdUser, ...prev]);
    setIsCreateDialogOpen(false);
    setMessage(`${createdUser.name} created successfully.`);
    resetCreateForm();
  };

  const openEditRole = (user: PlatformPortalUser) => {
    setEditingRoleUserId(user.id);
    setNextRole(user.role);
  };

  const applyEditedRole = () => {
    if (!editingRoleUserId) return;
    const existingOwner = usersData.find((user) => user.role === "Owner");
    if (nextRole === "Owner" && existingOwner && existingOwner.id !== editingRoleUserId) {
      setMessage("Only one Owner is allowed.");
      return;
    }
    setUsersData((prev) =>
      prev.map((user) => {
        if (user.id !== editingRoleUserId) return user;
        setMessage(`${user.name} role updated to ${nextRole}.`);
        if (selectedUser?.id === user.id) {
          setSelectedUser({ ...user, role: nextRole });
        }
        return { ...user, role: nextRole };
      }),
    );
    setEditingRoleUserId(null);
  };

  const handleToggleStatus = (userId: string) => {
    setUsersData((prev) =>
      prev.map((user) => {
        if (user.id !== userId) return user;
        const nextStatus = user.status === "suspended" ? "active" : "suspended";
        setMessage(`${user.name} is now ${nextStatus}.`);
        return { ...user, status: nextStatus };
      }),
    );
  };

  const handleResetCredentials = (userId: string) => {
    setUsersData((prev) =>
      prev.map((user) => {
        if (user.id !== userId) return user;
        setMessage(`Credentials reset for ${user.name}.`);
        return { ...user, status: "invited", lastLogin: null };
      }),
    );
  };

  const handleRemoveUser = (userId: string) => {
    const user = usersData.find((item) => item.id === userId);
    if (!user) return;
    setUsersData((prev) => prev.filter((item) => item.id !== userId));
    setSelectedUser((prev) => (prev?.id === userId ? null : prev));
    if (selectedUser?.id === userId) {
      setIsDetailsDialogOpen(false);
    }
    setMessage(`${user.name} removed.`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 border-b border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-semibold text-foreground">VerifyMe platform users</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              Internal Qrypted / VerifyMe staff who operate the VerifyMe admin portal and organization lifecycle tools
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create User</DialogTitle>
                <DialogDescription>
                  Create a new portal-access user and assign their initial role and scope.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="new-user-name">Full Name</Label>
                  <Input
                    id="new-user-name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-user-email">Email</Label>
                  <Input
                    id="new-user-email"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="jane@verifyme.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as PlatformPortalUser["role"])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                      </SelectContent>
                    </Select>
                  <p className="text-xs text-muted-foreground">{roleAccess[newUserRole].summary}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Organization Scope</Label>
                  <Select value="All Organizations">
                    <SelectTrigger disabled>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Organizations">All Organizations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetCreateForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateUser}>Create User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {message && (
          <div className="mb-4 rounded-md border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm text-green-700 dark:text-green-300">
            {message}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
          <Card className="p-4 border border-border/70 shadow-none min-h-[92px]">
            <p className="text-xs text-muted-foreground">Total Users</p>
            <p className="text-xl font-semibold text-foreground mt-1">{stats.totalUsers}</p>
          </Card>
          <Card className="p-4 border border-border/70 shadow-none min-h-[92px]">
            <p className="text-xs text-muted-foreground">Active Users</p>
            <p className="text-xl font-semibold text-foreground mt-1">{stats.activeUsers}</p>
          </Card>
          <Card className="p-4 border border-border/70 shadow-none min-h-[92px]">
            <p className="text-xs text-muted-foreground">Admins</p>
            <p className="text-xl font-semibold text-foreground mt-1">{stats.adminUsers}</p>
          </Card>
          <Card className="p-4 border border-border/70 shadow-none min-h-[92px]">
            <p className="text-xs text-muted-foreground">Pending Invites</p>
            <p className="text-xl font-semibold text-foreground mt-1">{stats.pendingInvites}</p>
          </Card>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[240px] md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or scope..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-md border-border bg-input-background pl-9 text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as typeof roleFilter)}>
            <SelectTrigger className="h-10 w-[180px] rounded-md text-sm">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roleOptions.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
            <SelectTrigger className="h-10 w-[180px] rounded-md text-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="invited">Invited</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-md"
            onClick={() => {
              setSearchQuery("");
              setRoleFilter("all");
              setStatusFilter("all");
            }}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                {selectedUser ? `${selectedUser.name} • ${selectedUser.email}` : "Portal user details"}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="rounded-md border border-border bg-accent/5 px-4 py-3 text-sm">
                  <p className="font-medium text-foreground">{selectedUser.name}</p>
                  <p className="text-muted-foreground">
                    {selectedUser.email} • {selectedUser.role} • {selectedUser.organizationScope}
                  </p>
                  <p className="text-muted-foreground mt-1">{roleAccess[selectedUser.role].summary}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border border-border p-3">
                    <p className="text-xs font-medium text-foreground mb-2">Can View & Do</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {roleAccess[selectedUser.role].can.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-md border border-border p-3">
                    <p className="text-xs font-medium text-foreground mb-2">Restrictions</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {(roleAccess[selectedUser.role].cannot.length > 0
                        ? roleAccess[selectedUser.role].cannot
                        : ["No restrictions"]).map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={editingRoleUserId !== null} onOpenChange={(open) => !open && setEditingRoleUserId(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription>Select the role you want to assign to this user.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Label>Role</Label>
              <Select value={nextRole} onValueChange={(value) => setNextRole(value as PlatformPortalUser["role"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{roleAccess[nextRole].summary}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingRoleUserId(null)}>Cancel</Button>
              <Button onClick={applyEditedRole}>Save Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Card className="m-8 border border-border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-accent/5 sticky top-0 z-10">
                <tr>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                      User
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">Role</th>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">Organization Scope</th>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">Status</th>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">Last Login</th>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">Created</th>
                  <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase w-[60px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-accent/5 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="text-[14px] font-medium text-foreground">{user.name}</p>
                        <p className="text-[12px] text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <UnifiedBadge variant="role" value={user.role} />
                    </td>
                    <td className="p-4">
                      <p className="text-[14px] text-foreground">{user.organizationScope}</p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <UnifiedBadge variant="status" value={statusLabel[user.status]} />
                    </td>
                    <td className="p-4">
                      <p className="text-[14px] text-foreground">{formatRelativeTime(user.lastLogin)}</p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <p className="text-[14px] text-foreground">{formatDate(user.created)}</p>
                    </td>
                    <td className="p-4 align-top">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDetailsDialogOpen(true);
                            }}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditRole(user)}>Edit Role</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(user.id)}>
                            {user.status === "suspended" ? "Activate User" : "Suspend User"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetCredentials(user.id)}>Reset Credentials</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleRemoveUser(user.id)}>
                            Remove User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-10 text-center">
                      <p className="text-sm font-medium text-foreground">No users found</p>
                      <p className="text-xs text-muted-foreground mt-1">Try clearing search or filter values.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
