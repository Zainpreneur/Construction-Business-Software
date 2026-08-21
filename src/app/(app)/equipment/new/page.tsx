import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { EquipmentForm } from "../EquipmentForm";
import { createEquipmentAction } from "../actions";

export default async function NewEquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Add equipment" />
      <Card>
        <CardContent>
          <EquipmentForm action={createEquipmentAction} error={error} cancelHref="/equipment" />
        </CardContent>
      </Card>
    </div>
  );
}
