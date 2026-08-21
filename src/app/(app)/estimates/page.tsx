import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/format";
import { computeTotals } from "@/lib/money";

export default async function EstimatesPage() {
  const estimates = await prisma.estimate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      project: { select: { id: true, name: true } },
      client: { select: { name: true, companyName: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Estimates"
        description={`${estimates.length} estimate${estimates.length === 1 ? "" : "s"}`}
        actions={
          <LinkButton href="/estimates/new">
            <Plus className="h-4 w-4" /> New estimate
          </LinkButton>
        }
      />

      {estimates.length === 0 ? (
        <EmptyState
          title="No estimates yet"
          action={
            <LinkButton href="/estimates/new" size="sm">
              <Plus className="h-4 w-4" /> New estimate
            </LinkButton>
          }
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Number</TH>
              <TH>Project</TH>
              <TH>Client</TH>
              <TH>Issued</TH>
              <TH>Total</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {estimates.map((estimate) => {
              const { total } = computeTotals(estimate.items, estimate.taxRate);
              return (
                <TR key={estimate.id}>
                  <TD>
                    <Link
                      href={`/estimates/${estimate.id}`}
                      className="font-medium text-foreground hover:text-brand"
                    >
                      {estimate.number}
                    </Link>
                  </TD>
                  <TD className="text-muted">
                    <Link href={`/projects/${estimate.project.id}`} className="hover:text-brand">
                      {estimate.project.name}
                    </Link>
                  </TD>
                  <TD className="text-muted">
                    {estimate.client.companyName || estimate.client.name}
                  </TD>
                  <TD className="text-muted">{formatDate(estimate.issueDate)}</TD>
                  <TD className="font-medium text-foreground">{formatCurrency(total)}</TD>
                  <TD>
                    <StatusBadge status={estimate.status} />
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      )}
    </div>
  );
}
