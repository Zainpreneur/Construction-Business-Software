import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { ClientForm } from "../ClientForm";
import { createClientAction } from "../actions";

export default async function NewClientPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="New client" description="Add a client to your company." />
      <Card>
        <CardContent>
          <ClientForm action={createClientAction} error={error} cancelHref="/clients" />
        </CardContent>
      </Card>
    </div>
  );
}
