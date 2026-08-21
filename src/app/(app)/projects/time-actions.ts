"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const timeSchema = z.object({
  userId: z.string().trim().min(1, "Team member is required"),
  taskId: z.string().trim().optional(),
  date: z.string().trim().min(1, "Date is required"),
  hours: z.coerce.number().positive("Hours must be greater than 0").max(24),
  notes: z.string().trim().optional(),
  billable: z.string().optional(),
});

export async function createTimeEntryAction(projectId: string, formData: FormData) {
  const session = await requireUser();
  const parsed = timeSchema.safeParse({
    userId: formData.get("userId"),
    taskId: formData.get("taskId") || undefined,
    date: formData.get("date"),
    hours: formData.get("hours"),
    notes: formData.get("notes") || undefined,
    billable: formData.get("billable") || undefined,
  });

  if (!parsed.success) {
    redirect(
      `/projects/${projectId}?tab=time&error=${encodeURIComponent(parsed.error.issues[0].message)}`
    );
  }

  // Employees may only log time against themselves.
  if (session.role === "EMPLOYEE" && parsed.data.userId !== session.userId) {
    redirect(
      `/projects/${projectId}?tab=time&error=${encodeURIComponent("You can only log time for yourself")}`
    );
  }

  await prisma.timeEntry.create({
    data: {
      projectId,
      userId: parsed.data.userId,
      taskId: parsed.data.taskId || null,
      date: new Date(parsed.data.date),
      hours: parsed.data.hours,
      notes: parsed.data.notes || null,
      billable: parsed.data.billable === "on",
    },
  });

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}?tab=time`);
}

export async function deleteTimeEntryAction(projectId: string, id: string) {
  const session = await requireUser();
  if (session.role === "EMPLOYEE") {
    const entry = await prisma.timeEntry.findUnique({ where: { id } });
    if (!entry || entry.userId !== session.userId) {
      redirect(
        `/projects/${projectId}?tab=time&error=${encodeURIComponent("You can only delete your own entries")}`
      );
    }
  }
  await prisma.timeEntry.delete({ where: { id } });
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}?tab=time`);
}
