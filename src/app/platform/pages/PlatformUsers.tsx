import { Search, Filter, MoreVertical, ArrowUpDown, ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { Button } from "../../shared/components/ui/button";
import { Input } from "../../shared/components/ui/input";
import { Card } from "../../shared/components/ui/card";
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
} from "../../shared/components/ui/dialog";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import { platformEndUserAssociations } from "../data/platformUsersSample";
import {
  groupAssociationsByVerifymeUsername,
} from "../data/groupEndUsers";

export function PlatformUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("all-orgs");
  const [statusFilter, setStatusFilter] = useState("all-status");
  const [usersData, setUsersData] = useState(platformEndUserAssociations);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedVerifymeUsername, setSelectedVerifymeUsername] = useState<string | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});

  const qualifyingAssociations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return usersData.filter((user) => {
      const matchesQuery =
        query.length === 0
        || user.verifymeUsername.toLowerCase().includes(query)
        || user.enterpriseUsername.toLowerCase().includes(query)
        || user.email.toLowerCase().includes(query)
        || user.organization.toLowerCase().includes(query);
      const matchesOrg =
        organizationFilter === "all-orgs" || user.organizationId === organizationFilter;
      const matchesStatus = statusFilter === "all-status" || user.status === statusFilter;
      return matchesQuery && matchesOrg && matchesStatus;
    });
  }, [usersData, searchQuery, organizationFilter, statusFilter]);

  const groupedUsers = useMemo(() => {
    const usernames = new Set(qualifyingAssociations.map((a) => a.verifymeUsername));
    const allGrouped = groupAssociationsByVerifymeUsername(usersData);
    return allGrouped.filter((g) => usernames.has(g.verifymeUsername));
  }, [usersData, qualifyingAssociations]);

  const selectedUserLinks = useMemo(() => {
    if (!selectedVerifymeUsername) return [];
    return usersData.filter((u) => u.verifymeUsername === selectedVerifymeUsername);
  }, [usersData, selectedVerifymeUsername]);

  const selectedRowGroup = useMemo(() => {
    if (selectedUserLinks.length === 0) return null;
    return groupAssociationsByVerifymeUsername(selectedUserLinks)[0] ?? null;
  }, [selectedUserLinks]);

  const organizationOptions = useMemo(() => {
    const unique = new Map<string, string>();
    usersData.forEach((user) => unique.set(user.organizationId, user.organization));
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
  }, [usersData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'Z').toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

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

  const toggleUserStatus = (verifymeUsername: string) => {
    const links = usersData.filter((user) => user.verifymeUsername === verifymeUsername);
    if (links.length === 0) return;
    const group = groupAssociationsByVerifymeUsername(links)[0];
    if (!group) return;
    const linkedCount = links.length;
    const nextStatus = group.rowStatus === "suspended" ? "active" : "suspended";
    setUsersData((prev) =>
      prev.map((user) =>
        user.verifymeUsername === verifymeUsername ? { ...user, status: nextStatus } : user,
      ),
    );
    setMessage(`${verifymeUsername} is now ${nextStatus} across ${linkedCount} linked organization${linkedCount > 1 ? "s" : ""}.`);
  };

  const resetCredentials = (verifymeUsername: string) => {
    const target = usersData.find((user) => user.verifymeUsername === verifymeUsername);
    if (!target) return;
    const linkedCount = usersData.filter((user) => user.verifymeUsername === verifymeUsername).length;
    setUsersData((prev) =>
      prev.map((user) =>
        user.verifymeUsername === verifymeUsername
          ? { ...user, status: "pending", lastActive: null }
          : user,
      ),
    );
    setMessage(`Credentials reset for ${verifymeUsername} across ${linkedCount} linked organization${linkedCount > 1 ? "s" : ""}.`);
  };

  const removeUser = (verifymeUsername: string) => {
    const linkedCount = usersData.filter((item) => item.verifymeUsername === verifymeUsername).length;
    setUsersData((prev) => prev.filter((item) => item.verifymeUsername !== verifymeUsername));
    setSelectedVerifymeUsername((prev) => (prev === verifymeUsername ? null : prev));
    setMessage(`${verifymeUsername} removed from ${linkedCount} linked organization${linkedCount > 1 ? "s" : ""}.`);
  };

  const rowStatusLabel = (status: "active" | "pending" | "suspended") =>
    status === "active" ? "Active" : status === "pending" ? "Pending" : "Suspended";

  const getEnterpriseUsername = (enterpriseUsername: string, organizationId: string) => {
    const value = enterpriseUsername.trim();
    return value.length > 0 ? value : `org_user_${organizationId.toLowerCase()}`;
  };

  const toggleExpanded = (verifymeUsername: string) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [verifymeUsername]: !prev[verifymeUsername],
    }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-8 border-b border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-semibold text-foreground">VerifyMe Users</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              Manage global VerifyMe end-user accounts, email and device status, linked organizations, recovery, and
              verification history (design-time sample data).
            </p>
          </div>
        </div>
        {message && (
          <div className="mb-4 rounded-md border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm text-green-700 dark:text-green-300">
            {message}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-background"
            />
          </div>

          <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
            <SelectTrigger className="w-[200px] h-10">
              <SelectValue placeholder="All Organizations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-orgs">All Organizations</SelectItem>
              {organizationOptions.map((organization) => (
                <SelectItem key={organization.id} value={organization.id}>
                  {organization.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>


          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-status">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => {
              setSearchQuery("");
              setOrganizationFilter("all-orgs");
              setStatusFilter("all-status");
            }}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Card className="m-8 border border-border shadow-sm">
          <div className="overflow-x-auto min-w-[900px]">
            <table className="w-full">
              <thead className="border-b border-border bg-accent/5">
                <tr>
                  <th className="text-left p-4 text-[13px] font-medium text-muted-foreground min-w-[320px]">
                    <button type="button" className="flex items-center gap-1 hover:text-foreground transition-colors">
                      VerifyMe Username
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                    <button type="button" className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Email
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                    <button type="button" className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Total API Calls
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                    <button type="button" className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Last Active
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-[13px] font-medium text-muted-foreground w-[60px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {groupedUsers.map((group) => {
                  const isExpanded = !!expandedUsers[group.verifymeUsername];
                  const memberships = group.memberships;

                  return (
                    <Fragment key={group.verifymeUsername}>
                      <tr className="hover:bg-accent/5 transition-colors">
                        <td className="p-4 align-top">
                          <button
                            type="button"
                            className="w-full flex items-center gap-2 text-left"
                            onClick={() => toggleExpanded(group.verifymeUsername)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                            )}
                            <span className="text-[14px] font-medium text-foreground font-mono">
                              {group.verifymeUsername}
                            </span>
                          </button>
                        </td>
                        <td className="p-4 align-top">
                          <p className="text-[14px] text-foreground">{group.email}</p>
                        </td>
                        <td className="p-4 align-top">
                          <UnifiedBadge
                            variant="status"
                            value={rowStatusLabel(group.rowStatus)}
                          />
                        </td>
                        <td className="p-4 align-top">
                          <p className="text-[14px] font-medium text-foreground tabular-nums">
                            {group.totalApiCalls.toLocaleString()}
                          </p>
                        </td>
                        <td className="p-4 align-top">
                          <p className="text-[14px] text-foreground">
                            {formatRelativeTime(group.lastActiveMax)}
                          </p>
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
                                onClick={() => setSelectedVerifymeUsername(group.verifymeUsername)}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => toggleUserStatus(group.verifymeUsername)}
                              >
                                {group.rowStatus === "suspended" ? "Activate User" : "Suspend User"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => resetCredentials(group.verifymeUsername)}
                              >
                                Reset Credentials
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => removeUser(group.verifymeUsername)}
                              >
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                      {isExpanded && memberships.map((m) => (
                        <tr key={m.id} className="bg-accent/5">
                          <td className="py-2 pr-4 pl-10 align-top">
                            <p className="text-[12px] font-mono text-foreground">
                              {getEnterpriseUsername(m.enterpriseUsername, m.organizationId)}
                            </p>
                          </td>
                          <td className="py-2 px-4 align-top">
                            <p className="text-[12px] text-foreground">{m.organization}</p>
                            <p className="text-[11px] font-mono text-muted-foreground">{m.organizationId}</p>
                          </td>
                          <td className="py-2 px-4 align-top">
                            <UnifiedBadge variant="status" value={rowStatusLabel(m.status)} />
                          </td>
                          <td className="py-2 px-4 align-top">
                            <p className="text-[12px] font-mono text-muted-foreground">
                              <span className="tabular-nums">{m.apiCalls.toLocaleString()}</span>
                              {" calls"}
                            </p>
                          </td>
                          <td className="py-2 px-4 align-top">
                            <p className="text-[12px] text-foreground">
                              {formatRelativeTime(m.lastActive)}
                            </p>
                          </td>
                          <td className="py-2 px-4" />
                        </tr>
                      ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <Dialog
        open={selectedVerifymeUsername !== null}
        onOpenChange={(open) => !open && setSelectedVerifymeUsername(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>End User Details</DialogTitle>
            <DialogDescription>
              {selectedRowGroup
                ? `${selectedRowGroup.verifymeUsername} • ${selectedRowGroup.email}`
                : "End user details"}
            </DialogDescription>
          </DialogHeader>
          {selectedRowGroup && (
            <div className="space-y-3 text-sm">
              <p>
                <span className="text-muted-foreground">VerifyMe Username:</span>{" "}
                {selectedRowGroup.verifymeUsername}
              </p>
              <p>
                <span className="text-muted-foreground">Email:</span> {selectedRowGroup.email}
              </p>
              <p>
                <span className="text-muted-foreground">Row status:</span>{" "}
                {rowStatusLabel(selectedRowGroup.rowStatus)}
              </p>
              <p>
                <span className="text-muted-foreground">Total API calls (all orgs):</span>{" "}
                {selectedRowGroup.totalApiCalls.toLocaleString()}
              </p>
              <p>
                <span className="text-muted-foreground">Last active (latest):</span>{" "}
                {formatRelativeTime(selectedRowGroup.lastActiveMax)}
              </p>
              <p>
                <span className="text-muted-foreground">Created (first link):</span>{" "}
                {selectedUserLinks.length > 0
                  ? formatDate(
                    [...selectedUserLinks].sort((a, b) => a.created.localeCompare(b.created))[0]!.created,
                  )
                  : "—"}
              </p>
              <div>
                <p className="text-muted-foreground mb-2">Organization links</p>
                <ul className="mt-1 space-y-2 border border-border rounded-md p-3 bg-accent/5">
                  {selectedUserLinks
                    .slice()
                    .sort((a, b) => a.organization.localeCompare(b.organization))
                    .map((link) => (
                      <li key={link.id} className="text-[13px] leading-snug">
                        <span className="font-medium text-foreground">{link.organization}</span>
                        <span className="text-muted-foreground font-mono text-[12px] ml-1">
                          ({link.organizationId})
                        </span>
                        <br />
                        <span className="text-muted-foreground">Org username:</span>{" "}
                        <span className="font-mono">
                          {getEnterpriseUsername(link.enterpriseUsername, link.organizationId)}
                        </span>
                        {" · "}
                        <span className="text-muted-foreground">API calls:</span>{" "}
                        <span className="tabular-nums">{link.apiCalls.toLocaleString()}</span>
                        {" · "}
                        <span className="text-muted-foreground">Status:</span> {link.status}
                        {" · "}
                        <span className="text-muted-foreground">Last active:</span>{" "}
                        {link.lastActive ? formatRelativeTime(link.lastActive) : "Never"}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedVerifymeUsername(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
