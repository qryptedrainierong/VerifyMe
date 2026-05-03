import { useEffect, useMemo, useState } from "react";
import { Button } from "../../../shared/components/ui/button";
import { Card } from "../../../shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../shared/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/components/ui/dialog";
import { Switch } from "../../../shared/components/ui/switch";
import { UnifiedBadge } from "../../../shared/components/UnifiedBadge";
import {
  formatIntegrationStatus,
  formatLifecycleStatus,
  getVerificationSpend,
  type PlatformOrganization,
} from "../../data/platformOrganizationsSample";
import type { PlatformEndUserAssociation } from "../../data/platformUsersSample";
import {
  getMockAuditRows,
  getMockClientApplications,
  getMockCreditTransactions,
  getMockQrKeys,
  getMockRedirectUris,
  getMockVerificationSessions,
  getMockVerificationSettings,
} from "../../data/organizationDetailMock";
import { BarChart3, CreditCard, Users } from "lucide-react";

type OrganizationProfile = {
  owner: { name: string; email: string; phone: string };
  billingEmail: string;
  address: string;
};

type EnterpriseRole =
  | "Owner"
  | "Admin"
  | "Operations"
  | "Technical / API Manager"
  | "Finance / Billing"
  | "Compliance / Auditor";

type EnterpriseUser = {
  id: string;
  enterpriseUsername: string;
  email: string;
  status: "active" | "pending";
  lastLogin: string | null;
  role: EnterpriseRole;
};

const enterpriseRoleDefinitions: Array<{
  role: EnterpriseRole;
  access: string;
  responsibilities: string[];
  restrictions: string[];
}> = [
  {
    role: "Owner",
    access: "FULL",
    responsibilities: [
      "Manage all portal users and roles",
      "Configure verification workflows and limits",
      "Manage OIDC-style client apps and integration settings",
      "Access logs, reports, and dashboards",
      "Manage billing, credits, and verification pricing",
      "View audit logs and compliance data",
    ],
    restrictions: [],
  },
  {
    role: "Admin",
    access: "HIGH",
    responsibilities: [
      "Manage users (invite, edit, deactivate)",
      "Configure workflows and rules",
      "Monitor usage and performance",
      "Access reports and dashboards",
    ],
    restrictions: [
      "Cannot change billing ownership",
      "Cannot override compliance/security policies",
    ],
  },
  {
    role: "Operations",
    access: "OPERATIONAL",
    responsibilities: [
      "Monitor verification requests",
      "View success/failure outcomes",
      "Handle exceptions and manual reviews",
      "Track real-time activity",
    ],
    restrictions: ["No user management", "No configuration changes", "No billing access"],
  },
  {
    role: "Technical / API Manager",
    access: "TECHNICAL",
    responsibilities: [
      "Manage client apps, redirect URIs, and integration metadata (no secrets in portal)",
      "Configure webhooks",
      "Monitor API usage and logs",
      "Debug integration issues",
    ],
    restrictions: ["No billing access", "No user management", "No operational control"],
  },
  {
    role: "Finance / Billing",
    access: "FINANCIAL",
    responsibilities: [
      "View and download invoices",
      "Manage payment methods",
      "Monitor usage and cost",
      "View plan invoices and credit statements",
    ],
    restrictions: [
      "No access to verification logs",
      "No access to personal identity data",
      "No system configuration",
    ],
  },
  {
    role: "Compliance / Auditor",
    access: "SENSITIVE READ",
    responsibilities: [
      "Access audit logs and access history",
      "Review verification records with masking",
      "Monitor suspicious activity",
      "Ensure compliance requirements",
    ],
    restrictions: ["Read-only role", "No billing control", "No system configuration"],
  },
];

type OrganizationDetailTabsProps = {
  organization: PlatformOrganization;
  profile: OrganizationProfile;
  organizationEndUsers: PlatformEndUserAssociation[];
};

function buildEnterpriseDummyUsers(org: PlatformOrganization): EnterpriseUser[] {
  const seedRoles: EnterpriseRole[] = [
    "Owner",
    "Admin",
    "Operations",
    "Technical / API Manager",
    "Finance / Billing",
    "Compliance / Auditor",
  ];
  return Array.from({ length: org.seatLimit }, (_, index) => {
    const sequence = index + 1;
    const paddedSequence = String(sequence).padStart(2, "0");
    const isActive = sequence <= org.seatsUsed;
    const role = seedRoles[index % seedRoles.length];
    return {
      id: `${org.id}-USR-${paddedSequence}`,
      enterpriseUsername: `user${paddedSequence}`,
      email: `user${paddedSequence}@${org.domain}`,
      status: isActive ? "active" : "pending",
      lastLogin: isActive
        ? `2024-04-${String((index % 9) + 1).padStart(2, "0")}T0${index % 9}:15:00`
        : null,
      role,
    };
  });
}

export function OrganizationDetailTabs({ organization, profile, organizationEndUsers }: OrganizationDetailTabsProps) {
  const usageSpend = getVerificationSpend(organization);
  const creditRemaining = Math.max(organization.creditBalance - usageSpend, 0);
  const creditUtilizationPct =
    organization.creditBalance > 0 ? (usageSpend / organization.creditBalance) * 100 : 0;

  const [organizationEnterpriseUsers, setOrganizationEnterpriseUsers] = useState<EnterpriseUser[]>(() =>
    buildEnterpriseDummyUsers(organization),
  );
  const [roleEditorUserId, setRoleEditorUserId] = useState<string | null>(null);
  const [roleDraft, setRoleDraft] = useState<EnterpriseRole | null>(null);
  const [roleMessage, setRoleMessage] = useState<string | null>(null);

  useEffect(() => {
    setOrganizationEnterpriseUsers(buildEnterpriseDummyUsers(organization));
    setRoleEditorUserId(null);
    setRoleDraft(null);
    setRoleMessage(null);
  }, [organization.id, organization.seatLimit, organization.seatsUsed, organization.domain]);

  const roleEditorUser = organizationEnterpriseUsers.find((user) => user.id === roleEditorUserId) ?? null;

  const clientApps = useMemo(() => getMockClientApplications(organization.id), [organization.id]);
  const redirectUris = useMemo(() => getMockRedirectUris(organization.id), [organization.id]);
  const qrKeys = useMemo(() => getMockQrKeys(organization.id), [organization.id]);
  const verificationSettings = useMemo(() => getMockVerificationSettings(organization.id), [organization.id]);
  const creditTx = useMemo(() => getMockCreditTransactions(organization.id), [organization.id]);
  const sessions = useMemo(() => getMockVerificationSessions(organization.id), [organization.id]);
  const auditRows = useMemo(() => getMockAuditRows(organization.id), [organization.id]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: organization.currency === "EUR" ? "EUR" : organization.currency === "SGD" ? "SGD" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

  const formatNumber = (num: number) => new Intl.NumberFormat("en-US").format(num);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const setupSteps = [
    { id: "profile", label: "Complete profile", done: organization.status !== "draft" },
    { id: "api", label: "Configure API integration", done: organization.integrationStatus !== "not_configured" },
    { id: "redirect", label: "Add redirect URI", done: !["not_configured", "missing_redirect_uri"].includes(organization.integrationStatus) },
    { id: "qr", label: "Configure QR linking keys", done: !["not_configured", "missing_keys"].includes(organization.integrationStatus) },
    { id: "verify", label: "Configure verification settings", done: organization.integrationStatus === "production_active" || organization.integrationStatus === "sandbox_active" },
    { id: "test", label: "Test integration", done: organization.integrationStatus === "production_active" },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <Tabs defaultValue="overview" className="h-full flex flex-col">
        <div className="border-b border-border px-8 overflow-x-auto">
          <TabsList className="bg-transparent inline-flex w-max min-w-full flex-nowrap h-auto py-1 gap-1">
            <TabsTrigger value="overview" className="text-[12px] shrink-0">
              Overview
            </TabsTrigger>
            <TabsTrigger value="client-apps" className="text-[12px] shrink-0">
              Client Apps / API
            </TabsTrigger>
            <TabsTrigger value="redirect-uris" className="text-[12px] shrink-0">
              Redirect URIs
            </TabsTrigger>
            <TabsTrigger value="qr-linking" className="text-[12px] shrink-0">
              QR Linking & Keys
            </TabsTrigger>
            <TabsTrigger value="verification-settings" className="text-[12px] shrink-0">
              Verification Settings
            </TabsTrigger>
            <TabsTrigger value="billing-credits" className="text-[12px] shrink-0">
              Billing & Credits
            </TabsTrigger>
            <TabsTrigger value="admin-users" className="text-[12px] shrink-0">
              Admin Users
            </TabsTrigger>
            <TabsTrigger value="linked-end-users" className="text-[12px] shrink-0">
              Linked End Users
            </TabsTrigger>
            <TabsTrigger value="verification-sessions" className="text-[12px] shrink-0">
              Verification Sessions
            </TabsTrigger>
            <TabsTrigger value="audit-logs" className="text-[12px] shrink-0">
              Audit Logs
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="flex-1 p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border border-border shadow-sm lg:col-span-2">
              <div className="p-6 border-b border-border">
                <h3 className="text-[16px] font-semibold text-foreground">Organization profile</h3>
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
                  <p className="text-[13px] text-muted-foreground mb-2">Lifecycle</p>
                  <UnifiedBadge variant="status" value={formatLifecycleStatus(organization.status)} />
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-2">Integration</p>
                  <UnifiedBadge variant="integration" value={formatIntegrationStatus(organization.integrationStatus)} />
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Plan</p>
                  <UnifiedBadge variant="plan" value={organization.plan} />
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Credit balance</p>
                  <p className="text-[22px] font-semibold text-foreground tabular-nums">{formatCurrency(organization.creditBalance)}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="border border-border shadow-sm">
            <div className="p-6 border-b border-border">
              <h3 className="text-[16px] font-semibold text-foreground">Integration setup checklist</h3>
              <p className="text-[13px] text-muted-foreground mt-1">
                Remaining steps are completed in the Organization Admin Portal unless noted.
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              {setupSteps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                    step.done ? "border-green-200 bg-green-50/40" : "border-border bg-muted/20"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                      step.done ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.done ? "✓" : ""}
                  </span>
                  <p className={`text-[13px] ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border border-border shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-[12px] text-muted-foreground font-medium tabular-nums">
                  {formatCurrency(usageSpend)} spend
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground mb-1">Verification sessions (period)</p>
              <p className="text-[28px] font-semibold text-foreground tabular-nums">{formatNumber(organization.usage)}</p>
              <p className="text-[12px] text-muted-foreground mt-1">Billable verification sessions (see Billing & Credits)</p>
            </Card>
            <Card className="p-6 border border-border shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-[12px] text-muted-foreground font-medium tabular-nums">
                  {formatNumber(organization.seatLimit)} seat limit
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground mb-1">Admin seat usage</p>
              <p className="text-[28px] font-semibold text-foreground tabular-nums">{formatNumber(organization.seatsUsed)}</p>
              <p className="text-[12px] text-muted-foreground mt-1">Organization Admin Portal users</p>
            </Card>
            <Card className="p-6 border border-border shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-[12px] text-muted-foreground font-medium tabular-nums">
                  {creditUtilizationPct.toFixed(1)}% utilized
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground mb-1">Credits remaining</p>
              <p className="text-[28px] font-semibold text-foreground tabular-nums">{formatCurrency(creditRemaining)}</p>
              <p className="text-[12px] text-muted-foreground mt-1">Against wallet balance</p>
            </Card>
          </div>

          <Card className="border border-dashed border-border bg-muted/10 p-4">
            <p className="text-[12px] text-muted-foreground">
              <strong className="text-foreground">Governance:</strong> VerifyMe admins may suspend an organization. Only a{" "}
              <strong className="text-foreground">Super Admin</strong> can permanently disable or archive an organization.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="client-apps" className="flex-1 p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-[16px] font-semibold text-foreground">Client applications</h3>
              <p className="text-[13px] text-muted-foreground mt-1">
                Each <span className="font-mono text-[12px]">client_id</span> uses your organization code, app type,
                environment, and sequence — for example{" "}
                <code className="text-[12px] bg-muted px-1.5 py-0.5 rounded font-mono">DEMO_CALLCENTER_PROD_001</code>.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                View API Docs
              </Button>
              <Button size="sm">Add Client App</Button>
            </div>
          </div>
          <Card className="border border-border shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-accent/5">
                <tr>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">client_id</th>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">Name</th>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">App type</th>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">Env</th>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">Last used</th>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">Secret</th>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clientApps.map((app) => (
                  <tr key={app.id} className="hover:bg-accent/5">
                    <td className="p-4 font-mono text-[13px] break-all max-w-[200px]">{app.clientId}</td>
                    <td className="p-4 text-[14px]">{app.name}</td>
                    <td className="p-4 text-[13px]">{app.appType}</td>
                    <td className="p-4 text-[13px]">{app.environment}</td>
                    <td className="p-4">
                      <UnifiedBadge variant="status" value={app.status === "active" ? "Active" : "Inactive"} />
                    </td>
                    <td className="p-4 text-[13px] text-muted-foreground">
                      {app.lastUsed ? formatDateTime(app.lastUsed) : "—"}
                    </td>
                    <td className="p-4 text-[13px]">
                      <span className="block font-medium text-foreground">{app.secretStatus}</span>
                      <span className="text-[12px] text-muted-foreground">Rotated {formatDate(app.lastRotated)}</span>
                    </td>
                    <td className="p-4">
                      <Button variant="outline" size="sm">
                        Rotate Secret
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="redirect-uris" className="flex-1 p-8 space-y-4">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <h3 className="text-[16px] font-semibold text-foreground">Redirect URIs</h3>
              <p className="text-[13px] text-muted-foreground mt-1">Allowed callbacks per client application (OIDC-style).</p>
            </div>
            <Button size="sm">Add Redirect URI</Button>
          </div>
          <Card className="border border-border shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-accent/5">
                <tr>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">client_id</th>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">redirect_uri</th>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">Environment</th>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {redirectUris.map((row) => (
                  <tr key={row.id} className="hover:bg-accent/5">
                    <td className="p-4 font-mono text-[13px]">{row.clientId}</td>
                    <td className="p-4 text-[13px] break-all max-w-md">{row.redirectUri}</td>
                    <td className="p-4 text-[13px]">{row.environment}</td>
                    <td className="p-4">
                      <UnifiedBadge variant="status" value={row.status === "active" ? "Active" : "Disabled"} />
                    </td>
                    <td className="p-4 flex gap-2">
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
          </Card>
        </TabsContent>

        <TabsContent value="qr-linking" className="flex-1 p-8 space-y-4">
          <Card className="border border-border bg-muted/20 p-4 mb-4">
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground">VerifyMe public key</strong> — used by the organization to encrypt QR payloads
              for VerifyMe. <strong className="text-foreground">Organization public key</strong> — used by VerifyMe to verify
              organization signatures. Private keys are never shown in this portal.
            </p>
          </Card>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm">
              View QR linking docs
            </Button>
            <Button variant="outline" size="sm">
              Upload / update org public key
            </Button>
            <Button size="sm">Rotate keys</Button>
          </div>
          <Card className="border border-border shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-accent/5">
                <tr>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">Key set</th>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">key_id</th>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">Algorithm</th>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">VerifyMe key</th>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">Org key</th>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">Created</th>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">Rotated</th>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {qrKeys.map((k) => (
                  <tr key={k.id} className="hover:bg-accent/5">
                    <td className="p-4 text-[14px]">{k.label}</td>
                    <td className="p-4 font-mono text-[13px]">{k.keyId}</td>
                    <td className="p-4 text-[12px] text-muted-foreground max-w-[180px]">{k.algorithm}</td>
                    <td className="p-4">
                      <UnifiedBadge variant="integration" value={k.verifyMePublicKeyStatus === "active" ? "Active" : "Pending"} />
                    </td>
                    <td className="p-4">
                      <UnifiedBadge
                        variant="integration"
                        value={
                          k.orgPublicKeyStatus === "active"
                            ? "Active"
                            : k.orgPublicKeyStatus === "missing"
                              ? "Missing"
                              : "Pending"
                        }
                      />
                    </td>
                    <td className="p-4 text-[13px]">{formatDate(k.created)}</td>
                    <td className="p-4 text-[13px]">{k.rotated ? formatDate(k.rotated) : "—"}</td>
                    <td className="p-4">
                      <UnifiedBadge variant="status" value={k.status === "active" ? "Active" : "Rotation pending"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="verification-settings" className="flex-1 p-8 space-y-6">
          <Card className="border border-border shadow-sm">
            <div className="p-6 border-b border-border">
              <h3 className="text-[16px] font-semibold text-foreground">Organization verification settings</h3>
              <p className="text-[13px] text-muted-foreground mt-1">Values must stay within VerifyMe platform limits (sample).</p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[13px] text-muted-foreground mb-1">Maximum attempts per verification</p>
                <p className="text-[20px] font-semibold">{verificationSettings.maxTokenAttempts}</p>
                <p className="text-[12px] text-muted-foreground mt-1">
                  Platform cap: {verificationSettings.platformMaxTokenAttempts} (default 10 unless overridden)
                </p>
              </div>
              <div>
                <p className="text-[13px] text-muted-foreground mb-1">Verification timeout (seconds)</p>
                <p className="text-[20px] font-semibold">{verificationSettings.verificationTimeoutSeconds}</p>
                <p className="text-[12px] text-muted-foreground mt-1">
                  Platform max: {verificationSettings.platformMaxTimeoutSeconds}s
                </p>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <span className="text-[14px]">Allow verification step resend</span>
                <Switch checked={verificationSettings.allowOtpResend} disabled />
              </div>
              <div>
                <p className="text-[13px] text-muted-foreground mb-1">Max resends per verification</p>
                <p className="text-[20px] font-semibold">{verificationSettings.maxOtpResends}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="billing-credits" className="flex-1 p-8 space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Add credits</Button>
            <Button variant="outline" size="sm">
              Change plan
            </Button>
            <Button variant="outline" size="sm">
              View usage events
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className="p-5 border border-border shadow-sm">
              <p className="text-[12px] text-muted-foreground">Plan</p>
              <p className="text-lg font-semibold mt-1">{organization.plan}</p>
            </Card>
            <Card className="p-5 border border-border shadow-sm">
              <p className="text-[12px] text-muted-foreground">Credit balance</p>
              <p className="text-lg font-semibold mt-1 tabular-nums">{formatCurrency(organization.creditBalance)}</p>
            </Card>
            <Card className="p-5 border border-border shadow-sm">
              <p className="text-[12px] text-muted-foreground">Monthly included credits</p>
              <p className="text-lg font-semibold mt-1 tabular-nums">{formatCurrency(organization.monthlyIncludedCredits)}</p>
            </Card>
            <Card className="p-5 border border-border shadow-sm">
              <p className="text-[12px] text-muted-foreground">Top-up credits</p>
              <p className="text-lg font-semibold mt-1 tabular-nums">{formatCurrency(organization.topUpCredits)}</p>
            </Card>
          </div>
          <Card className="p-5 border border-border shadow-sm">
            <p className="text-[13px] font-medium text-foreground mb-2">Credits & billable outcomes</p>
            <p className="text-[13px] text-muted-foreground mb-2">
              Credits are a monetary wallet balance. Top-up credits roll forward with the account.
            </p>
            <ul className="text-[13px] text-muted-foreground space-y-1 list-disc list-inside">
              <li>Verified — billable</li>
              <li>Failed — billable</li>
              <li>Expired — not billable</li>
              <li>Error — not billable</li>
              <li>Indeterminate — not billable</li>
            </ul>
            <p className="text-[13px] mt-3">
              Price per verification attempt:{" "}
              <span className="font-mono font-medium text-foreground">{formatCurrency(organization.pricePerVerification)}</span>
            </p>
            <p className="text-[13px] mt-2">
              Email delivery add-on billing:{" "}
              <strong>{organization.emailOtpBillingEnabled ? "On" : "Off"}</strong> (per-organization setting)
            </p>
            <p className="text-[12px] text-muted-foreground mt-2">
              SMS delivery (future): each send is billed separately when the add-on is available.
            </p>
          </Card>
          <Card className="border border-border shadow-sm overflow-x-auto">
            <div className="p-4 border-b border-border">
              <h4 className="text-[15px] font-semibold">Recent credit transactions</h4>
            </div>
            <table className="w-full">
              <thead className="border-b border-border bg-accent/5">
                <tr>
                  <th className="text-left p-3 text-[12px] font-semibold text-muted-foreground uppercase">Type</th>
                  <th className="text-left p-3 text-[12px] font-semibold text-muted-foreground uppercase">Amount</th>
                  <th className="text-left p-3 text-[12px] font-semibold text-muted-foreground uppercase">Balance after</th>
                  <th className="text-left p-3 text-[12px] font-semibold text-muted-foreground uppercase">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {creditTx.map((tx) => (
                  <tr key={tx.id}>
                    <td className="p-3 text-[13px]">{tx.type}</td>
                    <td className="p-3 text-[13px] tabular-nums">{formatCurrency(tx.amount)}</td>
                    <td className="p-3 text-[13px] tabular-nums">{formatCurrency(tx.balanceAfter)}</td>
                    <td className="p-3 text-[13px] text-muted-foreground">{formatDateTime(tx.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="admin-users" className="flex-1 p-8 space-y-4">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <h3 className="text-[16px] font-semibold text-foreground">Organization admin users</h3>
              <p className="text-[13px] text-muted-foreground mt-1">
                Admin seats: {organization.seatsUsed} of {organization.seatLimit} used
              </p>
            </div>
            <Button size="sm">Invite Admin</Button>
          </div>
          <Card className="border border-border shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-accent/5">
                <tr>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">Name</th>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">Email</th>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">Role</th>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">Last login</th>
                  <th className="text-left p-4 text-[12px] font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {organizationEnterpriseUsers.slice(0, 8).map((user) => (
                  <tr key={user.id} className="hover:bg-accent/5">
                    <td className="p-4 text-[14px]">{user.enterpriseUsername}</td>
                    <td className="p-4 text-[13px]">{user.email}</td>
                    <td className="p-4">
                      <UnifiedBadge variant="role" value={user.role} />
                    </td>
                    <td className="p-4">
                      <UnifiedBadge
                        variant="status"
                        value={user.status === "active" ? "Active" : "Pending"}
                      />
                    </td>
                    <td className="p-4 text-[13px] text-muted-foreground">
                      {user.lastLogin ? formatDateTime(user.lastLogin) : "Never"}
                    </td>
                    <td className="p-4 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setRoleEditorUserId(user.id); setRoleDraft(user.role); }}>
                        Change Role
                      </Button>
                      <Button variant="ghost" size="sm">
                        Suspend
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Dialog
            open={roleEditorUser !== null}
            onOpenChange={(open) => {
              if (!open) {
                setRoleEditorUserId(null);
                setRoleDraft(null);
              }
            }}
          >
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Change admin role</DialogTitle>
                <DialogDescription>
                  {roleEditorUser
                    ? `Each organization admin has exactly one role. Select a role for ${roleEditorUser.enterpriseUsername}.`
                    : "Select a single organization admin role."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Role</p>
                  <Select
                    value={roleDraft ?? undefined}
                    onValueChange={(value) => setRoleDraft(value as EnterpriseRole)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose role" />
                    </SelectTrigger>
                    <SelectContent>
                      {enterpriseRoleDefinitions.map((definition) => (
                        <SelectItem key={definition.role} value={definition.role}>
                          {definition.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {roleDraft
                  ? (
                    <div className="rounded-md border border-border p-3 text-[12px] text-muted-foreground space-y-1">
                      {enterpriseRoleDefinitions
                        .find((d) => d.role === roleDraft)
                        ?.responsibilities.map((line) => (
                          <p key={line}>• {line}</p>
                        ))}
                    </div>
                  )
                  : null}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setRoleEditorUserId(null); setRoleDraft(null); }}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!roleEditorUser || !roleDraft) return;
                    setOrganizationEnterpriseUsers((prev) =>
                      prev.map((u) => (u.id === roleEditorUser.id ? { ...u, role: roleDraft } : u)),
                    );
                    setRoleMessage(`Updated role for ${roleEditorUser.enterpriseUsername}.`);
                    setRoleEditorUserId(null);
                    setRoleDraft(null);
                  }}
                  disabled={!roleDraft}
                >
                  Save role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {roleMessage && (
            <div className="rounded-md border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm text-green-700 dark:text-green-300">
              {roleMessage}
            </div>
          )}
        </TabsContent>

        <TabsContent value="linked-end-users" className="flex-1 p-8">
          <Card className="border border-border shadow-sm overflow-x-auto">
            <div className="p-4 border-b border-border">
              <h3 className="text-[16px] font-semibold">Linked End Users</h3>
              <p className="text-[13px] text-muted-foreground">Summary view — full lists connect in a later phase.</p>
            </div>
            <table className="w-full">
              <thead className="border-b border-border bg-accent/5">
                <tr>
                  <th className="text-left p-3 text-[12px] font-semibold text-muted-foreground uppercase">client_user_id</th>
                  <th className="text-left p-3 text-[12px] font-semibold text-muted-foreground uppercase">Display</th>
                  <th className="text-left p-3 text-[12px] font-semibold text-muted-foreground uppercase">Link status</th>
                  <th className="text-left p-3 text-[12px] font-semibold text-muted-foreground uppercase">Linked</th>
                  <th className="text-left p-3 text-[12px] font-semibold text-muted-foreground uppercase">Last verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {organizationEndUsers.slice(0, 12).map((u) => (
                  <tr key={u.id}>
                    <td className="p-3 font-mono text-[13px]">{u.enterpriseUsername}</td>
                    <td className="p-3 text-[13px]">{u.verifymeUsername}</td>
                    <td className="p-3">
                      <UnifiedBadge variant="status" value={u.status === "active" ? "Linked" : u.status === "pending" ? "Pending" : "Suspended"} />
                    </td>
                    <td className="p-3 text-[13px] text-muted-foreground">{formatDate(u.created)}</td>
                    <td className="p-3 text-[13px] text-muted-foreground">{u.lastActive ? formatDateTime(u.lastActive) : "—"}</td>
                  </tr>
                ))}
                {organizationEndUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">
                      No linked end users for this organization yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="verification-sessions" className="flex-1 p-8">
          <Card className="border border-border shadow-sm overflow-x-auto">
            <div className="p-4 border-b border-border">
              <h3 className="text-[16px] font-semibold">Verification sessions</h3>
            </div>
            <table className="w-full">
              <thead className="border-b border-border bg-accent/5">
                <tr>
                  <th className="text-left p-3 text-[12px] font-semibold text-muted-foreground uppercase">Session ID</th>
                  <th className="text-left p-3 text-[12px] font-semibold text-muted-foreground uppercase">client_user_id</th>
                  <th className="text-left p-3 text-[12px] font-semibold text-muted-foreground uppercase">Outcome</th>
                  <th className="text-left p-3 text-[12px] font-semibold text-muted-foreground uppercase">Billable</th>
                  <th className="text-left p-3 text-[12px] font-semibold text-muted-foreground uppercase">Cost</th>
                  <th className="text-left p-3 text-[12px] font-semibold text-muted-foreground uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sessions.map((s) => (
                  <tr key={s.id}>
                    <td className="p-3 font-mono text-[13px]">{s.id}</td>
                    <td className="p-3 font-mono text-[13px]">{s.clientUserId}</td>
                    <td className="p-3 text-[13px]">{s.outcome}</td>
                    <td className="p-3">
                      <UnifiedBadge variant="status" value={s.billable ? "Billable" : "Not billable"} />
                    </td>
                    <td className="p-3 tabular-nums">{formatCurrency(s.cost)}</td>
                    <td className="p-3 text-[13px] text-muted-foreground">{formatDateTime(s.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="audit-logs" className="flex-1 p-8">
          <Card className="border border-border shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-accent/5">
                <tr>
                  <th className="text-left p-3 text-[12px] font-semibold text-muted-foreground uppercase">Event</th>
                  <th className="text-left p-3 text-[12px] font-semibold text-muted-foreground uppercase">Actor</th>
                  <th className="text-left p-3 text-[12px] font-semibold text-muted-foreground uppercase">Target</th>
                  <th className="text-left p-3 text-[12px] font-semibold text-muted-foreground uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {auditRows.map((a) => (
                  <tr key={a.id}>
                    <td className="p-3 text-[13px] font-mono">{a.event}</td>
                    <td className="p-3 text-[13px]">{a.actor}</td>
                    <td className="p-3 text-[13px]">{a.target}</td>
                    <td className="p-3 text-[13px] text-muted-foreground">{formatDateTime(a.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
