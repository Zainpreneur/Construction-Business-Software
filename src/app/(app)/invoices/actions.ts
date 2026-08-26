"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { parseLineItems } from "@/lib/line-items";
import { nextInvoiceNumber } from "@/lib/numbering";
import { computeTotals, amountPaid } from "@/lib/money";

const STAFF_ROLES = ["ADMIN", "MANAGER", "ACCOUNTANT"] as const;
const INVOICE_STATUSES = ["DRAFT", "SENT", "PARTIAL", "PAID", "OVERDUE", "VOID"] as const;

const invoiceSchema = z.object({
  projectId: z.string().trim().min(1, "Project is required"),
  issueDate: z.string().trim().min(1, "Issue date is required"),
  dueDate: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  taxRate: z.coerce.number().min(0).max(100).default(0),
});

async function parseAndValidate(formData: FormData, errorPath: string) {
  const parsed = invoiceSchema.safeParse({
    projectId: formData.get("projectId"),
    issueDate: formData.get("issueDate"),
    dueDate: formData.get("dueDate") || undefined,
    notes: formData.get("notes") || undefined,
    taxRate: formData.get("taxRate") || 0,
  });

  if (!parsed.success) {
    redirect(`${errorPath}?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const items = parseLineItems(formData);
  if (items.length === 0) {
    redirect(`${errorPath}?error=${encodeURIComponent("Add at least one line item")}`);
  }

  return { data: parsed.data, items };
}

export async function createInvoiceAction(formData: FormData) {
  await requireRole([...STAFF_ROLES]);
  const { data, items } = await parseAndValidate(formData, "/invoices/new");

  const project = await prisma.project.findUnique({ where: { id: data.projectId } });
  if (!project) {
    redirect(`/invoices/new?error=${encodeURIComponent("Project not found")}`);
  }

  const number = await nextInvoiceNumber();

  const invoice = await prisma.invoice.create({
    data: {
      number,
      projectId: data.projectId,
      clientId: project.clientId,
      issueDate: new Date(data.issueDate),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      notes: data.notes || null,
      taxRate: data.taxRate,
      items: { create: items.map((item, i) => ({ ...item, sortOrder: i })) },
    },
  });

  revalidatePath("/invoices");
  revalidatePath(`/projects/${data.projectId}`);
  revalidatePath("/dashboard");
  redirect(`/invoices/${invoice.id}`);
}

export async function updateInvoiceAction(id: string, formData: FormData) {
  await requireRole([...STAFF_ROLES]);
  const { data, items } = await parseAndValidate(formData, `/invoices/${id}/edit`);

  await prisma.$transaction([
    prisma.invoiceItem.deleteMany({ where: { invoiceId: id } }),
    prisma.invoice.update({
      where: { id },
      data: {
        issueDate: new Date(data.issueDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes || null,
        taxRate: data.taxRate,
        items: { create: items.map((item, i) => ({ ...item, sortOrder: i })) },
      },
    }),
  ]);

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  revalidatePath("/dashboard");
  redirect(`/invoices/${id}`);
}

export async function updateInvoiceStatusAction(id: string, formData: FormData) {
  await requireRole([...STAFF_ROLES]);
  const status = formData.get("status");
  if (
    typeof status !== "string" ||
    !INVOICE_STATUSES.includes(status as (typeof INVOICE_STATUSES)[number])
  ) {
    redirect(`/invoices/${id}?error=${encodeURIComponent("Invalid status")}`);
  }

  const invoice = await prisma.invoice.update({
    where: { id },
    data: { status: status as (typeof INVOICE_STATUSES)[number] },
  });
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  revalidatePath(`/projects/${invoice.projectId}`);
  revalidatePath("/dashboard");
  redirect(`/invoices/${id}`);
}

export async function deleteInvoiceAction(id: string) {
  await requireRole([...STAFF_ROLES]);
  const invoice = await prisma.invoice.delete({ where: { id } });
  revalidatePath("/invoices");
  revalidatePath(`/projects/${invoice.projectId}`);
  revalidatePath("/dashboard");
  redirect("/invoices");
}

const paymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  method: z.enum(["CASH", "CHECK", "CREDIT_CARD", "BANK_TRANSFER", "OTHER"]),
  paidAt: z.string().trim().min(1, "Date is required"),
  notes: z.string().trim().optional(),
});

export async function recordPaymentAction(invoiceId: string, formData: FormData) {
  await requireRole([...STAFF_ROLES]);
  const parsed = paymentSchema.safeParse({
    amount: formData.get("amount"),
    method: formData.get("method") || "BANK_TRANSFER",
    paidAt: formData.get("paidAt"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    redirect(
      `/invoices/${invoiceId}?error=${encodeURIComponent(parsed.error.issues[0].message)}`
    );
  }

  await prisma.payment.create({
    data: {
      invoiceId,
      amount: parsed.data.amount,
      method: parsed.data.method,
      paidAt: new Date(parsed.data.paidAt),
      notes: parsed.data.notes || null,
    },
  });

  // Auto-advance status based on how much has now been paid.
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { items: true, payments: true },
  });
  if (invoice) {
    const { total } = computeTotals(invoice.items, invoice.taxRate);
    const paid = amountPaid(invoice.payments);
    let status: (typeof INVOICE_STATUSES)[number] | undefined;
    if (paid >= total && total > 0) status = "PAID";
    else if (paid > 0) status = "PARTIAL";
    if (status && invoice.status !== "VOID") {
      await prisma.invoice.update({ where: { id: invoiceId }, data: { status } });
    }
  }

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/dashboard");
  redirect(`/invoices/${invoiceId}`);
}

export async function deletePaymentAction(invoiceId: string, paymentId: string) {
  await requireRole([...STAFF_ROLES]);
  await prisma.payment.delete({ where: { id: paymentId } });
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/dashboard");
  redirect(`/invoices/${invoiceId}`);
}
