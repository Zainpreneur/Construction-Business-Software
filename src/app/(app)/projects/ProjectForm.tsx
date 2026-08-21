import { prisma } from "@/lib/prisma";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { LinkButton } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { formatDateInput } from "@/lib/format";
import type { ProjectModel } from "@/generated/prisma/models";

const STATUS_OPTIONS = [
  "LEAD",
  "ESTIMATING",
  "PLANNING",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
] as const;

export async function ProjectForm({
  action,
  project,
  error,
  cancelHref,
  defaultClientId,
}: {
  action: (formData: FormData) => Promise<void>;
  project?: ProjectModel;
  error?: string;
  cancelHref: string;
  defaultClientId?: string;
}) {
  const [clients, managers] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { role: { in: ["ADMIN", "MANAGER"] }, active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <form action={action} className="space-y-5">
      {error && <Alert>{error}</Alert>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Project name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={project?.name}
            required
            placeholder="Carter Residence Remodel"
          />
        </div>

        <div>
          <Label htmlFor="clientId">Client</Label>
          <Select
            id="clientId"
            name="clientId"
            required
            defaultValue={project?.clientId ?? defaultClientId ?? ""}
          >
            <option value="" disabled>
              Select a client
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName || c.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={project?.status ?? "LEAD"}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s
                  .toLowerCase()
                  .split("_")
                  .map((w) => w[0].toUpperCase() + w.slice(1))
                  .join(" ")}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="managerId">Project manager</Label>
          <Select id="managerId" name="managerId" defaultValue={project?.managerId ?? ""}>
            <option value="">Unassigned</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="budget">Budget (USD)</Label>
          <Input
            id="budget"
            name="budget"
            type="number"
            step="0.01"
            min="0"
            defaultValue={project?.budget?.toString() ?? ""}
            placeholder="185000"
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="address">Site address</Label>
          <Input
            id="address"
            name="address"
            defaultValue={project?.address ?? ""}
            placeholder="482 Maple Ridge Rd, Austin, TX"
          />
        </div>

        <div>
          <Label htmlFor="startDate">Start date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={formatDateInput(project?.startDate)}
          />
        </div>

        <div>
          <Label htmlFor="endDate">Target end date</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={formatDateInput(project?.endDate)}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={project?.description ?? ""}
            placeholder="Scope of work, key details…"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SubmitButton>{project ? "Save changes" : "Create project"}</SubmitButton>
        <LinkButton href={cancelHref} variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
