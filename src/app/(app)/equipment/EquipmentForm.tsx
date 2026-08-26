import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { LinkButton } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { formatDateInput } from "@/lib/format";
import type { EquipmentModel } from "@/generated/prisma/models";

const STATUSES = ["AVAILABLE", "IN_USE", "MAINTENANCE", "RETIRED"] as const;

export function EquipmentForm({
  action,
  equipment,
  error,
  cancelHref,
}: {
  action: (formData: FormData) => Promise<void>;
  equipment?: EquipmentModel;
  error?: string;
  cancelHref: string;
}) {
  return (
    <form action={action} className="space-y-4">
      {error && <Alert>{error}</Alert>}
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required defaultValue={equipment?.name} placeholder="Bobcat S70 Skid Steer" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Type</Label>
          <Input id="type" name="type" defaultValue={equipment?.type ?? ""} placeholder="Heavy equipment" />
        </div>
        <div>
          <Label htmlFor="serialNumber">Serial #</Label>
          <Input id="serialNumber" name="serialNumber" defaultValue={equipment?.serialNumber ?? ""} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={equipment?.status ?? "AVAILABLE"}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s[0] + s.slice(1).toLowerCase().replace("_", " ")}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="purchaseDate">Purchase date</Label>
          <Input
            id="purchaseDate"
            name="purchaseDate"
            type="date"
            defaultValue={formatDateInput(equipment?.purchaseDate)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={equipment?.notes ?? ""} />
      </div>
      <div className="flex items-center gap-2">
        <SubmitButton>{equipment ? "Save changes" : "Add equipment"}</SubmitButton>
        <LinkButton href={cancelHref} variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
