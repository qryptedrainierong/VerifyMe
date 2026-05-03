import { Save } from "lucide-react";
import { Card } from "../../shared/components/ui/card";
import { Button } from "../../shared/components/ui/button";
import { Input } from "../../shared/components/ui/input";
import { Label } from "../../shared/components/ui/label";
import { Textarea } from "../../shared/components/ui/textarea";
import { Switch } from "../../shared/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shared/components/ui/select";

export function EnterpriseSettings() {
  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-[24px] font-semibold text-foreground">Settings</h2>
        <p className="text-[15px] text-muted-foreground mt-1">
          Organization profile, verification limits, session timeout, security and billing contacts, and portal
          preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="p-6 shadow-sm">
            <h3 className="text-[16px] font-semibold text-foreground mb-4">
              Organization Details
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input id="org-name" defaultValue="Acme Corp" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-website">Website</Label>
                <Input id="org-website" type="url" defaultValue="https://acme.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-description">Description</Label>
                <Textarea
                  id="org-description"
                  rows={4}
                  defaultValue="Leading provider of innovative business solutions."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-industry">Industry</Label>
                  <Select defaultValue="technology">
                    <SelectTrigger id="org-industry">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-size">Company Size</Label>
                  <Select defaultValue="50-200">
                    <SelectTrigger id="org-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="50-200">50-200 employees</SelectItem>
                      <SelectItem value="200+">200+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </Card>

          <Card className="p-6 shadow-sm">
            <h3 className="text-[16px] font-semibold text-foreground mb-4">
              Regional Settings
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="utc-5">
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                      <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="utc+0">London (UTC+0)</SelectItem>
                      <SelectItem value="utc+1">Central Europe (UTC+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6 shadow-sm">
            <h3 className="text-[16px] font-semibold text-foreground mb-4">
              Email Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-[14px] font-medium text-foreground">Team Activity</p>
                  <p className="text-[13px] text-muted-foreground">
                    Receive emails about team member activity
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-[14px] font-medium text-foreground">New Members</p>
                  <p className="text-[13px] text-muted-foreground">
                    Get notified when someone joins your organization
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-[14px] font-medium text-foreground">Billing Updates</p>
                  <p className="text-[13px] text-muted-foreground">
                    Important updates about billing, credits, and verification usage
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-[14px] font-medium text-foreground">Product Updates</p>
                  <p className="text-[13px] text-muted-foreground">
                    News about new features and improvements
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-[14px] font-medium text-foreground">Marketing Emails</p>
                  <p className="text-[13px] text-muted-foreground">
                    Occasional emails about tips and best practices
                  </p>
                </div>
                <Switch />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="p-6 shadow-sm">
            <h3 className="text-[16px] font-semibold text-foreground mb-4">
              Security Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-[14px] font-medium text-foreground">
                    Two-Factor Authentication
                  </p>
                  <p className="text-[13px] text-muted-foreground">
                    Require 2FA for all organization members
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-[14px] font-medium text-foreground">
                    Session Timeout
                  </p>
                  <p className="text-[13px] text-muted-foreground">
                    Auto-logout after 30 minutes of inactivity
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-[14px] font-medium text-foreground">
                    IP Allowlist
                  </p>
                  <p className="text-[13px] text-muted-foreground">
                    Restrict access to specific IP addresses
                  </p>
                </div>
                <Switch />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Update Security
              </Button>
            </div>
          </Card>

          <Card className="p-6 shadow-sm border-red-200 bg-red-50">
            <h3 className="text-[16px] font-semibold text-red-900 mb-2">
              Danger Zone
            </h3>
            <p className="text-[13px] text-red-700 mb-4">
              These actions are irreversible. Please be careful.
            </p>
            <div className="space-y-3">
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                Delete Organization
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
