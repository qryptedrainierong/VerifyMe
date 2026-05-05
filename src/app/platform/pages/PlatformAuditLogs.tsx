import { Search, Filter, Download, Calendar, ArrowUpDown, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
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
  AuditLog,
  ActorType,
  AuditStatus,
  AuditSeverityLevel,
  deriveAuditSeverity,
  getActionLabel,
  getAuditSummaryBucket,
  getAuditTableCategory,
  getCategoryColorForAction,
  redactPayloadForDisplay,
} from "../../shared/types/auditLog";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";
import { platformAuditLogsSample } from "../data/platformAuditLogsSample";
import { buildInitialOrganizations } from "../data/platformOrganizationsSample";
import { shouldIgnoreRowOpenClick } from "../utils/tableRowNav";

const AUDIT_LOGS_PER_PAGE = 10;

/** Prototype “current time” so mock date-range filters stay meaningful. */
const ANCHOR_NOW_MS = Date.parse("2024-04-12T23:59:59Z");

const DATE_RANGE_MS: Record<string, number> = {
  all: Infinity,
  "1day": 24 * 60 * 60 * 1000,
  "7days": 7 * 24 * 60 * 60 * 1000,
  "30days": 30 * 24 * 60 * 60 * 1000,
  "90days": 90 * 24 * 60 * 60 * 1000,
};

const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  }) + " UTC";

const getStatusBadgeColor = (status: AuditStatus) => {
  switch (status) {
    case AuditStatus.SUCCESS:
      return "bg-green-500/10 text-green-700 border-green-200";
    case AuditStatus.FAILED:
      return "bg-red-500/10 text-red-700 border-red-200";
    case AuditStatus.PENDING:
      return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
    case AuditStatus.WARNING:
      return "bg-orange-500/10 text-orange-700 border-orange-200";
    default:
      return "bg-gray-500/10 text-gray-700 border-gray-200";
  }
};

const getStatusLabel = (status: AuditStatus) => {
  const labels: Record<AuditStatus, string> = {
    [AuditStatus.SUCCESS]: "Success",
    [AuditStatus.FAILED]: "Failed",
    [AuditStatus.PENDING]: "Pending",
    [AuditStatus.WARNING]: "Warning",
  };
  return labels[status];
};

const severityBadge = (s: AuditSeverityLevel) => {
  const map: Record<AuditSeverityLevel, string> = {
    info: "bg-slate-500/10 text-slate-700 border-slate-200",
    low: "bg-blue-500/10 text-blue-800 border-blue-200",
    medium: "bg-amber-500/10 text-amber-800 border-amber-200",
    high: "bg-orange-500/10 text-orange-800 border-orange-200",
    critical: "bg-red-500/10 text-red-800 border-red-200",
  };
  return map[s];
};

const severityLabel = (s: AuditSeverityLevel) =>
  s.charAt(0).toUpperCase() + s.slice(1);

function actorFilterMatches(log: AuditLog, filter: string): boolean {
  if (filter === "all") return true;
  const map: Record<string, ActorType> = {
    "platform-admin": ActorType.PLATFORM_ADMIN,
    "org-owner": ActorType.ORGANIZATION_OWNER,
    "org-admin": ActorType.ORGANIZATION_ADMIN,
    "org-member": ActorType.ORGANIZATION_MEMBER,
    system: ActorType.SYSTEM,
  };
  return log.actorType === map[filter];
}

export function PlatformAuditLogs() {
  const knownOrgIds = useMemo(() => new Set(buildInitialOrganizations().map((o) => o.id)), []);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [actorFilter, setActorFilter] = useState<string>("all");
  const [organizationFilter, setOrganizationFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedLogs = useMemo(
    () => [...platformAuditLogsSample].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)),
    [],
  );

  const organizationOptions = useMemo(() => {
    const m = new Map<string, string>();
    sortedLogs.forEach((log) => m.set(log.organizationId, log.organization));
    return Array.from(m.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [sortedLogs]);

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const rangeMs = DATE_RANGE_MS[dateRange] ?? Infinity;

    return sortedLogs.filter((log) => {
      if (q.length > 0) {
        const hay = [
          log.action,
          getActionLabel(log.action),
          getAuditTableCategory(log.action),
          log.actor,
          log.organization,
          log.details,
          log.organizationId,
          log.id,
          log.target ?? "",
          log.sessionRef ?? "",
          log.requestRef ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (categoryFilter !== "all" && getAuditTableCategory(log.action) !== categoryFilter) return false;

      if (!actorFilterMatches(log, actorFilter)) return false;

      if (organizationFilter !== "all" && log.organizationId !== organizationFilter) return false;

      const sev = deriveAuditSeverity(log);
      if (severityFilter !== "all" && sev !== severityFilter) return false;

      if (dateRange !== "all" && rangeMs !== Infinity) {
        const t = Date.parse(log.timestamp);
        if (Number.isNaN(t) || ANCHOR_NOW_MS - t > rangeMs) return false;
      }

      return true;
    });
  }, [
    sortedLogs,
    searchQuery,
    categoryFilter,
    actorFilter,
    organizationFilter,
    severityFilter,
    dateRange,
  ]);

  const summary = useMemo(() => {
    let security = 0;
    let admin = 0;
    let integration = 0;
    let billing = 0;
    filteredLogs.forEach((log) => {
      switch (getAuditSummaryBucket(log.action)) {
        case "security":
          security += 1;
          break;
        case "admin":
          admin += 1;
          break;
        case "integration":
          integration += 1;
          break;
        case "billing":
          billing += 1;
          break;
      }
    });
    return {
      total: filteredLogs.length,
      security,
      admin,
      integration,
      billing,
    };
  }, [filteredLogs]);

  const totalLogs = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalLogs / AUDIT_LOGS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * AUDIT_LOGS_PER_PAGE;
  const endIndex = Math.min(startIndex + AUDIT_LOGS_PER_PAGE, totalLogs);
  const visibleLogs = filteredLogs.slice(startIndex, endIndex);

  const handleLogClick = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setTimeout(() => setSelectedLog(null), 300);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setActorFilter("all");
    setOrganizationFilter("all");
    setSeverityFilter("all");
    setDateRange("all");
    setCurrentPage(1);
  };

  return (
    <>
      <PortalPageFrame
        variant="fill"
        rootClassName="h-full"
        title="Audit Logs"
        description="Platform-wide governance and operational events. Detail opens in a modal; destructive controls stay on entity detail pages."
        headerActions={
          <Button variant="outline" type="button">
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        }
        headerExtra={
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events, actors, targets, organizations…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 bg-background pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="h-10 w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="Organization">Organization</SelectItem>
                <SelectItem value="VerifyMe User">VerifyMe User</SelectItem>
                <SelectItem value="Client app / API">Client app / API</SelectItem>
                <SelectItem value="Identity link">Identity link</SelectItem>
                <SelectItem value="Verification session">Verification session</SelectItem>
                <SelectItem value="Billing & credits">Billing & credits</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Org users">Org users</SelectItem>
                <SelectItem value="System & admin">System & admin</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={actorFilter} onValueChange={(v) => { setActorFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="h-10 w-[180px]">
                <SelectValue placeholder="Actor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actors</SelectItem>
                <SelectItem value="platform-admin">Platform Admin</SelectItem>
                <SelectItem value="org-owner">Organization Owner</SelectItem>
                <SelectItem value="org-admin">Organization Admin</SelectItem>
                <SelectItem value="org-member">Organization Member</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            <Select value={organizationFilter} onValueChange={(v) => { setOrganizationFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="h-10 w-[220px]">
                <SelectValue placeholder="Organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All organizations</SelectItem>
                {organizationOptions.map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="h-10 w-[160px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severity</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={(v) => { setDateRange(v); setCurrentPage(1); }}>
              <SelectTrigger className="h-10 w-[180px]">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dates (sample)</SelectItem>
                <SelectItem value="1day">Last 24 hours (mock)</SelectItem>
                <SelectItem value="7days">Last 7 days (mock)</SelectItem>
                <SelectItem value="30days">Last 30 days (mock)</SelectItem>
                <SelectItem value="90days">Last 90 days (mock)</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" className="h-10 w-10" type="button" onClick={resetFilters}>
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        }
        bodyClassName="space-y-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="border border-border p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Total events</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{summary.total}</p>
          </Card>
          <Card className="border border-border p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Security events</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{summary.security}</p>
          </Card>
          <Card className="border border-border p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Admin actions</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{summary.admin}</p>
          </Card>
          <Card className="border border-border p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Integration events</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{summary.integration}</p>
          </Card>
          <Card className="border border-border p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Billing / credits</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{summary.billing}</p>
          </Card>
        </div>

        <Card className="overflow-hidden border border-border shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
            <p className="text-[13px] text-muted-foreground">
              {totalLogs === 0
                ? "Showing 0 audit log entries"
                : `Showing ${startIndex + 1}-${endIndex} of ${totalLogs} audit log entries`}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                Previous
              </Button>
              <span className="px-2 text-[13px] text-muted-foreground">
                Page {safeCurrentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                type="button"
                disabled={safeCurrentPage === totalPages || totalLogs === 0}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="min-w-[1100px] overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="sticky top-0 border-b border-border bg-accent/5">
                <tr>
                  <th className="p-4 text-left font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      Timestamp
                      <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Event</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Category</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Actor</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Target</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Organization</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visibleLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="cursor-pointer transition-colors hover:bg-accent/10"
                    onClick={(e) => {
                      if (shouldIgnoreRowOpenClick(e.target)) return;
                      handleLogClick(log);
                    }}
                  >
                    <td className="p-4 align-top">
                      <div className="flex items-start gap-2">
                        <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-foreground">{formatDateTime(log.timestamp)}</p>
                          <p className="font-mono text-[11px] text-muted-foreground">{log.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <p className={`font-medium ${getCategoryColorForAction(log.action)}`}>
                        {getActionLabel(log.action)}
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground">{log.action}</p>
                    </td>
                    <td className="p-4 align-top text-muted-foreground">{getAuditTableCategory(log.action)}</td>
                    <td className="p-4 align-top">
                      <p className="text-foreground">{log.actor}</p>
                      <p className="text-[11px] text-muted-foreground">{log.actorType}</p>
                    </td>
                    <td className="max-w-[220px] p-4 align-top break-words text-foreground">{log.target ?? "—"}</td>
                    <td className="p-4 align-top">
                      <p className="text-foreground">{log.organization}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">{log.organizationId}</p>
                    </td>
                    <td className="p-4 align-top">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-1 text-[12px] font-medium ${severityBadge(
                          deriveAuditSeverity(log),
                        )}`}
                      >
                        {severityLabel(deriveAuditSeverity(log))}
                      </span>
                    </td>
                  </tr>
                ))}
                {visibleLogs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      No audit logs match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </PortalPageFrame>

      {isDetailsOpen && selectedLog && (
        <AuditLogDetailsModal
          log={selectedLog}
          isOpen={isDetailsOpen}
          onClose={closeDetails}
          knownOrgIds={knownOrgIds}
        />
      )}
    </>
  );
}

interface AuditLogDetailsModalProps {
  log: AuditLog;
  isOpen: boolean;
  onClose: () => void;
  knownOrgIds: Set<string>;
}

function AuditLogDetailsModal({ log, isOpen, onClose, knownOrgIds }: AuditLogDetailsModalProps) {
  if (!isOpen) return null;

  const sev = deriveAuditSeverity(log);
  const safePayload = redactPayloadForDisplay(log.payload);

  const renderPayloadDetails = () => {
    if (!log.payload || Object.keys(safePayload).length === 0) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Payload</h3>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Safe preview only. Sensitive keys are redacted. Raw tokens, OTPs, and secrets are never shown in VerifyMe Admin.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(safePayload).map(([key, value]) => {
            let displayValue: ReactNode = value as ReactNode;
            if (typeof value === "number") {
              displayValue =
                key.toLowerCase().includes("amount") || key.toLowerCase().includes("usd")
                  ? `$${value.toLocaleString()}`
                  : value.toLocaleString();
            } else if (typeof value === "boolean") {
              displayValue = value ? "Yes" : "No";
            } else if (typeof value === "object" && value !== null) {
              displayValue = JSON.stringify(value, null, 2);
            }

            return (
              <div key={key}>
                <p className="text-xs capitalize text-muted-foreground">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                <p className="break-words text-sm font-medium text-foreground">{displayValue}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const orgLinkable = log.organizationId !== "ORG-SYS" && knownOrgIds.has(log.organizationId);

  const copySafeJson = () => {
    const exportLog = {
      ...log,
      payload: safePayload,
    };
    void navigator.clipboard.writeText(JSON.stringify(exportLog, null, 2));
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} aria-hidden />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <Card
          className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden border border-border shadow-lg"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex shrink-0 items-start justify-between border-b border-border bg-accent/5 p-6">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className={`inline-flex rounded py-1 text-2xl font-medium ${getCategoryColorForAction(log.action)}`}>
                  {getActionLabel(log.action)}
                </span>
              </div>
              <span className="font-mono text-sm text-muted-foreground">{log.id}</span>
              <span className="px-3 text-sm text-muted-foreground">{formatDateTime(log.timestamp)}</span>
            </div>
            <button type="button" onClick={onClose} className="rounded p-1 transition-colors hover:bg-accent">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Summary</span> — {getActionLabel(log.action)} ·{" "}
              {log.organization} · {formatDateTime(log.timestamp)} · outcome {getStatusLabel(log.status)} · severity{" "}
              {severityLabel(sev)}. Related entities link only when sample ids match platform mock data.
            </div>

            <div className="space-y-6">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Details</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Event</p>
                  <p className="text-sm font-medium text-foreground">{getActionLabel(log.action)}</p>
                  <p className="font-mono text-xs text-muted-foreground">{log.action}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Category</p>
                  <p className="text-sm text-foreground">{getAuditTableCategory(log.action)}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Actor</p>
                  <p className="text-sm font-medium text-foreground">{log.actor}</p>
                  <p className="text-xs text-muted-foreground">{log.actorType}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Target</p>
                  <p className="text-sm text-foreground">{log.target ?? "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="mb-1 text-xs text-muted-foreground">Organization</p>
                  <p className="text-sm font-medium text-foreground">{log.organization}</p>
                  <p className="font-mono text-xs text-muted-foreground">{log.organizationId}</p>
                  {orgLinkable ? (
                    <Link
                      to={`/organizations/${encodeURIComponent(log.organizationId)}`}
                      className="mt-2 inline-block text-sm text-primary underline-offset-4 hover:underline"
                    >
                      Open organization detail
                    </Link>
                  ) : (
                    <p className="mt-2 text-[11px] text-muted-foreground">No organization detail route for this sample id.</p>
                  )}
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Outcome status</p>
                  <span
                    className={`inline-flex items-center rounded-md border px-3 py-1 text-sm font-medium ${getStatusBadgeColor(
                      log.status,
                    )}`}
                  >
                    {getStatusLabel(log.status)}
                  </span>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Severity</p>
                  <span
                    className={`inline-flex items-center rounded-md border px-3 py-1 text-sm font-medium ${severityBadge(sev)}`}
                  >
                    {severityLabel(sev)}
                  </span>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Source IP (mock)</p>
                  <p className="font-mono text-sm text-foreground">{log.ipAddress}</p>
                </div>
                {log.userAgent ? (
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">User agent (mock)</p>
                    <p className="truncate text-xs text-foreground">{log.userAgent}</p>
                  </div>
                ) : null}
                {log.requestRef ? (
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">Request reference</p>
                    <p className="font-mono text-sm text-foreground">{log.requestRef}</p>
                  </div>
                ) : null}
                {(log.sessionRef ?? log.relatedVerificationSessionId) ? (
                  <div className="col-span-2">
                    <p className="mb-1 text-xs text-muted-foreground">Verification session reference</p>
                    <p className="font-mono text-sm text-foreground">
                      {log.sessionRef ?? log.relatedVerificationSessionId}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Open Verification Sessions to match this id.</p>
                  </div>
                ) : null}
              </div>

              <div className="rounded-lg border border-border bg-muted/15 p-4">
                <p className="text-xs font-medium text-muted-foreground">Related entities</p>
                <ul className="mt-2 space-y-2 text-sm">
                  {log.relatedVerifymeId ? (
                    <li>
                      <Link
                        className="text-primary underline-offset-4 hover:underline"
                        to={`/verifyme-users/${encodeURIComponent(log.relatedVerifymeId)}`}
                      >
                        VerifyMe user {log.relatedVerifymeId}
                      </Link>
                    </li>
                  ) : null}
                  {log.relatedClientAppId ? (
                    <li>
                      <Link
                        className="text-primary underline-offset-4 hover:underline"
                        to={`/client-apps/${encodeURIComponent(log.relatedClientAppId)}`}
                      >
                        Client app ({log.relatedClientAppId})
                      </Link>
                    </li>
                  ) : null}
                  {log.relatedIdentityLinkId ? (
                    <li>
                      <Link
                        className="text-primary underline-offset-4 hover:underline"
                        to={`/identity-links/${encodeURIComponent(log.relatedIdentityLinkId)}`}
                      >
                        Identity link ({log.relatedIdentityLinkId})
                      </Link>
                    </li>
                  ) : null}
                  {!log.relatedVerifymeId && !log.relatedClientAppId && !log.relatedIdentityLinkId ? (
                    <li className="text-muted-foreground">No entity links for this row.</li>
                  ) : null}
                </ul>
              </div>

              <div>
                <p className="mb-2 text-xs text-muted-foreground">Description</p>
                <p className="rounded border border-border bg-accent/5 p-3 text-sm text-foreground">{log.details}</p>
              </div>

              {renderPayloadDetails()}
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-accent/5 p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Controls</p>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" type="button" onClick={copySafeJson}>
                Copy safe JSON
              </Button>
              <Button variant="outline" size="sm" type="button" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
