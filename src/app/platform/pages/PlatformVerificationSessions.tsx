import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Link, useSearchParams } from "react-router";
import { Filter, ListChecks, Search } from "lucide-react";
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
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import {
  VerificationBillingCallout,
  BillableBadge,
  OutcomeBadge,
  ProcessStatusBadge,
  VerificationSessionDetailBody,
} from "../../shared/components/VerificationSessionUi";
import {
  channelLabel,
  getVerificationSessionsMock,
  verificationOutcomeLabel,
  type MockVerificationSession,
  type VerificationSessionOutcome,
} from "../../shared/data/verificationSessionsMock";
import { buildInitialOrganizations } from "../data/platformOrganizationsSample";
import {
  getEndUserAssociationStoreVersion,
  getEndUserAssociations,
  subscribeEndUserAssociationListeners,
} from "../data/platformEndUserAssociationsSession";
import {
  computePlatformRiskSummaryForVerifymeId,
  isPublicVerifymeIdForRiskCompute,
} from "../data/mockPlatformRisk";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";
import { shouldIgnoreRowOpenClick } from "../utils/tableRowNav";
import { auditLogsHref } from "../utils/auditLogsNavigation";

type OutcomeFilter = "all" | VerificationSessionOutcome;
type BillableFilter = "all" | "billable" | "not_billable";
type ChannelFilter = "all" | "call" | "message" | "web";
type TimeFilter = "all" | "24h" | "7d" | "30d";

function withinTimeFilter(createdAt: string, tf: TimeFilter): boolean {
  if (tf === "all") return true;
  const t = new Date(createdAt).getTime();
  const now = Date.now();
  const h = tf === "24h" ? 24 : tf === "7d" ? 24 * 7 : 24 * 30;
  return now - t < h * 3600000;
}

export function PlatformVerificationSessions() {
  const allSessions = useMemo(() => getVerificationSessionsMock(), []);
  const organizations = useMemo(() => buildInitialOrganizations(), []);
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState<string>("all");
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>("all");
  const [billableFilter, setBillableFilter] = useState<BillableFilter>("all");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [detail, setDetail] = useState<MockVerificationSession | null>(null);

  useEffect(() => {
    const sid = searchParams.get("sessionId") ?? searchParams.get("verificationSessionId");
    if (!sid) return;
    const hit = allSessions.find((s) => s.sessionId === sid);
    if (hit) setDetail(hit);
  }, [searchParams, allSessions]);

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
    return allSessions.filter((s) => {
      if (orgFilter !== "all" && s.organizationId !== orgFilter) return false;
      if (outcomeFilter !== "all" && s.outcome !== outcomeFilter) return false;
      if (billableFilter === "billable" && !s.billable) return false;
      if (billableFilter === "not_billable" && s.billable) return false;
      if (channelFilter !== "all" && s.channel !== channelFilter) return false;
      if (!withinTimeFilter(s.createdAt, timeFilter)) return false;
      if (q.length > 0) {
        const hay =
          `${s.sessionId} ${s.organizationName} ${s.clientUserId} ${s.customerDisplayName ?? ""} ${s.maskedVerifymeId ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allSessions, search, orgFilter, outcomeFilter, billableFilter, channelFilter, timeFilter]);

  const stats = useMemo(() => {
    const list = allSessions;
    const total = list.length;
    const verified = list.filter((s) => s.outcome === "verified").length;
    const failed = list.filter((s) => s.outcome === "failed").length;
    const expiredCancelled = list.filter((s) => s.outcome === "expired" || s.outcome === "cancelled").length;
    const errInd = list.filter((s) => s.outcome === "error" || s.outcome === "indeterminate").length;
    const billableAmt = list.filter((s) => s.billable).reduce((a, s) => a + s.cost, 0);
    const attemptsSum = list.reduce((a, s) => a + s.attemptsUsed, 0);
    const avgAttempts = total > 0 ? attemptsSum / total : 0;
    return { total, verified, failed, expiredCancelled, errInd, billableAmt, avgAttempts };
  }, [allSessions]);

  return (
    <>
      <PortalPageFrame
        variant="fill"
        rootClassName="h-full"
        title="Verification Sessions"
        description="Platform-wide sessions: session status, ID proof result, billing, and risk context."
        bodyClassName="space-y-6"
      >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        <Card className="border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Total sessions</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{stats.total}</p>
        </Card>
        <Card className="border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">ID Proof Pass</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-green-700">{stats.verified}</p>
        </Card>
        <Card className="border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">ID Proof Fail</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-red-700">{stats.failed}</p>
        </Card>
        <Card className="border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Expired / cancelled</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{stats.expiredCancelled}</p>
        </Card>
        <Card className="border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Errors / indeterminate</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-orange-700">{stats.errInd}</p>
        </Card>
        <Card className="border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Billable amount</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">${stats.billableAmt.toFixed(2)}</p>
        </Card>
        <Card className="border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Avg attempts</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{stats.avgAttempts.toFixed(2)}</p>
        </Card>
      </div>

      <VerificationBillingCallout />

      <div className="flex flex-col flex-wrap gap-3 xl:flex-row">
        <div className="relative min-w-[200px] max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search session ID, organization, client_user_id, VerifyMe ID…"
            className="h-10 bg-background pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={orgFilter} onValueChange={setOrgFilter}>
          <SelectTrigger className="w-[220px] h-10">
            <SelectValue placeholder="Organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All organizations</SelectItem>
            {organizations.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.organizationName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={outcomeFilter} onValueChange={(v) => setOutcomeFilter(v as OutcomeFilter)}>
          <SelectTrigger className="w-[180px] h-10">
            <SelectValue placeholder="Outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ID proof outcomes</SelectItem>
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
        <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
          <SelectTrigger className="h-10 w-[160px]">
            <SelectValue placeholder="Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="24h">Last 24 hours</SelectItem>
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
            setOrgFilter("all");
            setOutcomeFilter("all");
            setBillableFilter("all");
            setChannelFilter("all");
            setTimeFilter("all");
          }}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Card className="border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-sm">
            <thead className="border-b border-border bg-accent/40">
              <tr>
                <th className="p-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">Session ID</th>
                <th className="p-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">Organization</th>
                <th className="p-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">
                  client_user_id / customer
                </th>
                <th className="p-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">VerifyMe ID</th>
                <th className="p-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">Channel</th>
                <th className="p-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">Session status</th>
                <th className="p-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">ID proof result</th>
                <th className="p-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">Attempts</th>
                <th className="p-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">Billing</th>
                <th className="p-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">Cost</th>
                <th className="p-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr
                  key={s.sessionId}
                  className="cursor-pointer transition-colors hover:bg-accent/30"
                  onClick={(e) => {
                    if (shouldIgnoreRowOpenClick(e.target)) return;
                    setDetail(s);
                  }}
                >
                  <td className="p-3 font-mono text-[12px]">{s.sessionId}</td>
                  <td className="p-3">
                    <p className="font-medium text-[13px]">{s.organizationName}</p>
                  </td>
                  <td className="p-3">
                    <p className="font-mono text-[12px]">{s.clientUserId}</p>
                    <p className="text-[12px] text-muted-foreground">{s.customerDisplayName?.trim() || "—"}</p>
                  </td>
                  <td className="p-3 font-mono text-[12px] text-muted-foreground">{s.maskedVerifymeId ?? "—"}</td>
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
                  <td className="p-3 text-[12px] text-muted-foreground">
                    {new Date(s.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground sm:px-8">No sessions match filters.</p>
        )}
      </Card>
      </PortalPageFrame>

      <Dialog
        open={detail !== null}
        onOpenChange={(o) => {
          if (!o) {
            setDetail(null);
            setSearchParams(
              (prev) => {
                const next = new URLSearchParams(prev);
                next.delete("sessionId");
                next.delete("verificationSessionId");
                return next;
              },
              { replace: true },
            );
          }
        }}
      >
        <DialogContent className="flex max-h-[min(92vh,calc(100dvh-2rem))] w-full max-w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden border bg-background p-0 shadow-lg sm:max-w-3xl">
          <DialogHeader className="shrink-0 space-y-1 border-b border-border px-6 pb-4 pt-6 text-left">
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight">
              <ListChecks className="h-5 w-5 text-primary" />
              Session details
            </DialogTitle>
            <DialogDescription>
              {detail ? `${detail.sessionId} · ${detail.organizationName}` : "Platform-wide view — OIDC-style milestones only."}
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
                <p className="mb-4 text-xs text-muted-foreground">
                  Secrets and raw tokens are never shown.{" "}
                  <Link
                    className="text-primary underline-offset-4 hover:underline"
                    to={auditLogsHref({
                      verificationSessionId: detail.sessionId,
                    })}
                  >
                    View audit history for this session
                  </Link>
                </p>
                <VerificationSessionDetailBody
                  session={detail}
                  variant="platform"
                  userRiskPreview={
                    sessionUserRisk ? { level: sessionUserRisk.level, score: sessionUserRisk.score } : null
                  }
                  verifymeUserDetailHref={
                    detail.maskedVerifymeId && isPublicVerifymeIdForRiskCompute(detail.maskedVerifymeId)
                      ? `/verifyme-users/${encodeURIComponent(detail.maskedVerifymeId)}`
                      : null
                  }
                />
              </div>
              <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
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
