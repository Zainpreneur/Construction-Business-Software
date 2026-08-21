import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Alert } from "@/components/ui/Alert";
import { cn } from "@/lib/utils";
import { deleteProjectAction } from "../actions";
import { getProjectDetail } from "./queries";
import { OverviewTab } from "./tabs/OverviewTab";
import { TasksTab } from "./tabs/TasksTab";
import { TimeTab } from "./tabs/TimeTab";
import { EstimatesTab } from "./tabs/EstimatesTab";
import { InvoicesTab } from "./tabs/InvoicesTab";
import { ExpensesTab } from "./tabs/ExpensesTab";
import { ChangeOrdersTab } from "./tabs/ChangeOrdersTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import { EquipmentTab } from "./tabs/EquipmentTab";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "tasks", label: "Tasks" },
  { key: "time", label: "Time" },
  { key: "estimates", label: "Estimates" },
  { key: "invoices", label: "Invoices" },
  { key: "expenses", label: "Expenses" },
  { key: "changeorders", label: "Change Orders" },
  { key: "documents", label: "Documents" },
  { key: "equipment", label: "Equipment" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  const { id } = await params;
  const { tab, error } = await searchParams;
  const session = await requireUser();
  const activeTab: TabKey = TABS.some((t) => t.key === tab) ? (tab as TabKey) : "overview";

  const [project, users, unassignedEquipment] = await Promise.all([
    getProjectDetail(id),
    prisma.user.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, role: true },
    }),
    prisma.equipment.findMany({
      where: { projectId: null },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!project) notFound();

  const canManage = session.role === "ADMIN" || session.role === "MANAGER";

  return (
    <div>
      <PageHeader
        title={project.name}
        description={project.client.companyName || project.client.name}
        actions={
          <>
            <StatusBadge status={project.status} />
            {canManage && (
              <>
                <LinkButton href={`/projects/${project.id}/edit`} variant="secondary" size="sm">
                  <Pencil className="h-4 w-4" /> Edit
                </LinkButton>
                {session.role === "ADMIN" && (
                  <DeleteButton
                    action={deleteProjectAction.bind(null, project.id)}
                    confirmMessage={`Delete ${project.name}? This removes all related tasks, invoices, and records.`}
                  />
                )}
              </>
            )}
          </>
        }
      />

      {error && (
        <Alert className="mb-4" tone="danger">
          {error}
        </Alert>
      )}

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/projects/${project.id}?tab=${t.key}`}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium",
              activeTab === t.key
                ? "border-brand text-brand"
                : "border-transparent text-muted hover:text-foreground"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {activeTab === "overview" && <OverviewTab project={project} />}
      {activeTab === "tasks" && (
        <TasksTab project={project} users={users} session={session} />
      )}
      {activeTab === "time" && <TimeTab project={project} users={users} session={session} />}
      {activeTab === "estimates" && <EstimatesTab project={project} />}
      {activeTab === "invoices" && <InvoicesTab project={project} />}
      {activeTab === "expenses" && <ExpensesTab project={project} canManage={canManage} />}
      {activeTab === "changeorders" && (
        <ChangeOrdersTab project={project} canManage={canManage} />
      )}
      {activeTab === "documents" && <DocumentsTab project={project} />}
      {activeTab === "equipment" && (
        <EquipmentTab
          project={project}
          unassignedEquipment={unassignedEquipment}
          canManage={canManage}
        />
      )}
    </div>
  );
}
