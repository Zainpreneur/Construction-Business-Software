import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const projects = await prisma.project.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { updatedAt: "desc" },
    include: {
      client: { select: { name: true, companyName: true } },
      manager: { select: { name: true } },
      _count: { select: { tasks: true } },
    },
  });

  const statusFilters = [
    "ACTIVE",
    "PLANNING",
    "ESTIMATING",
    "LEAD",
    "ON_HOLD",
    "COMPLETED",
    "CANCELLED",
  ];

  return (
    <div>
      <PageHeader
        title="Projects"
        description={`${projects.length} project${projects.length === 1 ? "" : "s"}`}
        actions={
          <LinkButton href="/projects/new">
            <Plus className="h-4 w-4" /> New project
          </LinkButton>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/projects"
          className={`rounded-full px-3 py-1 text-xs font-medium ${!status ? "bg-brand text-brand-foreground" : "bg-black/[.05] text-muted hover:bg-black/[.08]"}`}
        >
          All
        </Link>
        {statusFilters.map((s) => (
          <Link
            key={s}
            href={`/projects?status=${s}`}
            className={`rounded-full px-3 py-1 text-xs font-medium ${status === s ? "bg-brand text-brand-foreground" : "bg-black/[.05] text-muted hover:bg-black/[.08]"}`}
          >
            {s
              .toLowerCase()
              .split("_")
              .map((w) => w[0].toUpperCase() + w.slice(1))
              .join(" ")}
          </Link>
        ))}
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Create a project to start tracking tasks, time, and billing."
          action={
            <LinkButton href="/projects/new" size="sm">
              <Plus className="h-4 w-4" /> New project
            </LinkButton>
          }
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Project</TH>
              <TH>Client</TH>
              <TH>Manager</TH>
              <TH>Budget</TH>
              <TH>Target end</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {projects.map((project) => (
              <TR key={project.id}>
                <TD>
                  <Link
                    href={`/projects/${project.id}`}
                    className="font-medium text-foreground hover:text-brand"
                  >
                    {project.name}
                  </Link>
                  <div className="text-xs text-muted">{project._count.tasks} tasks</div>
                </TD>
                <TD className="text-muted">
                  {project.client.companyName || project.client.name}
                </TD>
                <TD className="text-muted">{project.manager?.name || "—"}</TD>
                <TD className="text-muted">
                  {project.budget ? formatCurrency(project.budget) : "—"}
                </TD>
                <TD className="text-muted">{formatDate(project.endDate)}</TD>
                <TD>
                  <StatusBadge status={project.status} />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
