import { Search, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../../shared/components/ui/button";
import { Input } from "../../shared/components/ui/input";
import { Card } from "../../shared/components/ui/card";
import { Label } from "../../shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from "../../shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../shared/components/ui/dropdown-menu";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import { enterpriseEndUsers, enterpriseOrganization } from "../data/enterpriseSample";

// Interface for enterprise end users
interface EnterpriseUser {
  id: string;
  username: string;
  verifymeUsername: string;
  status: "active" | "suspended";
  apiCalls: number;
  lastActive: string | null;
  created: string;
}

export function EnterpriseEndUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<EnterpriseUser | null>(null);

  const enterpriseUsers: EnterpriseUser[] = enterpriseEndUsers.map((user) => ({
    id: user.id,
    username: user.enterpriseUsername,
    verifymeUsername: user.verifymeUsername,
    status: user.status === "pending" ? "suspended" : user.status,
    apiCalls: user.apiCalls,
    lastActive: user.lastActive,
    created: user.created,
  }));

  // Calculate stats
  const totalUsers = enterpriseUsers.length;
  const activeUsers = enterpriseUsers.filter(u => u.status === "active").length;
  const suspendedUsers = enterpriseUsers.filter(u => u.status === "suspended").length;
  const totalApiCalls = enterpriseUsers.reduce((sum, u) => sum + u.apiCalls, 0);

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return "Never";

    const date = new Date(dateString + 'Z'); // Parse as UTC
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min ago (UTC)`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago (UTC)`;
    } else {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago (UTC)`;
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-semibold text-foreground">End Users</h2>
          <p className="text-[15px] text-muted-foreground mt-1">
            Manage end users for {enterpriseOrganization.name}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-10 bg-background"
        />
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 shadow-sm">
          <p className="text-[13px] text-muted-foreground mb-1">Total Users</p>
          <p className="text-[24px] font-semibold">{totalUsers}</p>
        </Card>
        <Card className="p-4 shadow-sm">
          <p className="text-[13px] text-muted-foreground mb-1">Active Users</p>
          <p className="text-[24px] font-semibold text-green-600">{activeUsers}</p>
        </Card>
        <Card className="p-4 shadow-sm">
          <p className="text-[13px] text-muted-foreground mb-1">Suspended</p>
          <p className="text-[24px] font-semibold text-red-600">{suspendedUsers}</p>
        </Card>
        <Card className="p-4 shadow-sm">
          <p className="text-[13px] text-muted-foreground mb-1">Total API Calls</p>
          <p className="text-[24px] font-semibold">{(totalApiCalls / 1000).toFixed(1)}K</p>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="border border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-accent/5">
              <tr>
                <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                  Enterprise Username
                </th>
                <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                  VerifyMe Username
                </th>
                <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                  API Calls
                </th>
                <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                  Last Active
                </th>
                <th className="text-left p-4 text-[13px] font-medium text-muted-foreground w-[60px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {enterpriseUsers.map((user) => (
                <tr key={user.id} className="hover:bg-accent/5 transition-colors">
                  <td className="p-4">
                    <p className="text-[14px] font-medium text-foreground font-mono">
                      {user.username}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-[14px] text-foreground font-mono">{user.verifymeUsername}</p>
                  </td>
                  <td className="p-4">
                    <UnifiedBadge
                      variant="status"
                      value={user.status === "active" ? "Active" : "Suspended"}
                    />
                  </td>
                  <td className="p-4">
                    <p className="text-[14px] font-medium text-foreground">
                      {user.apiCalls.toLocaleString()}
                    </p>
                    <p className="text-[12px] text-muted-foreground">this month</p>
                  </td>
                  <td className="p-4">
                    <p className="text-[14px] text-foreground">
                      {formatRelativeTime(user.lastActive)}
                    </p>
                  </td>
                  <td className="p-4">
                    <Dialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={() => setEditingUser(user)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DropdownMenuItem>View Usage Details</DropdownMenuItem>
                          <DropdownMenuItem>
                            {user.status === "active" ? "Suspend User" : "Activate User"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Edit User</DialogTitle>
                          <DialogDescription>
                            Update user information
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-username">Enterprise Username</Label>
                            <Input
                              id="edit-username"
                              defaultValue={editingUser?.username || ""}
                              placeholder="username"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-verifymeUsername">VerifyMe Username</Label>
                            <Input
                              id="edit-verifymeUsername"
                              defaultValue={editingUser?.verifymeUsername || ""}
                              placeholder="user.vm"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline">Cancel</Button>
                          <Button>Update User</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}