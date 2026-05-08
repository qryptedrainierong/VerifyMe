import { ArrowLeft, ClipboardList, Code2 } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Button } from "../../shared/components/ui/button";
import { Card } from "../../shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../shared/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/components/ui/tabs";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import { AuditHintText } from "../../shared/components/AuditHintText";
import {
  getClientAppById,
  getClientAppsStoreVersion,
  subscribeClientAppsListeners,
  updateClientAppRow,
} from "../data/platformClientAppsSession";
import type { PlatformClientAppRow } from "../data/platformClientAppsSample";
import { formatIntegrationStatus } from "../data/platformOrganizationsSample";
import { auditLogsHref } from "../utils/auditLogsNavigation";

function formatDateTime(iso: string | null) {
  return iso
    ? new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
      })
    : "—";
}

function redirectLabel(s: PlatformClientAppRow["redirectUriStatus"]) {
  return s === "configured" ? "Configured" : "Missing";
}

function qrLabel(s: PlatformClientAppRow["qrKeyReadiness"]) {
  return s === "ready" ? "Ready" : "Missing";
}

function secretLabel(s: PlatformClientAppRow["secretStatus"]) {
  return s === "configured" ? "Configured (masked)" : "Rotation due";
}

export function PlatformClientAppDetail() {
  const navigate = useNavigate();
  const { clientAppId } = useParams();

  const version = useSyncExternalStore(
    subscribeClientAppsListeners,
    getClientAppsStoreVersion,
    getClientAppsStoreVersion,
  );

  const row = useMemo(() => getClientAppById(clientAppId), [clientAppId, version]);

  const [rotateOpen, setRotateOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!clientAppId || !row) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <p className="text-sm text-muted-foreground">Client application not found.</p>
        <Button variant="outline" onClick={() => navigate("/client-apps")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Client Apps / API
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/client-apps")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Client Apps / API
          </Button>
          {message ? (
            <div className="mb-4 rounded-md border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm text-green-700 dark:text-green-300">
              {message}
            </div>
          ) : null}
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Code2 className="h-7 w-7 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 font-mono text-xs text-muted-foreground break-all">{row.clientId}</p>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{row.appName}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{row.organizationName}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <UnifiedBadge variant="status" value={row.environment === "production" ? "Production" : "Sandbox"} />
                <UnifiedBadge variant="integration" value={formatIntegrationStatus(row.integrationStatus)} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link
                    to={auditLogsHref({ clientAppId: row.id, entityType: "client_app" })}
                    className="inline-flex items-center gap-2"
                  >
                    <ClipboardList className="h-4 w-4" />
                    View audit history
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-8">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="flex h-9 w-full min-w-0 flex-wrap gap-1 bg-muted/40 p-1 sm:flex-nowrap">
              <TabsTrigger value="details" className="text-[11px] sm:text-xs">
                App Details
              </TabsTrigger>
              <TabsTrigger value="redirect" className="text-[11px] sm:text-xs">
                Redirect URIs
              </TabsTrigger>
              <TabsTrigger value="scopes" className="text-[11px] sm:text-xs">
                Scopes & Integration
              </TabsTrigger>
              <TabsTrigger value="controls" className="text-[11px] sm:text-xs">
                Client App Controls
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6">
              <Card className="border border-border p-6 shadow-sm">
                <p className="text-xs font-medium text-muted-foreground">App Details</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <UnifiedBadge variant="integration" value={formatIntegrationStatus(row.integrationStatus)} />
                  <UnifiedBadge variant="status" value={row.environment === "production" ? "Production" : "Sandbox"} />
                </div>
                <dl className="mt-6 space-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Client ID</dt>
                    <dd className="font-mono text-[13px] break-all">{row.clientId}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Organization</dt>
                    <dd className="font-medium">{row.organizationName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">App name</dt>
                    <dd className="font-medium">{row.appName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">App type</dt>
                    <dd>{row.appType}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Environment</dt>
                    <dd className="capitalize">{row.environment}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Integration status</dt>
                    <dd>
                      <UnifiedBadge variant="integration" value={formatIntegrationStatus(row.integrationStatus)} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Last used</dt>
                    <dd>{formatDateTime(row.lastUsed)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Secret status</dt>
                    <dd>{secretLabel(row.secretStatus)}</dd>
                  </div>
                </dl>
                <p className="mt-6 text-xs text-muted-foreground">No raw client_secret is shown.</p>
              </Card>
            </TabsContent>

            <TabsContent value="redirect" className="mt-6">
              <Card className="border border-border p-6 shadow-sm">
                <p className="text-xs font-medium text-muted-foreground">Redirect URIs</p>
                <div className="mt-3">
                  <UnifiedBadge variant="status" value={redirectLabel(row.redirectUriStatus)} />
                  <span className="ml-2 text-[12px] capitalize text-muted-foreground">{row.environment}</span>
                </div>
                {row.registeredRedirectUris.length > 0 ? (
                  <ul className="mt-4 space-y-2 font-mono text-[12px] text-foreground">
                    {row.registeredRedirectUris.map((u) => (
                      <li key={u} className="break-all rounded border border-border bg-muted/30 px-3 py-2">
                        {u}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">No redirect URIs registered.</p>
                )}
                <p className="mt-4 text-[12px] text-muted-foreground">
                  Only registered redirect URIs may receive authorization codes.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="scopes" className="mt-6">
              <Card className="border border-border p-6 shadow-sm">
                <p className="text-xs font-medium text-muted-foreground">Scopes & Integration</p>
                <p className="mt-2 text-sm text-muted-foreground">Enabled scope</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {row.enabledScopes.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center rounded border border-border bg-muted/40 px-2 py-0.5 font-mono text-[11px] text-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                {row.futureScopes?.length ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Additional scopes (not enabled): {row.futureScopes.join(", ")}
                  </p>
                ) : null}
                <div className="mt-6 border-t border-border pt-4 space-y-2 text-[13px]">
                  <p className="text-xs font-medium text-muted-foreground">OIDC endpoints (reference)</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Authorize — start user authorization</li>
                    <li>Handle Authorization — callback / code issuance</li>
                    <li>Token — exchange code for tokens</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-medium text-muted-foreground">QR / keys readiness</p>
                  <div className="mt-2">
                    <UnifiedBadge variant="status" value={qrLabel(row.qrKeyReadiness)} />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="controls" className="mt-6">
              <Card className="border border-border p-6 shadow-sm">
                <p className="text-xs font-medium text-muted-foreground">Client App Controls</p>
                <p className="mt-2 text-sm text-muted-foreground">Confirmation required. No secret values are displayed.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setRotateOpen(true)}>
                    Rotate secret…
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setDisableOpen(true)}>
                    Disable app…
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={rotateOpen} onOpenChange={setRotateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rotate client secret?</DialogTitle>
            <DialogDescription>
              Records a credential rotation for <span className="font-mono">{row.clientId}</span>. Secret values are never
              displayed in this portal.
            </DialogDescription>
          </DialogHeader>
          <AuditHintText />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRotateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                updateClientAppRow(row.id, { secretStatus: "configured" });
                setRotateOpen(false);
                setMessage(`Secret rotation recorded for ${row.appName}.`);
              }}
            >
              Confirm rotate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disable client application?</DialogTitle>
            <DialogDescription>
              Disables this client application for <span className="font-mono">{row.clientId}</span> and marks integration as
              not configured until restored.
            </DialogDescription>
          </DialogHeader>
          <AuditHintText />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDisableOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                updateClientAppRow(row.id, { integrationStatus: "not_configured" });
                setDisableOpen(false);
                setMessage(`${row.appName} disabled.`);
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
