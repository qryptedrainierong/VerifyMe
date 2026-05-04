import { BookOpen, ExternalLink, KeyRound, Link2, Plug } from "lucide-react";
import { Card } from "../../shared/components/ui/card";
import { Button } from "../../shared/components/ui/button";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import {
  enterpriseApiDocCards,
  enterpriseMockClientApplication,
  enterpriseMockRedirectUris,
  enterpriseOrganization,
} from "../data/enterpriseSample";

export function EnterpriseApiIntegration() {
  const client = enterpriseMockClientApplication;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="p-8 space-y-8 max-w-[1200px]">
      <div>
        <h1 className="text-[28px] font-semibold text-foreground">API integration</h1>
        <p className="text-[15px] text-muted-foreground mt-1 max-w-3xl">
          OIDC-style client configuration for VerifyMe: client identifiers, redirect URIs, scopes, and confidential-client
          secret handling (design-time sample).
        </p>
      </div>

      <Card className="p-6 border border-border shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <Plug className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-foreground">Client application</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">{client.name}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="https://docs.verifyme.example/api-overview" target="_blank" rel="noreferrer">
                <BookOpen className="w-4 h-4 mr-2" />
                API overview
                <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-70" />
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://docs.verifyme.example/oidc" target="_blank" rel="noreferrer">
                OIDC guide
                <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-70" />
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">client_id</p>
            <code className="block text-[13px] font-mono bg-muted px-3 py-2 rounded-md break-all">{client.clientId}</code>
          </div>
          <div className="space-y-3">
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Environment</p>
            <p className="text-[15px] font-medium text-foreground">{client.environment}</p>
          </div>
          <div className="space-y-3">
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Secret status</p>
            <div className="flex flex-wrap items-center gap-2">
              <UnifiedBadge variant="status" value={client.secretStatus} />
              <span className="text-[13px] text-muted-foreground">Last rotated {formatDate(client.lastRotated)}</span>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Client secrets are shown once when generated and are not stored in plain text. Use{" "}
              <strong className="text-foreground">Rotate secret</strong> to issue a new secret; previous secrets stop
              working after rotation completes.
            </p>
            <Button variant="outline" size="sm">
              <KeyRound className="w-4 h-4 mr-2" />
              Rotate secret
            </Button>
          </div>
          <div className="space-y-3">
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Integration status</p>
            <UnifiedBadge variant="integration" value={client.integrationStatusLabel} />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border space-y-4">
          <div>
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-2">MVP scopes (enabled)</p>
            <div className="flex flex-wrap gap-2">
              {client.allowedScopes.map((s) => (
                <code key={s} className="text-[12px] bg-muted px-2 py-1 rounded font-mono">
                  {s}
                </code>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Future scopes (not enabled)</p>
            <p className="text-[12px] text-muted-foreground mb-2">
              Reserved for later releases — not part of the current MVP client configuration.
            </p>
            <div className="flex flex-wrap gap-2 opacity-70">
              {client.futureScopes.map((s) => (
                <code key={s} className="text-[12px] bg-muted/60 px-2 py-1 rounded font-mono text-muted-foreground">
                  {s}
                </code>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div id="redirect-uris" className="scroll-mt-8">
        <Card className="p-6 border border-border shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link2 className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-[18px] font-semibold text-foreground">Redirect URIs</h2>
              </div>
              <p className="text-[13px] text-muted-foreground max-w-2xl">
                Only registered redirect URIs can receive VerifyMe authorization codes. Use HTTPS callbacks that match
                your deployment environment.
              </p>
            </div>
            <Button size="sm">Add redirect URI</Button>
          </div>
          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-accent/40 border-b border-border">
                <tr>
                  <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">redirect_uri</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Environment</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Status</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground uppercase text-[11px]">Created</th>
                  <th className="text-right p-3 font-semibold text-muted-foreground uppercase text-[11px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enterpriseMockRedirectUris.map((row) => (
                  <tr key={row.id} className="hover:bg-accent/20">
                    <td className="p-3 font-mono text-[12px] break-all max-w-md">{row.redirectUri}</td>
                    <td className="p-3">{row.environment}</td>
                    <td className="p-3">
                      <UnifiedBadge variant="status" value={row.status === "active" ? "Active" : "Disabled"} />
                    </td>
                    <td className="p-3 text-muted-foreground">{formatDate(row.created)}</td>
                    <td className="p-3 text-right space-x-2">
                      <Button variant="outline" size="sm">
                        Disable
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card className="p-5 border border-border shadow-sm bg-muted/20">
        <h2 className="text-[16px] font-semibold text-foreground mb-2">Handle authorization (MVP)</h2>
        <p className="text-[13px] text-muted-foreground leading-relaxed max-w-3xl">
          Your organization’s representative enters the <strong className="text-foreground">one-time verification token</strong> on the{" "}
          <strong className="text-foreground">VerifyMe Verification Page</strong>.{" "}
          <strong className="text-foreground">Handle Authorization</strong> validates that token; when valid, it returns{" "}
          <code className="text-[12px] bg-muted px-1 rounded">auth_code</code>,{" "}
          <code className="text-[12px] bg-muted px-1 rounded">state</code>, and{" "}
          <code className="text-[12px] bg-muted px-1 rounded">redirect_uri</code> so your backend can continue the OIDC-style
          code flow. The registered <code className="text-[12px] bg-muted px-1 rounded">redirect_uri</code> receives the
          authorization code only after validation succeeds.
        </p>
      </Card>

      <div>
        <h2 className="text-[18px] font-semibold text-foreground mb-2">OIDC endpoints (reference)</h2>
        <p className="text-[13px] text-muted-foreground mb-4 max-w-3xl">
          Sample cards for documentation alignment. Replace base URLs with your VerifyMe tenant endpoints when integrating.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {enterpriseApiDocCards.map((card) => (
            <Card key={card.id} className="p-5 border border-border shadow-sm flex flex-col">
              <h3 className="text-[15px] font-semibold text-foreground mb-2">{card.title}</h3>
              <p className="text-[13px] text-muted-foreground flex-1 mb-3">{card.purpose}</p>
              <p className="text-[12px] text-foreground/90 font-mono bg-muted/80 rounded px-2 py-1.5 mb-3">
                {card.parametersSummary}
              </p>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                <UnifiedBadge
                  variant="integration"
                  value={card.readiness}
                />
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://docs.verifyme.example" target="_blank" rel="noreferrer" className="text-[12px]">
                    Docs
                    <ExternalLink className="w-3 h-3 ml-1 inline opacity-70" />
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-5 border border-dashed border-border bg-muted/20">
        <p className="text-[13px] text-muted-foreground">
          Organization: <strong className="text-foreground">{enterpriseOrganization.organizationName}</strong> · Plan{" "}
          <strong className="text-foreground">{enterpriseOrganization.plan}</strong>
        </p>
      </Card>
    </div>
  );
}
