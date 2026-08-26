"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";

const ROLES = ["ADMIN", "MANAGER", "EMPLOYEE", "ACCOUNTANT"] as const;

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(ROLES),
  title: z.string().trim().optional(),
  phone: z.string().trim().optional(),
});

export async function createUserAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") || "EMPLOYEE",
    title: formData.get("title") || undefined,
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    redirect(`/team/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    redirect(`/team/new?error=${encodeURIComponent("A user with that email already exists")}`);
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
      title: parsed.data.title || null,
      phone: parsed.data.phone || null,
    },
  });

  revalidatePath("/team");
  redirect("/team");
}

const updateUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  role: z.enum(ROLES),
  title: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  active: z.string().optional(),
  password: z.union([z.string().length(0), z.string().min(8, "Password must be at least 8 characters")]).optional(),
});

export async function updateUserAction(id: string, formData: FormData) {
  const session = await requireRole(["ADMIN"]);
  const parsed = updateUserSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    title: formData.get("title") || undefined,
    phone: formData.get("phone") || undefined,
    active: formData.get("active") || undefined,
    password: formData.get("password") || "",
  });

  if (!parsed.success) {
    redirect(`/team/${id}/edit?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  if (id === session.userId && parsed.data.active !== "on") {
    redirect(`/team/${id}/edit?error=${encodeURIComponent("You cannot deactivate your own account")}`);
  }
  if (id === session.userId && parsed.data.role !== "ADMIN") {
    redirect(`/team/${id}/edit?error=${encodeURIComponent("You cannot change your own role")}`);
  }

  await prisma.user.update({
    where: { id },
    data: {
      name: parsed.data.name,
      role: parsed.data.role,
      title: parsed.data.title || null,
      phone: parsed.data.phone || null,
      active: parsed.data.active === "on",
      ...(parsed.data.password
        ? { passwordHash: await hashPassword(parsed.data.password) }
        : {}),
    },
  });

  revalidatePath("/team");
  redirect("/team");
}
