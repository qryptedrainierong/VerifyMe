import { useEffect, useState } from "react";
import { Button } from "../../../shared/components/ui/button";
import { Card } from "../../../shared/components/ui/card";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../shared/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/components/ui/dialog";
import { UnifiedBadge } from "../../../shared/components/UnifiedBadge";
import {
  formatIntegrationStatus,
  formatLifecycleStatus,
  getVerificationSpend,
  type PlatformOrganization,
} from "../../data/platformOrganizationsSample";
import type { PlatformEndUserAssociation } from "../../data/platformUsersSample";
import { patchPlatformOrganization } from "../../data/platformOrganizationSessionOverrides";
import { Link } from "react-router";
import { BarChart3, CreditCard, DollarSign, ExternalLink, TrendingUp, Users } from "lucide-react";

type OrganizationProfile = {
  owner: { name: string; email: string; phone: string };
  billingEmail: string;
  address: string;
};

type OrganizationDetailTabsProps = {
  organization: PlatformOrganization;
  profile: OrganizationProfile;
  /** Reserved for future reintroduction of Linked End Users panel; not shown in the four-tab layout. */
  organizationEndUsers: PlatformEndUserAssociation[];
};

export function OrganizationDetailTabs({
  organization,
  profile,
  organizationEndUsers: _organizationEndUsers,
}: OrganizationDetailTabsProps) {
  const orgId = organization.id;
  const billableSpend = getVerificationSpend(organization);
  const creditPosition = organization.creditBalance - billableSpend;
  const walletAppliedToBillablePct =
    organization.creditBalance > 0 && billableSpend <= organization.creditBalance
      ? Math.min(100, (billableSpend / organization.creditBalance) * 100)
      : null;

  const [orgControlMessage, setOrgControlMessage] = useState<string | null>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [suspendConfirmInput, setSuspendConfirmInput] = useState("");

  const suspendCodeMatches = suspendConfirmInput.trim() === organization.organizationCode;

  useEffect(() => {
    setOrgControlMessage(null);
    setSuspendDialogOpen(false);
    setReactivateDialogOpen(false);
    setSuspendConfirmInput("");
  }, [organization.id, organization.seatLimit, organization.seatsUsed, organization.domain]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: organization.currency === "EUR" ? "EUR" : organization.currency === "SGD" ? "SGD" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

  const formatNumber = (num: number) => new Intl.NumberFormat("en-US").format(num);

  const setupSteps: Array<{
    id: string;
    label: string;
    done: boolean;
    cta?: { to: string; label: string };
  }> = [
    { id: "profile", label: "Complete profile", done: organization.status !== "draft" },
    {
      id: "api",
      label: "Configure API integration",
      done: organization.integrationStatus !== "not_configured",
      cta: { to: `/client-apps?organizationId=${encodeURIComponent(orgId)}`, label: "Client Apps / API" },
    },
    {
      id: "redirect",
      label: "Add redirect URI",
      done: !["not_configured", "missing_redirect_uri"].includes(organization.integrationStatus),
      cta: {
        to: `/client-apps?organizationId=${encodeURIComponent(orgId)}#redirect-uris`,
        label: "Redirect URIs",
      },
    },
    {
      id: "qr",
      label: "Configure QR linking keys",
      done: !["not_configured", "missing_keys"].includes(organization.integrationStatus),
      cta: { to: `/identity-links?organizationId=${encodeURIComponent(orgId)}`, label: "Identity Links" },
    },
    {
      id: "verify",
      label: "Configure verification settings",
      done: organization.integrationStatus === "production_active" || organization.integrationStatus === "sandbox_active",
      cta: { to: `/settings?organizationId=${encodeURIComponent(orgId)}`, label: "Platform settings" },
    },
    { id: "test", label: "Test integration", done: organization.integrationStatus === "production_active" },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <Tabs defaultValue="org-details" className="h-full flex flex-col">
        <div className="border-b border-border px-8 overflow-x-auto">
          <TabsList className="bg-transparent inline-flex w-max min-w-full flex-nowrap h-auto py-1 gap-1 flex-wrap">
            <TabsTrigger value="org-details" className="text-[12px] shrink-0">
              Organization Details
            </TabsTrigger>
            <TabsTrigger value="usage" className="text-[12px] shrink-0">
              Usage
            </TabsTrigger>
            <TabsTrigger value="integration" className="text-[12px] shrink-0">
              Integration Checklist
            </TabsTrigger>
            <TabsTrigger value="controls" className="text-[12px] shrink-0">
              Organization Controls
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="org-details" className="flex-1 overflow-auto p-8 space-y-6 m-0 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border border-border shadow-sm lg:col-span-2">
              <div className="p-6 border-b border-border">
                <h3 className="text-[16px] font-semibold text-foreground">Info</h3>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Organization name</p>
                  <p className="text-[14px] text-foreground font-medium">{organization.organizationName}</p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Legal name</p>
                  <p className="text-[14px] text-foreground">{organization.legalName}</p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Organization type</p>
                  <p className="text-[14px] text-foreground">{organization.organizationType}</p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Industry</p>
                  <p className="text-[14px] text-foreground">{organization.industry}</p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Company size</p>
                  <p className="text-[14px] text-foreground">{organization.companySize}</p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Organization code</p>
                  <p className="text-[14px] text-foreground font-mono">{organization.organizationCode}</p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Primary client_id</p>
                  <p className="text-[13px] text-foreground font-mono break-all">{organization.primaryClientId}</p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Internal organization_id</p>
                  <p className="text-[13px] text-foreground font-mono">{organization.id}</p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Domain</p>
                  <p className="text-[14px] text-foreground">{organization.domain}</p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Country / timezone</p>
                  <p className="text-[14px] text-foreground">
                    {organization.country} · {organization.timezone}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Currency</p>
                  <p className="text-[14px] text-foreground">{organization.currency}</p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Owner</p>
                  <p className="text-[14px] text-foreground">{profile.owner.name}</p>
                  <p className="text-[12px] text-muted-foreground">{profile.owner.email}</p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Credits & invoices contact</p>
                  <p className="text-[14px] text-foreground">{profile.billingEmail}</p>
                </div>
              </div>
            </Card>

            <Card className="border border-border shadow-sm">
              <div className="p-6 border-b border-border">
                <h3 className="text-[16px] font-semibold text-foreground">Status</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-[13px] text-muted-foreground mb-2">Lifecycle status</p>
                  <UnifiedBadge variant="status" value={formatLifecycleStatus(organization.status)} />
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-2">Integration status</p>
                  <UnifiedBadge variant="integration" value={formatIntegrationStatus(organization.integrationStatus)} />
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Plan</p>
                  <UnifiedBadge variant="plan" value={organization.plan} />
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Credit balance</p>
                  <p className="text-[22px] font-semibold text-foreground tabular-nums">
                    {formatCurrency(organization.creditBalance)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="border border-border shadow-sm">
            <div className="p-6 border-b border-border">
              <h3 className="text-[16px] font-semibold text-foreground">Related Views</h3>
              <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                These links open platform-wide views with an organization filter. Filtered view behavior is design-phase
                until target screens read the organizationId query param.
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <Link
                to={`/client-apps?organizationId=${encodeURIComponent(orgId)}`}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-[13px] text-primary hover:bg-accent/60 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                Client Apps / API
              </Link>
              <Link
                to={`/verification-sessions?organizationId=${encodeURIComponent(orgId)}`}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-[13px] text-primary hover:bg-accent/60 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                Verification Sessions
              </Link>
              <Link
                to={`/billing?organizationId=${encodeURIComponent(orgId)}`}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-[13px] text-primary hover:bg-accent/60 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                Billing & Credits
              </Link>
              <Link
                to={`/audit-logs?organizationId=${encodeURIComponent(orgId)}`}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-[13px] text-primary hover:bg-accent/60 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                Audit Logs
              </Link>
              <Link
                to={`/identity-links?organizationId=${encodeURIComponent(orgId)}`}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-[13px] text-primary hover:bg-accent/60 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                Identity Links / Linked End Users
              </Link>
              <Link
                to={`/verifyme-users?organizationId=${encodeURIComponent(orgId)}`}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-[13px] text-primary hover:bg-accent/60 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                VerifyMe Users
              </Link>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="flex-1 overflow-auto p-8 space-y-6 m-0 mt-0">
          <div>
            <h3 className="text-[16px] font-semibold text-foreground mb-4">Dashboard</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <Card className="p-6 border border-border shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <p className="text-[13px] text-muted-foreground mb-1">Billable spend this period</p>
                <p className="text-[28px] font-semibold text-foreground tabular-nums">{formatCurrency(billableSpend)}</p>
                <p className="text-[12px] text-muted-foreground mt-1">From billable verification outcomes (sample)</p>
              </Card>
              <Card className="p-6 border border-border shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-[13px] text-muted-foreground mb-1">Verification sessions</p>
                <p className="text-[28px] font-semibold text-foreground tabular-nums">{formatNumber(organization.usage)}</p>
                <p className="text-[12px] text-muted-foreground mt-1">Session volume for this period (sample)</p>
              </Card>
              <Card className="p-6 border border-border shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-[12px] text-muted-foreground font-medium tabular-nums">
                    {formatNumber(organization.seatLimit)} limit
                  </span>
                </div>
                <p className="text-[13px] text-muted-foreground mb-1">Admin seat usage</p>
                <p className="text-[28px] font-semibold text-foreground tabular-nums">{formatNumber(organization.seatsUsed)}</p>
                <p className="text-[12px] text-muted-foreground mt-1">Organization Admin Portal seats in use</p>
              </Card>
              <Card className="p-6 border border-border shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  {walletAppliedToBillablePct !== null ? (
                    <span className="text-[12px] text-muted-foreground font-medium tabular-nums text-right max-w-[120px]">
                      {walletAppliedToBillablePct.toFixed(1)}% of wallet to billable spend
                    </span>
                  ) : (
                    <span className="text-[12px] text-muted-foreground font-medium text-right max-w-[120px]">
                      {creditPosition < 0 ? "Overage" : "—"}
                    </span>
                  )}
                </div>
                {creditPosition >= 0 ? (
                  <>
                    <p className="text-[13px] text-muted-foreground mb-1">Credits remaining</p>
                    <p className="text-[28px] font-semibold text-foreground tabular-nums">{formatCurrency(creditPosition)}</p>
                    <p className="text-[12px] text-muted-foreground mt-1">creditBalance − billable spend (this period)</p>
                  </>
                ) : (
                  <>
                    <p className="text-[13px] text-muted-foreground mb-1">Credit overage</p>
                    <p className="text-[28px] font-semibold text-red-600 tabular-nums">
                      {formatCurrency(Math.abs(creditPosition))}
                    </p>
                    <p className="text-[12px] text-muted-foreground mt-1">Billable spend exceeds current wallet balance.</p>
                  </>
                )}
              </Card>
            </div>
          </div>
          <Card className="border border-border bg-muted/20 p-4">
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Credits are monetary wallet value. Verification session volume and billable spend are tracked separately.
            </p>
          </Card>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[12px] text-muted-foreground">Open filtered platform views:</span>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/verification-sessions?organizationId=${encodeURIComponent(orgId)}`}>
                View verification sessions
                <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/billing?organizationId=${encodeURIComponent(orgId)}`}>
                View billing activity
                <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
              </Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="integration" className="flex-1 overflow-auto p-8 space-y-6 m-0 mt-0">
          <Card className="border border-border shadow-sm">
            <div className="p-6 border-b border-border">
              <h3 className="text-[16px] font-semibold text-foreground">Integration setup checklist</h3>
              <p className="text-[13px] text-muted-foreground mt-1">
                Remaining steps are completed in the Organization Admin Portal unless noted.
              </p>
              <p className="text-[12px] text-muted-foreground mt-2 leading-relaxed">
                This checklist is a readiness guide. Links open VerifyMe Admin pages for deeper API, redirect, identity,
                and settings work—they do not replace full integration management.
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              {setupSteps.map((step) => (
                <div
                  key={step.id}
                  className={`flex flex-col gap-2 rounded-lg border px-4 py-3 sm:flex-row sm:items-start sm:justify-between ${
                    step.done ? "border-green-200 bg-green-50/40" : "border-border bg-muted/20"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold mt-0.5 ${
                        step.done ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.done ? "✓" : ""}
                    </span>
                    <p className={`text-[13px] leading-snug ${step.done ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </p>
                  </div>
                  {step.cta ? (
                    <Button variant="link" size="sm" className="h-auto py-0 px-0 sm:shrink-0 self-start sm:self-center" asChild>
                      <Link to={step.cta.to}>
                        {step.cta.label}
                        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                      </Link>
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>

          <Card className="border border-border shadow-sm">
            <div className="p-6 border-b border-border">
              <h3 className="text-[16px] font-semibold text-foreground">Readiness summary</h3>
              <p className="text-[13px] text-muted-foreground mt-1">Compact snapshot from integration status (sample).</p>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[13px] text-muted-foreground mb-1">Current integration status</p>
                <UnifiedBadge variant="integration" value={formatIntegrationStatus(organization.integrationStatus)} />
              </div>
              <div>
                <p className="text-[13px] text-muted-foreground mb-1">Primary client_id</p>
                <p className="text-[13px] text-foreground font-mono break-all">{organization.primaryClientId}</p>
              </div>
              <div>
                <p className="text-[13px] text-muted-foreground mb-1">Redirect URI configured</p>
                <UnifiedBadge variant="status" value={setupSteps.find((s) => s.id === "redirect")?.done ? "Yes" : "No"} />
              </div>
              <div>
                <p className="text-[13px] text-muted-foreground mb-1">QR keys configured</p>
                <UnifiedBadge variant="status" value={setupSteps.find((s) => s.id === "qr")?.done ? "Yes" : "No"} />
              </div>
              <div>
                <p className="text-[13px] text-muted-foreground mb-1">Verification settings configured</p>
                <UnifiedBadge variant="status" value={setupSteps.find((s) => s.id === "verify")?.done ? "Yes" : "No"} />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="controls" className="flex-1 overflow-auto p-8 space-y-6 m-0 mt-0">
          <Card className="border border-border shadow-sm">
            <div className="p-6 border-b border-border">
              <h3 className="text-[16px] font-semibold text-foreground">Lifecycle Control</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-[13px] text-muted-foreground mb-2">Current organization status</p>
                <UnifiedBadge variant="status" value={formatLifecycleStatus(organization.status)} />
              </div>
              <div className="flex flex-wrap gap-2">
                {organization.status === "active" ? (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setSuspendConfirmInput("");
                      setSuspendDialogOpen(true);
                    }}
                  >
                    Suspend organization
                  </Button>
                ) : null}
                {organization.status === "suspended" ? (
                  <Button variant="default" onClick={() => setReactivateDialogOpen(true)}>
                    Reactivate organization
                  </Button>
                ) : null}
              </div>
              {orgControlMessage ? (
                <div className="rounded-md border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm text-green-700 dark:text-green-300">
                  {orgControlMessage}
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="border border-border shadow-sm">
            <div className="p-6 border-b border-border">
              <h3 className="text-[16px] font-semibold text-foreground">Plan Control</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-[13px] text-muted-foreground mb-2">Current plan</p>
                <UnifiedBadge variant="plan" value={organization.plan} />
              </div>
              <Button variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Plan changes affect included credits, seat limits, and pricing rules.
              </p>
            </div>
          </Card>

          <Card className="border border-border shadow-sm">
            <div className="p-6 border-b border-border">
              <h3 className="text-[16px] font-semibold text-foreground">Super Admin Controls</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" disabled className="text-muted-foreground">
                  Disable organization — Super Admin only
                </Button>
                <Button variant="outline" disabled className="text-muted-foreground">
                  Archive organization — Super Admin only
                </Button>
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Only VerifyMe Super Admin can permanently disable or archive an organization.
              </p>
            </div>
          </Card>

          <Card className="border border-border bg-muted/15 shadow-sm">
            <div className="p-4">
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Operational details such as sessions, billing activity, and audit history are reviewed in platform-wide
                filtered views.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={suspendDialogOpen}
        onOpenChange={(open) => {
          setSuspendDialogOpen(open);
          if (!open) {
            setSuspendConfirmInput("");
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Suspend organization</DialogTitle>
            <DialogDescription>Review the operational impact before confirming suspension.</DialogDescription>
          </DialogHeader>
          <ul className="list-disc pl-5 text-[13px] text-muted-foreground space-y-1">
            <li>Blocks verification sessions</li>
            <li>Prevents API usage for this organization</li>
            <li>Restricts Organization Admin Portal access for customer admins</li>
          </ul>
          <p className="text-[12px] text-muted-foreground border border-border/80 rounded-md bg-muted/30 px-3 py-2">
            This action will be recorded in audit logs.
          </p>
          <div className="space-y-2 py-2">
            <Label htmlFor="suspend-org-code-confirm" className="text-[13px]">
              Type organization code to confirm
            </Label>
            <Input
              id="suspend-org-code-confirm"
              autoComplete="off"
              value={suspendConfirmInput}
              onChange={(e) => setSuspendConfirmInput(e.target.value)}
              placeholder={organization.organizationCode}
              className="font-mono"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setSuspendDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!suspendCodeMatches}
              onClick={() => {
                patchPlatformOrganization(organization.id, { status: "suspended" });
                setSuspendDialogOpen(false);
                setSuspendConfirmInput("");
                setOrgControlMessage(`${organization.organizationName} was suspended.`);
              }}
            >
              Suspend organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reactivateDialogOpen} onOpenChange={setReactivateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reactivate organization?</DialogTitle>
            <DialogDescription>
              This restores the organization to Active for verification, API access, and Organization Admin Portal use
              (mock UI only).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setReactivateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                patchPlatformOrganization(organization.id, { status: "active" });
                setReactivateDialogOpen(false);
                setOrgControlMessage(`${organization.organizationName} was reactivated.`);
              }}
            >
              Reactivate organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Legacy top-level tab panels (removed 2026): Client Apps / API, Redirect URIs, QR Linking & Keys,
 * Verification Settings, Billing & Credits, Admin Users, Linked End Users, Verification Sessions, Audit Logs.
 * Mock sources: `organizationDetailMock` (client apps, redirect URIs, QR keys, verification settings, credit tx, audit rows),
 * `verificationSessionsMock` (sessions), inline admin-user table + role dialog, `organizationEndUsers` prop (linked users).
 * Restore bodies from git history if reintroducing tabs.
 */
