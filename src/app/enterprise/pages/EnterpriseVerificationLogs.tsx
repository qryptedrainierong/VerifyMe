import { useMemo, useState } from "react";
import { ScrollText, Search, MoreVertical } from "lucide-react";
import { Button } from "../../shared/components/ui/button";
import { Card } from "../../shared/components/ui/card";
import { Input } from "../../shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../shared/components/ui/dropdown-menu";
import {
  VerificationBillingCallout,
  BillableBadge,
  OutcomeBadge,
  VerificationSessionDetailBody,
} from "../../shared/components/VerificationSessionUi";
import {
  channelLabel,
  getOrgVerificationSessions,
  type MockVerificationSession,
  type VerificationSessionOutcome,
} from "../../shared/data/verificationSessionsMock";
import { enterpriseOrganization } from "../data/enterpriseSample";

type OutcomeFilter = "all" | VerificationSessionOutcome;
type BillableFilter = "all" | "billable" | "not_billable";
type ChannelFilter = "all" | "call" | "message" | "web";
type DateFilter = "all" | "7d" | "30d";

function withinDateFilter(createdAt: string, df: DateFilter): boolean {
  if (df === "all") return true;
  const t = new Date(createdAt).getTime();
  const days = df === "7d" ? 7 : 30;
  return Date.now() - t < days * 86400000;
}

export function EnterpriseVerificationLogs() {
  const orgSessions = useMemo(
    () => getOrgVerificationSessions(enterpriseOrganization.id),
    [],
  );

  const [search, setSearch] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>("all");
  const [billableFilter, setBillableFilter] = useState<BillableFilter>("all");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [detail, setDetail] = useState<MockVerificationSession | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orgSessions.filter((s) => {
      if (outcomeFilter !== "all" && s.outcome !== outcomeFilter) return false;
      if (billableFilter === "billable" && !s.billable) return false;
      if (billableFilter === "not_billable" && s.billable) return false;
      if (channelFilter !== "all" && s.channel !== channelFilter) return false;
      if (!withinDateFilter(s.createdAt, dateFilter)) return false;
      if (q.length > 0) {
        const hay = `${s.sessionId} ${s.clientUserId} ${s.customerName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [orgSessions, search, outcomeFilter, billableFilter, channelFilter, dateFilter]);

  const stats = useMemo(() => {
    const list = orgSessions;
    const total = list.length;
    const verified = list.filter((s) => s.outcome === "verified").length;
    const failed = list.filter((s) => s.outcome === "failed").length;
    const expired = list.filter((s) => s.outcome === "expired").length;
    const billableSpend = list.filter((s) => s.billable).reduce((a, s) => a + s.cost, 0);
    const avgAttempts = total > 0 ? list.reduce((a, s) => a + s.attemptsUsed, 0) / total : 0;
    return { total, verified, failed, expired, billableSpend, avgAttempts };
  }, [orgSessions]);

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto">
      <div className="max-w-3xl">
        <h1 className="text-[28px] font-semibold text-foreground">Verification Logs</h1>
        <p className="text-[15px] text-muted-foreground mt-1">
          Review verification sessions for <strong className="text-foreground">{enterpriseOrganization.organizationName}</strong>{" "}
          only.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4 border border-border shadow-sm">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Total sessions</p>
          <p className="text-xl font-semibold mt-1">{stats.total}</p>
        </Card>
        <Card className="p-4 border border-border shadow-sm">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Verified</p>
          <p className="text-xl font-semibold mt-1 text-green-700">{stats.verified}</p>
        </Card>
        <Card className="p-4 border border-border shadow-sm">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Failed</p>
          <p className="text-xl font-semibold mt-1 text-red-700">{stats.failed}</p>
        </Card>
        <Card className="p-4 border border-border shadow-sm">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Expired</p>
          <p className="text-xl font-semibold mt-1">{stats.expired}</p>
        </Card>
        <Card className="p-4 border border-border shadow-sm">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Billable spend</p>
          <p className="text-xl font-semibold mt-1">${stats.billableSpend.toFixed(2)}</p>
        </Card>
        <Card className="p-4 border border-border shadow-sm">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Avg attempts</p>
          <p className="text-xl font-semibold mt-1">{stats.avgAttempts.toFixed(2)}</p>
        </Card>
      </div>

      <VerificationBillingCallout />

      <div className="flex flex-col lg:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search session ID or client_user_id…"
            className="pl-10 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={outcomeFilter} onValueChange={(v) => setOutcomeFilter(v as OutcomeFilter)}>
          <SelectTrigger className="w-[180px] h-10">
            <SelectValue placeholder="Outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All outcomes</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="indeterminate">Indeterminate</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={billableFilter} onValueChange={(v) => setBillableFilter(v as BillableFilter)}>
          <SelectTrigger className="w-[160px] h-10">
            <SelectValue placeholder="Billable" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="billable">Billable only</SelectItem>
            <SelectItem value="not_billable">Not billable</SelectItem>
          </SelectContent>
        </Select>
        <Select value={channelFilter} onValueChange={(v) => setChannelFilter(v as ChannelFilter)}>
          <SelectTrigger className="w-[160px] h-10">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All channels</SelectItem>
            <SelectItem value="call">Call</SelectItem>
            <SelectItem value="message">Message</SelectItem>
            <SelectItem value="web">Web</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
          <SelectTrigger className="w-[180px] h-10">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All dates (sample)</SelectItem>
            <SelectItem value="7d">Last 7 days (mock)</SelectItem>
            <SelectItem value="30d">Last 30 days (mock)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-sm">
            <thead className="border-b border-border bg-accent/40">
              <tr>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Session ID</th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">client_user_id</th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Customer name</th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Channel</th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Outcome</th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Attempts</th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Billable</th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Cost</th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Timestamp</th>
                <th className="text-right p-3 font-semibold text-muted-foreground uppercase text-[11px] w-[72px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.sessionId} className="hover:bg-accent/30">
                  <td className="p-3 font-mono text-[12px]">{s.sessionId}</td>
                  <td className="p-3 font-mono text-[12px]">{s.clientUserId}</td>
                  <td className="p-3">{s.customerName}</td>
                  <td className="p-3 text-[13px]">{channelLabel(s.channel)}</td>
                  <td className="p-3">
                    <OutcomeBadge outcome={s.outcome} />
                  </td>
                  <td className="p-3 tabular-nums">
                    {s.attemptsUsed}/{s.maxAttempts}
                  </td>
                  <td className="p-3">
                    <BillableBadge billable={s.billable} />
                  </td>
                  <td className="p-3 tabular-nums">
                    {s.currency} {s.cost.toFixed(2)}
                  </td>
                  <td className="p-3 text-muted-foreground text-[12px]">
                    {new Date(s.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDetail(s)}>View details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="p-8 text-center text-muted-foreground text-sm">No sessions match filters.</p>
        )}
      </Card>

      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-primary" />
              Session details
            </DialogTitle>
            <DialogDescription>Organization-scoped — no cross-tenant data.</DialogDescription>
          </DialogHeader>
          {detail && (
            <>
              <VerificationSessionDetailBody session={detail} variant="organization" />
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetail(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
