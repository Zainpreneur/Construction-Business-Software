"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { parseLineItems } from "@/lib/line-items";
import { nextEstimateNumber, nextInvoiceNumber } from "@/lib/numbering";

const STAFF_ROLES = ["ADMIN", "MANAGER", "ACCOUNTANT"] as const;

const estimateSchema = z.object({
  projectId: z.string().trim().min(1, "Project is required"),
  issueDate: z.string().trim().min(1, "Issue date is required"),
  expiryDate: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  taxRate: z.coerce.number().min(0).max(100).default(0),
});

async function parseAndValidate(formData: FormData, errorPath: string) {
  const parsed = estimateSchema.safeParse({
    projectId: formData.get("projectId"),
    issueDate: formData.get("issueDate"),
    expiryDate: formData.get("expiryDate") || undefined,
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

export async function createEstimateAction(formData: FormData) {
  await requireRole([...STAFF_ROLES]);
  const { data, items } = await parseAndValidate(formData, "/estimates/new");

  const project = await prisma.project.findUnique({ where: { id: data.projectId } });
  if (!project) {
    redirect(`/estimates/new?error=${encodeURIComponent("Project not found")}`);
  }

  const number = await nextEstimateNumber();

  const estimate = await prisma.estimate.create({
    data: {
      number,
      projectId: data.projectId,
      clientId: project.clientId,
      issueDate: new Date(data.issueDate),
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      notes: data.notes || null,
      taxRate: data.taxRate,
      items: {
        create: items.map((item, i) => ({ ...item, sortOrder: i })),
      },
    },
  });

  revalidatePath("/estimates");
  revalidatePath(`/projects/${data.projectId}`);
  redirect(`/estimates/${estimate.id}`);
}

export async function updateEstimateAction(id: string, formData: FormData) {
  await requireRole([...STAFF_ROLES]);
  const { data, items } = await parseAndValidate(formData, `/estimates/${id}/edit`);

  await prisma.$transaction([
    prisma.estimateItem.deleteMany({ where: { estimateId: id } }),
    prisma.estimate.update({
      where: { id },
      data: {
        issueDate: new Date(data.issueDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        notes: data.notes || null,
        taxRate: data.taxRate,
        items: { create: items.map((item, i) => ({ ...item, sortOrder: i })) },
      },
    }),
  ]);

  revalidatePath("/estimates");
  revalidatePath(`/estimates/${id}`);
  redirect(`/estimates/${id}`);
}

const ESTIMATE_STATUSES = ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"] as const;

export async function updateEstimateStatusAction(id: string, formData: FormData) {
  await requireRole([...STAFF_ROLES]);
  const status = formData.get("status");
  if (
    typeof status !== "string" ||
    !ESTIMATE_STATUSES.includes(status as (typeof ESTIMATE_STATUSES)[number])
  ) {
    redirect(`/estimates/${id}?error=${encodeURIComponent("Invalid status")}`);
  }

  const estimate = await prisma.estimate.update({
    where: { id },
    data: { status: status as (typeof ESTIMATE_STATUSES)[number] },
  });
  revalidatePath("/estimates");
  revalidatePath(`/estimates/${id}`);
  revalidatePath(`/projects/${estimate.projectId}`);
  redirect(`/estimates/${id}`);
}

export async function deleteEstimateAction(id: string) {
  await requireRole([...STAFF_ROLES]);
  const estimate = await prisma.estimate.delete({ where: { id } });
  revalidatePath("/estimates");
  revalidatePath(`/projects/${estimate.projectId}`);
  redirect("/estimates");
}

export async function convertEstimateToInvoiceAction(id: string) {
  await requireRole([...STAFF_ROLES]);
  const estimate = await prisma.estimate.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!estimate) redirect("/estimates");

  const number = await nextInvoiceNumber();
  const issueDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const invoice = await prisma.invoice.create({
    data: {
      number,
      projectId: estimate.projectId,
      clientId: estimate.clientId,
      taxRate: estimate.taxRate,
      issueDate,
      dueDate,
      notes: estimate.notes,
      items: {
        create: estimate.items.map((item, i) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          sortOrder: i,
        })),
      },
    },
  });

  revalidatePath("/invoices");
  revalidatePath(`/projects/${estimate.projectId}`);
  redirect(`/invoices/${invoice.id}`);
}
