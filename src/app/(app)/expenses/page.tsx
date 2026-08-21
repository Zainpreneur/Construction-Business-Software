import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate, titleCase } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { deleteExpenseAction } from "./actions";

export default async function ExpensesPage() {
  const session = await requireUser();
  const canManage = ["ADMIN", "MANAGER", "ACCOUNTANT"].includes(session.role);

  const expenses = await prisma.expense.findMany({
    orderBy: { date: "desc" },
    include: { project: { select: { id: true, name: true } } },
  });
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div>
      <PageHeader
        title="Expenses"
        description={`${expenses.length} expense${expenses.length === 1 ? "" : "s"} · ${formatCurrency(total)} total`}
        actions={
          canManage && (
            <LinkButton href="/expenses/new">
              <Plus className="h-4 w-4" /> New expense
            </LinkButton>
          )
        }
      />

      {expenses.length === 0 ? (
        <EmptyState title="No expenses recorded" />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Date</TH>
              <TH>Project</TH>
              <TH>Category</TH>
              <TH>Vendor</TH>
              <TH>Amount</TH>
              {canManage && <TH />}
            </TR>
          </THead>
          <TBody>
            {expenses.map((expense) => (
              <TR key={expense.id}>
                <TD className="text-muted">{formatDate(expense.date)}</TD>
                <TD>
                  <Link
                    href={`/projects/${expense.project.id}?tab=expenses`}
                    className="font-medium text-foreground hover:text-brand"
                  >
                    {expense.project.name}
                  </Link>
                </TD>
                <TD>
                  <Badge tone="neutral">{titleCase(expense.category)}</Badge>
                </TD>
                <TD className="text-muted">{expense.vendor || "—"}</TD>
                <TD className="font-medium text-foreground">{formatCurrency(expense.amount)}</TD>
                {canManage && (
                  <TD>
                    <DeleteButton
                      action={deleteExpenseAction.bind(null, expense.project.id, expense.id)}
                      confirmMessage="Delete this expense?"
                    />
                  </TD>
                )}
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
