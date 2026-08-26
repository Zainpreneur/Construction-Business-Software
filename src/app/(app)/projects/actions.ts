"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

const MANAGE_ROLES = ["ADMIN", "MANAGER"] as const;

const projectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  description: z.string().trim().optional(),
  status: z.enum([
    "LEAD",
    "ESTIMATING",
    "PLANNING",
    "ACTIVE",
    "ON_HOLD",
    "COMPLETED",
    "CANCELLED",
  ]),
  clientId: z.string().trim().min(1, "Client is required"),
  managerId: z.string().trim().optional(),
  address: z.string().trim().optional(),
  budget: z.string().trim().optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
});

function parseProjectForm(formData: FormData) {
  return projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    status: formData.get("status"),
    clientId: formData.get("clientId"),
    managerId: formData.get("managerId") || undefined,
    address: formData.get("address") || undefined,
    budget: formData.get("budget") || undefined,
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
  });
}

function toData(parsed: z.infer<typeof projectSchema>) {
  return {
    name: parsed.name,
    description: parsed.description || null,
    status: parsed.status,
    clientId: parsed.clientId,
    managerId: parsed.managerId || null,
    address: parsed.address || null,
    budget: parsed.budget ? Number(parsed.budget) : null,
    startDate: parsed.startDate ? new Date(parsed.startDate) : null,
    endDate: parsed.endDate ? new Date(parsed.endDate) : null,
  };
}

export async function createProjectAction(formData: FormData) {
  await requireRole([...MANAGE_ROLES]);
  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    redirect(`/projects/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const project = await prisma.project.create({ data: toData(parsed.data) });
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect(`/projects/${project.id}`);
}

export async function updateProjectAction(id: string, formData: FormData) {
  await requireRole([...MANAGE_ROLES]);
  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    redirect(
      `/projects/${id}/edit?error=${encodeURIComponent(parsed.error.issues[0].message)}`
    );
  }

  await prisma.project.update({ where: { id }, data: toData(parsed.data) });
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  revalidatePath("/dashboard");
  redirect(`/projects/${id}`);
}

export async function deleteProjectAction(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.project.delete({ where: { id } });
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect("/projects");
}
