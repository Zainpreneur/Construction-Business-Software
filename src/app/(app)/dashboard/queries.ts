import "server-only";

import { prisma } from "@/lib/prisma";
import { computeTotals, amountPaid } from "@/lib/money";
import { toNumber } from "@/lib/format";
import type { ProjectStatus } from "@/generated/prisma/enums";

const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  LEAD: "Lead",
  ESTIMATING: "Estimating",
  PLANNING: "Planning",
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function monthKey(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short" });
}

export async function getDashboardData() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    projectStatusCounts,
    activeProjectCount,
    openInvoices,
    payments,
    expenses,
    upcomingTasks,
    recentProjects,
    clientCount,
  ] = await Promise.all([
    prisma.project.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.invoice.findMany({
      where: { status: { in: ["SENT", "PARTIAL", "OVERDUE"] } },
      include: { items: true, payments: true },
    }),
    prisma.payment.findMany({
      where: { paidAt: { gte: sixMonthsAgo } },
      select: { amount: true, paidAt: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: sixMonthsAgo } },
      select: { amount: true, date: true },
    }),
    prisma.task.findMany({
      where: { status: { not: "DONE" } },
      orderBy: [{ dueDate: "asc" }],
      take: 8,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { name: true } },
      },
    }),
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { client: { select: { name: true, companyName: true } } },
    }),
    prisma.client.count(),
  ]);

  const outstandingTotal = openInvoices.reduce((sum, inv) => {
    const { total } = computeTotals(inv.items, inv.taxRate);
    const paid = amountPaid(inv.payments);
    return sum + Math.max(total - paid, 0);
  }, 0);

  const overdueInvoices = openInvoices.filter((inv) => inv.status === "OVERDUE");
  const overdueTotal = overdueInvoices.reduce((sum, inv) => {
    const { total } = computeTotals(inv.items, inv.taxRate);
    const paid = amountPaid(inv.payments);
    return sum + Math.max(total - paid, 0);
  }, 0);

  const revenueThisMonth = payments
    .filter(
      (p) =>
        p.paidAt.getMonth() === now.getMonth() &&
        p.paidAt.getFullYear() === now.getFullYear()
    )
    .reduce((sum, p) => sum + toNumber(p.amount), 0);

  // Build last 6 months trend buckets.
  const months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: monthKey(d) });
  }
  const revenueTrend = months.map(({ key, label }) => {
    const [y, m] = key.split("-").map(Number);
    const revenue = payments
      .filter((p) => p.paidAt.getFullYear() === y && p.paidAt.getMonth() === m)
      .reduce((sum, p) => sum + toNumber(p.amount), 0);
    const expenseTotal = expenses
      .filter((e) => e.date.getFullYear() === y && e.date.getMonth() === m)
      .reduce((sum, e) => sum + toNumber(e.amount), 0);
    return { month: label, revenue, expenses: expenseTotal };
  });

  const statusChartData = Object.entries(PROJECT_STATUS_LABELS).map(
    ([status, label]) => ({
      name: label,
      value:
        projectStatusCounts.find((s) => s.status === status)?._count._all ?? 0,
    })
  );

  return {
    activeProjectCount,
    totalProjectCount: projectStatusCounts.reduce((s, p) => s + p._count._all, 0),
    outstandingTotal,
    overdueTotal,
    overdueCount: overdueInvoices.length,
    revenueThisMonth,
    revenueTrend,
    statusChartData,
    clientCount,
    upcomingTasks,
    recentProjects,
  };
}
