import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency, formatDate, formatHours } from "@/lib/format";
import { computeTotals, amountPaid } from "@/lib/money";
import type { ProjectDetail } from "../queries";

export function OverviewTab({ project }: { project: ProjectDetail }) {
  const invoicedTotal = project.invoices.reduce(
    (sum, inv) => sum + computeTotals(inv.items, inv.taxRate).total,
    0
  );
  const collectedTotal = project.invoices.reduce(
    (sum, inv) => sum + amountPaid(inv.payments),
    0
  );
  const expenseTotal = project.expenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );
  const changeOrderTotal = project.changeOrders
    .filter((c) => c.status === "APPROVED")
    .reduce((sum, c) => sum + Number(c.amount), 0);
  const budget = project.budget ? Number(project.budget) : null;
  const totalHours = project.timeEntries.reduce((sum, t) => sum + Number(t.hours), 0);
  const openTasks = project.tasks.filter((t) => t.status !== "DONE").length;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="whitespace-pre-wrap text-foreground">
            {project.description || "No description provided."}
          </p>
          <dl className="grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted">Site address</dt>
              <dd className="mt-0.5 text-foreground">{project.address || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Start date</dt>
              <dd className="mt-0.5 text-foreground">{formatDate(project.startDate)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Target end date</dt>
              <dd className="mt-0.5 text-foreground">{formatDate(project.endDate)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Project manager</dt>
              <dd className="mt-0.5 text-foreground">{project.manager?.name || "Unassigned"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Open tasks</dt>
              <dd className="mt-0.5 text-foreground">{openTasks}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Logged hours</dt>
              <dd className="mt-0.5 text-foreground">{formatHours(totalHours)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Budget" value={budget !== null ? formatCurrency(budget) : "—"} />
          <Row label="Approved change orders" value={formatCurrency(changeOrderTotal)} />
          <Row label="Invoiced to date" value={formatCurrency(invoicedTotal)} />
          <Row label="Collected" value={formatCurrency(collectedTotal)} />
          <Row label="Expenses" value={formatCurrency(expenseTotal)} />
          <div className="border-t border-border pt-3">
            <Row
              label="Remaining to invoice"
              value={formatCurrency(Math.max(invoicedTotal - collectedTotal, 0))}
              emphasis
            />
          </div>
          {budget !== null && (
            <div className="border-t border-border pt-3">
              <Row
                label="Budget vs. expenses"
                value={formatCurrency(budget - expenseTotal)}
                emphasis
                tone={budget - expenseTotal < 0 ? "danger" : undefined}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  label,
  value,
  emphasis,
  tone,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  tone?: "danger";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span
        className={
          emphasis
            ? `font-semibold ${tone === "danger" ? "text-danger" : "text-foreground"}`
            : "text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}
