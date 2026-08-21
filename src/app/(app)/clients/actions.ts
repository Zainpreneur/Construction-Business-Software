"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

const STAFF_ROLES = ["ADMIN", "MANAGER", "ACCOUNTANT"] as const;

const clientSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  companyName: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: "Enter a valid email",
    }),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

function parseClientForm(formData: FormData) {
  return clientSchema.safeParse({
    name: formData.get("name"),
    companyName: formData.get("companyName") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

export async function createClientAction(formData: FormData) {
  await requireRole([...STAFF_ROLES]);
  const parsed = parseClientForm(formData);
  if (!parsed.success) {
    redirect(`/clients/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const client = await prisma.client.create({ data: parsed.data });
  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

export async function updateClientAction(id: string, formData: FormData) {
  await requireRole([...STAFF_ROLES]);
  const parsed = parseClientForm(formData);
  if (!parsed.success) {
    redirect(
      `/clients/${id}/edit?error=${encodeURIComponent(parsed.error.issues[0].message)}`
    );
  }

  await prisma.client.update({ where: { id }, data: parsed.data });
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}

export async function deleteClientAction(id: string) {
  await requireRole(["ADMIN", "MANAGER"]);
  const projectCount = await prisma.project.count({ where: { clientId: id } });
  if (projectCount > 0) {
    redirect(
      `/clients/${id}?error=${encodeURIComponent(
        "Cannot delete a client with existing projects. Delete or reassign their projects first."
      )}`
    );
  }
  await prisma.client.delete({ where: { id } });
  revalidatePath("/clients");
  redirect("/clients");
}
