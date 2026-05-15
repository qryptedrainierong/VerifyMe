import { Download, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router";
import { Button } from "../../shared/components/ui/button";
import { Card } from "../../shared/components/ui/card";
import { Badge } from "../../shared/components/ui/badge";
import {
  AuditLog,
  ActorType,
  AuditStatus,
  deriveAuditSeverity,
  deriveAuditEntityType,
  deriveGovernanceSeverityLabel,
  getActionLabel,
  getAuditTableCategory,
  getCategoryColorForAction,
  getGovernanceCategoryForLog,
  governanceSeverityBadgeClass,
  isConflictWorkflowAuditEvent,
  isRiskGovernanceAuditEvent,
  type GovernanceCategory,
  redactPayloadForDisplay,
} from "../../shared/types/auditLog";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";
import { platformAuditLogsSample } from "../data/platformAuditLogsSample";
import { buildInitialOrganizations } from "../data/platformOrganizationsSample";
import { shouldIgnoreRowOpenClick } from "../utils/tableRowNav";
import { TableEmptyStateRow } from "../../shared/components/TableEmptyStateRow";
import { cn } from "../../shared/components/ui/utils";
import { usePlatformRole } from "../context/PlatformRoleContext";
import { canPerformPlatformAction, canShowNavSection } from "../utils/platformRolePermissions";

const AUDIT_LOGS_PER_PAGE = 10;

/** Fixed anchor for relative date-range filtering against static seeded timestamps. See docs/implementation-notes.md. */
const ANCHOR_NOW_MS = Date.parse("2024-04-12T23:59:59Z");

const DATE_RANGE_MS: Record<string, number> = {
  all: Infinity,
  "1day": 24 * 60 * 60 * 1000,
  "7days": 7 * 24 * 60 * 60 * 1000,
  "30days": 30 * 24 * 60 * 60 * 1000,
  "90days": 90 * 24 * 60 * 60 * 1000,
};

const GOVERNANCE_CATEGORIES: GovernanceCategory[] = [
  "Risk",
  "Identity",
  "Security",
  "Verification",
  "Governance",
  "Billing",
];

const ENTITY_TYPES: Array<{ value: string; label: string }> = [
  { value: "all", label: "All subjects" },
  { value: "organization", label: "Organization" },
  { value: "verifyme_user", label: "VerifyMe user" },
  { value: "platform_admin", label: "Platform admin" },
  { value: "identity_link", label: "Identity link" },
  { value: "client_app", label: "Client app" },
  { value: "verification_session", label: "Verification session" },
  { value: "billing", label: "Billing" },
  { value: "other", label: "Other" },
];

function formatDateTime(dateString: string) {
  return (
    new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "UTC",
    }) + " UTC"
  );
}

function formatRelativeAuditTime(iso: string, nowMs: number): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  const diffMs = Math.max(0, nowMs - t);
  const sec = Math.floor(diffMs / 1000);
  if (sec < 45) return "Just now";
  const min = Math.floor(diffMs / 60000);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(diffMs / 3600000);
  if (hr < 24) return `${hr}h ago`;

  const then = new Date(t);
  const now = new Date(nowMs);
  const thenDay = Date.UTC(then.getUTCFullYear(), then.getUTCMonth(), then.getUTCDate());
  const nowDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dayDiff = Math.floor((nowDay - thenDay) / 86400000);
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff < 7) return `${dayDiff}d ago`;

  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" }).format(then) + " UTC";
}

function GovernanceSeverityBadge({ label }: { label: ReturnType<typeof deriveGovernanceSeverityLabel> }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 px-1.5 text-[10px] font-medium leading-none",
        governanceSeverityBadgeClass(label),
        label === "Critical" && "border-red-400/80 bg-red-50 font-semibold text-red-900 dark:border-red-900/60 dark:bg-red-950/45 dark:text-red-100",
        label === "High" && "border-orange-300/80 bg-orange-50 text-orange-950 dark:bg-orange-950/35 dark:text-orange-50",
      )}
    >
      {label}
    </Badge>
  );
}

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

function severityLabelInternal(s: ReturnType<typeof deriveAuditSeverity>) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

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

function entityTypeShort(log: AuditLog): string {
  const t = deriveAuditEntityType(log);
  const map: Record<string, string> = {
    organization: "Organization",
    verifyme_user: "VerifyMe user",
    platform_admin: "Platform admin",
    identity_link: "Identity link",
    client_app: "Client app",
    verification_session: "Verification",
    billing: "Billing",
    other: "Other",
  };
  return map[t] ?? "Other";
}

function parseGovernanceSeverityParam(
  v: string | null,
): "Informational" | "Warning" | "High" | "Critical" | "all" {
  if (!v) return "all";
  const m: Record<string, "Informational" | "Warning" | "High" | "Critical"> = {
    informational: "Informational",
    warning: "Warning",
    high: "High",
    critical: "Critical",
  };
  return m[v.toLowerCase()] ?? "all";
}

export function PlatformAuditLogs() {
  const { role } = usePlatformRole();
  const canExportLogs = canPerformPlatformAction(role, "export_audit");
  const showSettingsBackLink = canShowNavSection(role, "settings");
  const knownOrgIds = useMemo(() => new Set(buildInitialOrganizations().map((o) => o.id)), []);
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get("search") ?? "";

  const govParam = searchParams.get("governanceCategory");
  const governanceCategory: GovernanceCategory | "all" =
    govParam && (GOVERNANCE_CATEGORIES as readonly string[]).includes(govParam) ? (govParam as GovernanceCategory) : "all";

  const entParam = searchParams.get("entityType") ?? "all";
  const entityType = ENTITY_TYPES.some((t) => t.value === entParam) ? entParam : "all";
  const actorFilter = searchParams.get("actor") ?? "all";
  const organizationFilter = searchParams.get("organizationId") ?? "all";
  const severityGov = parseGovernanceSeverityParam(searchParams.get("severity"));
  const dateRange = searchParams.get("dateRange") ?? "all";
  const verifymeIdFilter = searchParams.get("verifymeId") ?? "";
  const identityLinkFilter = searchParams.get("identityLinkId") ?? "";
  const clientAppFilter = searchParams.get("clientAppId") ?? "";
  const verificationSessionFilter = searchParams.get("verificationSessionId") ?? "";
  const platformAdminIdFilter = searchParams.get("platformAdminId") ?? "";
  const rawFocus = searchParams.get("focus") ?? "all";
  const governanceFocus = rawFocus === "risk" || rawFocus === "conflict" ? rawFocus : "all";

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchParams.toString()]);

  const sortedLogs = useMemo(
    () => [...platformAuditLogsSample].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)),
    [],
  );

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const rangeMs = DATE_RANGE_MS[dateRange] ?? Infinity;
    const riskOnly = governanceFocus === "risk";
    const conflictOnly = governanceFocus === "conflict";

    return sortedLogs.filter((log) => {
      if (q.length > 0) {
        const hay = [
          log.action,
          getActionLabel(log.action),
          getAuditTableCategory(log.action),
          getGovernanceCategoryForLog(log),
          log.actor,
          log.organization,
          log.details,
          log.organizationId,
          log.id,
          log.target ?? "",
          log.sessionRef ?? "",
          log.requestRef ?? "",
          log.relatedVerifymeId ?? "",
          log.relatedIdentityLinkId ?? "",
          log.relatedClientAppId ?? "",
          log.relatedVerificationSessionId ?? "",
          log.relatedPlatformAdminId ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (governanceCategory !== "all" && getGovernanceCategoryForLog(log) !== governanceCategory) return false;

      if (entityType !== "all" && deriveAuditEntityType(log) !== entityType) return false;

      if (!actorFilterMatches(log, actorFilter)) return false;

      if (organizationFilter !== "all" && log.organizationId !== organizationFilter) return false;

      const govSev = deriveGovernanceSeverityLabel(log);
      if (severityGov !== "all" && govSev !== severityGov) return false;

      if (verifymeIdFilter.trim()) {
        const vm = verifymeIdFilter.trim();
        const matchesVm =
          log.relatedVerifymeId === vm || log.target === vm || (log.details && log.details.includes(vm));
        if (!matchesVm) return false;
      }

      if (identityLinkFilter.trim() && log.relatedIdentityLinkId !== identityLinkFilter.trim()) return false;

      if (clientAppFilter.trim() && log.relatedClientAppId !== clientAppFilter.trim()) return false;

      if (verificationSessionFilter.trim()) {
        const vs = verificationSessionFilter.trim();
        if (log.relatedVerificationSessionId !== vs && log.sessionRef !== vs) return false;
      }
      if (platformAdminIdFilter.trim()) {
        const pa = platformAdminIdFilter.trim();
        const matchesPa = log.relatedPlatformAdminId === pa || log.actor.toLowerCase().includes(pa.toLowerCase());
        if (!matchesPa) return false;
      }

      if (riskOnly && !isRiskGovernanceAuditEvent(log)) return false;

      if (conflictOnly && !isConflictWorkflowAuditEvent(log)) return false;

      if (dateRange !== "all" && rangeMs !== Infinity) {
        const t = Date.parse(log.timestamp);
        if (Number.isNaN(t) || ANCHOR_NOW_MS - t > rangeMs) return false;
      }

      return true;
    });
  }, [
    sortedLogs,
    searchQuery,
    governanceCategory,
    entityType,
    actorFilter,
    organizationFilter,
    severityGov,
    dateRange,
    verifymeIdFilter,
    identityLinkFilter,
    clientAppFilter,
    verificationSessionFilter,
    platformAdminIdFilter,
    governanceFocus,
  ]);

  const summary = useMemo(() => {
    let high = 0;
    let critical = 0;
    filteredLogs.forEach((log) => {
      const sev = deriveGovernanceSeverityLabel(log);
      if (sev === "High") high += 1;
      if (sev === "Critical") critical += 1;
    });
    return {
      total: filteredLogs.length,
      high,
      critical,
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

  return (
    <>
      <PortalPageFrame
        variant="fill"
        rootClassName="h-full"
        title="Audit Logs"
        description="Governance-aligned audit trail across platform operations and verification activity."
        headerClassName="border-border/80 px-5 py-3.5 sm:px-7"
        headingClassName="text-xl font-semibold tracking-tight md:text-2xl"
        contentMaxWidthClass="max-w-[min(100%,90rem)]"
        headerActions={
          <div className="flex items-center gap-2">
            {showSettingsBackLink ? (
              <Button variant="ghost" size="sm" type="button" asChild>
                <Link to="/settings">Platform Settings</Link>
              </Button>
            ) : null}
            {canExportLogs ? (
              <Button variant="outline" size="sm" type="button" className="h-8 text-xs">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export
              </Button>
            ) : null}
          </div>
        }
        headerExtra={
          <p className="text-[11px] leading-snug text-muted-foreground">
            Audit visibility is shown for preview. Production audit access must be scoped by backend RBAC.
          </p>
        }
        bodyClassName="space-y-3 px-5 pb-4 pt-3 sm:px-7 sm:pb-5 sm:pt-4"
      >
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span className="tabular-nums">
            <span className="font-medium text-foreground">{summary.total.toLocaleString()}</span> events
          </span>
          <span aria-hidden>•</span>
          <Badge variant="secondary" className="h-5 px-2 text-[10px] font-normal tabular-nums">
            {summary.high.toLocaleString()} high severity
          </Badge>
          <Badge variant="secondary" className="h-5 px-2 text-[10px] font-normal tabular-nums">
            {summary.critical.toLocaleString()} critical
          </Badge>
        </div>

        <Card className="overflow-hidden border border-border/70 shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-3 py-2">
            <p className="text-[11px] text-muted-foreground tabular-nums">
              {totalLogs === 0
                ? "No matching events"
                : `${startIndex + 1}–${endIndex} of ${totalLogs.toLocaleString()}`}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="h-7 px-2 text-xs"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                Previous
              </Button>
              <span className="px-1 text-[11px] tabular-nums text-muted-foreground">
                {safeCurrentPage} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="h-7 px-2 text-xs"
                disabled={safeCurrentPage === totalPages || totalLogs === 0}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="min-w-[640px] overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="sticky top-0 border-b border-border/60 bg-muted/25">
                <tr>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-muted-foreground">Time</th>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-muted-foreground">Event</th>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-muted-foreground">Category</th>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-muted-foreground">Severity</th>
                  <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-muted-foreground">Actor</th>
                  <th className="px-2.5 py-1.5 text-right text-[10px] font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {visibleLogs.map((log) => {
                  const govSev = deriveGovernanceSeverityLabel(log);
                  return (
                    <tr
                      key={log.id}
                      className="cursor-pointer transition-colors hover:bg-muted/30"
                      onClick={(e) => {
                        if (shouldIgnoreRowOpenClick(e.target)) return;
                        handleLogClick(log);
                      }}
                    >
                      <td
                        className="whitespace-nowrap px-2.5 py-1.5 align-middle tabular-nums text-[10px] text-muted-foreground"
                        title={formatDateTime(log.timestamp)}
                      >
                        {formatRelativeAuditTime(log.timestamp, ANCHOR_NOW_MS)}
                      </td>
                      <td className="max-w-[16rem] px-2.5 py-1.5 align-middle">
                        <p className="line-clamp-2 font-medium leading-snug text-foreground">{getActionLabel(log.action)}</p>
                      </td>
                      <td className="whitespace-nowrap px-2.5 py-1.5 align-middle text-[11px] text-muted-foreground">
                        {getGovernanceCategoryForLog(log)}
                      </td>
                      <td className="px-2.5 py-1.5 align-middle whitespace-nowrap">
                        <GovernanceSeverityBadge label={govSev} />
                      </td>
                      <td className="max-w-[10rem] px-2.5 py-1.5 align-middle">
                        <p className="truncate text-foreground">{log.actor}</p>
                      </td>
                      <td className="px-2.5 py-1.5 align-middle text-right">
                        <button
                          type="button"
                          className="text-[10px] font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-primary hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLogClick(log);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {visibleLogs.length === 0 ? (
                  <TableEmptyStateRow colSpan={6} title="No audit logs match current filters." />
                ) : null}
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

  const internalSev = deriveAuditSeverity(log);
  const govSev = deriveGovernanceSeverityLabel(log);
  const safePayload = redactPayloadForDisplay(log.payload);
  const sessionRef = log.sessionRef ?? log.relatedVerificationSessionId;

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

  const hasEntityLinks =
    Boolean(log.relatedVerifymeId) ||
    Boolean(log.relatedClientAppId) ||
    Boolean(log.relatedIdentityLinkId) ||
    Boolean(sessionRef);

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
              <p className="text-sm text-muted-foreground">{formatDateTime(log.timestamp)}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded p-1 transition-colors hover:bg-accent">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Summary</span> — {getActionLabel(log.action)} ·{" "}
              {getGovernanceCategoryForLog(log)} · {log.organization} · {formatDateTime(log.timestamp)} · outcome{" "}
              {getStatusLabel(log.status)} · governance severity {govSev} (internal {severityLabelInternal(internalSev)}).
            </div>

            <div className="space-y-6">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Details</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="mb-1 text-xs text-muted-foreground">Log ID</p>
                  <p className="font-mono text-sm text-foreground">{log.id}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Event</p>
                  <p className="text-sm font-medium text-foreground">{getActionLabel(log.action)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Event key</p>
                  <p className="font-mono text-xs text-muted-foreground">{log.action}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Category</p>
                  <p className="text-sm text-foreground">{getGovernanceCategoryForLog(log)}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Event area (legacy facet)</p>
                  <p className="text-sm text-foreground">{getAuditTableCategory(log.action)}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Subject</p>
                  <p className="text-sm text-foreground">{entityTypeShort(log)}</p>
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
                  <p className="mt-2 text-xs text-muted-foreground">Organization ID</p>
                  <p className="font-mono text-xs text-muted-foreground">{log.organizationId}</p>
                  {orgLinkable ? (
                    <Link
                      to={`/organizations/${encodeURIComponent(log.organizationId)}`}
                      className="mt-2 inline-block text-sm text-primary underline-offset-4 hover:underline"
                    >
                      Open organization detail
                    </Link>
                  ) : (
                    <p className="mt-2 text-[11px] text-muted-foreground">Organization detail is not available for this record.</p>
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
                  <p className="mb-1 text-xs text-muted-foreground">Governance severity</p>
                  <span
                    className={`inline-flex items-center rounded-md border px-3 py-1 text-sm font-medium ${governanceSeverityBadgeClass(
                      govSev,
                    )}`}
                  >
                    {govSev}
                  </span>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Source IP</p>
                  <p className="font-mono text-sm text-foreground">{log.ipAddress}</p>
                </div>
                {log.userAgent ? (
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">User agent</p>
                    <p className="truncate text-xs text-foreground">{log.userAgent}</p>
                  </div>
                ) : null}
                {log.requestRef ? (
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">Request reference</p>
                    <p className="font-mono text-sm text-foreground">{log.requestRef}</p>
                  </div>
                ) : null}
                {sessionRef ? (
                  <div className="col-span-2">
                    <p className="mb-1 text-xs text-muted-foreground">Verification session reference</p>
                    <p className="font-mono text-sm text-foreground">{sessionRef}</p>
                    <Link
                      className="mt-2 inline-block text-sm text-primary underline-offset-4 hover:underline"
                      to={`/verification-sessions?sessionId=${encodeURIComponent(sessionRef)}`}
                    >
                      Open verification session detail
                    </Link>
                  </div>
                ) : null}
              </div>

              {log.changeTracking && log.changeTracking.length > 0 ? (
                <div className="rounded-lg border border-border bg-muted/10 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Changes</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    High-level state transitions only — no raw credentials or comparison payloads.
                  </p>
                  <ul className="mt-3 space-y-3">
                    {log.changeTracking.map((c, i) => (
                      <li key={i} className="rounded-md border border-border/80 bg-background/60 px-3 py-2 text-sm">
                        <p className="font-medium text-foreground">{c.label}</p>
                        <p className="mt-1 text-[13px] text-muted-foreground">
                          <span className="text-foreground/80">{c.before}</span>
                          <span className="mx-2 text-muted-foreground">→</span>
                          <span className="text-foreground/80">{c.after}</span>
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

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
                        Client app {log.relatedClientAppId}
                      </Link>
                    </li>
                  ) : null}
                  {log.relatedIdentityLinkId ? (
                    <li>
                      <Link
                        className="text-primary underline-offset-4 hover:underline"
                        to={`/identity-links/${encodeURIComponent(log.relatedIdentityLinkId)}`}
                      >
                        Identity link {log.relatedIdentityLinkId}
                      </Link>
                    </li>
                  ) : null}
                  {sessionRef ? (
                    <li>
                      <Link
                        className="text-primary underline-offset-4 hover:underline"
                        to={`/verification-sessions?sessionId=${encodeURIComponent(sessionRef)}`}
                      >
                        Verification session {sessionRef}
                      </Link>
                    </li>
                  ) : null}
                  {!hasEntityLinks ? <li className="text-muted-foreground">No entity links for this row.</li> : null}
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
