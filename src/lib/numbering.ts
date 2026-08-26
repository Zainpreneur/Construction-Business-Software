import "server-only";

import { prisma } from "@/lib/prisma";

async function nextNumber(prefix: string, startAt: number, findLatest: () => Promise<string | null>) {
  const latest = await findLatest();
  if (!latest) return `${prefix}-${startAt}`;
  const match = latest.match(/(\d+)$/);
  const n = match ? Number(match[1]) + 1 : startAt;
  return `${prefix}-${n}`;
}

export async function nextEstimateNumber() {
  return nextNumber("EST", 1001, async () => {
    const latest = await prisma.estimate.findFirst({
      orderBy: { createdAt: "desc" },
      select: { number: true },
    });
    return latest?.number ?? null;
  });
}

export async function nextInvoiceNumber() {
  return nextNumber("INV", 2001, async () => {
    const latest = await prisma.invoice.findFirst({
      orderBy: { createdAt: "desc" },
      select: { number: true },
    });
    return latest?.number ?? null;
  });
}
