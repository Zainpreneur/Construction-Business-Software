import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Alert } from "@/components/ui/Alert";
import { AutoSubmitSelect } from "@/components/ui/AutoSubmitSelect";
import { Input, Label, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { formatCurrency, formatDate, titleCase } from "@/lib/format";
import { computeTotals, amountPaid } from "@/lib/money";
import {
  deleteInvoiceAction,
  deletePaymentAction,
  recordPaymentAction,
  updateInvoiceStatusAction,
} from "../actions";

const STATUSES = ["DRAFT", "SENT", "PARTIAL", "PAID", "OVERDUE", "VOID"] as const;
const PAYMENT_METHODS = ["BANK_TRANSFER", "CHECK", "CREDIT_CARD", "CASH", "OTHER"] as const;

export default async function InvoiceDetailPage({
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
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      payments: { orderBy: { paidAt: "desc" } },
      project: true,
      client: true,
    },
  });
  if (!invoice) notFound();

  const { subtotal, tax, total } = computeTotals(invoice.items, invoice.taxRate);
  const paid = amountPaid(invoice.payments);
  const balance = Math.max(total - paid, 0);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={invoice.number}
        description={`${invoice.project.name} · ${invoice.client.companyName || invoice.client.name}`}
        actions={
          <>
            <AutoSubmitSelect
              action={updateInvoiceStatusAction.bind(null, id)}
              name="status"
              defaultValue={invoice.status}
              className="h-9 rounded-md border border-border bg-white px-3 text-sm font-medium text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </AutoSubmitSelect>
            <LinkButton href={`/invoices/${id}/edit`} variant="secondary" size="sm">
              <Pencil className="h-4 w-4" /> Edit
            </LinkButton>
            <DeleteButton
              action={deleteInvoiceAction.bind(null, id)}
              confirmMessage={`Delete invoice ${invoice.number}?`}
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
          <StatusBadge status={invoice.status} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted">Project</p>
              <Link
                href={`/projects/${invoice.project.id}`}
                className="font-medium text-foreground hover:text-brand"
              >
                {invoice.project.name}
              </Link>
            </div>
            <div>
              <p className="text-xs text-muted">Issued</p>
              <p className="font-medium text-foreground">{formatDate(invoice.issueDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Due</p>
              <p className="font-medium text-foreground">{formatDate(invoice.dueDate)}</p>
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
              {invoice.items.map((item) => (
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
              <span>Tax ({invoice.taxRate.toString()}%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between font-medium text-foreground">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-success">
              <span>Paid</span>
              <span>{formatCurrency(paid)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1 font-semibold text-foreground">
              <span>Balance due</span>
              <span>{formatCurrency(balance)}</span>
            </div>
          </div>

          {invoice.notes && (
            <div className="border-t border-border pt-4 text-sm whitespace-pre-wrap text-muted">
              {invoice.notes}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {balance > 0 && (
            <form
              action={recordPaymentAction.bind(null, id)}
              className="grid grid-cols-1 gap-3 rounded-md border border-dashed border-border p-3 sm:grid-cols-4"
            >
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  defaultValue={balance.toFixed(2)}
                />
              </div>
              <div>
                <Label htmlFor="method">Method</Label>
                <Select id="method" name="method" defaultValue="BANK_TRANSFER">
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {titleCase(m)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="paidAt">Date</Label>
                <Input
                  id="paidAt"
                  name="paidAt"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                />
              </div>
              <div className="flex items-end">
                <SubmitButton>Record payment</SubmitButton>
              </div>
              <div className="sm:col-span-4">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" name="notes" placeholder="Optional" />
              </div>
            </form>
          )}

          {invoice.payments.length === 0 ? (
            <p className="text-sm text-muted">No payments recorded yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {invoice.payments.map((payment) => (
                <li key={payment.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <span className="font-medium text-foreground">
                      {formatCurrency(payment.amount)}
                    </span>
                    <span className="ml-2 text-muted">
                      {titleCase(payment.method)} · {formatDate(payment.paidAt)}
                    </span>
                    {payment.notes && <p className="text-xs text-muted">{payment.notes}</p>}
                  </div>
                  <DeleteButton
                    action={deletePaymentAction.bind(null, id, payment.id)}
                    confirmMessage="Delete this payment?"
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
