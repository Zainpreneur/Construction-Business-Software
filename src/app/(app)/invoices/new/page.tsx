import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { InvoiceForm } from "../InvoiceForm";
import { createInvoiceAction } from "../actions";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; projectId?: string }>;
}) {
  const { error, projectId } = await searchParams;
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="New invoice" />
      <Card>
        <CardContent>
          <InvoiceForm
            action={createInvoiceAction}
            error={error}
            cancelHref="/invoices"
            defaultProjectId={projectId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
