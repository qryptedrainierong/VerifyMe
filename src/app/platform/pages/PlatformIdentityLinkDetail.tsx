import { ArrowLeft, Link2 } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../../shared/components/ui/button";
import { Card } from "../../shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/components/ui/tabs";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import {
  getIdentityLinkById,
  getIdentityLinksStoreVersion,
  subscribeIdentityLinksListeners,
  updateIdentityLinkRow,
} from "../data/platformIdentityLinksSession";
import type { IdentityLinkConflictStatus, IdentityLinkStatus } from "../data/platformIdentityLinksSample";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../shared/components/ui/alert-dialog";

function linkStatusLabel(s: IdentityLinkStatus): string {
  const map: Record<IdentityLinkStatus, string> = {
    linked: "Linked",
    pending: "Pending",
    suspended: "Suspended",
    disabled: "Disabled",
  };
  return map[s];
}

function conflictLabel(c: IdentityLinkConflictStatus): string {
  const map: Record<IdentityLinkConflictStatus, string> = {
    none: "None",
    pending_review: "Pending review",
    resolved: "Resolved",
  };
  return map[c];
}

export function PlatformIdentityLinkDetail() {
  const navigate = useNavigate();
  const { identityLinkId } = useParams();

  const version = useSyncExternalStore(
    subscribeIdentityLinksListeners,
    getIdentityLinksStoreVersion,
    getIdentityLinksStoreVersion,
  );

  const row = useMemo(() => getIdentityLinkById(identityLinkId), [identityLinkId, version]);

  const [conflictReviewOpen, setConflictReviewOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const formatDate = (iso: string) =>
    new Date(iso + (iso.includes("T") ? "" : "T00:00:00Z")).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
    });

  if (!identityLinkId || !row) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <p className="text-sm text-muted-foreground">Identity link not found.</p>
        <Button variant="outline" onClick={() => navigate("/identity-links")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Identity Links
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card p-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/identity-links")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Identity Links
          </Button>
          {message ? (
            <div className="mb-4 rounded-md border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm text-green-700 dark:text-green-300">
              {message}
            </div>
          ) : null}
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Link2 className="h-7 w-7 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 font-mono text-sm font-medium text-foreground break-all">{row.clientUserId}</p>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {row.organizationName}
              </h1>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{row.organizationId}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <UnifiedBadge variant="status" value={linkStatusLabel(row.linkStatus)} />
                <UnifiedBadge variant="status" value={conflictLabel(row.conflictStatus)} />
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-8">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="flex h-9 w-full min-w-0 flex-wrap gap-1 bg-muted/40 p-1 sm:flex-nowrap">
              <TabsTrigger value="details" className="text-[11px] sm:text-xs">
                Link Details
              </TabsTrigger>
              <TabsTrigger value="user" className="text-[11px] sm:text-xs">
                VerifyMe User
              </TabsTrigger>
              <TabsTrigger value="org" className="text-[11px] sm:text-xs">
                Organization Context
              </TabsTrigger>
              <TabsTrigger value="conflict" className="text-[11px] sm:text-xs">
                Conflict Review / Controls
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6">
              <Card className="border border-border p-6 shadow-sm">
                <p className="text-xs font-medium text-muted-foreground">Summary</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <UnifiedBadge variant="status" value={linkStatusLabel(row.linkStatus)} />
                  <UnifiedBadge variant="status" value={conflictLabel(row.conflictStatus)} />
                </div>
                <dl className="mt-6 space-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Organization</dt>
                    <dd className="font-medium">
                      {row.organizationName}{" "}
                      <span className="font-mono text-xs text-muted-foreground">({row.organizationId})</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">client_user_id</dt>
                    <dd className="font-mono">{row.clientUserId}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Customer</dt>
                    <dd>{row.customerDisplayName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">VerifyMe ID (masked)</dt>
                    <dd className="font-mono">{row.maskedVerifymeId}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Last verified</dt>
                    <dd className="text-muted-foreground">{row.lastVerified ? formatDateTime(row.lastVerified) : "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Created / linked</dt>
                    <dd className="text-muted-foreground">{formatDate(row.createdLinkedAt)}</dd>
                  </div>
                </dl>
              </Card>
            </TabsContent>

            <TabsContent value="user" className="mt-6">
              <Card className="border border-border p-6 shadow-sm">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  This link associates the organization&apos;s <span className="font-mono text-foreground">client_user_id</span>{" "}
                  with the customer&apos;s VerifyMe identity. Only masked VerifyMe identifiers are shown in admin tooling.
                </p>
                <div className="mt-4 rounded-md border border-border bg-muted/20 p-4 text-sm">
                  <p>
                    <span className="text-muted-foreground">Masked VerifyMe ID:</span>{" "}
                    <span className="font-mono font-medium">{row.maskedVerifymeId}</span>
                  </p>
                  <p className="mt-2">
                    <span className="text-muted-foreground">Customer display:</span> {row.customerDisplayName}
                  </p>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Passcodes, OTPs, biometrics, tokens, and recovery material are never displayed.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="org" className="mt-6">
              <Card className="border border-border p-6 shadow-sm">
                <p className="text-sm font-medium text-foreground">{row.organizationName}</p>
                <p className="font-mono text-xs text-muted-foreground">{row.organizationId}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Organization-scoped identity linking for enterprise applications. Deep operational tables for this org are
                  linked from Organization Detail where applicable (design-phase).
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="conflict" className="mt-6">
              <Card className="border border-border p-6 shadow-sm">
                <p className="text-xs font-medium text-muted-foreground">Conflict Review / Controls</p>
                <div className="mt-3">
                  <UnifiedBadge variant="status" value={conflictLabel(row.conflictStatus)} />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Mock workflow only. Production would route through compliance review before resolving conflicts.
                </p>
                {row.conflictStatus === "pending_review" ? (
                  <Button type="button" variant="secondary" className="mt-4" onClick={() => setConflictReviewOpen(true)}>
                    Mark conflict reviewed (mock)…
                  </Button>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">No pending conflict actions for this link.</p>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AlertDialog open={conflictReviewOpen} onOpenChange={setConflictReviewOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Mark conflict reviewed?</AlertDialogTitle>
            <AlertDialogDescription>
              Updates sample data only. This action would be recorded in audit logs in production. Link{" "}
              <span className="font-mono text-foreground">{row.id}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                updateIdentityLinkRow(row.id, { conflictStatus: "resolved" });
                setConflictReviewOpen(false);
                setMessage(`Conflict for ${row.clientUserId} marked reviewed (mock).`);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
