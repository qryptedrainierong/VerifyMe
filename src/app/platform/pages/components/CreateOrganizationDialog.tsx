import { useMemo, useState } from "react";
import { City, Country, State } from "country-state-city";
import { Check, ChevronsUpDown } from "lucide-react";
import { getCountryCallingCode, isSupportedCountry, parsePhoneNumberFromString } from "libphonenumber-js";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../shared/components/ui/dialog";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Textarea } from "../../../shared/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../../../shared/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "../../../shared/components/ui/command";
import { cn } from "../../../shared/components/ui/utils";

export type OrganizationStatus = "active" | "trial" | "suspended";

export type NewOrganizationInput = {
  legalName: string;
  displayName: string;
  orgType: string;
  industry: string;
  companySize: string;
  country: string;
  supportPhoneCountryCode: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  supportEmail: string;
  supportPhone: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhoneCountryCode: string;
  adminPhone: string;
  adminTitle: string;
  plan: "Starter" | "Professional" | "Enterprise";
  trialStartDate: string;
  status: OrganizationStatus;
  notes: string;
  internalTags: string;
  complianceFlags: string;
};

type CreateOrganizationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingOrganizationNames: string[];
  onSubmit: (input: NewOrganizationInput) => Promise<void> | void;
};

const defaultForm: NewOrganizationInput = {
  legalName: "",
  displayName: "",
  orgType: "",
  industry: "",
  companySize: "",
  country: "",
  supportPhoneCountryCode: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  supportEmail: "",
  supportPhone: "",
  adminFirstName: "",
  adminLastName: "",
  adminEmail: "",
  adminPhoneCountryCode: "",
  adminPhone: "",
  adminTitle: "",
  plan: "Starter",
  trialStartDate: "",
  status: "trial",
  notes: "",
  internalTags: "",
  complianceFlags: "",
};

const requiredFields: Array<keyof NewOrganizationInput> = [
  "legalName",
  "displayName",
  "orgType",
  "industry",
  "companySize",
  "country",
  "addressLine1",
  "city",
  "postalCode",
  "supportEmail",
  "adminFirstName",
  "adminLastName",
  "adminEmail",
  "adminPhone",
  "adminTitle",
  "plan",
  "trialStartDate",
  "status",
];

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

function isEmailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getPhoneExampleByCode(countryCode: string) {
  const examples: Record<string, string> = {
    "+1": "202 555 0123",
    "+44": "7400 123456",
    "+61": "412 345 678",
    "+63": "912 345 6789",
    "+65": "8123 4567",
    "+60": "12 345 6789",
    "+91": "91234 56789",
    "+81": "90 1234 5678",
  };
  return examples[countryCode] ?? "123 456 7890";
}

function isPhoneValidForCountryCode(value: string, countryCode: string) {
  if (!value.trim() || !countryCode.trim()) {
    return false;
  }

  const normalizedLocal = value.replace(/[^\d]/g, "");
  const normalizedCode = countryCode.startsWith("+") ? countryCode : `+${countryCode}`;
  const parsedPhone = parsePhoneNumberFromString(`${normalizedCode}${normalizedLocal}`);
  const phoneType = parsedPhone?.getType();
  const isAllowedType = !phoneType
    || phoneType === "MOBILE"
    || phoneType === "FIXED_LINE"
    || phoneType === "FIXED_LINE_OR_MOBILE";

  return Boolean(
    parsedPhone?.isValid()
      && `+${parsedPhone.countryCallingCode}` === normalizedCode
      && isAllowedType,
  );
}

const organizationTypes = [
  "Startup",
  "SME",
  "Enterprise",
  "Government",
  "Education",
  "Non-profit",
  "Sandbox",
  "Other",
] as const;

const industries = [
  "Financial Services",
  "BPO/Call Center",
  "Telecommunications",
  "Healthcare",
  "E-Commerce/Marketplace",
  "Technology/IT Services",
  "Logistics/Transportation",
  "Travel/Hospitality",
  "Retail/Wholesale",
  "Education",
  "Government",
  "Media/Entertainment",
  "Professional Services",
  "Real Estate",
  "Energy/Utilities",
  "Other",
] as const;

const companySizes = [
  "1-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5001+",
] as const;

const adminRoles = [
  "CTO",
  "CIO",
  "IT Manager",
  "Security Manager",
  "Operations Manager",
  "Compliance Officer",
  "Other",
] as const;

type CountryStateCityConfig = {
  isoCode: string;
  name: string;
  phoneCode: string;
};

type GeoNameState = {
  name: string;
  adminCode1: string;
};

type LocalCity = {
  id: number;
  name: string;
};

type SearchableOption = {
  value: string;
  label: string;
};

// Some jurisdictions are city-states or do not use first-level states/provinces
// in the same way; for onboarding we skip state selection for these.
const countriesWithoutStateSelection = new Set([
  "SG", // Singapore
  "HK", // Hong Kong
  "MO", // Macao
  "VA", // Vatican City
]);

// For city-state jurisdictions, city should match the country/jurisdiction name.
const countriesWithLockedCity = new Set([
  "SG", // Singapore
  "HK", // Hong Kong
  "MO", // Macao
  "VA", // Vatican City
]);

const fallbackCountries: CountryStateCityConfig[] = Country.getAllCountries()
  .map((country) => ({
    isoCode: country.isoCode,
    name: country.name,
    phoneCode: isSupportedCountry(country.isoCode as Parameters<typeof getCountryCallingCode>[0])
      ? `+${getCountryCallingCode(country.isoCode as Parameters<typeof getCountryCallingCode>[0])}`
      : `+${country.phonecode}`,
  }))
  .filter((country) => country.isoCode.length === 2 && country.name.trim() && country.phoneCode !== "+")
  .sort((a, b) => a.name.localeCompare(b.name));

function getStatesForCountry(countryIso: string): GeoNameState[] {
  if (!countryIso || countriesWithoutStateSelection.has(countryIso)) {
    return [];
  }
  return State.getStatesOfCountry(countryIso)
    .filter((state) => state.name.trim() && state.isoCode.trim())
    .map((state) => ({ name: state.name, adminCode1: state.isoCode }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function getCitiesForCountry(countryIso: string, stateCode?: string): LocalCity[] {
  if (!countryIso) {
    return [];
  }
  const cities = (stateCode
    ? City.getCitiesOfState(countryIso, stateCode)
    : City.getCitiesOfCountry(countryIso)) ?? [];
  const unique = new Map<string, LocalCity>();
  for (const city of cities) {
    if (!city.name.trim()) {
      continue;
    }
    const key = city.name.trim().toLowerCase();
    if (!unique.has(key)) {
      unique.set(key, { id: unique.size + 1, name: city.name });
    }
  }
  return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name));
}

type SearchableSelectProps = {
  id: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  popoverClassName?: string;
};

function SearchableSelect({
  id,
  placeholder,
  searchPlaceholder,
  emptyText,
  options,
  value,
  onChange,
  disabled = false,
  popoverClassName,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-[var(--radix-popover-trigger-width)] max-h-[min(18rem,var(--radix-popover-content-available-height))] overflow-hidden p-0",
          popoverClassName,
        )}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList
            className="max-h-64 overflow-y-auto overscroll-contain"
            onWheelCapture={(event) => event.stopPropagation()}
          >
            <CommandEmpty>{emptyText}</CommandEmpty>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={`${option.label} ${option.value}`}
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0",
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function CreateOrganizationDialog({
  open,
  onOpenChange,
  existingOrganizationNames,
  onSubmit,
}: CreateOrganizationDialogProps) {
  const [form, setForm] = useState<NewOrganizationInput>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof NewOrganizationInput, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCountryIso, setSelectedCountryIso] = useState<string>("");
  const countries = fallbackCountries;
  const [stateOptions, setStateOptions] = useState<GeoNameState[]>([]);
  const [cityOptions, setCityOptions] = useState<LocalCity[]>([]);
  const [orgTypeSelection, setOrgTypeSelection] = useState<string>("");
  const [industrySelection, setIndustrySelection] = useState<string>("");
  const [adminRoleSelection, setAdminRoleSelection] = useState<string>("");

  const existingNames = useMemo(
    () => new Set(existingOrganizationNames.map(normalizeName)),
    [existingOrganizationNames],
  );

  const setField = <K extends keyof NewOrganizationInput>(key: K, value: NewOrganizationInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setFormError(null);
  };

  const hasStateOptions = stateOptions.length > 0;
  const hasLockedCity = Boolean(selectedCountryIso && countriesWithLockedCity.has(selectedCountryIso));
  const uniquePhoneCodes = useMemo(
    () => Array.from(new Set(countries.map((country) => country.phoneCode))).sort((a, b) => a.localeCompare(b)),
    [countries],
  );
  const phoneCodeOptions = useMemo<SearchableOption[]>(
    () => uniquePhoneCodes.map((code) => ({ value: code, label: code })),
    [uniquePhoneCodes],
  );
  const countryOptions = useMemo<SearchableOption[]>(
    () => countries.map((country) => ({ value: country.isoCode, label: country.name })),
    [countries],
  );
  const stateSelectOptions = useMemo<SearchableOption[]>(
    () => stateOptions.map((state) => ({ value: state.name, label: state.name })),
    [stateOptions],
  );
  const citiesForState = cityOptions;
  const citySelectOptions = useMemo<SearchableOption[]>(
    () => citiesForState.map((city) => ({ value: city.name, label: city.name })),
    [citiesForState],
  );

  const resetForm = () => {
    setForm(defaultForm);
    setSelectedCountryIso("");
    setStateOptions([]);
    setCityOptions([]);
    setOrgTypeSelection("");
    setIndustrySelection("");
    setAdminRoleSelection("");
    setErrors({});
    setFormError(null);
    setIsSubmitting(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) {
      return;
    }
    onOpenChange(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof NewOrganizationInput, string>> = {};
    for (const key of requiredFields) {
      if (!String(form[key]).trim()) {
        nextErrors[key] = "This field is required.";
      }
    }
    if (hasStateOptions && !form.state.trim()) {
      nextErrors.state = "This field is required.";
    }

    if (form.supportEmail && !isEmailValid(form.supportEmail)) {
      nextErrors.supportEmail = "Enter a valid support email.";
    }

    if (form.adminEmail && !isEmailValid(form.adminEmail)) {
      nextErrors.adminEmail = "Enter a valid admin email.";
    }

    if (form.adminPhone && !isPhoneValidForCountryCode(form.adminPhone, form.adminPhoneCountryCode)) {
      nextErrors.adminPhone = "Enter a valid phone number for the selected country code.";
    }

    if (form.supportPhone && !isPhoneValidForCountryCode(form.supportPhone, form.supportPhoneCountryCode)) {
      nextErrors.supportPhone = "Enter a valid phone number for the selected country code.";
    }

    if (form.supportPhone && !form.supportPhoneCountryCode) {
      nextErrors.supportPhone = "Select a country code.";
    }

    if (form.adminPhone && !form.adminPhoneCountryCode) {
      nextErrors.adminPhone = "Select a country code.";
    }

    if (existingNames.has(normalizeName(form.displayName))) {
      nextErrors.displayName = "An organization with this display name already exists.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      setFormError("Please fix the highlighted fields before continuing.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await onSubmit({
        ...form,
        legalName: form.legalName.trim(),
        displayName: form.displayName.trim(),
        orgType: form.orgType.trim(),
        industry: form.industry.trim(),
        companySize: form.companySize.trim(),
        country: form.country.trim(),
        supportPhoneCountryCode: form.supportPhoneCountryCode.trim(),
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        postalCode: form.postalCode.trim(),
        supportEmail: form.supportEmail.trim(),
        supportPhone: form.supportPhone.trim(),
        adminFirstName: form.adminFirstName.trim(),
        adminLastName: form.adminLastName.trim(),
        adminEmail: form.adminEmail.trim(),
        adminPhoneCountryCode: form.adminPhoneCountryCode.trim(),
        adminPhone: form.adminPhone.trim(),
        adminTitle: form.adminTitle.trim(),
        notes: form.notes.trim(),
        internalTags: form.internalTags.trim(),
        complianceFlags: form.complianceFlags.trim(),
      });
      handleOpenChange(false);
    } catch (error) {
      const fallbackMessage = "Could not create organization. Please try again.";
      setFormError(error instanceof Error ? error.message : fallbackMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCountryChange = (country: string) => {
    const selectedCountry = countries.find((entry) => entry.isoCode === country);
    const defaultCode = selectedCountry?.phoneCode ?? "";
    const resolvedStates = getStatesForCountry(country);
    const firstState = resolvedStates[0];
    const nextStateCode = firstState?.adminCode1 ?? "";
    const nextCities = countriesWithLockedCity.has(country)
      ? [{ id: 1, name: selectedCountry?.name ?? "" }].filter((city) => city.name)
      : getCitiesForCountry(country, nextStateCode || undefined);

    setSelectedCountryIso(country);
    setStateOptions(resolvedStates);
    setField("country", selectedCountry?.name ?? "");
    setField(
      "state",
      countriesWithoutStateSelection.has(country) ? (selectedCountry?.name ?? "") : (firstState?.name ?? ""),
    );
    setCityOptions(nextCities);
    setField("city", countriesWithLockedCity.has(country) ? (selectedCountry?.name ?? "") : (nextCities[0]?.name ?? ""));
    setField("supportPhoneCountryCode", defaultCode);
    setField("adminPhoneCountryCode", defaultCode);
  };

  const handleStateChange = (state: string) => {
    const matchedState = stateOptions.find((entry) => entry.name === state);
    const nextStateCode = matchedState?.adminCode1 ?? "";
    const nextCities = getCitiesForCountry(selectedCountryIso, nextStateCode || undefined);
    setField("state", state);
    setCityOptions(nextCities);
    setField("city", nextCities[0]?.name ?? "");
  };

  const handleAdminRoleChange = (value: string) => {
    setAdminRoleSelection(value);
    if (value !== "Other") {
      setField("adminTitle", value);
    } else {
      setField("adminTitle", "");
    }
  };

  const handleOrganizationTypeChange = (value: string) => {
    setOrgTypeSelection(value);
    if (value !== "Other") {
      setField("orgType", value);
    } else {
      setField("orgType", "");
    }
  };

  const handleIndustryChange = (value: string) => {
    setIndustrySelection(value);
    if (value !== "Other") {
      setField("industry", value);
    } else {
      setField("industry", "");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Complete onboarding details to create a new enterprise account in the platform.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Organization Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="legalName">Legal Name *</Label>
                <Input id="legalName" value={form.legalName} onChange={(e) => setField("legalName", e.target.value)} />
                {errors.legalName && <p className="text-xs text-destructive">{errors.legalName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name *</Label>
                <Input id="displayName" value={form.displayName} onChange={(e) => setField("displayName", e.target.value)} />
                {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgType">Organization Type *</Label>
                <div className="space-y-2">
                <Select value={orgTypeSelection || undefined} onValueChange={handleOrganizationTypeChange}>
                  <SelectTrigger id="orgType">
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizationTypes.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {orgTypeSelection === "Other" && (
                  <Input
                    placeholder="Enter custom organization type"
                    value={form.orgType}
                    onChange={(e) => setField("orgType", e.target.value)}
                  />
                )}
                </div>
                {errors.orgType && <p className="text-xs text-destructive">{errors.orgType}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <div className="space-y-2">
                <Select value={industrySelection || undefined} onValueChange={handleIndustryChange}>
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {industrySelection === "Other" && (
                  <Input
                    placeholder="Enter custom industry"
                    value={form.industry}
                    onChange={(e) => setField("industry", e.target.value)}
                  />
                )}
                </div>
                {errors.industry && <p className="text-xs text-destructive">{errors.industry}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size *</Label>
                <Select value={form.companySize || undefined} onValueChange={(value) => setField("companySize", value)}>
                  <SelectTrigger id="companySize">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option} employees
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.companySize && <p className="text-xs text-destructive">{errors.companySize}</p>}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Contact and Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <SearchableSelect
                  id="country"
                  value={selectedCountryIso}
                  onChange={handleCountryChange}
                  options={countryOptions}
                  placeholder="Select country"
                  searchPlaceholder="Search country..."
                  emptyText="No country found."
                  popoverClassName="max-h-72 overflow-hidden"
                />
                {errors.country && <p className="text-xs text-destructive">{errors.country}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province *</Label>
                {hasStateOptions ? (
                  <SearchableSelect
                    id="state"
                    value={form.state || ""}
                    onChange={handleStateChange}
                    options={stateSelectOptions}
                    placeholder={form.country
                      ? "Select state/province"
                      : "Select country first"}
                    searchPlaceholder="Search state/province..."
                    emptyText="No state/province found."
                    disabled={!form.country}
                    popoverClassName="max-h-72 overflow-hidden"
                  />
                ) : (
                  <Input id="state" value={form.country || ""} disabled />
                )}
                {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressLine1">Address Line 1 *</Label>
                <Input id="addressLine1" value={form.addressLine1} onChange={(e) => setField("addressLine1", e.target.value)} />
                {errors.addressLine1 && <p className="text-xs text-destructive">{errors.addressLine1}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input id="addressLine2" value={form.addressLine2} onChange={(e) => setField("addressLine2", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                {hasLockedCity ? (
                  <Input id="city" value={form.city || form.country || ""} disabled />
                ) : (
                  <SearchableSelect
                    id="city"
                    value={form.city || ""}
                    onChange={(value) => setField("city", value)}
                    options={citySelectOptions}
                    placeholder={form.country
                      ? hasStateOptions
                        ? "Select city"
                        : "Select city/municipality"
                      : "Select country first"}
                    searchPlaceholder="Search city..."
                    emptyText="No city found."
                    disabled={!form.country || (hasStateOptions && !form.state)}
                    popoverClassName="max-h-72 overflow-hidden"
                  />
                )}
                {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input id="postalCode" value={form.postalCode} onChange={(e) => setField("postalCode", e.target.value)} />
                {errors.postalCode && <p className="text-xs text-destructive">{errors.postalCode}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email *</Label>
                <Input id="supportEmail" type="email" value={form.supportEmail} onChange={(e) => setField("supportEmail", e.target.value)} />
                {errors.supportEmail && <p className="text-xs text-destructive">{errors.supportEmail}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportPhone">Support Phone</Label>
                <div className="flex gap-2">
                  <div className="w-[140px]">
                    <SearchableSelect
                      id="supportPhoneCountryCode"
                      value={form.supportPhoneCountryCode || ""}
                      onChange={(value) => setField("supportPhoneCountryCode", value)}
                      options={phoneCodeOptions}
                      placeholder="Code"
                      searchPlaceholder="Search code..."
                      emptyText="No code found."
                      popoverClassName="max-h-72 overflow-hidden"
                    />
                  </div>
                  <Input
                    id="supportPhone"
                    value={form.supportPhone}
                    onChange={(e) => setField("supportPhone", e.target.value)}
                    placeholder={getPhoneExampleByCode(form.supportPhoneCountryCode || "+1")}
                  />
                </div>
                {errors.supportPhone && <p className="text-xs text-destructive">{errors.supportPhone}</p>}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Admin Owner Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminFirstName">Admin First Name *</Label>
                <Input id="adminFirstName" value={form.adminFirstName} onChange={(e) => setField("adminFirstName", e.target.value)} />
                {errors.adminFirstName && <p className="text-xs text-destructive">{errors.adminFirstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminLastName">Admin Last Name *</Label>
                <Input id="adminLastName" value={form.adminLastName} onChange={(e) => setField("adminLastName", e.target.value)} />
                {errors.adminLastName && <p className="text-xs text-destructive">{errors.adminLastName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email *</Label>
                <Input id="adminEmail" type="email" value={form.adminEmail} onChange={(e) => setField("adminEmail", e.target.value)} />
                {errors.adminEmail && <p className="text-xs text-destructive">{errors.adminEmail}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminPhone">Admin Phone *</Label>
                <div className="flex gap-2">
                  <div className="w-[140px]">
                    <SearchableSelect
                      id="adminPhoneCountryCode"
                      value={form.adminPhoneCountryCode || ""}
                      onChange={(value) => setField("adminPhoneCountryCode", value)}
                      options={phoneCodeOptions}
                      placeholder="Code"
                      searchPlaceholder="Search code..."
                      emptyText="No code found."
                      popoverClassName="max-h-72 overflow-hidden"
                    />
                  </div>
                  <Input
                    id="adminPhone"
                    value={form.adminPhone}
                    onChange={(e) => setField("adminPhone", e.target.value)}
                    placeholder={getPhoneExampleByCode(form.adminPhoneCountryCode || "+1")}
                  />
                </div>
                {errors.adminPhone && <p className="text-xs text-destructive">{errors.adminPhone}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="adminTitle">Admin Role/Title *</Label>
                <div className="space-y-2">
                  <Select value={adminRoleSelection || undefined} onValueChange={handleAdminRoleChange}>
                    <SelectTrigger id="adminTitle">
                      <SelectValue placeholder="Select admin role" />
                    </SelectTrigger>
                    <SelectContent>
                      {adminRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {adminRoleSelection === "Other" && (
                    <Input
                      placeholder="Enter custom admin role/title"
                      value={form.adminTitle}
                      onChange={(e) => setField("adminTitle", e.target.value)}
                    />
                  )}
                </div>
                {errors.adminTitle && <p className="text-xs text-destructive">{errors.adminTitle}</p>}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Plan and Lifecycle Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Subscription Tier *</Label>
                <Select value={form.plan} onValueChange={(value: NewOrganizationInput["plan"]) => setField("plan", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Starter">Starter</SelectItem>
                    <SelectItem value="Professional">Professional</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                {errors.plan && <p className="text-xs text-destructive">{errors.plan}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="trialStartDate">Trial/Start Date *</Label>
                <Input id="trialStartDate" type="date" value={form.trialStartDate} onChange={(e) => setField("trialStartDate", e.target.value)} />
                {errors.trialStartDate && <p className="text-xs text-destructive">{errors.trialStartDate}</p>}
              </div>
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select value={form.status} onValueChange={(value: OrganizationStatus) => setField("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-xs text-destructive">{errors.status}</p>}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Operational Details (Optional)</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="internalTags">Internal Tags</Label>
                <Input
                  id="internalTags"
                  placeholder="finance, high-priority, region-apac"
                  value={form.internalTags}
                  onChange={(e) => setField("internalTags", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="complianceFlags">Compliance Flags</Label>
                <Input
                  id="complianceFlags"
                  placeholder="SOC2, ISO27001, GDPR"
                  value={form.complianceFlags}
                  onChange={(e) => setField("complianceFlags", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  rows={4}
                  placeholder="Any internal onboarding notes..."
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                />
              </div>
            </div>
          </section>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating Organization..." : "Create Organization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
