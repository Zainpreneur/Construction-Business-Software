import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ProjectDetail } from "../queries";
import {
  createChangeOrderAction,
  deleteChangeOrderAction,
  updateChangeOrderStatusAction,
} from "../../changeorders-actions";

export function ChangeOrdersTab({
  project,
  canManage,
}: {
  project: ProjectDetail;
  canManage: boolean;
}) {
  const approvedTotal = project.changeOrders
    .filter((c) => c.status === "APPROVED")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <div className="space-y-4">
      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>New change order</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={createChangeOrderAction.bind(null, project.id)}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div className="sm:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required placeholder="Upgrade to quartz countertops" />
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" name="amount" type="number" step="0.01" required />
              </div>
              <div className="flex items-end">
                <SubmitButton>Submit</SubmitButton>
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={2} />
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {project.changeOrders.length === 0 ? (
        <EmptyState title="No change orders" />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Title</TH>
              <TH>Requested by</TH>
              <TH>Date</TH>
              <TH>Amount</TH>
              <TH>Status</TH>
              {canManage && <TH />}
            </TR>
          </THead>
          <TBody>
            {project.changeOrders.map((co) => (
              <TR key={co.id}>
                <TD>
                  <div className="font-medium text-foreground">{co.title}</div>
                  {co.description && (
                    <div className="mt-0.5 max-w-sm truncate text-xs text-muted">
                      {co.description}
                    </div>
                  )}
                </TD>
                <TD className="text-muted">{co.createdBy?.name || "—"}</TD>
                <TD className="text-muted">{formatDate(co.createdAt)}</TD>
                <TD className="font-medium text-foreground">{formatCurrency(co.amount)}</TD>
                <TD>
                  <StatusBadge status={co.status} />
                </TD>
                {canManage && (
                  <TD>
                    <div className="flex items-center gap-1.5">
                      {co.status === "PENDING" && (
                        <>
                          <form
                            action={updateChangeOrderStatusAction.bind(
                              null,
                              project.id,
                              co.id,
                              "APPROVED"
                            )}
                          >
                            <Button type="submit" size="sm" variant="secondary">
                              Approve
                            </Button>
                          </form>
                          <form
                            action={updateChangeOrderStatusAction.bind(
                              null,
                              project.id,
                              co.id,
                              "REJECTED"
                            )}
                          >
                            <Button type="submit" size="sm" variant="secondary">
                              Reject
                            </Button>
                          </form>
                        </>
                      )}
                      <DeleteButton
                        action={deleteChangeOrderAction.bind(null, project.id, co.id)}
                        confirmMessage="Delete this change order?"
                      />
                    </div>
                  </TD>
                )}
              </TR>
            ))}
          </TBody>
          <tfoot>
            <TR>
              <TD colSpan={3} className="text-right font-medium text-muted">
                Approved total
              </TD>
              <TD className="font-semibold text-foreground">{formatCurrency(approvedTotal)}</TD>
              <TD />
              {canManage && <TD />}
            </TR>
          </tfoot>
        </Table>
      )}
    </div>
  );
}
