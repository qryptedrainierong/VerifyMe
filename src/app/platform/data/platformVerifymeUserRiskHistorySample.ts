/**
 * Mock-only risk trajectory for VerifyMe Admin “Risk History” (no backend).
 * Signals are aggregated labels only — never other organizations’ identifiers.
 */

export type VerifymeRiskHistoryEntry = {
  id: string;
  /** ISO 8601 UTC */
  timestamp: string;
  previousLevel: string;
  newLevel: string;
  /** Operator-safe contributing factors summary */
  contributingSignalsSummary: string;
};

const histories: Record<string, VerifymeRiskHistoryEntry[]> = {
  vm07f9a2: [
    {
      id: "risk-vm07-003",
      timestamp: "2024-04-12T17:58:00Z",
      previousLevel: "Elevated",
      newLevel: "Elevated",
      contributingSignalsSummary: "Elevated verification velocity; linked org count unchanged.",
    },
    {
      id: "risk-vm07-002",
      timestamp: "2024-04-11T09:22:00Z",
      previousLevel: "Moderate",
      newLevel: "Elevated",
      contributingSignalsSummary:
        "Device binding refreshed; aggregated session anomalies across linked workspaces (no tenant names surfaced).",
    },
    {
      id: "risk-vm07-001",
      timestamp: "2024-04-08T14:05:00Z",
      previousLevel: "Low",
      newLevel: "Moderate",
      contributingSignalsSummary: "New organization link established; onboarding pattern differs from baseline.",
    },
  ],
  vm91b3c4: [
    {
      id: "risk-vm91-002",
      timestamp: "2024-04-12T13:42:00Z",
      previousLevel: "Elevated",
      newLevel: "High",
      contributingSignalsSummary: "Identity consistency review flagged; recovery attempts within policy window.",
    },
    {
      id: "risk-vm91-001",
      timestamp: "2024-04-10T11:30:00Z",
      previousLevel: "Moderate",
      newLevel: "Elevated",
      contributingSignalsSummary: "Cross-link activity increased; device posture stable.",
    },
  ],
};

export function getRiskHistoryForVerifymeId(verifymeId: string): VerifymeRiskHistoryEntry[] {
  return [...(histories[verifymeId] ?? [])].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
}
