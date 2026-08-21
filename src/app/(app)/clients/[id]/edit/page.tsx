import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { ClientForm } from "../../ClientForm";
import { updateClientAction } from "../../actions";

export default async function EditClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={`Edit ${client.name}`} />
      <Card>
        <CardContent>
          <ClientForm
            action={updateClientAction.bind(null, id)}
            client={client}
            error={error}
            cancelHref={`/clients/${id}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
