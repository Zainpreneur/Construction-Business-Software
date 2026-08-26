import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, ArrowRightLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton, Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Alert } from "@/components/ui/Alert";
import { AutoSubmitSelect } from "@/components/ui/AutoSubmitSelect";
import { formatCurrency, formatDate } from "@/lib/format";
import { computeTotals } from "@/lib/money";
import {
  convertEstimateToInvoiceAction,
  deleteEstimateAction,
  updateEstimateStatusAction,
} from "../actions";

const STATUSES = ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"] as const;

export default async function EstimateDetailPage({
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
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      project: true,
      client: true,
    },
  });
  if (!estimate) notFound();

  const { subtotal, tax, total } = computeTotals(estimate.items, estimate.taxRate);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={estimate.number}
        description={`${estimate.project.name} · ${estimate.client.companyName || estimate.client.name}`}
        actions={
          <>
            <AutoSubmitSelect
              action={updateEstimateStatusAction.bind(null, id)}
              name="status"
              defaultValue={estimate.status}
              className="h-9 rounded-md border border-border bg-white px-3 text-sm font-medium text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s[0] + s.slice(1).toLowerCase()}
                </option>
              ))}
            </AutoSubmitSelect>
            <LinkButton href={`/estimates/${id}/edit`} variant="secondary" size="sm">
              <Pencil className="h-4 w-4" /> Edit
            </LinkButton>
            <DeleteButton
              action={deleteEstimateAction.bind(null, id)}
              confirmMessage={`Delete estimate ${estimate.number}?`}
            />
          </>
        }
      />

      {error && (
        <Alert className="mb-4" tone="danger">
          {error}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <StatusBadge status={estimate.status} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted">Project</p>
              <Link
                href={`/projects/${estimate.project.id}`}
                className="font-medium text-foreground hover:text-brand"
              >
                {estimate.project.name}
              </Link>
            </div>
            <div>
              <p className="text-xs text-muted">Issued</p>
              <p className="font-medium text-foreground">{formatDate(estimate.issueDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Expires</p>
              <p className="font-medium text-foreground">{formatDate(estimate.expiryDate)}</p>
            </div>
          </div>

          <Table>
            <THead>
              <TR>
                <TH>Description</TH>
                <TH>Qty</TH>
                <TH>Unit price</TH>
                <TH className="text-right">Amount</TH>
              </TR>
            </THead>
            <TBody>
              {estimate.items.map((item) => (
                <TR key={item.id}>
                  <TD>{item.description}</TD>
                  <TD className="text-muted">{item.quantity.toString()}</TD>
                  <TD className="text-muted">{formatCurrency(item.unitPrice)}</TD>
                  <TD className="text-right font-medium text-foreground">
                    {formatCurrency(Number(item.quantity) * Number(item.unitPrice))}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>

          <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Tax ({estimate.taxRate.toString()}%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1 font-semibold text-foreground">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {estimate.notes && (
            <div className="border-t border-border pt-4 text-sm whitespace-pre-wrap text-muted">
              {estimate.notes}
            </div>
          )}
        </CardContent>
      </Card>

      {estimate.status === "ACCEPTED" && (
        <form action={convertEstimateToInvoiceAction.bind(null, id)} className="mt-4">
          <Button type="submit" variant="secondary">
            <ArrowRightLeft className="h-4 w-4" /> Convert to invoice
          </Button>
        </form>
      )}
    </div>
  );
}
