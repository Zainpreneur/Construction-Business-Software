import Link from "next/link";
import {
  Building2,
  Users,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { ProjectStatusChart } from "@/components/charts/ProjectStatusChart";
import { formatCurrency, formatDate } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "./queries";

export default async function DashboardPage() {
  const session = await requireUser();
  const data = await getDashboardData();

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${session.name.split(" ")[0]}`}
        description="Here's what's happening across your projects today."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active projects"
          value={String(data.activeProjectCount)}
          hint={`${data.totalProjectCount} total`}
          icon={Building2}
          tone="brand"
        />
        <StatCard
          label="Revenue this month"
          value={formatCurrency(data.revenueThisMonth)}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          label="Outstanding invoices"
          value={formatCurrency(data.outstandingTotal)}
          icon={Users}
          tone="info"
        />
        <StatCard
          label="Overdue"
          value={formatCurrency(data.overdueTotal)}
          hint={`${data.overdueCount} invoice${data.overdueCount === 1 ? "" : "s"}`}
          icon={AlertTriangle}
          tone="danger"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue vs. expenses</CardTitle>
            <span className="text-xs text-muted">Last 6 months</span>
          </CardHeader>
          <CardContent>
            <RevenueChart data={data.revenueTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects by status</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectStatusChart data={data.statusChartData} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming &amp; overdue tasks</CardTitle>
            <Link
              href="/projects"
              className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              View projects <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {data.upcomingTasks.length === 0 ? (
              <div className="p-5">
                <EmptyState title="No open tasks" />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {data.upcomingTasks.map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/projects/${task.project.id}`}
                        className="block truncate text-sm font-medium text-foreground hover:text-brand"
                      >
                        {task.title}
                      </Link>
                      <p className="truncate text-xs text-muted">
                        {task.project.name}
                        {task.assignee ? ` · ${task.assignee.name}` : ""}
                        {task.dueDate ? ` · Due ${formatDate(task.dueDate)}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={task.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recently updated projects</CardTitle>
            <Link
              href="/projects"
              className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentProjects.length === 0 ? (
              <div className="p-5">
                <EmptyState title="No projects yet" />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {data.recentProjects.map((project) => (
                  <li key={project.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/projects/${project.id}`}
                        className="block truncate text-sm font-medium text-foreground hover:text-brand"
                      >
                        {project.name}
                      </Link>
                      <p className="truncate text-xs text-muted">
                        {project.client.companyName || project.client.name}
                      </p>
                    </div>
                    <StatusBadge status={project.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
