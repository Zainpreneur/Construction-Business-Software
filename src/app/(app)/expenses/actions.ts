"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

const STAFF_ROLES = ["ADMIN", "MANAGER", "ACCOUNTANT"] as const;

const CATEGORIES = [
  "MATERIALS",
  "LABOR",
  "EQUIPMENT",
  "SUBCONTRACTOR",
  "PERMITS",
  "TRAVEL",
  "UTILITIES",
  "OTHER",
] as const;

const expenseSchema = z.object({
  projectId: z.string().trim().min(1, "Project is required"),
  category: z.enum(CATEGORIES),
  vendor: z.string().trim().optional(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  date: z.string().trim().min(1, "Date is required"),
  description: z.string().trim().optional(),
});

function parseExpenseForm(formData: FormData) {
  return expenseSchema.safeParse({
    projectId: formData.get("projectId"),
    category: formData.get("category") || "OTHER",
    vendor: formData.get("vendor") || undefined,
    amount: formData.get("amount"),
    date: formData.get("date"),
    description: formData.get("description") || undefined,
  });
}

function redirectPath(projectId: string) {
  return `/projects/${projectId}?tab=expenses`;
}

export async function createExpenseAction(formData: FormData) {
  await requireRole([...STAFF_ROLES]);
  const parsed = parseExpenseForm(formData);
  const projectId = String(formData.get("projectId") || "");

  if (!parsed.success) {
    const target = projectId ? redirectPath(projectId) : "/expenses/new";
    redirect(`${target}${target.includes("?") ? "&" : "?"}error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  await prisma.expense.create({
    data: {
      projectId: parsed.data.projectId,
      category: parsed.data.category,
      vendor: parsed.data.vendor || null,
      amount: parsed.data.amount,
      date: new Date(parsed.data.date),
      description: parsed.data.description || null,
    },
  });

  revalidatePath("/expenses");
  revalidatePath(`/projects/${parsed.data.projectId}`);
  revalidatePath("/dashboard");
  redirect(redirectPath(parsed.data.projectId));
}

export async function deleteExpenseAction(projectId: string, id: string) {
  await requireRole([...STAFF_ROLES]);
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/expenses");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  redirect(redirectPath(projectId));
}
