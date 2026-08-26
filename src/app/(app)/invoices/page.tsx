import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/format";
import { computeTotals, amountPaid } from "@/lib/money";

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      payments: true,
      project: { select: { id: true, name: true } },
      client: { select: { name: true, companyName: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Invoices"
        description={`${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`}
        actions={
          <LinkButton href="/invoices/new">
            <Plus className="h-4 w-4" /> New invoice
          </LinkButton>
        }
      />

      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          action={
            <LinkButton href="/invoices/new" size="sm">
              <Plus className="h-4 w-4" /> New invoice
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
              <TH>Due</TH>
              <TH>Total</TH>
              <TH>Balance</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {invoices.map((invoice) => {
              const { total } = computeTotals(invoice.items, invoice.taxRate);
              const paid = amountPaid(invoice.payments);
              return (
                <TR key={invoice.id}>
                  <TD>
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="font-medium text-foreground hover:text-brand"
                    >
                      {invoice.number}
                    </Link>
                  </TD>
                  <TD className="text-muted">
                    <Link href={`/projects/${invoice.project.id}`} className="hover:text-brand">
                      {invoice.project.name}
                    </Link>
                  </TD>
                  <TD className="text-muted">
                    {invoice.client.companyName || invoice.client.name}
                  </TD>
                  <TD className="text-muted">{formatDate(invoice.dueDate)}</TD>
                  <TD className="font-medium text-foreground">{formatCurrency(total)}</TD>
                  <TD className="text-muted">{formatCurrency(Math.max(total - paid, 0))}</TD>
                  <TD>
                    <StatusBadge status={invoice.status} />
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
