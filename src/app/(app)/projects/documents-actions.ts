"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

const CATEGORIES = [
  "CONTRACT",
  "PERMIT",
  "BLUEPRINT",
  "PHOTO",
  "INSURANCE",
  "INVOICE",
  "OTHER",
] as const;

export async function uploadDocumentAction(projectId: string, formData: FormData) {
  const session = await requireUser();
  const file = formData.get("file");
  const category = formData.get("category");
  const name = (formData.get("name") as string)?.trim();

  if (!(file instanceof File) || file.size === 0) {
    redirect(
      `/projects/${projectId}?tab=documents&error=${encodeURIComponent("Choose a file to upload")}`
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    redirect(
      `/projects/${projectId}?tab=documents&error=${encodeURIComponent("File is larger than 15 MB")}`
    );
  }

  const categoryValue = CATEGORIES.includes(category as (typeof CATEGORIES)[number])
    ? (category as (typeof CATEGORIES)[number])
    : "OTHER";

  const buffer = Buffer.from(await file.arrayBuffer());

  await prisma.document.create({
    data: {
      projectId,
      name: name || file.name,
      category: categoryValue,
      fileName: file.name,
      fileType: file.type || null,
      fileSize: file.size,
      data: buffer,
      uploadedById: session.userId,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}?tab=documents`);
}

export async function deleteDocumentAction(projectId: string, id: string) {
  await requireUser();
  await prisma.document.delete({ where: { id } });
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}?tab=documents`);
}
