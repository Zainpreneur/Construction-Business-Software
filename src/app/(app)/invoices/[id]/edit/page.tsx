import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { InvoiceForm } from "../../InvoiceForm";
import { updateInvoiceAction } from "../../actions";

export default async function EditInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!invoice) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={`Edit ${invoice.number}`} />
      <Card>
        <CardContent>
          <InvoiceForm
            action={updateInvoiceAction.bind(null, id)}
            invoice={invoice}
            items={invoice.items}
            error={error}
            cancelHref={`/invoices/${id}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
