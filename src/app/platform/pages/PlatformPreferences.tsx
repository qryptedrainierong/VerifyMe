import { useEffect, useState } from "react";
import { Button } from "../../shared/components/ui/button";
import { Card } from "../../shared/components/ui/card";
import { Label } from "../../shared/components/ui/label";
import { Switch } from "../../shared/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shared/components/ui/select";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";
import { usePlatformOperatorExperience, type OperatorExperiencePreferences } from "../context/PlatformOperatorExperienceContext";

export function PlatformPreferences() {
  const { preferences, updatePreferences, resetPreferencesToDefaults, preferencesFeedback } = usePlatformOperatorExperience();
  const [draft, setDraft] = useState<OperatorExperiencePreferences>(preferences);

  useEffect(() => {
    setDraft(preferences);
  }, [preferences]);

  const setDisplay = (partial: Partial<OperatorExperiencePreferences["display"]>) =>
    setDraft((d) => ({ ...d, display: { ...d.display, ...partial } }));
  const setLoc = (partial: Partial<OperatorExperiencePreferences["localization"]>) =>
    setDraft((d) => ({ ...d, localization: { ...d.localization, ...partial } }));
  const setViews = (partial: Partial<OperatorExperiencePreferences["defaultViews"]>) =>
    setDraft((d) => ({ ...d, defaultViews: { ...d.defaultViews, ...partial } }));
  const setA11y = (partial: Partial<OperatorExperiencePreferences["accessibility"]>) =>
    setDraft((d) => ({ ...d, accessibility: { ...d.accessibility, ...partial } }));

  return (
    <PortalPageFrame
      title="Preferences"
      description="Display and working-style defaults for this operator on this device. Theme and density selections are stored locally and are not yet wired to global portal theming."
      headerActions={
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => resetPreferencesToDefaults()}>
            Reset to defaults
          </Button>
          <Button type="button" size="sm" onClick={() => updatePreferences(draft)}>
            Save preferences
          </Button>
        </div>
      }
      bodyClassName="space-y-6"
    >
      {preferencesFeedback ? (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">{preferencesFeedback}</p>
      ) : null}

      <Card className="border border-border p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Display</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={draft.display.theme} onValueChange={(v) => setDisplay({ theme: v as OperatorExperiencePreferences["display"]["theme"] })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Density</Label>
            <Select value={draft.display.density} onValueChange={(v) => setDisplay({ density: v as OperatorExperiencePreferences["display"]["density"] })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Table density</Label>
            <Select
              value={draft.display.tableDensity}
              onValueChange={(v) => setDisplay({ tableDensity: v as OperatorExperiencePreferences["display"]["tableDensity"] })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Dashboard density</Label>
            <Select
              value={draft.display.dashboardDensity}
              onValueChange={(v) => setDisplay({ dashboardDensity: v as OperatorExperiencePreferences["display"]["dashboardDensity"] })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="focused">Focused</SelectItem>
                <SelectItem value="expanded">Expanded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="border border-border p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Localization</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={draft.localization.timezone} onValueChange={(v) => setLoc({ timezone: v })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Singapore">Asia / Singapore</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">America / New York</SelectItem>
                <SelectItem value="Europe/London">Europe / London</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date format</Label>
            <Select value={draft.localization.dateFormat} onValueChange={(v) => setLoc({ dateFormat: v })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Number format</Label>
            <Select value={draft.localization.numberFormat} onValueChange={(v) => setLoc({ numberFormat: v })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1,234.56">1,234.56</SelectItem>
                <SelectItem value="1.234,56">1.234,56</SelectItem>
                <SelectItem value="1 234,56">1 234,56</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Currency display</Label>
            <Select value={draft.localization.currencyDisplay} onValueChange={(v) => setLoc({ currencyDisplay: v })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD · symbol prefix">USD · symbol prefix</SelectItem>
                <SelectItem value="USD · code suffix">USD · code suffix</SelectItem>
                <SelectItem value="Local · organization default">Local · organization default</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="border border-border p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Default views</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Default landing page</Label>
            <Select value={draft.defaultViews.defaultLandingPage} onValueChange={(v) => setViews({ defaultLandingPage: v })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dashboard">Dashboard</SelectItem>
                <SelectItem value="Audit Logs">Audit Logs</SelectItem>
                <SelectItem value="Verification Sessions">Verification Sessions</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Default dashboard scope</Label>
            <Select value={draft.defaultViews.defaultDashboardScope} onValueChange={(v) => setViews({ defaultDashboardScope: v })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Platform-wide">Platform-wide</SelectItem>
                <SelectItem value="Last opened organization">Last opened organization</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Default audit filter</Label>
            <Select value={draft.defaultViews.defaultAuditFilter} onValueChange={(v) => setViews({ defaultAuditFilter: v })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Last 7 days · governance">Last 7 days · governance</SelectItem>
                <SelectItem value="Last 24 hours · all">Last 24 hours · all</SelectItem>
                <SelectItem value="Risk & identity focus">Risk &amp; identity focus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="border border-border p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Accessibility</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">Stored for future UI integration; does not change motion or contrast globally in this build.</p>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-md border border-border px-3 py-2">
            <Label htmlFor="reduce-motion" className="text-sm font-normal">
              Reduce motion
            </Label>
            <Switch id="reduce-motion" checked={draft.accessibility.reduceMotion} onCheckedChange={(v) => setA11y({ reduceMotion: v })} />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-md border border-border px-3 py-2">
            <Label htmlFor="high-contrast" className="text-sm font-normal">
              High contrast
            </Label>
            <Switch id="high-contrast" checked={draft.accessibility.highContrast} onCheckedChange={(v) => setA11y({ highContrast: v })} />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-md border border-border px-3 py-2">
            <Label htmlFor="larger-text" className="text-sm font-normal">
              Larger text
            </Label>
            <Switch id="larger-text" checked={draft.accessibility.largerText} onCheckedChange={(v) => setA11y({ largerText: v })} />
          </div>
        </div>
      </Card>
    </PortalPageFrame>
  );
}
