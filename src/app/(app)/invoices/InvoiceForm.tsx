import { prisma } from "@/lib/prisma";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { LinkButton } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { LineItemsEditor } from "@/components/forms/LineItemsEditor";
import { formatDateInput } from "@/lib/format";
import type { InvoiceModel, InvoiceItemModel } from "@/generated/prisma/models";

export async function InvoiceForm({
  action,
  invoice,
  items,
  error,
  cancelHref,
  defaultProjectId,
}: {
  action: (formData: FormData) => Promise<void>;
  invoice?: InvoiceModel;
  items?: InvoiceItemModel[];
  error?: string;
  cancelHref: string;
  defaultProjectId?: string;
}) {
  const projects = await prisma.project.findMany({
    orderBy: { name: "asc" },
    include: { client: { select: { name: true, companyName: true } } },
  });

  return (
    <form action={action} className="space-y-5">
      {error && <Alert>{error}</Alert>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <Label htmlFor="projectId">Project</Label>
          <Select
            id="projectId"
            name="projectId"
            required
            defaultValue={invoice?.projectId ?? defaultProjectId ?? ""}
            disabled={Boolean(invoice)}
          >
            <option value="" disabled>
              Select a project
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.client.companyName || p.client.name}
              </option>
            ))}
          </Select>
          {invoice && <input type="hidden" name="projectId" value={invoice.projectId} />}
        </div>

        <div>
          <Label htmlFor="issueDate">Issue date</Label>
          <Input
            id="issueDate"
            name="issueDate"
            type="date"
            required
            defaultValue={formatDateInput(invoice?.issueDate) || new Date().toISOString().slice(0, 10)}
          />
        </div>
        <div>
          <Label htmlFor="dueDate">Due date</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={formatDateInput(invoice?.dueDate)}
          />
        </div>
      </div>

      <LineItemsEditor defaultItems={items} defaultTaxRate={invoice?.taxRate} />

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={invoice?.notes ?? ""}
          placeholder="Payment terms, remittance details…"
        />
      </div>

      <div className="flex items-center gap-2">
        <SubmitButton>{invoice ? "Save changes" : "Create invoice"}</SubmitButton>
        <LinkButton href={cancelHref} variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
