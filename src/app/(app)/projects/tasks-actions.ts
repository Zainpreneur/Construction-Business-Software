"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/auth";

const taskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required"),
  description: z.string().trim().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  assigneeId: z.string().trim().optional(),
  dueDate: z.string().trim().optional(),
});

export async function createTaskAction(projectId: string, formData: FormData) {
  await requireRole(["ADMIN", "MANAGER"]);
  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    priority: formData.get("priority") || "MEDIUM",
    assigneeId: formData.get("assigneeId") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });

  if (!parsed.success) {
    redirect(
      `/projects/${projectId}?tab=tasks&error=${encodeURIComponent(parsed.error.issues[0].message)}`
    );
  }

  await prisma.task.create({
    data: {
      projectId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      priority: parsed.data.priority,
      assigneeId: parsed.data.assigneeId || null,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  redirect(`/projects/${projectId}?tab=tasks`);
}

export async function updateTaskStatusAction(
  projectId: string,
  taskId: string,
  formData: FormData
) {
  const session = await requireUser();
  const status = formData.get("status");
  const allowed = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];
  if (typeof status !== "string" || !allowed.includes(status)) {
    redirect(`/projects/${projectId}?tab=tasks&error=${encodeURIComponent("Invalid status")}`);
  }

  if (session.role === "EMPLOYEE") {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || task.assigneeId !== session.userId) {
      redirect(
        `/projects/${projectId}?tab=tasks&error=${encodeURIComponent("You can only update tasks assigned to you")}`
      );
    }
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { status: status as never },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  redirect(`/projects/${projectId}?tab=tasks`);
}

export async function deleteTaskAction(projectId: string, taskId: string) {
  await requireRole(["ADMIN", "MANAGER"]);
  await prisma.task.delete({ where: { id: taskId } });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  redirect(`/projects/${projectId}?tab=tasks`);
}
