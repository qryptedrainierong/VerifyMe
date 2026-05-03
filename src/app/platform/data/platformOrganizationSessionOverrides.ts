import type { PlatformOrganization } from "./platformOrganizationsSample";
import { getSampleOrganizationById } from "./platformOrganizationsSample";

/** UI-only: orgs created in-session until reload; merged with static sample in detail view. */
const overridesById = new Map<string, PlatformOrganization>();

export function registerPlatformOrganizationOverride(organization: PlatformOrganization) {
  overridesById.set(organization.id, organization);
}

export function getPlatformOrganizationForDetail(id: string | undefined): PlatformOrganization | undefined {
  if (!id) {
    return undefined;
  }
  return overridesById.get(id) ?? getSampleOrganizationById(id);
}
