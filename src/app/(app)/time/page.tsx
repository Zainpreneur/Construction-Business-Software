import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Input, Label, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { formatDate, formatHours } from "@/lib/format";
import { createTimeEntryAction, deleteTimeEntryAction } from "../projects/time-actions";

export default async function TimeTrackingPage() {
  const session = await requireUser();
  const canManage = session.role === "ADMIN" || session.role === "MANAGER";

  const [entries, projects, users] = await Promise.all([
    prisma.timeEntry.findMany({
      where: session.role === "EMPLOYEE" ? { userId: session.userId } : undefined,
      orderBy: { date: "desc" },
      take: 100,
      include: {
        project: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
        task: { select: { title: true } },
      },
    }),
    prisma.project.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const totalHours = entries.reduce((sum, e) => sum + Number(e.hours), 0);

  return (
    <div>
      <PageHeader
        title="Time Tracking"
        description={`${entries.length} entries · ${formatHours(totalHours)} logged`}
      />

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Log time</CardTitle>
        </CardHeader>
        <CardContent>
          <TimeEntryFormForProjects
            projects={projects}
            users={users}
            canManage={canManage}
            userId={session.userId}
          />
        </CardContent>
      </Card>

      {entries.length === 0 ? (
        <EmptyState title="No time logged yet" />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Date</TH>
              <TH>Project</TH>
              <TH>Team member</TH>
              <TH>Task</TH>
              <TH>Hours</TH>
              <TH />
            </TR>
          </THead>
          <TBody>
            {entries.map((entry) => {
              const canDelete = canManage || entry.userId === session.userId;
              return (
                <TR key={entry.id}>
                  <TD className="text-muted">{formatDate(entry.date)}</TD>
                  <TD>
                    <Link
                      href={`/projects/${entry.project.id}?tab=time`}
                      className="font-medium text-foreground hover:text-brand"
                    >
                      {entry.project.name}
                    </Link>
                  </TD>
                  <TD className="text-muted">{entry.user.name}</TD>
                  <TD className="text-muted">{entry.task?.title || "General"}</TD>
                  <TD className="text-foreground">
                    {formatHours(entry.hours)}
                    {!entry.billable && (
                      <Badge tone="neutral" className="ml-2">
                        Non-billable
                      </Badge>
                    )}
                  </TD>
                  <TD>
                    {canDelete && (
                      <DeleteButton
                        action={deleteTimeEntryAction.bind(null, entry.project.id, entry.id)}
                        confirmMessage="Delete this time entry?"
                      />
                    )}
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

function TimeEntryFormForProjects({
  projects,
  users,
  canManage,
  userId,
}: {
  projects: { id: string; name: string }[];
  users: { id: string; name: string }[];
  canManage: boolean;
  userId: string;
}) {
  return (
    <form
      action={async (formData: FormData) => {
        "use server";
        const projectId = String(formData.get("projectId") || "");
        await createTimeEntryAction(projectId, formData);
      }}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6"
    >
      <div>
        <Label htmlFor="projectId">Project</Label>
        <Select id="projectId" name="projectId" required defaultValue="">
          <option value="" disabled>
            Select
          </option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>
      {canManage ? (
        <div>
          <Label htmlFor="userId">Team member</Label>
          <Select id="userId" name="userId" required defaultValue={userId}>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        </div>
      ) : (
        <input type="hidden" name="userId" value={userId} />
      )}
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
      <div className="flex items-end gap-3">
        <label className="flex items-center gap-1.5 text-sm text-foreground">
          <input type="checkbox" name="billable" defaultChecked className="h-4 w-4 rounded border-border" />
          Billable
        </label>
      </div>
      <div className="sm:col-span-2 lg:col-span-6">
        <SubmitButton>Log time</SubmitButton>
      </div>
    </form>
  );
}
