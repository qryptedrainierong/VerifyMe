import { CreditCard, Download, AlertCircle } from "lucide-react";
import { Card } from "../../shared/components/ui/card";
import { Button } from "../../shared/components/ui/button";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { DataTable } from "../../shared/components/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/components/ui/tabs";
import { Progress } from "../../shared/components/ui/progress";
import {
  enterpriseCreditRemaining,
  enterpriseCreditUtilizationPct,
  enterpriseInvoices,
  enterpriseOrganization,
  enterpriseUsageLimit,
  enterpriseUsagePct,
  enterpriseUsageSpend,
} from "../data/enterpriseSample";

export function EnterpriseBilling() {
  const invoices = enterpriseInvoices;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-[24px] font-semibold text-foreground">Billing</h2>
        <p className="text-[15px] text-muted-foreground mt-1">
          Plan, invoices or billing history, credit purchases, top-ups, and payment-related settings
        </p>
      </div>

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
            <p className="text-[13px] text-muted-foreground mb-1">Monthly Cost</p>
            <p className="text-[24px] font-semibold text-foreground">{formatCurrency(enterpriseOrganization.creditBalance)}</p>
            <p className="text-[13px] text-muted-foreground mt-1">Included credit</p>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Verification Spend</p>
            <p className="text-[24px] font-semibold text-foreground">{formatCurrency(enterpriseUsageSpend)}</p>
            <p className="text-[13px] text-muted-foreground mt-1">
              {enterpriseOrganization.usage.toLocaleString()} calls this period
            </p>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Credit Remaining</p>
            <p className="text-[24px] font-semibold text-foreground">{formatCurrency(enterpriseCreditRemaining)}</p>
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
                render: (row) => <StatusBadge status={row.status as any} label="Paid" />,
              },
              {
                key: "download",
                label: "",
                render: () => (
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                ),
              },
            ]}
            data={invoices}
          />
        </TabsContent>

        <TabsContent value="usage" className="mt-6">
          <Card className="p-6 shadow-sm">
            <h3 className="text-[16px] font-semibold text-foreground mb-4">Current Billing Period Usage</h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] text-foreground">Identity verification attempts</span>
                  <span className="text-[14px] font-medium">
                    {enterpriseOrganization.usage.toLocaleString()} / {enterpriseUsageLimit.toLocaleString()}
                  </span>
                </div>
                <Progress value={Math.min(enterpriseUsagePct, 100)} className="h-2" />
                <p className="text-[12px] text-muted-foreground mt-1.5">{enterpriseUsagePct.toFixed(1)}% of call allowance used</p>
              </div>
              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Period</span>
                  <span className="text-[13px] font-medium text-foreground">Apr 1 - Apr 30, 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Avg daily usage</span>
                  <span className="text-[13px] font-medium text-foreground">6,900 calls/day</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Remaining</span>
                  <span className="text-[13px] font-medium text-foreground">
                    {Math.max(enterpriseUsageLimit - enterpriseOrganization.usage, 0).toLocaleString()} calls
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
    </div>
  );
}
