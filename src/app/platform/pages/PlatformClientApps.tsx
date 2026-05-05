import { Search, Filter } from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useSearchParams } from "react-router";
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
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import {
  getClientAppsStoreVersion,
  getClientAppRows,
  subscribeClientAppsListeners,
} from "../data/platformClientAppsSession";
import type { ClientAppEnvironment, PlatformClientAppRow } from "../data/platformClientAppsSample";
import { buildInitialOrganizations, formatIntegrationStatus, type IntegrationStatus } from "../data/platformOrganizationsSample";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";
import { shouldIgnoreRowOpenClick } from "../utils/tableRowNav";

export function PlatformClientApps() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlOrganizationId = searchParams.get("organizationId");

  const version = useSyncExternalStore(
    subscribeClientAppsListeners,
    getClientAppsStoreVersion,
    getClientAppsStoreVersion,
  );

  const rows = useMemo(() => getClientAppRows(), [version]);

  const [searchQuery, setSearchQuery] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("all-orgs");
  const [environmentFilter, setEnvironmentFilter] = useState<"all" | ClientAppEnvironment>("all");
  const [integrationFilter, setIntegrationFilter] = useState<"all" | IntegrationStatus>("all");

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
        </>
      }
      bodyClassName="space-y-6"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Total client apps</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{summary.total}</p>
        </Card>
        <Card className="border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Production active</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{summary.productionActive}</p>
        </Card>
        <Card className="border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Sandbox active</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{summary.sandboxActive}</p>
        </Card>
        <Card className="border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Missing redirect URI</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{summary.missingRedirect}</p>
        </Card>
        <Card className="border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Missing QR keys</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{summary.missingQr}</p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search organization, client_id, app name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 bg-background pl-10"
          />
        </div>
        <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
          <SelectTrigger className="h-10 w-[200px]">
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
          <SelectTrigger className="h-10 w-[150px]">
            <SelectValue placeholder="Environment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All env</SelectItem>
            <SelectItem value="production">Production</SelectItem>
            <SelectItem value="sandbox">Sandbox</SelectItem>
          </SelectContent>
        </Select>
        <Select value={integrationFilter} onValueChange={(v) => setIntegrationFilter(v as typeof integrationFilter)}>
          <SelectTrigger className="h-10 w-[200px]">
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
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Card className="overflow-hidden border border-border shadow-sm">
        <div className="min-w-[1100px] overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="border-b border-border bg-accent/5">
              <tr>
                <th className="p-3 text-left font-medium text-muted-foreground">Organization</th>
                <th className="p-3 text-left font-medium text-muted-foreground">client_id</th>
                <th className="p-3 text-left font-medium text-muted-foreground">App name / type</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Environment</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Scopes</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Redirect URI</th>
                <th className="p-3 text-left font-medium text-muted-foreground">QR / keys</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Secret status</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Last used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="cursor-pointer transition-colors hover:bg-accent/10"
                  onClick={(e) => {
                    if (shouldIgnoreRowOpenClick(e.target)) return;
                    navigate(`/client-apps/${encodeURIComponent(r.id)}`);
                  }}
                >
                  <td className="p-3 align-top">
                    <p className="font-medium text-foreground">{r.organizationName}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{r.organizationId}</p>
                  </td>
                  <td className="max-w-[140px] break-all p-3 align-top font-mono text-[12px]">{r.clientId}</td>
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
                          className="inline-flex items-center rounded border border-border bg-muted/40 px-2 py-0.5 font-mono text-[11px] text-foreground"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    {r.futureScopes?.length ? (
                      <p className="mt-1 text-[11px] text-muted-foreground">
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
                  <td className="whitespace-nowrap p-3 align-top text-muted-foreground">{formatDateTime(r.lastUsed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PortalPageFrame>
  );
}
