import { CreditCard, Download, AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Card } from "../../shared/components/ui/card";
import { Button } from "../../shared/components/ui/button";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { DataTable } from "../../shared/components/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/components/ui/tabs";
import { Progress } from "../../shared/components/ui/progress";
import { Switch } from "../../shared/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../shared/components/ui/dialog";
import {
  enterpriseCreditRemaining,
  enterpriseCreditUtilizationPct,
  enterpriseInvoices,
  enterpriseOrganization,
  enterpriseUsageLimit,
  enterpriseUsagePct,
  enterpriseUsageSpend,
  type EnterpriseInvoiceRow,
} from "../data/enterpriseSample";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";

function parseInvoiceDate(dateStr: string): number {
  const t = Date.parse(dateStr);
  return Number.isNaN(t) ? 0 : t;
}

function invoiceStatusBadge(row: EnterpriseInvoiceRow) {
  if (row.refundRequested) {
    return <StatusBadge status="warning" label="Refund requested" />;
  }
  return <StatusBadge status={row.status as any} label={row.status === "success" ? "Paid" : undefined} />;
}

export function EnterpriseBilling() {
  const [requiresActionOnly, setRequiresActionOnly] = useState(true);
  const [invoiceDetail, setInvoiceDetail] = useState<EnterpriseInvoiceRow | null>(null);
  const [confirming, setConfirming] = useState<"reminder" | "refund" | null>(null);

  const sortedInvoices = useMemo(() => {
    const copy = [...enterpriseInvoices];
    copy.sort((a, b) => {
      if (a.actionRequired !== b.actionRequired) return a.actionRequired ? -1 : 1;
      return parseInvoiceDate(b.date) - parseInvoiceDate(a.date);
    });
    return copy;
  }, []);

  const invoices = useMemo(
    () => sortedInvoices.filter((inv) => (requiresActionOnly ? inv.actionRequired : true)),
    [sortedInvoices, requiresActionOnly],
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <>
    <PortalPageFrame
      title="Billing"
      description="Plan, invoices or billing history, credit purchases, top-ups, and payment-related settings."
      bodyClassName="max-w-7xl space-y-6"
    >
      {/* Current Plan */}
      <Card className="p-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-[18px] font-semibold text-foreground mb-1">{enterpriseOrganization.plan} Plan</h3>
            <p className="text-[14px] text-muted-foreground">
              Your current VerifyMe plan and included credits
            </p>
          </div>
          <StatusBadge status="active" />
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Plan</p>
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">{formatCurrency(enterpriseOrganization.creditBalance)}</p>
            <p className="text-[13px] text-muted-foreground mt-1">Included credit</p>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Billable verification spend</p>
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">{formatCurrency(enterpriseUsageSpend)}</p>
            <p className="text-[13px] text-muted-foreground mt-1">
              {enterpriseOrganization.usage.toLocaleString()} verification sessions this period
            </p>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Credit Remaining</p>
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">{formatCurrency(enterpriseCreditRemaining)}</p>
            <p className="text-[13px] text-muted-foreground mt-1">{enterpriseCreditUtilizationPct.toFixed(1)}% utilized</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button>Upgrade Plan</Button>
          <Button variant="outline">View Usage</Button>
        </div>
      </Card>

      {/* Payment Method */}
      <Card className="p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-semibold text-foreground">Payment Method</h3>
          <Button variant="outline" size="sm">Update</Button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-[14px] font-medium text-foreground">Visa ending in 4242</p>
            <p className="text-[13px] text-muted-foreground">Expires 12/2025</p>
          </div>
        </div>
      </Card>

      {/* Usage Alert */}
      <Card className="p-4 bg-orange-50 border-orange-200 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-[14px] font-medium text-orange-900">
              Approaching included credit limit
            </p>
            <p className="text-[13px] text-orange-700 mt-1">
              You've spent {formatCurrency(enterpriseUsageSpend)} from {formatCurrency(enterpriseOrganization.creditBalance)} included credit
              ({enterpriseCreditUtilizationPct.toFixed(1)}%). Consider upgrading your plan.
            </p>
          </div>
          <Button variant="outline" size="sm" className="border-orange-300 hover:bg-orange-100">
            Upgrade
          </Button>
        </div>
      </Card>

      {/* Tabs for Invoice History */}
      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoice History</TabsTrigger>
          <TabsTrigger value="usage">Usage Details</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-6">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Requires action</span>
            <Switch checked={requiresActionOnly} onCheckedChange={setRequiresActionOnly} />
            <span className="text-sm text-muted-foreground">All invoices</span>
          </div>
          <DataTable
            title="Recent Invoices"
            columns={[
              { key: "id", label: "Invoice ID" },
              { key: "period", label: "Billing Period" },
              { key: "date", label: "Date" },
              { key: "amount", label: "Amount", render: (row) => formatCurrency(Number(row.amount)) },
              {
                key: "status",
                label: "Status",
                render: (row) => invoiceStatusBadge(row as EnterpriseInvoiceRow),
              },
              { key: "actionRequired", label: "Action required", render: (row) => (row.actionRequired ? "Yes" : "No") },
            ]}
            data={invoices}
            onRowClick={(row) => setInvoiceDetail(row as EnterpriseInvoiceRow)}
          />
        </TabsContent>

        <TabsContent value="usage" className="mt-6">
          <Card className="p-6 shadow-sm">
            <h3 className="text-[16px] font-semibold text-foreground mb-4">Current period usage</h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] text-foreground">Verification sessions</span>
                  <span className="text-[14px] font-medium">
                    {enterpriseOrganization.usage.toLocaleString()} / {enterpriseUsageLimit.toLocaleString()}
                  </span>
                </div>
                <Progress value={Math.min(enterpriseUsagePct, 100)} className="h-2" />
                <p className="text-[12px] text-muted-foreground mt-1.5">{enterpriseUsagePct.toFixed(1)}% of period verification volume</p>
              </div>
              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Period</span>
                  <span className="text-[13px] font-medium text-foreground">Apr 1 - Apr 30, 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Avg daily usage</span>
                  <span className="text-[13px] font-medium text-foreground">6,900 sessions/day</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Remaining</span>
                  <span className="text-[13px] font-medium text-foreground">
                    {Math.max(enterpriseUsageLimit - enterpriseOrganization.usage, 0).toLocaleString()} sessions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Credit remaining</span>
                  <span className="text-[13px] font-medium text-foreground">{formatCurrency(enterpriseCreditRemaining)}</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </PortalPageFrame>
    <Dialog open={invoiceDetail !== null} onOpenChange={(o) => !o && setInvoiceDetail(null)}>
      <DialogContent className="max-w-lg">
        {invoiceDetail && (
          <>
            <DialogHeader>
              <DialogTitle>Invoice detail</DialogTitle>
              <DialogDescription>{invoiceDetail.id} · {invoiceDetail.period}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Summary</p>
                <p>{invoiceDetail.summary ?? "Invoice for verification usage and plan credits."}</p>
              </div>
              <p>
                <span className="text-muted-foreground">Amount:</span>{" "}
                <strong>{formatCurrency(Number(invoiceDetail.amount))}</strong>
              </p>
              <p>
                <span className="text-muted-foreground">Period:</span> {invoiceDetail.period} ·{" "}
                <span className="text-muted-foreground">Issued:</span> {invoiceDetail.date}
              </p>
              <p>Action required: {invoiceDetail.actionRequired ? "Yes" : "No"}</p>
              {invoiceDetail.refundRequested ? (
                <p className="text-xs text-amber-800 dark:text-amber-200">Refund requested — finance workflow in progress.</p>
              ) : null}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!invoiceDetail.actionRequired}
                  onClick={() => setConfirming("reminder")}
                >
                  Send reminder
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!invoiceDetail.actionRequired || invoiceDetail.refundRequested}
                  onClick={() => setConfirming("refund")}
                >
                  Request refund
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Billing controls require confirmation and are recorded in audit logs when live.</p>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setInvoiceDetail(null)}>Close</Button></DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
    <Dialog open={confirming !== null} onOpenChange={(o) => !o && setConfirming(null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{confirming === "reminder" ? "Send payment reminder?" : "Request refund?"}</DialogTitle>
          <DialogDescription className="text-left space-y-2">
            {confirming === "reminder" && (
              <>
                <p>Send a reminder for invoice {invoiceDetail?.id} ({invoiceDetail?.period})?</p>
                <p className="text-xs text-muted-foreground">This action will be recorded in audit logs.</p>
              </>
            )}
            {confirming === "refund" && (
              <>
                <p>Request a refund review for invoice {invoiceDetail?.id}? Finance will follow your organization policy.</p>
                <p className="text-xs text-muted-foreground">This action will be recorded in audit logs.</p>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirming(null)}>
            Cancel
          </Button>
          <Button onClick={() => setConfirming(null)}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
