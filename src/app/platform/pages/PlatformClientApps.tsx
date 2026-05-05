import { Search, Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../shared/components/ui/dialog";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import {
  platformClientApps,
  type ClientAppEnvironment,
  type PlatformClientAppRow,
} from "../data/platformClientAppsSample";
import { buildInitialOrganizations, formatIntegrationStatus, type IntegrationStatus } from "../data/platformOrganizationsSample";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";

export function PlatformClientApps() {
  const [searchParams] = useSearchParams();
  const urlOrganizationId = searchParams.get("organizationId");

  const [rows, setRows] = useState(platformClientApps);
  const [searchQuery, setSearchQuery] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("all-orgs");
  const [environmentFilter, setEnvironmentFilter] = useState<"all" | ClientAppEnvironment>("all");
  const [integrationFilter, setIntegrationFilter] = useState<"all" | IntegrationStatus>("all");
  const [detailRow, setDetailRow] = useState<PlatformClientAppRow | null>(null);
  const [rotateRow, setRotateRow] = useState<PlatformClientAppRow | null>(null);
  const [disableRow, setDisableRow] = useState<PlatformClientAppRow | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const knownOrgIds = useMemo(() => new Set(buildInitialOrganizations().map((o) => o.id)), []);

  useEffect(() => {
    if (urlOrganizationId && knownOrgIds.has(urlOrganizationId)) {
      setOrganizationFilter(urlOrganizationId);
    }
  }, [urlOrganizationId, knownOrgIds]);

  const organizationOptions = useMemo(() => {
    const m = new Map<string, string>();
    rows.forEach((r) => m.set(r.organizationId, r.organizationName));
    return Array.from(m.entries()).map(([id, name]) => ({ id, name }));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQ =
        q.length === 0 ||
        r.organizationName.toLowerCase().includes(q) ||
        r.organizationId.toLowerCase().includes(q) ||
        r.clientId.toLowerCase().includes(q) ||
        r.appName.toLowerCase().includes(q) ||
        r.appType.toLowerCase().includes(q);
      const matchesOrg = organizationFilter === "all-orgs" || r.organizationId === organizationFilter;
      const matchesEnv = environmentFilter === "all" || r.environment === environmentFilter;
      const matchesInt = integrationFilter === "all" || r.integrationStatus === integrationFilter;
      return matchesQ && matchesOrg && matchesEnv && matchesInt;
    });
  }, [rows, searchQuery, organizationFilter, environmentFilter, integrationFilter]);

  const summary = useMemo(() => {
    const b = filtered;
    return {
      total: b.length,
      productionActive: b.filter((r) => r.integrationStatus === "production_active").length,
      sandboxActive: b.filter((r) => r.integrationStatus === "sandbox_active").length,
      missingRedirect: b.filter((r) => r.redirectUriStatus === "missing").length,
      missingQr: b.filter((r) => r.qrKeyReadiness === "missing").length,
    };
  }, [filtered]);

  const formatDateTime = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZone: "UTC",
        })
      : "—";

  const redirectLabel = (s: PlatformClientAppRow["redirectUriStatus"]) => (s === "configured" ? "Configured" : "Missing");
  const qrLabel = (s: PlatformClientAppRow["qrKeyReadiness"]) => (s === "ready" ? "Ready" : "Missing");
  const secretLabel = (s: PlatformClientAppRow["secretStatus"]) =>
    s === "configured" ? "Configured (masked)" : "Rotation due";

  return (
    <>
      <PortalPageFrame
        variant="fill"
        rootClassName="h-full"
        title="Client Apps / API"
        description="Platform-wide view of organization client applications and integration readiness. Client secrets, private keys, and raw QR payloads are never shown."
        headerExtra={
          <>
            {urlOrganizationId ? (
              <p className="text-xs text-muted-foreground sm:text-sm">
                URL filter: <span className="font-mono text-foreground">{urlOrganizationId}</span>
                {!knownOrgIds.has(urlOrganizationId)
                  ? " — unknown organization id in sample set; adjust filters manually."
                  : " — applied when recognized in sample organizations."}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground sm:text-sm">
                Optional <span className="font-mono">?organizationId=…</span> pre-selects organization when recognized
                (design-phase).
              </p>
            )}
            {message ? (
              <div className="rounded-md border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm text-green-700 dark:text-green-300">
                {message}
              </div>
            ) : null}
          </>
        }
        bodyClassName="space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4 border border-border shadow-sm">
            <p className="text-[12px] text-muted-foreground">Total client apps</p>
            <p className="text-[22px] font-semibold tabular-nums">{summary.total}</p>
          </Card>
          <Card className="p-4 border border-border shadow-sm">
            <p className="text-[12px] text-muted-foreground">Production active</p>
            <p className="text-[22px] font-semibold tabular-nums">{summary.productionActive}</p>
          </Card>
          <Card className="p-4 border border-border shadow-sm">
            <p className="text-[12px] text-muted-foreground">Sandbox active</p>
            <p className="text-[22px] font-semibold tabular-nums">{summary.sandboxActive}</p>
          </Card>
          <Card className="p-4 border border-border shadow-sm">
            <p className="text-[12px] text-muted-foreground">Missing redirect URI</p>
            <p className="text-[22px] font-semibold tabular-nums">{summary.missingRedirect}</p>
          </Card>
          <Card className="p-4 border border-border shadow-sm">
            <p className="text-[12px] text-muted-foreground">Missing QR keys</p>
            <p className="text-[22px] font-semibold tabular-nums">{summary.missingQr}</p>
          </Card>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search organization, client_id, app name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
            <SelectTrigger className="w-[200px] h-10">
              <SelectValue placeholder="Organization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-orgs">All organizations</SelectItem>
              {organizationOptions.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={environmentFilter} onValueChange={(v) => setEnvironmentFilter(v as typeof environmentFilter)}>
            <SelectTrigger className="w-[150px] h-10">
              <SelectValue placeholder="Environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All env</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="sandbox">Sandbox</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={integrationFilter}
            onValueChange={(v) => setIntegrationFilter(v as typeof integrationFilter)}
          >
            <SelectTrigger className="w-[200px] h-10">
              <SelectValue placeholder="Integration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All integration states</SelectItem>
              <SelectItem value="not_configured">Not configured</SelectItem>
              <SelectItem value="missing_redirect_uri">Missing redirect URI</SelectItem>
              <SelectItem value="missing_keys">Missing keys</SelectItem>
              <SelectItem value="ready_for_testing">Ready for testing</SelectItem>
              <SelectItem value="sandbox_active">Sandbox active</SelectItem>
              <SelectItem value="production_active">Production active</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => {
              setSearchQuery("");
              setOrganizationFilter("all-orgs");
              setEnvironmentFilter("all");
              setIntegrationFilter("all");
            }}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <Card className="border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-w-[1100px]">
            <table className="w-full text-[13px]">
              <thead className="border-b border-border bg-accent/5">
                <tr>
                  <th className="text-left p-3 font-medium text-muted-foreground">Organization</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">client_id</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">App name / type</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Environment</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Scopes</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Redirect URI</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">QR / keys</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Secret status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Last used</th>
                  <th className="text-left p-3 font-medium text-muted-foreground w-[220px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-accent/5">
                    <td className="p-3 align-top">
                      <p className="font-medium text-foreground">{r.organizationName}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">{r.organizationId}</p>
                    </td>
                    <td className="p-3 font-mono text-[12px] align-top break-all max-w-[140px]">{r.clientId}</td>
                    <td className="p-3 align-top">
                      <p className="font-medium">{r.appName}</p>
                      <p className="text-[12px] text-muted-foreground">{r.appType}</p>
                    </td>
                    <td className="p-3 align-top capitalize">{r.environment}</td>
                    <td className="p-3 align-top">
                      <div className="flex flex-wrap gap-1">
                        {r.enabledScopes.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center rounded border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-mono text-foreground"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      {r.futureScopes?.length ? (
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Future: {r.futureScopes.join(", ")} (not enabled)
                        </p>
                      ) : null}
                    </td>
                    <td className="p-3 align-top">
                      <UnifiedBadge variant="status" value={redirectLabel(r.redirectUriStatus)} />
                    </td>
                    <td className="p-3 align-top">
                      <UnifiedBadge variant="status" value={qrLabel(r.qrKeyReadiness)} />
                    </td>
                    <td className="p-3 align-top">
                      <UnifiedBadge variant="status" value={secretLabel(r.secretStatus)} />
                    </td>
                    <td className="p-3 text-muted-foreground align-top whitespace-nowrap">
                      {formatDateTime(r.lastUsed)}
                    </td>
                    <td className="p-3 align-top">
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" onClick={() => setDetailRow(r)}>
                          View details
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setRotateRow(r)}>
                          Rotate secret (mock)
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDisableRow(r)}>
                          Disable app (mock)
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </PortalPageFrame>

      <Dialog open={detailRow !== null} onOpenChange={(o) => !o && setDetailRow(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Client application</DialogTitle>
            <DialogDescription>Read-only sample — no secrets or key material.</DialogDescription>
          </DialogHeader>
          {detailRow ? (
            <div className="space-y-2 text-[13px]">
              <p>
                <span className="text-muted-foreground">Organization:</span> {detailRow.organizationName} (
                {detailRow.organizationId})
              </p>
              <p>
                <span className="text-muted-foreground">client_id:</span>{" "}
                <span className="font-mono break-all">{detailRow.clientId}</span>
              </p>
              <p>
                <span className="text-muted-foreground">App:</span> {detailRow.appName} ({detailRow.appType})
              </p>
              <p>
                <span className="text-muted-foreground">Environment:</span> {detailRow.environment}
              </p>
              <p>
                <span className="text-muted-foreground">Enabled scopes (MVP):</span> {detailRow.enabledScopes.join(", ")}
              </p>
              {detailRow.futureScopes?.length ? (
                <p>
                  <span className="text-muted-foreground">Future scopes:</span> {detailRow.futureScopes.join(", ")}
                </p>
              ) : null}
              <p className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground">Integration:</span>
                <UnifiedBadge variant="integration" value={formatIntegrationStatus(detailRow.integrationStatus)} />
              </p>
              <p>
                <span className="text-muted-foreground">Redirect URI:</span> {redirectLabel(detailRow.redirectUriStatus)}
              </p>
              <p>
                <span className="text-muted-foreground">QR / keys:</span> {qrLabel(detailRow.qrKeyReadiness)}
              </p>
              <p>
                <span className="text-muted-foreground">Secret:</span> {secretLabel(detailRow.secretStatus)}
              </p>
              <p>
                <span className="text-muted-foreground">Last used:</span> {formatDateTime(detailRow.lastUsed)}
              </p>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailRow(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rotateRow !== null} onOpenChange={(o) => !o && setRotateRow(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rotate client secret?</DialogTitle>
            <DialogDescription>
              Mock only: marks secret rotation as satisfied for{" "}
              {rotateRow ? <span className="font-mono">{rotateRow.clientId}</span> : null}. Raw secrets are never
              displayed.
            </DialogDescription>
          </DialogHeader>
          <p className="text-[12px] text-muted-foreground border border-border/80 rounded-md bg-muted/30 px-3 py-2">
            This action will be recorded in audit logs.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRotateRow(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!rotateRow) return;
                setRows((prev) =>
                  prev.map((x) => (x.id === rotateRow.id ? { ...x, secretStatus: "configured" as const } : x)),
                );
                setRotateRow(null);
                setMessage(`Secret rotation recorded for ${rotateRow.appName} (mock).`);
              }}
            >
              Confirm rotate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={disableRow !== null} onOpenChange={(o) => !o && setDisableRow(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disable client application?</DialogTitle>
            <DialogDescription>
              Mock only: sets integration to not configured for{" "}
              {disableRow ? <span className="font-mono">{disableRow.clientId}</span> : null}.
            </DialogDescription>
          </DialogHeader>
          <p className="text-[12px] text-muted-foreground border border-border/80 rounded-md bg-muted/30 px-3 py-2">
            This action will be recorded in audit logs.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDisableRow(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!disableRow) return;
                setRows((prev) =>
                  prev.map((x) =>
                    x.id === disableRow.id ? { ...x, integrationStatus: "not_configured" as const } : x,
                  ),
                );
                setDisableRow(null);
                setMessage(`${disableRow.appName} disabled in sample data (mock).`);
              }}
            >
              Confirm disable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
