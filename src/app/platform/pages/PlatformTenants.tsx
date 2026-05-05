import { Building2, Plus, Download } from "lucide-react";
import { DataTable } from "../../shared/components/DataTable";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import { FilterBar } from "../../shared/components/FilterBar";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";
import { Button } from "../../shared/components/ui/button";
import { Card } from "../../shared/components/ui/card";

export function PlatformTenants() {
  const tenants = [
    {
      id: "ORG-001",
      name: "Acme Corporation",
      domain: "acme.com",
      plan: "Enterprise",
      seats: 245,
      seatsUsed: 238,
      mrr: "$12,450",
      status: "active",
      created: "Jan 15, 2024",
      owner: "john@acme.com",
    },
    {
      id: "ORG-002",
      name: "TechStart Inc.",
      domain: "techstart.io",
      plan: "Professional",
      seats: 100,
      seatsUsed: 89,
      mrr: "$4,450",
      status: "active",
      created: "Feb 3, 2024",
      owner: "sarah@techstart.io",
    },
    {
      id: "ORG-003",
      name: "Global Ventures",
      domain: "globalventures.com",
      plan: "Enterprise",
      seats: 500,
      seatsUsed: 512,
      mrr: "$25,600",
      status: "warning",
      created: "Dec 8, 2023",
      owner: "admin@globalventures.com",
    },
    {
      id: "ORG-004",
      name: "Innovation Labs",
      domain: "innovationlabs.co",
      plan: "Starter",
      seats: 25,
      seatsUsed: 12,
      mrr: "$490",
      status: "pending",
      created: "Mar 22, 2024",
      owner: "contact@innovationlabs.co",
    },
    {
      id: "ORG-005",
      name: "Design Studio Pro",
      domain: "designstudio.io",
      plan: "Professional",
      seats: 150,
      seatsUsed: 156,
      mrr: "$7,800",
      status: "active",
      created: "Jan 28, 2024",
      owner: "team@designstudio.io",
    },
    {
      id: "ORG-006",
      name: "Finance Corp",
      domain: "financecorp.com",
      plan: "Enterprise",
      seats: 300,
      seatsUsed: 267,
      mrr: "$15,200",
      status: "active",
      created: "Nov 12, 2023",
      owner: "it@financecorp.com",
    },
  ];

  return (
    <PortalPageFrame
      variant="fill"
      rootClassName="h-full"
      title="Organizations (legacy)"
      description="Manage customer organizations, plans, and credits. Prefer the main Organizations experience for new work."
      headerActions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Organization
          </Button>
        </div>
      }
      headerExtra={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="border border-border p-4 shadow-sm">
            <p className="mb-1 text-xs text-muted-foreground">Total Organizations</p>
            <p className="text-2xl font-semibold tabular-nums">1,247</p>
          </Card>
          <Card className="border border-border p-4 shadow-sm">
            <p className="mb-1 text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-semibold tabular-nums text-green-600">1,189</p>
          </Card>
          <Card className="border border-border p-4 shadow-sm">
            <p className="mb-1 text-xs text-muted-foreground">Trial</p>
            <p className="text-2xl font-semibold tabular-nums text-yellow-600">42</p>
          </Card>
          <Card className="border border-border p-4 shadow-sm">
            <p className="mb-1 text-xs text-muted-foreground">Churned</p>
            <p className="text-2xl font-semibold tabular-nums text-red-600">16</p>
          </Card>
        </div>
      }
      bodyClassName="flex min-h-0 flex-1 flex-col gap-0 px-0 py-0 sm:px-0 sm:py-0"
    >
      <FilterBar
        className="shrink-0"
        onSearch={(value) => console.log("Search:", value)}
        filters={[
          {
            label: "Plan",
            options: [
              { label: "All Plans", value: "all" },
              { label: "Enterprise", value: "enterprise" },
              { label: "Professional", value: "professional" },
              { label: "Starter", value: "starter" },
            ],
          },
          {
            label: "Status",
            options: [
              { label: "All Status", value: "all" },
              { label: "Active", value: "active" },
              { label: "Trial", value: "trial" },
              { label: "Pending", value: "pending" },
            ],
          },
        ]}
        actions={
          <Button variant="outline" size="sm">
            Advanced Filters
          </Button>
        }
      />

      <div className="min-h-0 flex-1 overflow-auto px-6 py-6 sm:px-8 sm:py-8">
        <DataTable
          columns={[
            {
              key: "id",
              label: "Organization ID",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-mono text-[13px]">{row.id}</span>
                </div>
              ),
            },
            {
              key: "name",
              label: "Organization",
              render: (row) => (
                <div>
                  <p className="font-medium text-[14px]">{row.name}</p>
                  <p className="text-[12px] text-muted-foreground">{row.domain}</p>
                </div>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (row) => <StatusBadge status={row.status as any} />,
            },
            {
              key: "plan",
              label: "Plan",
              render: (row) => <UnifiedBadge variant="plan" value={row.plan} size="sm" />,
            },
            {
              key: "seats",
              label: "Seats",
              render: (row) => (
                <div>
                  <p className="text-[14px]">
                    {row.seatsUsed} / {row.seats}
                  </p>
                  <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full ${
                        row.seatsUsed > row.seats
                          ? "bg-red-500"
                          : row.seatsUsed / row.seats > 0.9
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min((row.seatsUsed / row.seats) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ),
            },
            { key: "mrr", label: "MRR" },
            {
              key: "owner",
              label: "Owner",
              render: (row) => <span className="text-[13px]">{row.owner}</span>,
            },
            { key: "created", label: "Created" },
            {
              key: "actions",
              label: "",
              render: () => (
                <Button variant="ghost" size="sm">
                  Manage
                </Button>
              ),
            },
          ]}
          data={tenants}
        />
      </div>
    </PortalPageFrame>
  );
}
