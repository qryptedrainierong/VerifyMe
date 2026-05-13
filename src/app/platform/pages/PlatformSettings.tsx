import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Card } from "../../shared/components/ui/card";
import { Button } from "../../shared/components/ui/button";
import { Input } from "../../shared/components/ui/input";
import { Label } from "../../shared/components/ui/label";
import { Switch } from "../../shared/components/ui/switch";
import { Textarea } from "../../shared/components/ui/textarea";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shared/components/ui/select";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../shared/components/ui/dialog";
import { usePlatformRole } from "../context/PlatformRoleContext";
import { settingsCategoriesForRole, type PlatformSettingsCategoryId } from "../utils/platformRolePermissions";

type SettingsCategory =
  | "general"
  | "verification_policy"
  | "risk_governance"
  | "organization_defaults"
  | "billing_policy"
  | "audit_retention"
  | "platform_team_policy"
  | "feature_controls"
  | "developer_internal";

type FeatureState = "enabled" | "internal_only" | "pilot_only" | "disabled";

type RiskyChange = {
  title: string;
  description: string;
  onConfirm: () => void;
};

const categoryNav: Array<{ id: SettingsCategory; label: string; superAdminOnly?: boolean }> = [
  { id: "general", label: "General Platform" },
  { id: "verification_policy", label: "Verification Policy" },
  { id: "risk_governance", label: "Risk & Governance" },
  { id: "organization_defaults", label: "Organization Defaults" },
  { id: "billing_policy", label: "Billing & Credits Policy" },
  { id: "audit_retention", label: "Audit & Retention" },
  { id: "platform_team_policy", label: "Platform Team & Access Policy" },
  { id: "feature_controls", label: "Feature Controls" },
  { id: "developer_internal", label: "Developer / Internal", superAdminOnly: true },
];

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
      {description ? <p className="text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function PlatformSettings() {
  const { role } = usePlatformRole();
  const isSuperAdmin = role === "super_admin";
  const settingsScope = settingsCategoriesForRole(role);
  const [searchParams] = useSearchParams();
  const scopedOrganizationId = searchParams.get("organizationId");
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>("general");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [confirmRiskyChange, setConfirmRiskyChange] = useState<RiskyChange | null>(null);

  const [platformDisplayName, setPlatformDisplayName] = useState("VerifyMe Platform");
  const [supportEmail, setSupportEmail] = useState("support@verifyme.com");
  const [supportUrl, setSupportUrl] = useState("https://verifyme.com/support");
  const [defaultTimezone, setDefaultTimezone] = useState("UTC");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [platformStatus, setPlatformStatus] = useState("Operational");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [operationalBanner, setOperationalBanner] = useState("All core services are operating normally.");

  const [defaultVerificationTimeout, setDefaultVerificationTimeout] = useState("240");
  const [minimumVerificationTimeout, setMinimumVerificationTimeout] = useState("120");
  const [maximumVerificationTimeout, setMaximumVerificationTimeout] = useState("600");
  const [defaultRetryAttempts, setDefaultRetryAttempts] = useState("2");
  const [maxOrgRetryAttempts, setMaxOrgRetryAttempts] = useState("3");
  const [challengeResendCooldown, setChallengeResendCooldown] = useState("30");
  const [maxResendAttempts, setMaxResendAttempts] = useState("3");
  const [channelPolicy, setChannelPolicy] = useState({ call: true, message: true, web: true });
  const [verificationGuidance, setVerificationGuidance] = useState({
    riskGuidance: true,
    nameConsistencyGuidance: true,
    conflictWarnings: true,
  });

  const [riskScoringEnabled, setRiskScoringEnabled] = useState(true);
  const [riskVersion, setRiskVersion] = useState("v2.4");
  const [highRiskThreshold, setHighRiskThreshold] = useState("70");
  const [criticalRiskThreshold, setCriticalRiskThreshold] = useState("85");
  const [autoReviewThreshold, setAutoReviewThreshold] = useState("80");
  const [requireManualCriticalReview, setRequireManualCriticalReview] = useState(true);
  const [requireConflictReview, setRequireConflictReview] = useState(true);
  const [governanceAlertsEnabled, setGovernanceAlertsEnabled] = useState(true);
  const [nameConsistencyEnabled, setNameConsistencyEnabled] = useState(true);
  const [allowPartialNameMatches, setAllowPartialNameMatches] = useState(true);
  const [minimumNameConfidence, setMinimumNameConfidence] = useState("0.78");

  const [orgDefaultSessionTimeout, setOrgDefaultSessionTimeout] = useState("240");
  const [orgDefaultRetryAttempts, setOrgDefaultRetryAttempts] = useState("2");
  const [orgDefaultResendLimit, setOrgDefaultResendLimit] = useState("2");
  const [orgDefaultRiskGuidance, setOrgDefaultRiskGuidance] = useState(true);
  const [orgDefaultAuditRetentionDays, setOrgDefaultAuditRetentionDays] = useState("365");
  const [orgDefaultBillingModel, setOrgDefaultBillingModel] = useState("per_verification_outcome");
  const [orgDefaultIncludedCredits, setOrgDefaultIncludedCredits] = useState("1000");
  const [orgDefaultVerificationPrice, setOrgDefaultVerificationPrice] = useState("1.20");
  const [orgLowCreditWarningThreshold, setOrgLowCreditWarningThreshold] = useState("150");
  const [defaultAllowedScopes, setDefaultAllowedScopes] = useState("openid");
  const [defaultQrLinkingEnabled, setDefaultQrLinkingEnabled] = useState(true);
  const [defaultApiAccessEnabled, setDefaultApiAccessEnabled] = useState(true);

  const [creditConsumptionPolicy, setCreditConsumptionPolicy] = useState("deduct_on_completed_billable_outcome");
  const [globalLowCreditThreshold, setGlobalLowCreditThreshold] = useState("100");
  const [creditOverageAllowed, setCreditOverageAllowed] = useState(true);
  const [autoSuspendOnNegativeBalance, setAutoSuspendOnNegativeBalance] = useState(false);
  const [gracePeriodDays, setGracePeriodDays] = useState("5");

  const [auditLoggingEnabled, setAuditLoggingEnabled] = useState(true);
  const [riskEventRetentionDays, setRiskEventRetentionDays] = useState("730");
  const [verificationRetentionDays, setVerificationRetentionDays] = useState("365");
  const [billingRetentionDays, setBillingRetentionDays] = useState("2555");
  const [adminActionRetentionDays, setAdminActionRetentionDays] = useState("2555");
  const [verificationSessionRetentionDays, setVerificationSessionRetentionDays] = useState("365");
  const [auditLogRetentionDays, setAuditLogRetentionDays] = useState("2555");
  const [conflictHistoryRetentionDays, setConflictHistoryRetentionDays] = useState("1095");
  const [allowCsvExport, setAllowCsvExport] = useState(true);
  const [allowAuditExport, setAllowAuditExport] = useState(true);
  const [requireElevatedExportPermission, setRequireElevatedExportPermission] = useState(true);

  const [requireMfaForPlatformAdmins, setRequireMfaForPlatformAdmins] = useState(true);
  const [passwordResetTimeoutMinutes, setPasswordResetTimeoutMinutes] = useState("30");
  const [platformAdminSessionTimeoutMinutes, setPlatformAdminSessionTimeoutMinutes] = useState("20");
  const [maxConcurrentPlatformAdminSessions, setMaxConcurrentPlatformAdminSessions] = useState("3");
  const [superAdminProtectionsEnabled, setSuperAdminProtectionsEnabled] = useState(true);
  const [requireRoleChangeConfirmations, setRequireRoleChangeConfirmations] = useState(true);
  const [requireOrganizationDisableArchiveConfirmation, setRequireOrganizationDisableArchiveConfirmation] = useState(true);

  const [verificationFeatures, setVerificationFeatures] = useState({
    adaptiveChallenge: "enabled" as FeatureState,
    verificationReplayGuard: "internal_only" as FeatureState,
    channelPriorityRouting: "pilot_only" as FeatureState,
  });
  const [riskFeatures, setRiskFeatures] = useState({
    governanceEscalationFeed: "enabled" as FeatureState,
    identityConflictCopilot: "internal_only" as FeatureState,
    riskBandDriftMonitor: "pilot_only" as FeatureState,
  });
  const [billingFeatures, setBillingFeatures] = useState({
    proactiveCreditWarnings: "enabled" as FeatureState,
    invoiceReminderAutomation: "pilot_only" as FeatureState,
    negativeBalanceAutoActions: "internal_only" as FeatureState,
  });
  const [enterpriseFeatures, setEnterpriseFeatures] = useState({
    linkedEndUserReviewQueue: "enabled" as FeatureState,
    teamAccessGovernanceHints: "enabled" as FeatureState,
    enterpriseRoutingOverrides: "disabled" as FeatureState,
  });
  const [experimentalFeatures, setExperimentalFeatures] = useState({
    policySimulator: "disabled" as FeatureState,
    anomalyWorkbench: "internal_only" as FeatureState,
  });

  const visibleCategories = useMemo(
    () =>
      categoryNav.filter((item) => {
        if (item.superAdminOnly && !isSuperAdmin) return false;
        if (settingsScope === "all") return true;
        return settingsScope.includes(item.id as PlatformSettingsCategoryId);
      }),
    [isSuperAdmin, settingsScope],
  );

  useEffect(() => {
    const ids = visibleCategories.map((c) => c.id);
    if (ids.length > 0 && !ids.includes(activeCategory)) {
      setActiveCategory(ids[0]!);
    }
  }, [visibleCategories, activeCategory]);

  const metadata = {
    updatedAt: "2026-05-07 15:55 UTC+8",
    updatedBy: "rainier@verifyme.com",
    effectiveDate: "2026-05-08 00:00 UTC+8",
  };

  const markSaved = (label: string) => {
    setSaveMessage(`${label} updated.`);
  };

  const requestRiskyChange = (title: string, description: string, onConfirm: () => void) => {
    setConfirmRiskyChange({ title, description, onConfirm });
  };

  const renderMetadata = () => (
    <div className="mt-5 rounded-md border border-border/80 bg-muted/20 p-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Policy metadata</p>
      <dl className="grid gap-2 text-xs sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Last updated</dt>
          <dd className="font-medium text-foreground">{metadata.updatedAt}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Updated by</dt>
          <dd className="font-medium text-foreground">{metadata.updatedBy}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Effective date</dt>
          <dd className="font-medium text-foreground">{metadata.effectiveDate}</dd>
        </div>
      </dl>
    </div>
  );

  const featureBadgeClass = (state: FeatureState) => {
    if (state === "enabled") return "border-emerald-300 bg-emerald-50 text-emerald-700";
    if (state === "internal_only") return "border-sky-300 bg-sky-50 text-sky-700";
    if (state === "pilot_only") return "border-amber-300 bg-amber-50 text-amber-800";
    return "border-slate-300 bg-slate-100 text-slate-700";
  };

  const featureStateLabel = (state: FeatureState) => {
    if (state === "internal_only") return "Internal only";
    if (state === "pilot_only") return "Pilot organizations only";
    if (state === "enabled") return "Enabled";
    return "Disabled";
  };

  return (
    <>
      <PortalPageFrame
        title="Platform Settings"
        description="Global governance and operational policy center for verification, risk, billing, audit controls, platform admin access, and controlled feature rollout."
        headerActions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/audit-logs?governanceCategory=Governance&search=policy">View related audit logs</Link>
          </Button>
        }
        headerExtra={
          <div className="space-y-2">
            {scopedOrganizationId ? (
              <div className="rounded-md border border-border/80 bg-muted/30 px-4 py-2 text-xs text-muted-foreground sm:text-sm">
                Organization context detected: <span className="font-mono text-foreground">{scopedOrganizationId}</span>. This
                page controls global platform policy (including default templates), not tenant-local organization settings.
              </div>
            ) : null}
            {saveMessage ? (
              <div className="rounded-md border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm text-green-700 dark:text-green-300">
                {saveMessage}
              </div>
            ) : null}
          </div>
        }
        bodyClassName="space-y-6"
      >
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Card className="h-fit border border-border p-3 shadow-sm">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Settings categories</p>
            <div className="space-y-1">
              {visibleCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                    activeCategory === category.id
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
            {!isSuperAdmin ? (
              <p className="mt-3 px-2 text-xs text-muted-foreground">
                Developer / Internal settings are visible to Super Admin users only.
              </p>
            ) : null}
          </Card>

          <div className="space-y-4">
            {activeCategory === "general" ? (
              <>
                <Card className="border border-border p-6 shadow-sm">
                  <SectionHeader
                    title="General Platform"
                    description="Operational metadata and customer-facing support defaults used across platform surfaces."
                  />
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="platformDisplayName">Platform display name</Label>
                      <Input id="platformDisplayName" value={platformDisplayName} onChange={(e) => setPlatformDisplayName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail">Support email</Label>
                      <Input id="supportEmail" type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportUrl">Support contact URL</Label>
                      <Input id="supportUrl" value={supportUrl} onChange={(e) => setSupportUrl(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Platform status</Label>
                      <Select value={platformStatus} onValueChange={setPlatformStatus}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Operational">Operational</SelectItem>
                          <SelectItem value="Degraded">Degraded</SelectItem>
                          <SelectItem value="Maintenance advisory">Maintenance advisory</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Default timezone</Label>
                      <Select value={defaultTimezone} onValueChange={setDefaultTimezone}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="Asia/Singapore">Asia/Singapore</SelectItem>
                          <SelectItem value="America/New_York">America/New_York</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Default currency</Label>
                      <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="SGD">SGD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-md border border-amber-200 bg-amber-50/60 p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Maintenance mode</p>
                      <p className="text-xs text-muted-foreground">Informational only for MVP; no destructive global shutdown behavior.</p>
                    </div>
                    <UnifiedBadge variant="status" value="High impact" size="sm" />
                    <Switch
                      checked={maintenanceMode}
                      onCheckedChange={(checked) => {
                        requestRiskyChange(
                          checked ? "Enable maintenance advisory?" : "Disable maintenance advisory?",
                          "This action updates global operational messaging.",
                          () => setMaintenanceMode(checked),
                        );
                      }}
                    />
                  </div>
                  <div className="mt-4 rounded-md border border-border/80 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                    <strong className="text-foreground">Platform-enforced:</strong> status, global notice, and support metadata.
                    <span className="mx-1">·</span>
                    <strong className="text-foreground">Organization-configurable:</strong> not applicable in this section.
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="operationalBanner">Operational notice banner</Label>
                    <Textarea id="operationalBanner" rows={3} value={operationalBanner} onChange={(e) => setOperationalBanner(e.target.value)} />
                  </div>
                  {renderMetadata()}
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => markSaved("platform_settings.updated")}>Save general platform settings</Button>
                  </div>
                </Card>
              </>
            ) : null}

            {activeCategory === "verification_policy" ? (
              <>
                <Card className="border border-border p-6 shadow-sm">
                  <SectionHeader
                    title="Session Policy"
                    description="Platform-enforced maximums define safe bounds. Organizations can configure values only within these limits."
                  />
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Default verification session timeout (seconds)</Label>
                      <Input value={defaultVerificationTimeout} onChange={(e) => setDefaultVerificationTimeout(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum timeout (seconds)</Label>
                      <Input value={minimumVerificationTimeout} onChange={(e) => setMinimumVerificationTimeout(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum timeout (seconds)</Label>
                      <Input value={maximumVerificationTimeout} onChange={(e) => setMaximumVerificationTimeout(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Default retry attempts</Label>
                      <Input value={defaultRetryAttempts} onChange={(e) => setDefaultRetryAttempts(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum retry attempts allowed for organizations</Label>
                      <Input value={maxOrgRetryAttempts} onChange={(e) => setMaxOrgRetryAttempts(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Challenge resend cooldown (seconds)</Label>
                      <Input value={challengeResendCooldown} onChange={(e) => setChallengeResendCooldown(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum resend attempts</Label>
                      <Input value={maxResendAttempts} onChange={(e) => setMaxResendAttempts(e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-4 rounded-md border border-border/80 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                    <strong className="text-foreground">Platform-enforced limits:</strong> minimum and maximum timeout, max retries, max resend.
                    <span className="mx-1">·</span>
                    <strong className="text-foreground">Organization-configurable defaults:</strong> timeout/retry within these bounds.
                  </div>
                  {renderMetadata()}
                </Card>

                <Card className="border border-border p-6 shadow-sm">
                  <SectionHeader title="Billing Policy" description="Global billable and non-billable verification outcomes." />
                  <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm">
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
                      <p className="font-medium text-emerald-800">Billable outcomes</p>
                      <ul className="mt-2 space-y-1 text-emerald-700">
                        <li>ID Proof Pass</li>
                        <li>ID Proof Fail</li>
                      </ul>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <p className="font-medium text-slate-800">Non-billable outcomes</p>
                      <ul className="mt-2 space-y-1 text-slate-700">
                        <li>Expired</li>
                        <li>Cancelled</li>
                        <li>Indeterminate</li>
                        <li>Error</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className="border border-border p-6 shadow-sm">
                  <SectionHeader title="Channel Policy" />
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {(["call", "message", "web"] as const).map((channel) => (
                      <div key={channel} className="flex items-center justify-between rounded-md border border-border p-3">
                        <p className="text-sm font-medium capitalize text-foreground">{channel}</p>
                        <Switch
                          checked={channelPolicy[channel]}
                          onCheckedChange={(checked) => setChannelPolicy((prev) => ({ ...prev, [channel]: checked }))}
                        />
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="border border-border p-6 shadow-sm">
                  <SectionHeader title="Verification Guidance" />
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-md border border-border p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Enable operator risk guidance</p>
                        <p className="text-xs text-muted-foreground">Guidance for risk review without exposing internal heuristics.</p>
                      </div>
                      <Switch checked={verificationGuidance.riskGuidance} onCheckedChange={(checked) => setVerificationGuidance((prev) => ({ ...prev, riskGuidance: checked }))} />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Enable name consistency guidance</p>
                        <p className="text-xs text-muted-foreground">Operator hints for conflict and consistency review workflows.</p>
                      </div>
                      <Switch checked={verificationGuidance.nameConsistencyGuidance} onCheckedChange={(checked) => setVerificationGuidance((prev) => ({ ...prev, nameConsistencyGuidance: checked }))} />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Enable conflict warnings</p>
                        <p className="text-xs text-muted-foreground">Escalation prompts when active conflicts need manual review.</p>
                      </div>
                      <Switch checked={verificationGuidance.conflictWarnings} onCheckedChange={(checked) => setVerificationGuidance((prev) => ({ ...prev, conflictWarnings: checked }))} />
                    </div>
                  </div>
                  {renderMetadata()}
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => markSaved("verification_policy.updated")}>Save verification policy</Button>
                  </div>
                </Card>
              </>
            ) : null}

            {activeCategory === "risk_governance" ? (
              <>
                <Card className="border border-border p-6 shadow-sm">
                  <SectionHeader
                    title="Risk Scoring"
                    description="Safe operational controls only. Raw scoring weights and internal detection logic are not shown."
                  />
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50/60 p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Risk scoring enabled</p>
                        <p className="text-xs text-muted-foreground">Applies platform-wide VerifyMe User risk posture evaluation.</p>
                      </div>
                      <UnifiedBadge variant="status" value="High impact" size="sm" />
                      <Switch
                        checked={riskScoringEnabled}
                        onCheckedChange={(checked) =>
                          requestRiskyChange(
                            checked ? "Enable risk scoring?" : "Disable risk scoring?",
                            "Changing risk scoring affects governance posture across VerifyMe Users.",
                            () => setRiskScoringEnabled(checked),
                          )
                        }
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Current scoring version</Label>
                        <Input value={riskVersion} onChange={(e) => setRiskVersion(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Auto-review threshold</Label>
                        <Input value={autoReviewThreshold} onChange={(e) => setAutoReviewThreshold(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>High-risk threshold</Label>
                        <Input value={highRiskThreshold} onChange={(e) => setHighRiskThreshold(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Critical-risk threshold</Label>
                        <Input value={criticalRiskThreshold} onChange={(e) => setCriticalRiskThreshold(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="border border-border p-6 shadow-sm">
                  <SectionHeader title="Governance Escalation" />
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-md border border-border p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Require manual review for critical risk</p>
                        <p className="text-xs text-muted-foreground">Critical risk cases cannot auto-close without operator review.</p>
                      </div>
                      <Switch checked={requireManualCriticalReview} onCheckedChange={setRequireManualCriticalReview} />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Require manual review for active conflicts</p>
                        <p className="text-xs text-muted-foreground">Conflict states remain open until reviewed with audit trace.</p>
                      </div>
                      <Switch checked={requireConflictReview} onCheckedChange={setRequireConflictReview} />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Enable governance alerts</p>
                        <p className="text-xs text-muted-foreground">Send internal operational alerts for elevated events.</p>
                      </div>
                      <Switch checked={governanceAlertsEnabled} onCheckedChange={setGovernanceAlertsEnabled} />
                    </div>
                  </div>
                </Card>

                <Card className="border border-border p-6 shadow-sm">
                  <SectionHeader title="Name Consistency" />
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-md border border-border p-3">
                      <p className="text-sm font-medium text-foreground">Enable name consistency evaluation</p>
                      <Switch checked={nameConsistencyEnabled} onCheckedChange={setNameConsistencyEnabled} />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border p-3">
                      <p className="text-sm font-medium text-foreground">Allow partial matches</p>
                      <Switch checked={allowPartialNameMatches} onCheckedChange={setAllowPartialNameMatches} />
                    </div>
                    <div className="space-y-2 rounded-md border border-border p-3">
                      <Label>Minimum acceptable confidence</Label>
                      <Input value={minimumNameConfidence} onChange={(e) => setMinimumNameConfidence(e.target.value)} />
                    </div>
                  </div>
                  {renderMetadata()}
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => markSaved("risk_policy.updated")}>Save risk & governance policy</Button>
                  </div>
                </Card>
              </>
            ) : null}

            {activeCategory === "organization_defaults" ? (
              <>
                <Card className="border border-border p-6 shadow-sm">
                  <SectionHeader title="Security Defaults" />
                  <p className="mt-1 text-sm text-muted-foreground">Defaults applied at organization creation; tenant values can stay within platform maximums only.</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Default session timeout (seconds)</Label><Input value={orgDefaultSessionTimeout} onChange={(e) => setOrgDefaultSessionTimeout(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Default retry attempts</Label><Input value={orgDefaultRetryAttempts} onChange={(e) => setOrgDefaultRetryAttempts(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Default resend limit</Label><Input value={orgDefaultResendLimit} onChange={(e) => setOrgDefaultResendLimit(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Default audit retention (days)</Label><Input value={orgDefaultAuditRetentionDays} onChange={(e) => setOrgDefaultAuditRetentionDays(e.target.value)} /></div>
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-md border border-border p-3">
                    <p className="text-sm font-medium text-foreground">Default risk guidance enabled</p>
                    <Switch checked={orgDefaultRiskGuidance} onCheckedChange={setOrgDefaultRiskGuidance} />
                  </div>
                </Card>

                <Card className="border border-border p-6 shadow-sm">
                  <SectionHeader title="Billing Defaults" />
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Default billing model</Label>
                      <Select value={orgDefaultBillingModel} onValueChange={setOrgDefaultBillingModel}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="per_verification_outcome">Per verification outcome</SelectItem>
                          <SelectItem value="prepaid_credits">Prepaid credits</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Default included credits</Label><Input value={orgDefaultIncludedCredits} onChange={(e) => setOrgDefaultIncludedCredits(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Default verification pricing (USD)</Label><Input value={orgDefaultVerificationPrice} onChange={(e) => setOrgDefaultVerificationPrice(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Default low-credit warning threshold</Label><Input value={orgLowCreditWarningThreshold} onChange={(e) => setOrgLowCreditWarningThreshold(e.target.value)} /></div>
                  </div>
                </Card>

                <Card className="border border-border p-6 shadow-sm">
                  <SectionHeader title="Integration Defaults" />
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Default allowed scopes</Label>
                      <Input value={defaultAllowedScopes} onChange={(e) => setDefaultAllowedScopes(e.target.value)} />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border p-3">
                      <p className="text-sm font-medium text-foreground">Default QR linking enabled</p>
                      <Switch checked={defaultQrLinkingEnabled} onCheckedChange={setDefaultQrLinkingEnabled} />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border p-3">
                      <p className="text-sm font-medium text-foreground">Default API access enabled</p>
                      <Switch checked={defaultApiAccessEnabled} onCheckedChange={setDefaultApiAccessEnabled} />
                    </div>
                  </div>
                  <div className="mt-4 rounded-md border border-border/80 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                    <strong className="text-foreground">Platform-enforced:</strong> max limits and policy-level constraints.
                    <span className="mx-1">·</span>
                    <strong className="text-foreground">Organization defaults:</strong> initial values that org admins can tune within policy.
                  </div>
                  {renderMetadata()}
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => markSaved("organization_defaults.updated")}>Save organization defaults</Button>
                  </div>
                </Card>
              </>
            ) : null}

            {activeCategory === "billing_policy" ? (
              <>
                <Card className="border border-border p-6 shadow-sm">
                  <SectionHeader title="Billing Rules" />
                  <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm">
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
                      <p className="font-medium text-emerald-800">Billable outcomes</p>
                      <ul className="mt-2 space-y-1 text-emerald-700">
                        <li>ID Proof Pass</li>
                        <li>ID Proof Fail</li>
                      </ul>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <p className="font-medium text-slate-800">Non-billable outcomes</p>
                      <ul className="mt-2 space-y-1 text-slate-700">
                        <li>Expired</li>
                        <li>Cancelled</li>
                        <li>Indeterminate</li>
                        <li>Error</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label>Credit consumption policy</Label>
                    <Select value={creditConsumptionPolicy} onValueChange={setCreditConsumptionPolicy}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deduct_on_completed_billable_outcome">Deduct on completed billable outcome</SelectItem>
                        <SelectItem value="deduct_on_verification_resolution">Deduct on verification resolution</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Card>

                <Card className="border border-border p-6 shadow-sm">
                  <SectionHeader title="Credit Controls" />
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Low-credit threshold</Label><Input value={globalLowCreditThreshold} onChange={(e) => setGlobalLowCreditThreshold(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Grace period (days)</Label><Input value={gracePeriodDays} onChange={(e) => setGracePeriodDays(e.target.value)} /></div>
                    <div className="flex items-center justify-between rounded-md border border-border p-3">
                      <p className="text-sm font-medium text-foreground">Credit overage allowed</p>
                      <Switch checked={creditOverageAllowed} onCheckedChange={setCreditOverageAllowed} />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50/60 p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Auto-suspend on negative balance</p>
                        <p className="text-xs text-muted-foreground">Applies platform billing policy to organizations below threshold.</p>
                      </div>
                      <UnifiedBadge variant="status" value="High impact" size="sm" />
                      <Switch
                        checked={autoSuspendOnNegativeBalance}
                        onCheckedChange={(checked) =>
                          requestRiskyChange(
                            checked ? "Enable auto-suspend on negative balance?" : "Disable auto-suspend on negative balance?",
                            "Changing this policy affects organization lifecycle handling for negative balances.",
                            () => setAutoSuspendOnNegativeBalance(checked),
                          )
                        }
                      />
                    </div>
                  </div>
                </Card>

                <Card className="border border-border p-6 shadow-sm">
                  <SectionHeader title="Future Billing Features" />
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Email OTP billing</p>
                        <p className="text-xs text-muted-foreground">Not enabled</p>
                      </div>
                      <Switch checked={false} disabled />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">SMS billing</p>
                        <p className="text-xs text-muted-foreground">Not enabled</p>
                      </div>
                      <Switch checked={false} disabled />
                    </div>
                  </div>
                  {renderMetadata()}
                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={() =>
                        requestRiskyChange(
                          "Update billing & credits policy?",
                          "Billing policy changes affect charges and credit behavior across organizations. This action will be recorded in audit logs.",
                          () => markSaved("billing_policy.updated"),
                        )
                      }
                    >
                      Save billing policy
                    </Button>
                  </div>
                </Card>
              </>
            ) : null}

            {activeCategory === "audit_retention" ? (
              <>
                <Card className="border border-border p-6 shadow-sm">
                  <SectionHeader title="Audit Policy" />
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50/60 p-3">
                      <p className="text-sm font-medium text-foreground">Audit logging enabled</p>
                      <UnifiedBadge variant="status" value="High impact" size="sm" />
                      <Switch
                        checked={auditLoggingEnabled}
                        onCheckedChange={(checked) =>
                          requestRiskyChange(
                            checked ? "Enable audit logging?" : "Disable audit logging?",
                            "Audit logging must remain enabled for governance traceability.",
                            () => setAuditLoggingEnabled(checked),
                          )
                        }
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2"><Label>Risk event retention (days)</Label><Input value={riskEventRetentionDays} onChange={(e) => setRiskEventRetentionDays(e.target.value)} /></div>
                      <div className="space-y-2"><Label>Verification retention (days)</Label><Input value={verificationRetentionDays} onChange={(e) => setVerificationRetentionDays(e.target.value)} /></div>
                      <div className="space-y-2"><Label>Billing retention (days)</Label><Input value={billingRetentionDays} onChange={(e) => setBillingRetentionDays(e.target.value)} /></div>
                      <div className="space-y-2"><Label>Admin-action retention (days)</Label><Input value={adminActionRetentionDays} onChange={(e) => setAdminActionRetentionDays(e.target.value)} /></div>
                    </div>
                  </div>
                </Card>

                <Card className="border border-border p-6 shadow-sm">
                  <SectionHeader title="Data Retention" />
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Verification session retention (days)</Label><Input value={verificationSessionRetentionDays} onChange={(e) => setVerificationSessionRetentionDays(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Audit log retention (days)</Label><Input value={auditLogRetentionDays} onChange={(e) => setAuditLogRetentionDays(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Conflict history retention (days)</Label><Input value={conflictHistoryRetentionDays} onChange={(e) => setConflictHistoryRetentionDays(e.target.value)} /></div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">Retention policies may depend on compliance requirements.</p>
                </Card>

                <Card className="border border-border p-6 shadow-sm">
                  <SectionHeader title="Export Policy" />
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-md border border-border p-3">
                      <p className="text-sm font-medium text-foreground">Allow CSV export</p>
                      <Switch checked={allowCsvExport} onCheckedChange={setAllowCsvExport} />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border p-3">
                      <p className="text-sm font-medium text-foreground">Allow audit export</p>
                      <Switch checked={allowAuditExport} onCheckedChange={setAllowAuditExport} />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border p-3">
                      <p className="text-sm font-medium text-foreground">Require elevated permission for exports</p>
                      <Switch checked={requireElevatedExportPermission} onCheckedChange={setRequireElevatedExportPermission} />
                    </div>
                  </div>
                  {renderMetadata()}
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => markSaved("audit_policy.updated")}>Save audit & retention policy</Button>
                  </div>
                </Card>
              </>
            ) : null}

            {activeCategory === "platform_team_policy" ? (
              <>
                <Card className="border border-border p-6 shadow-sm">
                  <SectionHeader title="Authentication Policy" />
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50/60 p-3 md:col-span-2">
                      <p className="text-sm font-medium text-foreground">Require MFA for platform admins</p>
                      <UnifiedBadge variant="status" value="High impact" size="sm" />
                      <Switch
                        checked={requireMfaForPlatformAdmins}
                        onCheckedChange={(checked) =>
                          requestRiskyChange(
                            checked ? "Require MFA for platform admins?" : "Disable MFA requirement for platform admins?",
                            "Changing MFA policy impacts platform admin access security.",
                            () => setRequireMfaForPlatformAdmins(checked),
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2"><Label>Password reset timeout (minutes)</Label><Input value={passwordResetTimeoutMinutes} onChange={(e) => setPasswordResetTimeoutMinutes(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Session timeout (minutes)</Label><Input value={platformAdminSessionTimeoutMinutes} onChange={(e) => setPlatformAdminSessionTimeoutMinutes(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Maximum concurrent sessions</Label><Input value={maxConcurrentPlatformAdminSessions} onChange={(e) => setMaxConcurrentPlatformAdminSessions(e.target.value)} /></div>
                  </div>
                </Card>

                <Card className="border border-border p-6 shadow-sm">
                  <SectionHeader title="Role Governance" />
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-md border border-border p-3">
                      <p className="text-sm font-medium text-foreground">Super Admin protections</p>
                      <Switch checked={superAdminProtectionsEnabled} onCheckedChange={setSuperAdminProtectionsEnabled} />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border p-3">
                      <p className="text-sm font-medium text-foreground">Require confirmation for role changes</p>
                      <Switch checked={requireRoleChangeConfirmations} onCheckedChange={setRequireRoleChangeConfirmations} />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border p-3">
                      <p className="text-sm font-medium text-foreground">Require confirmation for organization disable/archive</p>
                      <Switch checked={requireOrganizationDisableArchiveConfirmation} onCheckedChange={setRequireOrganizationDisableArchiveConfirmation} />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Platform Admin Users are separate from VerifyMe Users and Organization Admin Users.
                  </p>
                  {renderMetadata()}
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => markSaved("platform_settings.updated")}>Save team & access policy</Button>
                  </div>
                </Card>
              </>
            ) : null}

            {activeCategory === "feature_controls" ? (
              <>
                <Card className="border border-border p-6 shadow-sm">
                  <SectionHeader title="Feature Controls" description="Controlled rollout states: Enabled, Internal only, Pilot organizations only, Disabled." />
                  <div className="mt-4 space-y-6">
                    {[
                      {
                        title: "Verification features",
                        state: verificationFeatures,
                        setState: setVerificationFeatures,
                      },
                      {
                        title: "Risk/governance features",
                        state: riskFeatures,
                        setState: setRiskFeatures,
                      },
                      {
                        title: "Billing features",
                        state: billingFeatures,
                        setState: setBillingFeatures,
                      },
                      {
                        title: "Enterprise features",
                        state: enterpriseFeatures,
                        setState: setEnterpriseFeatures,
                      },
                      {
                        title: "Experimental features",
                        state: experimentalFeatures,
                        setState: setExperimentalFeatures,
                      },
                    ].map((group) => (
                      <div key={group.title} className="space-y-3">
                        <h4 className="text-sm font-semibold text-foreground">{group.title}</h4>
                        {Object.entries(group.state).map(([featureKey, featureState]) => (
                          <div key={featureKey} className="grid items-center gap-3 rounded-md border border-border p-3 md:grid-cols-[minmax(0,1fr)_220px_160px]">
                            <p className="text-sm text-foreground">{featureKey.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}</p>
                            <Select
                              value={featureState}
                              onValueChange={(value: FeatureState) =>
                                group.setState((prev) => ({ ...prev, [featureKey]: value }))
                              }
                            >
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="enabled">Enabled</SelectItem>
                                <SelectItem value="internal_only">Internal only</SelectItem>
                                <SelectItem value="pilot_only">Pilot organizations only</SelectItem>
                                <SelectItem value="disabled">Disabled</SelectItem>
                              </SelectContent>
                            </Select>
                            <span className={`inline-flex w-fit rounded border px-2 py-1 text-xs ${featureBadgeClass(featureState as FeatureState)}`}>
                              {featureStateLabel(featureState as FeatureState)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  {renderMetadata()}
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => markSaved("feature_control.updated")}>Save feature controls</Button>
                  </div>
                </Card>
              </>
            ) : null}

            {activeCategory === "developer_internal" && isSuperAdmin ? (
              <Card className="border border-red-200 bg-red-50/40 p-6 shadow-sm">
                <SectionHeader
                  title="Developer / Internal"
                  description="Super Admin-only operational diagnostics. Sensitive values remain redacted and cryptographic material is never shown."
                />
                <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-red-200 bg-white/70 px-3 py-1.5 text-xs text-red-700">
                  <span className="font-semibold">Restricted</span>
                  <span>Super Admin only · Redacted diagnostics</span>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-md border border-border p-3 text-sm">
                    <p className="text-xs text-muted-foreground">Build version</p>
                    <p className="font-medium text-foreground">verifyme-admin-portals@0.0.1</p>
                  </div>
                  <div className="rounded-md border border-border p-3 text-sm">
                    <p className="text-xs text-muted-foreground">Environment</p>
                    <p className="font-medium text-foreground">Production-like (mock runtime)</p>
                  </div>
                  <div className="rounded-md border border-border p-3 text-sm">
                    <p className="text-xs text-muted-foreground">API status</p>
                    <p className="font-medium text-foreground">Mock services healthy</p>
                  </div>
                  <div className="rounded-md border border-border p-3 text-sm">
                    <p className="text-xs text-muted-foreground">Queue health</p>
                    <p className="font-medium text-foreground">Review queue stable, no backlog spike</p>
                  </div>
                  <div className="rounded-md border border-border p-3 text-sm md:col-span-2">
                    <p className="text-xs text-muted-foreground">Feature diagnostics</p>
                    <p className="font-medium text-foreground">No sensitive payload values displayed in diagnostics.</p>
                  </div>
                </div>
                <div className="mt-4 rounded-md border border-red-200 bg-white/80 px-3 py-2 text-xs text-red-700">
                  Restricted data notice: this section excludes OTPs, passcodes, biometrics, client secrets, token material, private keys, Encrypted_Auth_Cred, and Transaction_Code.
                </div>
                {renderMetadata()}
              </Card>
            ) : null}
          </div>
        </div>
      </PortalPageFrame>

      <Dialog open={confirmRiskyChange !== null} onOpenChange={(open) => !open && setConfirmRiskyChange(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{confirmRiskyChange?.title ?? "Confirm policy change"}</DialogTitle>
            <DialogDescription className="leading-relaxed">
              {confirmRiskyChange?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              This change may affect governance behavior across platform workflows.
            </div>
            <div className="rounded-md border border-border/80 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              This action will be recorded in audit logs.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRiskyChange(null)}>Cancel</Button>
            <Button
              onClick={() => {
                confirmRiskyChange?.onConfirm();
                setConfirmRiskyChange(null);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
