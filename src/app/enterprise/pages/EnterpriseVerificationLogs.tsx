import { useMemo, useState, useSyncExternalStore } from "react";
import { Filter, ScrollText, Search } from "lucide-react";
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
  VerificationBillingCallout,
  BillableBadge,
  OutcomeBadge,
  ProcessStatusBadge,
  VerificationSessionDetailBody,
} from "../../shared/components/VerificationSessionUi";
import {
  channelLabel,
  getOrgVerificationSessions,
  verificationOutcomeLabel,
  type MockVerificationSession,
  type VerificationSessionOutcome,
} from "../../shared/data/verificationSessionsMock";
import { enterpriseOrganization } from "../data/enterpriseSample";
import {
  getEndUserAssociationStoreVersion,
  getEndUserAssociations,
  subscribeEndUserAssociationListeners,
} from "../../platform/data/platformEndUserAssociationsSession";
import {
  computePlatformRiskSummaryForVerifymeId,
  isPublicVerifymeIdForRiskCompute,
} from "../../platform/data/mockPlatformRisk";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";
import { shouldIgnoreRowOpenClick } from "../../platform/utils/tableRowNav";
import { SummaryStatCard } from "../../shared/components/SummaryStatCard";
import { TableEmptyStateRow } from "../../shared/components/TableEmptyStateRow";

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

  const assocVersion = useSyncExternalStore(
    subscribeEndUserAssociationListeners,
    getEndUserAssociationStoreVersion,
    getEndUserAssociationStoreVersion,
  );
  const platformAssociations = useMemo(() => getEndUserAssociations(), [assocVersion]);

  const sessionUserRisk = useMemo(() => {
    if (!detail?.maskedVerifymeId || !isPublicVerifymeIdForRiskCompute(detail.maskedVerifymeId)) return null;
    return computePlatformRiskSummaryForVerifymeId(detail.maskedVerifymeId, platformAssociations);
  }, [detail, platformAssociations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orgSessions.filter((s) => {
      if (outcomeFilter !== "all" && s.outcome !== outcomeFilter) return false;
      if (billableFilter === "billable" && !s.billable) return false;
      if (billableFilter === "not_billable" && s.billable) return false;
      if (channelFilter !== "all" && s.channel !== channelFilter) return false;
      if (!withinDateFilter(s.createdAt, dateFilter)) return false;
      if (q.length > 0) {
        const hay = `${s.sessionId} ${s.clientUserId} ${s.customerDisplayName ?? ""}`.toLowerCase();
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
    <>
      <PortalPageFrame
        title="Verification Logs"
        description={
          <>
            Verification sessions for{" "}
            <strong className="text-foreground">{enterpriseOrganization.organizationName}</strong> only. Customer display
            names are organization-provided references.
          </>
        }
        bodyClassName="space-y-6"
      >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <SummaryStatCard label="Total sessions" value={stats.total} />
        <SummaryStatCard label="ID Proof Pass" value={stats.verified} valueClassName="text-green-700" />
        <SummaryStatCard label="ID Proof Fail" value={stats.failed} valueClassName="text-red-700" />
        <SummaryStatCard label="Expired" value={stats.expired} />
        <SummaryStatCard label="Billable spend" value={`$${stats.billableSpend.toFixed(2)}`} />
        <SummaryStatCard label="Avg attempts" value={stats.avgAttempts.toFixed(2)} />
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
            <SelectValue placeholder="Session lifecycle status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All session lifecycle statuses</SelectItem>
            <SelectItem value="verified">{verificationOutcomeLabel("verified")}</SelectItem>
            <SelectItem value="failed">{verificationOutcomeLabel("failed")}</SelectItem>
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
            <SelectItem value="all">All dates</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
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
            setOutcomeFilter("all");
            setBillableFilter("all");
            setChannelFilter("all");
            setDateFilter("all");
          }}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-[12px] text-muted-foreground">
        Session lifecycle status and ID proof result are separate. Lifecycle filtering controls session state, while the
        table keeps ID proof result in its own column.
      </p>

      <Card className="border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-sm">
            <thead className="border-b border-border bg-accent/40">
              <tr>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Session ID</th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">client_user_id</th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">
                  Customer display (org)
                </th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Channel</th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Session status</th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">ID proof result</th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Attempts</th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Billing</th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Cost</th>
                <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr
                  key={s.sessionId}
                  className="cursor-pointer hover:bg-accent/30"
                  onClick={(e) => {
                    if (shouldIgnoreRowOpenClick(e.target)) return;
                    setDetail(s);
                  }}
                >
                  <td className="p-3 font-mono text-[12px]">{s.sessionId}</td>
                  <td className="p-3 font-mono text-[12px]">{s.clientUserId}</td>
                  <td className="p-3">
                    <span>{s.customerDisplayName?.trim() || "—"}</span>
                  </td>
                  <td className="p-3 text-[13px]">{channelLabel(s.channel)}</td>
                  <td className="p-3">
                    <ProcessStatusBadge session={s} />
                  </td>
                  <td className="p-3">
                    <OutcomeBadge session={s} />
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
                </tr>
              ))}
              {filtered.length === 0 ? (
                <TableEmptyStateRow colSpan={10} title="No verification sessions match current filters." />
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
      </PortalPageFrame>

      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-primary" />
              Session details
            </DialogTitle>
            <DialogDescription>Organization-scoped session detail.</DialogDescription>
          </DialogHeader>
          {detail && (
            <>
              <VerificationSessionDetailBody
                session={detail}
                variant="organization"
                userRiskPreview={sessionUserRisk ? { level: sessionUserRisk.level } : null}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetail(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
