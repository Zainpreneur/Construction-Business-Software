import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { AutoSubmitSelect } from "@/components/ui/AutoSubmitSelect";
import { formatDate } from "@/lib/format";
import type { ProjectDetail } from "../queries";
import { createTaskAction, deleteTaskAction, updateTaskStatusAction } from "../../tasks-actions";
import type { SessionPayload } from "@/lib/auth";

const STATUSES = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"] as const;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export function TasksTab({
  project,
  users,
  session,
}: {
  project: ProjectDetail;
  users: { id: string; name: string; role: string }[];
  session: SessionPayload;
}) {
  const canManage = session.role === "ADMIN" || session.role === "MANAGER";

  return (
    <div className="space-y-4">
      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>Add task</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={createTaskAction.bind(null, project.id)}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div className="sm:col-span-2 lg:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required placeholder="Install cabinet hardware" />
              </div>
              <div>
                <Label htmlFor="assigneeId">Assignee</Label>
                <Select id="assigneeId" name="assigneeId" defaultValue="">
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select id="priority" name="priority" defaultValue="MEDIUM">
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p[0] + p.slice(1).toLowerCase()}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="dueDate">Due date</Label>
                <Input id="dueDate" name="dueDate" type="date" />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <Label htmlFor="description">Notes</Label>
                <Textarea id="description" name="description" rows={2} />
              </div>
              <div className="flex items-end">
                <SubmitButton>Add task</SubmitButton>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {project.tasks.length === 0 ? (
        <EmptyState title="No tasks yet" description="Break the project down into tasks." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Task</TH>
              <TH>Assignee</TH>
              <TH>Priority</TH>
              <TH>Due</TH>
              <TH>Status</TH>
              {canManage && <TH />}
            </TR>
          </THead>
          <TBody>
            {project.tasks.map((task) => {
              const canEditStatus =
                canManage || (session.role === "EMPLOYEE" && task.assigneeId === session.userId);
              return (
                <TR key={task.id}>
                  <TD>
                    <div className="font-medium text-foreground">{task.title}</div>
                    {task.description && (
                      <div className="mt-0.5 max-w-md truncate text-xs text-muted">
                        {task.description}
                      </div>
                    )}
                  </TD>
                  <TD className="text-muted">{task.assignee?.name || "—"}</TD>
                  <TD>
                    <StatusBadge status={task.priority} />
                  </TD>
                  <TD className="text-muted">{formatDate(task.dueDate)}</TD>
                  <TD>
                    {canEditStatus ? (
                      <AutoSubmitSelect
                        action={updateTaskStatusAction.bind(null, project.id, task.id)}
                        name="status"
                        defaultValue={task.status}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace("_", " ")}
                          </option>
                        ))}
                      </AutoSubmitSelect>
                    ) : (
                      <StatusBadge status={task.status} />
                    )}
                  </TD>
                  {canManage && (
                    <TD>
                      <DeleteButton
                        action={deleteTaskAction.bind(null, project.id, task.id)}
                        confirmMessage={`Delete task "${task.title}"?`}
                      />
                    </TD>
                  )}
                </TR>
              );
            })}
          </TBody>
        </Table>
      )}
    </div>
  );
}
