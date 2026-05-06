/**
 * Mock-only conflict lifecycle for Identity Link detail “Conflict History” (no backend).
 */

export type IdentityLinkConflictHistoryEntryKind = "detected" | "review_opened" | "reviewed" | "resolved";

export type IdentityLinkConflictHistoryEntry = {
  id: string;
  kind: IdentityLinkConflictHistoryEntryKind;
  timestamp: string;
  summary: string;
  reviewer?: string;
  resolutionNotes?: string;
};

const byLinkId: Record<string, IdentityLinkConflictHistoryEntry[]> = {
  "IL-1003": [
    {
      id: "ch-IL1003-r3",
      kind: "resolved",
      timestamp: "2024-04-12T14:35:00Z",
      summary: "Conflict cleared after operator verification.",
      reviewer: "VerifyMe platform",
      resolutionNotes: "Name variance explained by lawful name format; conflict closed.",
    },
    {
      id: "ch-IL1003-r2",
      kind: "reviewed",
      timestamp: "2024-04-12T14:22:00Z",
      summary: "Review notes captured.",
      reviewer: "VerifyMe platform",
    },
    {
      id: "ch-IL1003-r1",
      kind: "detected",
      timestamp: "2024-04-11T08:55:00Z",
      summary: "Automated check flagged inconsistent display name vs issuer record.",
    },
  ],
  "IL-1002": [
    {
      id: "ch-IL1002-1",
      kind: "detected",
      timestamp: "2024-04-09T16:40:00Z",
      summary: "Soft signal: referral source mismatch (no credential material).",
    },
  ],
};

export function getConflictHistoryForIdentityLinkId(linkId: string): IdentityLinkConflictHistoryEntry[] {
  return [...(byLinkId[linkId] ?? [])].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
}
