import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { EstimateForm } from "../../EstimateForm";
import { updateEstimateAction } from "../../actions";

export default async function EditEstimatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const estimate = await prisma.estimate.findUnique({
    where: { id },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!estimate) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={`Edit ${estimate.number}`} />
      <Card>
        <CardContent>
          <EstimateForm
            action={updateEstimateAction.bind(null, id)}
            estimate={estimate}
            items={estimate.items}
            error={error}
            cancelHref={`/estimates/${id}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
