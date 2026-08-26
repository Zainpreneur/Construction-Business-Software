"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

const changeOrderSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  amount: z.coerce.number().refine((n) => !Number.isNaN(n), "Amount is required"),
});

export async function createChangeOrderAction(projectId: string, formData: FormData) {
  const session = await requireRole(["ADMIN", "MANAGER"]);
  const parsed = changeOrderSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    amount: formData.get("amount"),
  });

  if (!parsed.success) {
    redirect(
      `/projects/${projectId}?tab=changeorders&error=${encodeURIComponent(parsed.error.issues[0].message)}`
    );
  }

  await prisma.changeOrder.create({
    data: {
      projectId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      amount: parsed.data.amount,
      createdById: session.userId,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}?tab=changeorders`);
}

export async function updateChangeOrderStatusAction(
  projectId: string,
  id: string,
  status: "APPROVED" | "REJECTED" | "PENDING"
) {
  await requireRole(["ADMIN", "MANAGER"]);
  await prisma.changeOrder.update({ where: { id }, data: { status } });
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}?tab=changeorders`);
}

export async function deleteChangeOrderAction(projectId: string, id: string) {
  await requireRole(["ADMIN", "MANAGER"]);
  await prisma.changeOrder.delete({ where: { id } });
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}?tab=changeorders`);
}
