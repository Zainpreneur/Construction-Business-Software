import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, Label, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatHours } from "@/lib/format";
import type { ProjectDetail } from "../queries";
import { createTimeEntryAction, deleteTimeEntryAction } from "../../time-actions";
import type { SessionPayload } from "@/lib/auth";

export function TimeTab({
  project,
  users,
  session,
}: {
  project: ProjectDetail;
  users: { id: string; name: string; role: string }[];
  session: SessionPayload;
}) {
  const totalHours = project.timeEntries.reduce((sum, t) => sum + Number(t.hours), 0);
  const canManage = session.role === "ADMIN" || session.role === "MANAGER";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Log time</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={createTimeEntryAction.bind(null, project.id)}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
          >
            {canManage ? (
              <div>
                <Label htmlFor="userId">Team member</Label>
                <Select id="userId" name="userId" required defaultValue={session.userId}>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </Select>
              </div>
            ) : (
              <input type="hidden" name="userId" value={session.userId} />
            )}
            <div>
              <Label htmlFor="taskId">Task (optional)</Label>
              <Select id="taskId" name="taskId" defaultValue="">
                <option value="">General</option>
                {project.tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </Select>
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
              <Label htmlFor="hours">Hours</Label>
              <Input id="hours" name="hours" type="number" step="0.25" min="0.25" max="24" required />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" name="notes" placeholder="Optional" />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-4">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" name="billable" defaultChecked className="h-4 w-4 rounded border-border" />
                Billable
              </label>
            </div>
            <div className="flex items-end">
              <SubmitButton>Log time</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      {project.timeEntries.length === 0 ? (
        <EmptyState title="No time logged yet" />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Date</TH>
              <TH>Team member</TH>
              <TH>Task</TH>
              <TH>Hours</TH>
              <TH>Notes</TH>
              <TH />
            </TR>
          </THead>
          <TBody>
            {project.timeEntries.map((entry) => {
              const canDelete = canManage || entry.userId === session.userId;
              return (
                <TR key={entry.id}>
                  <TD className="text-muted">{formatDate(entry.date)}</TD>
                  <TD className="text-foreground">{entry.user.name}</TD>
                  <TD className="text-muted">{entry.task?.title || "General"}</TD>
                  <TD className="text-foreground">
                    {formatHours(entry.hours)}
                    {!entry.billable && (
                      <Badge tone="neutral" className="ml-2">
                        Non-billable
                      </Badge>
                    )}
                  </TD>
                  <TD className="max-w-xs truncate text-muted">{entry.notes || "—"}</TD>
                  <TD>
                    {canDelete && (
                      <DeleteButton
                        action={deleteTimeEntryAction.bind(null, project.id, entry.id)}
                        confirmMessage="Delete this time entry?"
                      />
                    )}
                  </TD>
                </TR>
              );
            })}
          </TBody>
          <tfoot>
            <TR>
              <TD colSpan={3} className="text-right font-medium text-muted">
                Total
              </TD>
              <TD className="font-semibold text-foreground">{formatHours(totalHours)}</TD>
              <TD />
              <TD />
            </TR>
          </tfoot>
        </Table>
      )}
    </div>
  );
}
