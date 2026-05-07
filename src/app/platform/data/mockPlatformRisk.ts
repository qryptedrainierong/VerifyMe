import type { RiskLevelLabel } from "../../shared/components/RiskSummary";
import type { PlatformEndUserAssociation } from "./platformUsersSample";
import { groupAssociationsByVerifymeUserId, type GroupedEndUser } from "./groupEndUsers";

/** Mock-only platform-wide aggregates (no per-organization disclosure in signals). */
export type MockPlatformUserRiskOverlay = {
  /** Sample window: ID Proof Fail count attributed to this VerifyMe user across the platform. */
  idProofFailCountSample: number;
  /** Synthetic flag for “recent device replacement” in mock risk engine. */
  recentDeviceReplacement?: boolean;
};

/**
 * Optional overrides keyed by public VerifyMe ID. Users not listed use zeros — score still reflects
 * sessions, org count, and device derived from link rows.
 */
export const mockPlatformUserRiskByVerifymeId: Record<string, MockPlatformUserRiskOverlay> = {
  vm07f9a2: { idProofFailCountSample: 1 },
  vm91b3c4: { idProofFailCountSample: 0 },
  vm44d5e6: { idProofFailCountSample: 3 },
  vmaa12bc: { idProofFailCountSample: 0, recentDeviceReplacement: false },
  vmbb34de: { idProofFailCountSample: 0 },
  vmcc56ef: { idProofFailCountSample: 2 },
  vmdd78ab: { idProofFailCountSample: 0 },
  vmee90cd: { idProofFailCountSample: 5 },
  vmff01ef: { idProofFailCountSample: 0 },
  vmconflict1: { idProofFailCountSample: 1 },
  vmzz12xy: { idProofFailCountSample: 4, recentDeviceReplacement: true },
  vmorphan1: { idProofFailCountSample: 0, recentDeviceReplacement: false },
  /** Demo VerifyMe User for Organization Admin “critical” user-risk band (sample only). */
  vmorgdemo99: { idProofFailCountSample: 12, recentDeviceReplacement: true },
};

export function riskLevelFromScore(score: number): RiskLevelLabel {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  if (s <= 24) return "Low";
  if (s <= 49) return "Moderate";
  if (s <= 74) return "High";
  return "Critical";
}

export type PlatformRiskSummaryModel = {
  score: number;
  level: RiskLevelLabel;
  signals: string[];
  recommendation: string;
};

/** Public VerifyMe ID suitable for platform risk engine (no redacted / wildcard forms). */
export function isPublicVerifymeIdForRiskCompute(id: string | null | undefined): id is string {
  if (!id || !id.startsWith("vm")) return false;
  if (id.includes("*")) return false;
  return /^vm[0-9a-z]{2,16}$/i.test(id);
}

/**
 * Platform risk for a VerifyMe user from current sample associations (e.g. identity link list + user detail).
 */
export function computePlatformRiskSummaryForVerifymeId(
  verifymeId: string,
  associations: PlatformEndUserAssociation[],
): PlatformRiskSummaryModel | null {
  const slice = associations.filter((a) => a.verifymeId === verifymeId);
  if (slice.length === 0) return null;
  const group = groupAssociationsByVerifymeUserId(slice)[0];
  return group ? computePlatformRiskSummary(group) : null;
}

/** Organization Admin: level only — no cross-organization factor list. */
export function userRiskLevelForOrgAdmin(
  platformVerifymeId: string | null | undefined,
  associations: PlatformEndUserAssociation[],
): RiskLevelLabel | null {
  if (!platformVerifymeId) return null;
  return computePlatformRiskSummaryForVerifymeId(platformVerifymeId, associations)?.level ?? null;
}

/**
 * Deterministic mock “Platform Risk” for VerifyMe Admin (sample data only).
 * Signals are safe labels — no other organizations named, no raw comparison data.
 */
export function computePlatformRiskSummary(group: GroupedEndUser): PlatformRiskSummaryModel {
  const overlay = mockPlatformUserRiskByVerifymeId[group.verifymeId] ?? { idProofFailCountSample: 0 };
  const signals: string[] = [];
  let score = 8;

  const fails = overlay.idProofFailCountSample;
  if (fails > 0) {
    const add = Math.min(28, fails * 6);
    score += add;
    signals.push(
      fails === 1
        ? "ID Proof Fail outcome observed in sample window (platform aggregate)"
        : `Multiple ID Proof Fail outcomes in sample window (platform aggregate · ${fails})`,
    );
  }

  const totalSessions = group.totalVerificationSessions;
  if (totalSessions >= 4500) {
    score += 14;
    signals.push("High verification session frequency (sample aggregate)");
  } else if (totalSessions >= 2000) {
    score += 8;
    signals.push("Elevated verification session volume");
  } else if (totalSessions > 800) {
    score += 4;
    signals.push("Above-typical verification activity");
  }

  const orgCount = group.memberships.length;
  if (orgCount >= 3) {
    score += 12;
    signals.push("Linked to several organizations (platform scope)");
  } else if (orgCount === 2) {
    score += 6;
    signals.push("Linked to more than one organization");
  }

  const device = group.memberships[0]?.device;
  if (device?.status === "pending_enrollment") {
    score += 18;
    signals.push("Device enrollment incomplete");
  } else if (overlay.recentDeviceReplacement) {
    score += 10;
    signals.push("Recent device replacement indicated");
  } else if (device?.status === "active") {
    score -= 6;
    signals.push("Active device binding healthy");
  }

  if (group.rowStatus === "suspended") {
    score += 16;
    signals.push("Account status: suspended");
  } else if (group.rowStatus === "disabled") {
    score += 12;
    signals.push("Account status: disabled");
  } else if (group.rowStatus === "pending") {
    score += 6;
    signals.push("Account status: pending completion");
  }

  score = Math.max(0, Math.min(100, score));
  const level = riskLevelFromScore(score);

  let recommendation =
    "Continue routine monitoring. Risk indicators are not proof of fraud; use alongside policy and review.";
  if (level === "Moderate") {
    recommendation =
      "Consider light-touch review in VerifyMe Admin if activity spikes further. No automatic action implied.";
  }
  if (level === "High") {
    recommendation =
      "Escalate for operator review. Cross-tenant detail remains restricted to platform operators.";
  }
  if (level === "Critical") {
    recommendation =
      "Priority review recommended for platform operators. Enforcement remains policy-driven — configure separately.";
  }

  return { score, level, signals, recommendation };
}
