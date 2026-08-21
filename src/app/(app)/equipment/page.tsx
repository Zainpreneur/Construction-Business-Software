import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { formatDate } from "@/lib/format";
import { deleteEquipmentAction } from "./actions";

export default async function EquipmentPage() {
  const session = await requireUser();
  const canManage = session.role === "ADMIN" || session.role === "MANAGER";

  const equipment = await prisma.equipment.findMany({
    orderBy: { name: "asc" },
    include: { project: { select: { id: true, name: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Equipment"
        description={`${equipment.length} item${equipment.length === 1 ? "" : "s"}`}
        actions={
          canManage && (
            <LinkButton href="/equipment/new">
              <Plus className="h-4 w-4" /> Add equipment
            </LinkButton>
          )
        }
      />

      {equipment.length === 0 ? (
        <EmptyState title="No equipment tracked yet" />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Type</TH>
              <TH>Serial #</TH>
              <TH>Assigned project</TH>
              <TH>Purchased</TH>
              <TH>Status</TH>
              {canManage && <TH />}
            </TR>
          </THead>
          <TBody>
            {equipment.map((eq) => (
              <TR key={eq.id}>
                <TD>
                  {canManage ? (
                    <Link
                      href={`/equipment/${eq.id}/edit`}
                      className="font-medium text-foreground hover:text-brand"
                    >
                      {eq.name}
                    </Link>
                  ) : (
                    <span className="font-medium text-foreground">{eq.name}</span>
                  )}
                </TD>
                <TD className="text-muted">{eq.type || "—"}</TD>
                <TD className="text-muted">{eq.serialNumber || "—"}</TD>
                <TD className="text-muted">
                  {eq.project ? (
                    <Link href={`/projects/${eq.project.id}?tab=equipment`} className="hover:text-brand">
                      {eq.project.name}
                    </Link>
                  ) : (
                    "Unassigned"
                  )}
                </TD>
                <TD className="text-muted">{formatDate(eq.purchaseDate)}</TD>
                <TD>
                  <StatusBadge status={eq.status} />
                </TD>
                {canManage && (
                  <TD>
                    <DeleteButton
                      action={deleteEquipmentAction.bind(null, eq.id)}
                      confirmMessage={`Delete "${eq.name}"?`}
                    />
                  </TD>
                )}
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
