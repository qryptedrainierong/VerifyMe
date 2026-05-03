import { ArrowLeft, Building2, Users, BarChart3, CreditCard, Eye, Pause, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../../shared/components/ui/button";
import { Card } from "../../shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/components/ui/tabs";
import { Checkbox } from "../../shared/components/ui/checkbox";
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
  getSampleOrganizationById,
  getUsageSpend,
  type PlatformOrganization,
} from "../data/platformOrganizationsSample";
import { platformEndUserAssociations } from "../data/platformUsersSample";

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
  roles: EnterpriseRole[];
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
    restrictions: [
      "No user management",
      "No configuration changes",
      "No billing access",
    ],
  },
  {
    role: "Technical / API Manager",
    access: "TECHNICAL",
    responsibilities: [
      "Generate and manage API keys",
      "Configure webhooks",
      "Monitor API usage and logs",
      "Debug integration issues",
    ],
    restrictions: [
      "No billing access",
      "No user management",
      "No operational control",
    ],
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
    restrictions: [
      "Read-only role",
      "No billing control",
      "No system configuration",
    ],
  },
];

function buildEnterpriseDummyUsers(org: PlatformOrganization): EnterpriseUser[] {
  const seedRoles: EnterpriseRole[] = [
    "Owner",
    "Admin",
    "Operations",
    "Technical / API Manager",
    "Finance / Billing",
    "Compliance / Auditor",
  ];
  return Array.from({ length: org.seats }, (_, index) => {
    const sequence = index + 1;
    const paddedSequence = String(sequence).padStart(2, "0");
    const isActive = sequence <= org.seatsUsed;
    const baseRole = seedRoles[index % seedRoles.length];
    const extraRoles: EnterpriseRole[] =
      baseRole === "Owner"
        ? ["Compliance / Auditor", "Technical / API Manager"]
        : baseRole === "Admin"
          ? ["Operations"]
          : [];
    return {
      id: `${org.id}-USR-${paddedSequence}`,
      enterpriseUsername: `user${paddedSequence}`,
      email: `user${paddedSequence}@${org.domain}`,
      status: isActive ? "active" : "pending",
      lastLogin: isActive
        ? `2024-04-${String((index % 9) + 1).padStart(2, "0")}T0${index % 9}:15:00`
        : null,
      roles: [baseRole, ...extraRoles],
    };
  });
}

const profileByOrgId: Record<string, OrganizationProfile> = {
  "ORG-001": {
    owner: {
      name: "John Smith",
      email: "john@acme.com",
      phone: "+1 (555) 123-4567",
    },
    billingEmail: "billing@acme.com",
    address: "123 Market St, San Francisco, CA 94103",
  },
};

function profileForOrganization(org: PlatformOrganization): OrganizationProfile {
  return (
    profileByOrgId[org.id] ?? {
      owner: {
        name: "Primary admin",
        email: `admin@${org.domain}`,
        phone: "+1 (555) 000-0100",
      },
      billingEmail: `billing@${org.domain}`,
      address: "Address on file",
    }
  );
}

export function PlatformOrganizationDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const organization = useMemo(() => getSampleOrganizationById(id), [id]);
  const profile = organization ? profileForOrganization(organization) : null;

  const usageSpend = organization ? getUsageSpend(organization.usage) : 0;
  const creditRemaining = organization ? Math.max(organization.credit - usageSpend, 0) : 0;
  const creditUtilizationPct =
    organization && organization.credit > 0 ? (usageSpend / organization.credit) * 100 : 0;
  const organizationEndUsers = organization
    ? platformEndUserAssociations.filter((user) => user.organizationId === organization.id)
    : [];
  const [organizationEnterpriseUsers, setOrganizationEnterpriseUsers] = useState<EnterpriseUser[]>(
    organization ? buildEnterpriseDummyUsers(organization) : [],
  );
  const [roleEditorUserId, setRoleEditorUserId] = useState<string | null>(null);
  const [roleDraft, setRoleDraft] = useState<EnterpriseRole[]>([]);
  const [roleMessage, setRoleMessage] = useState<string | null>(null);

  useEffect(() => {
    if (organization) {
      setOrganizationEnterpriseUsers(buildEnterpriseDummyUsers(organization));
    } else {
      setOrganizationEnterpriseUsers([]);
    }
    setRoleEditorUserId(null);
    setRoleDraft([]);
    setRoleMessage(null);
  }, [organization?.id]);

  const roleEditorUser = organizationEnterpriseUsers.find((user) => user.id === roleEditorUserId) ?? null;

  const recentActivity = [
    {
      id: 1,
      action: "User invited",
      user: "john@acme.com",
      target: "sarah@acme.com",
      timestamp: "2024-04-09T10:30:00",
    },
    {
      id: 2,
      action: "Subscription upgraded",
      user: "john@acme.com",
      target: "Enterprise Plan",
      timestamp: "2024-04-08T15:45:00",
    },
    {
      id: 3,
      action: "API key rotated",
      user: "admin@acme.com",
      target: "Production API Key",
      timestamp: "2024-04-07T09:15:00",
    },
    {
      id: 4,
      action: "SSO configured",
      user: "john@acme.com",
      target: "Okta Integration",
      timestamp: "2024-04-06T14:20:00",
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (!organization || !profile) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-4 p-8">
        <p className="text-sm text-muted-foreground">Organization not found.</p>
        <Button variant="outline" onClick={() => navigate("/organizations")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Organizations
        </Button>
      </div>
    );
  }

  const statusLabel =
    organization.status === "active"
      ? "Active"
      : organization.status === "trial"
      ? "Trial"
      : "Suspended";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-8 border-b border-border bg-card">
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/organizations")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Organizations
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-[28px] font-semibold text-foreground">
                  {organization.name}
                </h1>
                <UnifiedBadge variant="plan" value={organization.plan} />
                <UnifiedBadge variant="status" value={statusLabel} />
              </div>
              <p className="text-[14px] text-muted-foreground">
                {organization.domain} • Created {formatDate(organization.created)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View as Client
            </Button>
            <Button variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
            <Button variant="outline">
              <Pause className="w-4 h-4 mr-2" />
              Suspend
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="overview" className="h-full flex flex-col">
          <div className="border-b border-border px-8">
            <TabsList className="bg-transparent">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="end-users">Linked end users</TabsTrigger>
              <TabsTrigger value="usage">Credits and usage</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="audit">Audit Logs</TabsTrigger>
              <TabsTrigger value="users">Team and roles</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="flex-1 p-8 space-y-6">
            {/* Organization Profile */}
            <Card className="border border-border shadow-sm">
              <div className="p-6 border-b border-border">
                <h3 className="text-[16px] font-semibold text-foreground">
                  Organization Profile
                </h3>
              </div>
              <div className="p-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Organization ID</p>
                  <p className="text-[14px] text-foreground font-mono">{organization.id}</p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Domain</p>
                  <p className="text-[14px] text-foreground">{organization.domain}</p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Owner Name</p>
                  <p className="text-[14px] text-foreground">{profile.owner.name}</p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Owner Email</p>
                  <p className="text-[14px] text-foreground">{profile.owner.email}</p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Phone</p>
                  <p className="text-[14px] text-foreground">{profile.owner.phone}</p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Billing Email</p>
                  <p className="text-[14px] text-foreground">{profile.billingEmail}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[13px] text-muted-foreground mb-1">Address</p>
                  <p className="text-[14px] text-foreground">{profile.address}</p>
                </div>
              </div>
            </Card>

            {/* Plan & credits summary */}
            <Card className="border border-border shadow-sm">
              <div className="p-6 border-b border-border">
                <h3 className="text-[16px] font-semibold text-foreground">
                  Plan and credits summary
                </h3>
              </div>
              <div className="p-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Current Plan</p>
                  <p className="text-[14px] text-foreground font-medium">
                    {organization.plan}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Included Credit</p>
                  <p className="text-[14px] text-foreground font-medium">
                    {formatCurrency(organization.credit)}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Verification Spend</p>
                  <p className="text-[14px] text-foreground font-medium tabular-nums">
                    {formatCurrency(usageSpend)} / {formatCurrency(organization.credit)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[13px] text-muted-foreground mb-1">Manager Seat Usage</p>
                  <div className="flex items-center gap-3 max-w-lg">
                    <p className="text-[14px] text-foreground tabular-nums">
                      {formatNumber(organization.seatsUsed)} / {formatNumber(organization.seats)}
                    </p>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          organization.seatsUsed > organization.seats
                            ? "bg-red-500"
                            : organization.seatsUsed / organization.seats > 0.9
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            (organization.seatsUsed / organization.seats) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-1">Users</p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Next Billing Date</p>
                  <p className="text-[14px] text-foreground">May 15, 2024</p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">Billing Status</p>
                  <UnifiedBadge
                    variant="billing"
                    value={
                      organization.billingStatus === "current"
                        ? "Current"
                        : organization.billingStatus === "overdue"
                        ? "Overdue"
                        : "Failed"
                    }
                  />
                </div>
              </div>
            </Card>

            {/* Usage Summary Cards — aligned with organizations dashboard (verification usage, seats, credit) */}
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
                <p className="text-[13px] text-muted-foreground mb-1">Verification API Calls</p>
                <p className="text-[28px] font-semibold text-foreground tabular-nums">
                  {formatNumber(organization.usage)}
                </p>
                <p className="text-[12px] text-muted-foreground mt-1">This billing period</p>
              </Card>

              <Card className="p-6 border border-border shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-[12px] text-muted-foreground font-medium tabular-nums">
                    {formatNumber(organization.seats)} seats
                  </span>
                </div>
                <p className="text-[13px] text-muted-foreground mb-1">Users</p>
                <p className="text-[28px] font-semibold text-foreground tabular-nums">
                  {formatNumber(organization.seatsUsed)}
                </p>
                <p className="text-[12px] text-muted-foreground mt-1">In use vs included</p>
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
                <p className="text-[13px] text-muted-foreground mb-1">Credit Remaining</p>
                <p className="text-[28px] font-semibold text-foreground tabular-nums">
                  {formatCurrency(creditRemaining)}
                </p>
                <p className="text-[12px] text-muted-foreground mt-1">
                  {creditRemaining > 0 ? "Against included credit" : "Credit exhausted"}
                </p>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border border-border shadow-sm">
              <div className="p-6 border-b border-border">
                <h3 className="text-[16px] font-semibold text-foreground">Recent Activity</h3>
              </div>
              <div className="divide-y divide-border">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-5 flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <p className="text-[13px] font-medium text-foreground">
                        {activity.action}
                      </p>
                      <p className="text-[13px] text-muted-foreground">{activity.target}</p>
                      <p className="text-[12px] text-muted-foreground text-right">
                        {formatDateTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Support Notes */}
            <Card className="border border-border shadow-sm">
              <div className="p-6 border-b border-border">
                <h3 className="text-[16px] font-semibold text-foreground">Support Notes</h3>
              </div>
              <div className="p-6">
                <p className="text-[14px] text-muted-foreground">
                  No support notes available for this organization.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="end-users" className="flex-1 p-8">
            <Card className="border border-border shadow-sm">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[16px] font-semibold text-foreground">Linked end users</h3>
                    <p className="text-[13px] text-muted-foreground">
                      Client records linked to VerifyMe identities for {organization.name}
                    </p>
                  </div>
                  <p className="text-[13px] text-muted-foreground">
                    {organizationEndUsers.length} user{organizationEndUsers.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border bg-accent/5">
                    <tr>
                      <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                        VerifyMe Username
                      </th>
                      <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Client user ID
                      </th>
                      <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Email
                      </th>
                      <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Status
                      </th>
                      <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Verifications
                      </th>
                      <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Last Active
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {organizationEndUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-accent/5 transition-colors">
                        <td className="p-4">
                          <p className="text-[14px] font-medium text-foreground font-mono">
                            {user.verifymeUsername}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-[14px] text-foreground font-mono">
                            {user.enterpriseUsername}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-[14px] text-foreground">{user.email}</p>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <UnifiedBadge
                            variant="status"
                            value={
                              user.status === "active"
                                ? "Active"
                                : user.status === "pending"
                                ? "Pending"
                                : "Suspended"
                            }
                          />
                        </td>
                        <td className="p-4">
                          <p className="text-[14px] text-foreground tabular-nums">
                            {formatNumber(user.apiCalls)}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-[13px] text-muted-foreground">
                            {user.lastActive ? formatDateTime(user.lastActive) : "Never"}
                          </p>
                        </td>
                      </tr>
                    ))}
                    {organizationEndUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-10 text-center">
                          <p className="text-sm font-medium text-foreground">No linked end users</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            This organization currently has no mapped client_user_id links to VerifyMe identities.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="flex-1 p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <Card className="p-6 border border-border shadow-sm">
                  <p className="text-[13px] text-muted-foreground mb-1">Verification attempts</p>
                  <p className="text-[28px] font-semibold text-foreground tabular-nums">
                    {formatNumber(organization.usage)}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-1">Current billing period</p>
                </Card>
                <Card className="p-6 border border-border shadow-sm">
                  <p className="text-[13px] text-muted-foreground mb-1">Linked end users</p>
                  <p className="text-[28px] font-semibold text-foreground tabular-nums">
                    {formatNumber(organizationEndUsers.length)}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-1">QR-linked customer records</p>
                </Card>
                <Card className="p-6 border border-border shadow-sm">
                  <p className="text-[13px] text-muted-foreground mb-1">Usage Spend</p>
                  <p className="text-[28px] font-semibold text-foreground tabular-nums">
                    {formatCurrency(usageSpend)}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-1">Sample rate per billable verification</p>
                </Card>
                <Card className="p-6 border border-border shadow-sm">
                  <p className="text-[13px] text-muted-foreground mb-1">Credit Utilization</p>
                  <p className="text-[28px] font-semibold text-foreground tabular-nums">
                    {creditUtilizationPct.toFixed(1)}%
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    {formatCurrency(creditRemaining)} credit remaining
                  </p>
                </Card>
              </div>

              <Card className="border border-border shadow-sm">
                <div className="p-6 border-b border-border">
                  <h3 className="text-[16px] font-semibold text-foreground">Usage by Verification Type</h3>
                  <p className="text-[13px] text-muted-foreground">
                    Distribution derived from current organization usage
                  </p>
                </div>
                <div className="p-6 space-y-5">
                  {[
                    { type: "Successful Verification", value: Math.round(organization.usage * 0.92), color: "bg-green-500" },
                    { type: "Failed Verification", value: Math.round(organization.usage * 0.08), color: "bg-red-500" },
                  ].map((item) => {
                    const percent = organization.usage > 0 ? (item.value / organization.usage) * 100 : 0;
                    return (
                      <div key={item.type}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[14px] text-foreground">{item.type}</p>
                          <p className="text-[13px] text-muted-foreground tabular-nums">
                            {formatNumber(item.value)} ({percent.toFixed(1)}%)
                          </p>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="border border-border shadow-sm">
                <div className="p-6 border-b border-border">
                  <h3 className="text-[16px] font-semibold text-foreground">Last 7 Days Trend</h3>
                  <p className="text-[13px] text-muted-foreground">Estimated daily volume based on current period usage</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border bg-accent/5">
                      <tr>
                        <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">Date</th>
                        <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">Calls</th>
                        <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">Spend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                        const calls = Math.round((organization.usage / 7) * (0.9 + day * 0.03));
                        const date = new Date(Date.UTC(2024, 3, day));
                        return (
                          <tr key={day} className="hover:bg-accent/5 transition-colors">
                            <td className="p-4 text-[14px] text-foreground">
                              {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </td>
                            <td className="p-4 text-[14px] text-foreground tabular-nums">{formatNumber(calls)}</td>
                            <td className="p-4 text-[14px] text-foreground tabular-nums">{formatCurrency(getUsageSpend(calls))}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="flex-1 p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <Card className="p-6 border border-border shadow-sm">
                  <p className="text-[13px] text-muted-foreground mb-1">Included Credit</p>
                  <p className="text-[28px] font-semibold text-foreground tabular-nums">
                    {formatCurrency(organization.credit)}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-1">Current billing cycle</p>
                </Card>
                <Card className="p-6 border border-border shadow-sm">
                  <p className="text-[13px] text-muted-foreground mb-1">Verification Spend</p>
                  <p className="text-[28px] font-semibold text-foreground tabular-nums">
                    {formatCurrency(usageSpend)}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    {formatNumber(organization.usage)} verification calls
                  </p>
                </Card>
                <Card className="p-6 border border-border shadow-sm">
                  <p className="text-[13px] text-muted-foreground mb-1">Credit Remaining</p>
                  <p className="text-[28px] font-semibold text-foreground tabular-nums">
                    {formatCurrency(creditRemaining)}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    {creditUtilizationPct.toFixed(1)}% utilized
                  </p>
                </Card>
                <Card className="p-6 border border-border shadow-sm">
                  <p className="text-[13px] text-muted-foreground mb-1">Billing Status</p>
                  <div className="mt-2">
                    <UnifiedBadge
                      variant="billing"
                      value={
                        organization.billingStatus === "current"
                          ? "Current"
                          : organization.billingStatus === "overdue"
                            ? "Overdue"
                            : "Failed"
                      }
                    />
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-3">Next billing date: May 15, 2024</p>
                </Card>
              </div>

              <Card className="border border-border shadow-sm">
                <div className="p-6 border-b border-border">
                  <h3 className="text-[16px] font-semibold text-foreground">Billing Breakdown</h3>
                  <p className="text-[13px] text-muted-foreground">
                    Credit consumption and spend ratio for this organization
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[14px] text-foreground">Usage Spend vs Included Credit</p>
                      <p className="text-[13px] text-muted-foreground tabular-nums">
                        {formatCurrency(usageSpend)} / {formatCurrency(organization.credit)}
                      </p>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${
                          usageSpend > organization.credit
                            ? "bg-red-500"
                            : usageSpend / organization.credit > 0.8
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min((usageSpend / organization.credit) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-md border border-border p-4">
                      <p className="text-xs text-muted-foreground">Verification Cost per Call</p>
                      <p className="text-sm font-medium text-foreground mt-1">$0.05</p>
                    </div>
                    <div className="rounded-md border border-border p-4">
                      <p className="text-xs text-muted-foreground">Invoice Estimate</p>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {formatCurrency(Math.max(usageSpend - organization.credit, 0))}
                      </p>
                    </div>
                    <div className="rounded-md border border-border p-4">
                      <p className="text-xs text-muted-foreground">Plan</p>
                      <p className="text-sm font-medium text-foreground mt-1">{organization.plan}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border border-border shadow-sm">
                <div className="p-6 border-b border-border">
                  <h3 className="text-[16px] font-semibold text-foreground">Invoice Timeline</h3>
                  <p className="text-[13px] text-muted-foreground">Recent invoice and payment events</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border bg-accent/5">
                      <tr>
                        <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">Invoice</th>
                        <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">Date</th>
                        <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">Amount</th>
                        <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[
                        {
                          id: `INV-${organization.id}-0424`,
                          date: "2024-04-01",
                          amount: Math.max(Math.round(usageSpend), 1),
                          status:
                            organization.billingStatus === "current"
                              ? "Paid"
                              : organization.billingStatus === "overdue"
                                ? "Overdue"
                                : "Failed",
                        },
                        {
                          id: `INV-${organization.id}-0324`,
                          date: "2024-03-01",
                          amount: Math.max(Math.round(usageSpend * 0.88), 1),
                          status: "Paid",
                        },
                        {
                          id: `INV-${organization.id}-0224`,
                          date: "2024-02-01",
                          amount: Math.max(Math.round(usageSpend * 0.81), 1),
                          status: "Paid",
                        },
                      ].map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-accent/5 transition-colors">
                          <td className="p-4">
                            <p className="text-[14px] font-mono text-foreground">{invoice.id}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-[14px] text-foreground">{formatDate(invoice.date)}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-[14px] text-foreground tabular-nums">{formatCurrency(invoice.amount)}</p>
                          </td>
                          <td className="p-4">
                            <UnifiedBadge variant="billing" value={invoice.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="flex-1 p-8">
            <div className="text-center py-20">
              <p className="text-[14px] text-muted-foreground">Audit logs tab content</p>
            </div>
          </TabsContent>

          <TabsContent value="users" className="flex-1 p-8">
            <Card className="border border-border shadow-sm">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[16px] font-semibold text-foreground">Team and roles</h3>
                    <p className="text-[13px] text-muted-foreground">
                      Organization portal users for {organization.name}
                    </p>
                  </div>
                  <p className="text-[13px] text-muted-foreground">
                    {organizationEnterpriseUsers.length} user{organizationEnterpriseUsers.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <p className="mt-2 text-[12px] text-muted-foreground">
                  An Owner can assign multiple roles to a portal user.
                </p>
                {roleMessage && (
                  <div className="mt-3 rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2 text-xs text-green-700 dark:text-green-300">
                    {roleMessage}
                  </div>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border bg-accent/5">
                    <tr>
                      <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Portal username
                      </th>
                      <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Email
                      </th>
                      <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Roles
                      </th>
                      <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Status
                      </th>
                      <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Last Login
                      </th>
                      <th className="text-left p-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {organizationEnterpriseUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-accent/5 transition-colors">
                        <td className="p-4">
                          <p className="text-[14px] font-medium text-foreground font-mono">{user.enterpriseUsername}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-[14px] text-foreground">{user.email}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5">
                            {user.roles.map((role) => (
                              <UnifiedBadge key={`${user.id}-${role}`} variant="role" value={role} />
                            ))}
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <UnifiedBadge
                            variant="status"
                            value={
                              user.status === "active"
                                ? "Active"
                                : user.status === "pending"
                                ? "Pending"
                                : "Suspended"
                            }
                          />
                        </td>
                        <td className="p-4">
                          <p className="text-[13px] text-muted-foreground">
                            {user.lastLogin ? formatDateTime(user.lastLogin) : "Never"}
                          </p>
                        </td>
                        <td className="p-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setRoleEditorUserId(user.id);
                              setRoleDraft(user.roles);
                            }}
                          >
                            Assign Roles
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {organizationEnterpriseUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-10 text-center">
                          <p className="text-sm font-medium text-foreground">No enterprise users assigned</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            No enterprise users are currently mapped to this organization.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
            <Dialog open={roleEditorUser !== null} onOpenChange={(open) => !open && setRoleEditorUserId(null)}>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Assign portal roles</DialogTitle>
                  <DialogDescription>
                    {roleEditorUser
                      ? `Assign one or more roles for ${roleEditorUser.enterpriseUsername}.`
                      : "Assign one or more organization portal roles."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                  {enterpriseRoleDefinitions.map((definition) => {
                    const checked = roleDraft.includes(definition.role);
                    return (
                      <label
                        key={definition.role}
                        className="flex gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-accent/5"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => {
                            const isChecked = Boolean(value);
                            setRoleDraft((prev) => {
                              if (isChecked) {
                                return prev.includes(definition.role) ? prev : [...prev, definition.role];
                              }
                              return prev.filter((role) => role !== definition.role);
                            });
                          }}
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{definition.role}</p>
                            <span className="text-[10px] rounded border border-border px-1.5 py-0.5 text-muted-foreground">
                              {definition.access}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {definition.responsibilities.join(" • ")}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Restrictions: {definition.restrictions.length > 0 ? definition.restrictions.join(" • ") : "None"}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRoleEditorUserId(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (!roleEditorUser) return;
                      if (roleDraft.length === 0) return;
                      setOrganizationEnterpriseUsers((prev) =>
                        prev.map((user) =>
                          user.id === roleEditorUser.id ? { ...user, roles: roleDraft } : user,
                        ),
                      );
                      setRoleMessage(`Updated roles for ${roleEditorUser.enterpriseUsername}.`);
                      setRoleEditorUserId(null);
                    }}
                    disabled={roleDraft.length === 0}
                  >
                    Save Roles
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 p-8">
            <div className="text-center py-20">
              <p className="text-[14px] text-muted-foreground">Settings tab content</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
