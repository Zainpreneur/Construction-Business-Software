import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { EquipmentForm } from "../../EquipmentForm";
import { updateEquipmentAction } from "../../actions";

export default async function EditEquipmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const equipment = await prisma.equipment.findUnique({ where: { id } });
  if (!equipment) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={`Edit ${equipment.name}`} />
      <Card>
        <CardContent>
          <EquipmentForm
            action={updateEquipmentAction.bind(null, id)}
            equipment={equipment}
            error={error}
            cancelHref="/equipment"
          />
        </CardContent>
      </Card>
    </div>
  );
}
