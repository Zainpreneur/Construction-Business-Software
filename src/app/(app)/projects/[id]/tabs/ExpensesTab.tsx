import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, Label, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, titleCase } from "@/lib/format";
import type { ProjectDetail } from "../queries";
import { createExpenseAction, deleteExpenseAction } from "../../../expenses/actions";

const CATEGORIES = [
  "MATERIALS",
  "LABOR",
  "EQUIPMENT",
  "SUBCONTRACTOR",
  "PERMITS",
  "TRAVEL",
  "UTILITIES",
  "OTHER",
] as const;

export function ExpensesTab({
  project,
  canManage,
}: {
  project: ProjectDetail;
  canManage: boolean;
}) {
  const total = project.expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-4">
      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>Add expense</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={createExpenseAction}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
            >
              <input type="hidden" name="projectId" value={project.id} />
              <div>
                <Label htmlFor="category">Category</Label>
                <Select id="category" name="category" defaultValue="MATERIALS">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {titleCase(c)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="vendor">Vendor</Label>
                <Input id="vendor" name="vendor" placeholder="Optional" />
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" placeholder="Optional" />
              </div>
              <div className="flex items-end">
                <SubmitButton>Add expense</SubmitButton>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {project.expenses.length === 0 ? (
        <EmptyState title="No expenses recorded" />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Date</TH>
              <TH>Category</TH>
              <TH>Vendor</TH>
              <TH>Description</TH>
              <TH>Amount</TH>
              {canManage && <TH />}
            </TR>
          </THead>
          <TBody>
            {project.expenses.map((expense) => (
              <TR key={expense.id}>
                <TD className="text-muted">{formatDate(expense.date)}</TD>
                <TD>
                  <Badge tone="neutral">{titleCase(expense.category)}</Badge>
                </TD>
                <TD className="text-muted">{expense.vendor || "—"}</TD>
                <TD className="max-w-xs truncate text-muted">{expense.description || "—"}</TD>
                <TD className="font-medium text-foreground">{formatCurrency(expense.amount)}</TD>
                {canManage && (
                  <TD>
                    <DeleteButton
                      action={deleteExpenseAction.bind(null, project.id, expense.id)}
                      confirmMessage="Delete this expense?"
                    />
                  </TD>
                )}
              </TR>
            ))}
          </TBody>
          <tfoot>
            <TR>
              <TD colSpan={4} className="text-right font-medium text-muted">
                Total
              </TD>
              <TD className="font-semibold text-foreground">{formatCurrency(total)}</TD>
              {canManage && <TD />}
            </TR>
          </tfoot>
        </Table>
      )}
    </div>
  );
}
