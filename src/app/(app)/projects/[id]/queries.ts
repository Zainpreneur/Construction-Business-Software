import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const projectDetailInclude = {
  client: true,
  manager: true,
  tasks: {
    include: { assignee: { select: { id: true, name: true } } },
    orderBy: { dueDate: "asc" },
  },
  timeEntries: {
    include: {
      user: { select: { id: true, name: true } },
      task: { select: { id: true, title: true } },
    },
    orderBy: { date: "desc" },
  },
  estimates: { include: { items: true }, orderBy: { createdAt: "desc" } },
  invoices: {
    include: { items: true, payments: true },
    orderBy: { createdAt: "desc" },
  },
  expenses: { orderBy: { date: "desc" } },
  changeOrders: {
    include: { createdBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  },
  documents: {
    select: {
      id: true,
      name: true,
      category: true,
      fileName: true,
      fileType: true,
      fileSize: true,
      createdAt: true,
      uploadedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  },
  equipment: { orderBy: { name: "asc" } },
} satisfies Prisma.ProjectInclude;

export type ProjectDetail = NonNullable<
  Awaited<ReturnType<typeof getProjectDetail>>
>;

export async function getProjectDetail(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: projectDetailInclude,
  });
}
