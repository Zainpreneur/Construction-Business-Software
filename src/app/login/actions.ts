"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  next: z.string().optional(),
});

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });

  const nextPath =
    typeof formData.get("next") === "string" && formData.get("next")
      ? String(formData.get("next"))
      : "/dashboard";

  if (!parsed.success) {
    redirect(
      `/login?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid input")}&next=${encodeURIComponent(nextPath)}`
    );
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    redirect(
      `/login?error=${encodeURIComponent("Invalid email or password")}&next=${encodeURIComponent(nextPath)}`
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    redirect(
      `/login?error=${encodeURIComponent("Invalid email or password")}&next=${encodeURIComponent(nextPath)}`
    );
  }

  await createSession({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  redirect(nextPath.startsWith("/") ? nextPath : "/dashboard");
}
