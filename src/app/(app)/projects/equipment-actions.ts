"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function assignEquipmentAction(projectId: string, formData: FormData) {
  await requireRole(["ADMIN", "MANAGER"]);
  const equipmentId = formData.get("equipmentId");
  if (typeof equipmentId !== "string" || !equipmentId) {
    redirect(`/projects/${projectId}?tab=equipment`);
  }

  await prisma.equipment.update({
    where: { id: equipmentId },
    data: { projectId, status: "IN_USE" },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/equipment");
  redirect(`/projects/${projectId}?tab=equipment`);
}

export async function unassignEquipmentAction(projectId: string, equipmentId: string) {
  await requireRole(["ADMIN", "MANAGER"]);
  await prisma.equipment.update({
    where: { id: equipmentId },
    data: { projectId: null, status: "AVAILABLE" },
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/equipment");
  redirect(`/projects/${projectId}?tab=equipment`);
}
