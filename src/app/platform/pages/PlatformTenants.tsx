import { Building2, Plus, Download } from "lucide-react";
import { DataTable } from "../../shared/components/DataTable";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { UnifiedBadge } from "../../shared/components/UnifiedBadge";
import { FilterBar } from "../../shared/components/FilterBar";
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
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[20px] font-semibold text-foreground">Tenant Management</h2>
            <p className="text-[14px] text-muted-foreground mt-1">
              Manage all customer organizations and their subscriptions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Tenant
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4 shadow-sm">
            <p className="text-[13px] text-muted-foreground mb-1">Total Tenants</p>
            <p className="text-[24px] font-semibold">1,247</p>
          </Card>
          <Card className="p-4 shadow-sm">
            <p className="text-[13px] text-muted-foreground mb-1">Active</p>
            <p className="text-[24px] font-semibold text-green-600">1,189</p>
          </Card>
          <Card className="p-4 shadow-sm">
            <p className="text-[13px] text-muted-foreground mb-1">Trial</p>
            <p className="text-[24px] font-semibold text-yellow-600">42</p>
          </Card>
          <Card className="p-4 shadow-sm">
            <p className="text-[13px] text-muted-foreground mb-1">Churned</p>
            <p className="text-[24px] font-semibold text-red-600">16</p>
          </Card>
        </div>
      </div>

      <FilterBar
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

      <div className="flex-1 p-6 overflow-auto">
        <DataTable
          columns={[
            {
              key: "id",
              label: "Tenant ID",
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
    </div>
  );
}
