import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { computeTotals, amountPaid } from "@/lib/money";
import type { ProjectDetail } from "../queries";

export function InvoicesTab({ project }: { project: ProjectDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <LinkButton href={`/invoices/new?projectId=${project.id}`} size="sm">
          <Plus className="h-4 w-4" /> New invoice
        </LinkButton>
      </CardHeader>
      <CardContent className="p-0">
        {project.invoices.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No invoices yet" />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {project.invoices.map((invoice) => {
              const { total } = computeTotals(invoice.items, invoice.taxRate);
              const paid = amountPaid(invoice.payments);
              return (
                <li key={invoice.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="text-sm font-medium text-foreground hover:text-brand"
                    >
                      {invoice.number}
                    </Link>
                    <p className="text-xs text-muted">
                      Due {formatDate(invoice.dueDate)} · {formatCurrency(paid)} paid
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground">{formatCurrency(total)}</span>
                    <StatusBadge status={invoice.status} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
