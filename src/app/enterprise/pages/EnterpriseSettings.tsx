import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { Save } from "lucide-react";
import { Card } from "../../shared/components/ui/card";
import { Button } from "../../shared/components/ui/button";
import { Input } from "../../shared/components/ui/input";
import { Label } from "../../shared/components/ui/label";
import { Textarea } from "../../shared/components/ui/textarea";
import { Switch } from "../../shared/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/components/ui/tabs";
import {
  enterpriseOrganization,
  enterpriseOrganizationProfileExtended,
  enterpriseVerificationSettingsMock,
} from "../data/enterpriseSample";

export function EnterpriseSettings() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("profile");
  const profile = enterpriseOrganizationProfileExtended;
  const v = enterpriseVerificationSettingsMock;

  useEffect(() => {
    if (location.hash === "#verification-settings") {
      setActiveTab("verification");
    }
  }, [location.hash]);

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-[24px] font-semibold text-foreground">Settings</h2>
        <p className="text-[15px] text-muted-foreground mt-1">
          Organization profile, verification behavior, notifications, and security preferences (sample forms — no
          persistence).
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="profile">Profile & organization</TabsTrigger>
          <TabsTrigger value="verification">Verification settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6 shadow-sm border border-border">
            <h3 className="text-[16px] font-semibold text-foreground mb-4">Organization profile</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization name</Label>
                  <Input id="org-name" defaultValue={enterpriseOrganization.organizationName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legal-name">Legal name</Label>
                  <Input id="legal-name" defaultValue={enterpriseOrganization.legalName} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-type">Organization type</Label>
                  <Input id="org-type" defaultValue={enterpriseOrganization.organizationType} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-code">Organization code</Label>
                  <Input id="org-code" className="font-mono" defaultValue={enterpriseOrganization.organizationCode} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" defaultValue={enterpriseOrganization.industry} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Company size</Label>
                  <Input id="size" defaultValue={enterpriseOrganization.companySize} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Primary domain</Label>
                <Input id="domain" defaultValue={enterpriseOrganization.domain} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Full address</Label>
                <Textarea id="address" rows={3} defaultValue={profile.fullAddress} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" className="font-mono text-sm" defaultValue={enterpriseOrganization.timezone} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" defaultValue={enterpriseOrganization.currency} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-sm border border-border">
            <h3 className="text-[16px] font-semibold text-foreground mb-4">Contacts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(
                [
                  ["Primary contact", profile.primaryContact],
                  ["Technical contact", profile.technicalContact],
                  ["Billing contact", profile.billingContact],
                  ["Security contact", profile.securityContact],
                ] as const
              ).map(([title, c]) => (
                <div key={title} className="space-y-3 rounded-lg border border-border p-4">
                  <p className="text-[13px] font-semibold text-foreground">{title}</p>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <Input defaultValue={c.name} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <Input type="email" defaultValue={c.email} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <Input defaultValue={c.phone} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <Button type="button">
                <Save className="w-4 h-4 mr-2" />
                Save profile (mock)
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <div id="verification-settings" className="scroll-mt-24 space-y-6">
            <Card className="p-6 shadow-sm border border-border">
              <h3 className="text-[16px] font-semibold text-foreground mb-2">Verification behavior</h3>
              <p className="text-[13px] text-muted-foreground mb-6">
                Organization settings must stay within VerifyMe platform maximum limits. VerifyMe defines defaults and
                caps; overrides here apply only to{" "}
                <strong className="text-foreground">{enterpriseOrganization.organizationName}</strong>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Max attempts per verification</Label>
                  <Input type="number" readOnly className="bg-muted/50" value={v.maxAttemptsPerVerification} />
                  <p className="text-[12px] text-muted-foreground">Platform maximum: {v.platformMaxAttempts}</p>
                </div>
                <div className="space-y-2">
                  <Label>Verification session timeout (seconds)</Label>
                  <Input type="number" readOnly className="bg-muted/50" value={v.verificationSessionTimeoutSeconds} />
                  <p className="text-[12px] text-muted-foreground">Platform maximum: {v.platformMaxTimeoutSeconds}s</p>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4 md:col-span-2">
                  <div>
                    <p className="text-[14px] font-medium text-foreground">Allow verification resend</p>
                    <p className="text-[12px] text-muted-foreground">Lets the user request another delivery step where supported.</p>
                  </div>
                  <Switch defaultChecked={v.allowVerificationResend} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Max resend count per verification</Label>
                  <Input type="number" readOnly className="bg-muted/50 max-w-xs" value={v.maxResendCount} />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button type="button">
                  <Save className="w-4 h-4 mr-2" />
                  Save verification settings (mock)
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6 shadow-sm border border-border">
            <h3 className="text-[16px] font-semibold text-foreground mb-4">Email notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-[14px] font-medium text-foreground">Team activity</p>
                  <p className="text-[13px] text-muted-foreground">Activity from organization portal users</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-[14px] font-medium text-foreground">New members</p>
                  <p className="text-[13px] text-muted-foreground">Invites and role changes</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-[14px] font-medium text-foreground">Credits & invoices</p>
                  <p className="text-[13px] text-muted-foreground">Credits, usage summaries, and invoice availability</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-[14px] font-medium text-foreground">Product updates</p>
                  <p className="text-[13px] text-muted-foreground">VerifyMe platform notices</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-[14px] font-medium text-foreground">Best-practice tips</p>
                  <p className="text-[13px] text-muted-foreground">Occasional integration and security tips</p>
                </div>
                <Switch />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button type="button">
                <Save className="w-4 h-4 mr-2" />
                Save preferences (mock)
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="p-6 shadow-sm border border-border">
            <h3 className="text-[16px] font-semibold text-foreground mb-4">Security settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-[14px] font-medium text-foreground">Two-factor authentication</p>
                  <p className="text-[13px] text-muted-foreground">Require 2FA for organization portal users</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-[14px] font-medium text-foreground">Portal session timeout</p>
                  <p className="text-[13px] text-muted-foreground">Auto sign-out after inactivity</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-[14px] font-medium text-foreground">IP allowlist</p>
                  <p className="text-[13px] text-muted-foreground">Restrict portal access by source network</p>
                </div>
                <Switch />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button type="button">
                <Save className="w-4 h-4 mr-2" />
                Update security (mock)
              </Button>
            </div>
          </Card>

          <Card className="p-6 shadow-sm border-red-200 bg-red-50 dark:bg-red-950/30">
            <h3 className="text-[16px] font-semibold text-red-900 dark:text-red-200 mb-2">Danger zone</h3>
            <p className="text-[13px] text-red-800 dark:text-red-300/90 mb-4">
              Destructive actions require elevated approval in production.
            </p>
            <Button variant="outline" type="button" className="border-red-300 text-red-700 hover:bg-red-100 dark:hover:bg-red-950">
              Request organization deletion (mock)
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
