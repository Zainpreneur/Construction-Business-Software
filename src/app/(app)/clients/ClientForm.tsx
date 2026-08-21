import { Input, Label, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { LinkButton } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { ClientModel } from "@/generated/prisma/models";

export function ClientForm({
  action,
  client,
  error,
  cancelHref,
}: {
  action: (formData: FormData) => Promise<void>;
  client?: ClientModel;
  error?: string;
  cancelHref: string;
}) {
  return (
    <form action={action} className="space-y-5">
      {error && <Alert>{error}</Alert>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Contact name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={client?.name}
            required
            placeholder="Helen Carter"
          />
        </div>
        <div>
          <Label htmlFor="companyName">Company name</Label>
          <Input
            id="companyName"
            name="companyName"
            defaultValue={client?.companyName ?? ""}
            placeholder="Carter Family Trust"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={client?.email ?? ""}
            placeholder="client@example.com"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={client?.phone ?? ""}
            placeholder="555-0100"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            defaultValue={client?.address ?? ""}
            placeholder="123 Main St, Austin, TX"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={client?.notes ?? ""}
            placeholder="Preferences, access instructions, etc."
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SubmitButton>{client ? "Save changes" : "Create client"}</SubmitButton>
        <LinkButton href={cancelHref} variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
