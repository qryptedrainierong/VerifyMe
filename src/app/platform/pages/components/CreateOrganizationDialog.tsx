import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/components/ui/dialog";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Switch } from "../../../shared/components/ui/switch";
import { cn } from "../../../shared/components/ui/utils";

export type NewOrganizationInput = {
  organizationName: string;
  legalName: string;
  organizationCode: string;
  organizationType: string;
  industry: string;
  companySize: string;
  country: string;
  timezone: string;
  currency: string;
  adminFullName: string;
  adminEmail: string;
  adminRole: "Owner";
  plan: "Starter" | "Professional" | "Enterprise";
  initialCredits: number;
  topUpCredits: number;
  pricePerVerification: number;
  emailOtpBillingEnabled: boolean;
  seatLimit: number;
};

type CreateOrganizationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingOrganizationCodes: string[];
  onSubmit: (input: NewOrganizationInput) => Promise<void> | void;
};

const emptyForm: NewOrganizationInput = {
  organizationName: "",
  legalName: "",
  organizationCode: "",
  organizationType: "Enterprise",
  industry: "Financial Services",
  companySize: "51-200",
  country: "United States",
  timezone: "America/New_York",
  currency: "USD",
  adminFullName: "",
  adminEmail: "",
  adminRole: "Owner",
  plan: "Starter",
  initialCredits: 10,
  topUpCredits: 0,
  pricePerVerification: 0.05,
  emailOtpBillingEnabled: true,
  seatLimit: 5,
};

const organizationTypes = ["Startup", "SME", "Enterprise", "Government", "Education", "Non-profit", "Sandbox"] as const;
const industries = [
  "Financial Services",
  "BPO/Call Center",
  "Telecommunications",
  "Healthcare",
  "Technology/IT Services",
  "Other",
] as const;
const companySizes = ["1-50", "51-200", "201-500", "501-1000", "1001-5000", "5001+"] as const;
const countries = ["United States", "Singapore", "United Kingdom", "Germany", "Australia"] as const;
const timezones = [
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Asia/Singapore",
  "Europe/London",
  "Europe/Berlin",
  "Australia/Sydney",
] as const;
const currencies = ["USD", "EUR", "SGD"] as const;

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function isEmailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function CreateOrganizationDialog({
  open,
  onOpenChange,
  existingOrganizationCodes,
  onSubmit,
}: CreateOrganizationDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<NewOrganizationInput>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const codes = useMemo(
    () => new Set(existingOrganizationCodes.map((c) => normalizeCode(c))),
    [existingOrganizationCodes],
  );

  const setField = <K extends keyof NewOrganizationInput>(key: K, value: NewOrganizationInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const reset = () => {
    setStep(1);
    setForm(emptyForm);
    setError(null);
    setSubmitting(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (submitting) return;
    onOpenChange(next);
    if (!next) reset();
  };

  const validateStep1 = () => {
    if (!form.organizationName.trim()) return "Organization name is required.";
    if (!form.legalName.trim()) return "Legal name is required.";
    const code = normalizeCode(form.organizationCode);
    if (code.length < 3) return "Organization code must be at least 3 characters (letters/numbers).";
    if (codes.has(code)) return "Organization code is already in use.";
    if (!form.country.trim()) return "Country is required.";
    return null;
  };

  const validateStep2 = () => {
    if (!form.adminFullName.trim()) return "Admin full name is required.";
    if (!isEmailValid(form.adminEmail)) return "Valid admin email is required.";
    return null;
  };

  const validateStep3 = () => {
    if (form.initialCredits < 0 || form.topUpCredits < 0) return "Credits cannot be negative.";
    if (form.pricePerVerification <= 0) return "Price per verification must be greater than zero.";
    if (form.seatLimit < 1) return "Seat limit must be at least 1.";
    return null;
  };

  const goNext = () => {
    if (step === 1) {
      const e = validateStep1();
      if (e) {
        setError(e);
        return;
      }
      setField("organizationCode", normalizeCode(form.organizationCode));
      setStep(2);
    } else if (step === 2) {
      const e = validateStep2();
      if (e) {
        setError(e);
        return;
      }
      setStep(3);
    }
  };

  const goBack = () => {
    setError(null);
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const finish = async () => {
    const e = validateStep3();
    if (e) {
      setError(e);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        ...form,
        organizationName: form.organizationName.trim(),
        legalName: form.legalName.trim(),
        organizationCode: normalizeCode(form.organizationCode),
        adminFullName: form.adminFullName.trim(),
        adminEmail: form.adminEmail.trim().toLowerCase(),
      });
      handleOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create organization.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepTitle = step === 1 ? "Profile" : step === 2 ? "Initial admin" : "Plan & credits";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create organization</DialogTitle>
          <DialogDescription>
            Step {step} of 3: {stepTitle}. No backend call — mock flow for VerifyMe Admin Portal design.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                step >= n ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>

        {error && <p className="text-sm text-destructive mb-3">{error}</p>}

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization name *</Label>
              <Input id="org-name" value={form.organizationName} onChange={(e) => setField("organizationName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legal">Legal name *</Label>
              <Input id="legal" value={form.legalName} onChange={(e) => setField("legalName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Organization code *</Label>
              <Input
                id="code"
                className="font-mono uppercase"
                value={form.organizationCode}
                onChange={(e) => setField("organizationCode", e.target.value.toUpperCase())}
                placeholder="e.g. ACME"
              />
              <p className="text-[11px] text-muted-foreground">
                Primary <span className="font-mono">client_id</span> will look like{" "}
                <code className="bg-muted px-1 rounded text-[11px] font-mono">ACME_CALLCENTER_SANDBOX_001</code> once issued.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Organization type</Label>
                <Select value={form.organizationType} onValueChange={(v) => setField("organizationType", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {organizationTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Select value={form.industry} onValueChange={(v) => setField("industry", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Company size</Label>
              <Select value={form.companySize} onValueChange={(v) => setField("companySize", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {companySizes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={form.country} onValueChange={(v) => setField("country", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={form.timezone} onValueChange={(v) => setField("timezone", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={form.currency} onValueChange={(v) => setField("currency", v as NewOrganizationInput["currency"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Full name *</Label>
              <Input id="admin-name" value={form.adminFullName} onChange={(e) => setField("adminFullName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email *</Label>
              <Input id="admin-email" type="email" value={form.adminEmail} onChange={(e) => setField("adminEmail", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input readOnly value="Owner" className="bg-muted/50" />
              <p className="text-[12px] text-muted-foreground">Initial Organization Admin Portal access defaults to Owner.</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={form.plan} onValueChange={(v) => setField("plan", v as NewOrganizationInput["plan"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Starter">Starter</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="init-credit">Initial credit allocation ($)</Label>
                <Input
                  id="init-credit"
                  type="number"
                  min={0}
                  step={1}
                  value={form.initialCredits}
                  onChange={(e) => setField("initialCredits", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topup">Optional top-up credits ($)</Label>
                <Input
                  id="topup"
                  type="number"
                  min={0}
                  step={1}
                  value={form.topUpCredits}
                  onChange={(e) => setField("topUpCredits", Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price per verification attempt ($)</Label>
              <Input
                id="price"
                type="number"
                min={0.01}
                step={0.01}
                value={form.pricePerVerification}
                onChange={(e) => setField("pricePerVerification", Number(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Email OTP billing</p>
                <p className="text-[12px] text-muted-foreground">Configurable per organization</p>
              </div>
              <Switch checked={form.emailOtpBillingEnabled} onCheckedChange={(v) => setField("emailOtpBillingEnabled", v)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seats">Seat limit (admin users)</Label>
              <Input
                id="seats"
                type="number"
                min={1}
                value={form.seatLimit}
                onChange={(e) => setField("seatLimit", Number(e.target.value))}
              />
            </div>
            <div className="rounded-md border border-blue-200 bg-blue-50/50 p-3 text-[12px] text-muted-foreground">
              After creation (mock): lifecycle <strong className="text-foreground">pending_setup</strong>, integration{" "}
              <strong className="text-foreground">not_configured</strong>. The organization admin completes remaining setup
              in the Organization Admin Portal.
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <div className="flex flex-1 justify-end gap-2">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={goBack} disabled={submitting}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button type="button" onClick={goNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button type="button" onClick={finish} disabled={submitting}>
                {submitting ? "Creating…" : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Create organization
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
