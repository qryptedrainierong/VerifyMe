import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../../shared/components/ui/card";
import { Input } from "../../shared/components/ui/input";
import { Filter, Search } from "lucide-react";
import { Button } from "../../shared/components/ui/button";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shared/components/ui/select";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import { SummaryStatCard } from "../../shared/components/SummaryStatCard";
import { TableEmptyStateRow } from "../../shared/components/TableEmptyStateRow";
import { platformTeamSample, type PlatformMfaStatus, type PlatformTeamRole, type PlatformTeamStatus } from "../data/platformTeamSample";
import { shouldIgnoreRowOpenClick } from "../utils/tableRowNav";

export function PlatformTeamAccess() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<PlatformTeamRole | "all">("all");
  const [status, setStatus] = useState<PlatformTeamStatus | "all">("all");
  const [mfa, setMfa] = useState<PlatformMfaStatus | "all">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return platformTeamSample.filter((r) => {
      if (role !== "all" && r.role !== role) return false;
      if (status !== "all" && r.status !== status) return false;
      if (mfa !== "all" && r.mfaStatus !== mfa) return false;
      if (!q) return true;
      return `${r.fullName} ${r.email} ${r.platformAdminId}`.toLowerCase().includes(q);
    });
  }, [search, role, status, mfa]);

  const stats = useMemo(
    () => ({
      total: platformTeamSample.length,
      active: platformTeamSample.filter((m) => m.status === "active").length,
      mfaAttention: platformTeamSample.filter((m) => m.mfaStatus !== "enabled").length,
      suspendedDisabled: platformTeamSample.filter((m) => m.status === "suspended" || m.status === "disabled").length,
      recent: platformTeamSample.filter((m) => m.lastActivityAt).length,
    }),
    [],
  );

  return (
    <PortalPageFrame
      title="Platform Team & Access"
      description="Operational view of internal VerifyMe platform admin users and operator access posture."
      bodyClassName="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <SummaryStatCard label="Total platform users" value={stats.total} />
        <SummaryStatCard label="Active users" value={stats.active} />
        <SummaryStatCard label="MFA attention required" value={stats.mfaAttention} />
        <SummaryStatCard label="Suspended / disabled" value={stats.suspendedDisabled} />
        <SummaryStatCard label="Recent admin activity" value={stats.recent} />
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search name, email, platform admin ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={role} onValueChange={(v) => setRole(v as PlatformTeamRole | "all")}>
          <SelectTrigger className="h-10 w-[220px]"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {Array.from(new Set(platformTeamSample.map((m) => m.role))).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as PlatformTeamStatus | "all")}>
          <SelectTrigger className="h-10 w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={mfa} onValueChange={(v) => setMfa(v as PlatformMfaStatus | "all")}>
          <SelectTrigger className="h-10 w-[190px]"><SelectValue placeholder="MFA" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All MFA status</SelectItem>
            <SelectItem value="enabled">Enabled</SelectItem>
            <SelectItem value="reset_required">Reset required</SelectItem>
            <SelectItem value="not_configured">Not configured</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0"
          aria-label="Clear filters"
          onClick={() => {
            setSearch("");
            setRole("all");
            setStatus("all");
            setMfa("all");
          }}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      <Card className="overflow-hidden border border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-accent/5">
              <tr>
                <th className="p-3 text-left text-[11px] uppercase text-muted-foreground">Platform admin</th>
                <th className="p-3 text-left text-[11px] uppercase text-muted-foreground">Email</th>
                <th className="p-3 text-left text-[11px] uppercase text-muted-foreground">Role</th>
                <th className="p-3 text-left text-[11px] uppercase text-muted-foreground">Status</th>
                <th className="p-3 text-left text-[11px] uppercase text-muted-foreground">MFA</th>
                <th className="p-3 text-left text-[11px] uppercase text-muted-foreground">Last activity</th>
                <th className="p-3 text-left text-[11px] uppercase text-muted-foreground">Last login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((m) => (
                <tr key={m.id} className="cursor-pointer hover:bg-accent/20" onClick={(e) => {
                  if (shouldIgnoreRowOpenClick(e.target)) return;
                  navigate(`/platform-team/${encodeURIComponent(m.platformAdminId)}`);
                }}>
                  <td className="p-3"><p className="font-medium">{m.fullName}</p><p className="text-xs font-mono text-muted-foreground">{m.platformAdminId}</p></td>
                  <td className="p-3">{m.email}</td>
                  <td className="p-3"><UnifiedBadge variant="role" value={m.role} /></td>
                  <td className="p-3"><UnifiedBadge variant="status" value={m.status} /></td>
                  <td className="p-3"><UnifiedBadge variant="status" value={m.mfaStatus} /></td>
                  <td className="p-3 text-muted-foreground">{m.lastActivityAt ? new Date(m.lastActivityAt).toLocaleString() : "Never"}</td>
                  <td className="p-3 text-muted-foreground">{m.lastLoginAt ? new Date(m.lastLoginAt).toLocaleString() : "Never"}</td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <TableEmptyStateRow colSpan={7} title="No platform admins match current filters." />
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </PortalPageFrame>
  );
}

