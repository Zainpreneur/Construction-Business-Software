"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

const MANAGE_ROLES = ["ADMIN", "MANAGER"] as const;

const equipmentSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  type: z.string().trim().optional(),
  serialNumber: z.string().trim().optional(),
  status: z.enum(["AVAILABLE", "IN_USE", "MAINTENANCE", "RETIRED"]),
  purchaseDate: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

function parseForm(formData: FormData) {
  return equipmentSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type") || undefined,
    serialNumber: formData.get("serialNumber") || undefined,
    status: formData.get("status") || "AVAILABLE",
    purchaseDate: formData.get("purchaseDate") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

export async function createEquipmentAction(formData: FormData) {
  await requireRole([...MANAGE_ROLES]);
  const parsed = parseForm(formData);
  if (!parsed.success) {
    redirect(`/equipment/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  await prisma.equipment.create({
    data: {
      name: parsed.data.name,
      type: parsed.data.type || null,
      serialNumber: parsed.data.serialNumber || null,
      status: parsed.data.status,
      purchaseDate: parsed.data.purchaseDate ? new Date(parsed.data.purchaseDate) : null,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/equipment");
  redirect("/equipment");
}

export async function updateEquipmentAction(id: string, formData: FormData) {
  await requireRole([...MANAGE_ROLES]);
  const parsed = parseForm(formData);
  if (!parsed.success) {
    redirect(
      `/equipment/${id}/edit?error=${encodeURIComponent(parsed.error.issues[0].message)}`
    );
  }

  await prisma.equipment.update({
    where: { id },
    data: {
      name: parsed.data.name,
      type: parsed.data.type || null,
      serialNumber: parsed.data.serialNumber || null,
      status: parsed.data.status,
      purchaseDate: parsed.data.purchaseDate ? new Date(parsed.data.purchaseDate) : null,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/equipment");
  redirect("/equipment");
}

export async function deleteEquipmentAction(id: string) {
  await requireRole([...MANAGE_ROLES]);
  await prisma.equipment.delete({ where: { id } });
  revalidatePath("/equipment");
  redirect("/equipment");
}
