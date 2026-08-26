import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { projects: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Clients"
        description={`${clients.length} client${clients.length === 1 ? "" : "s"}`}
        actions={
          <LinkButton href="/clients/new">
            <Plus className="h-4 w-4" /> New client
          </LinkButton>
        }
      />

      {clients.length === 0 ? (
        <EmptyState
          title="No clients yet"
          description="Add your first client to start creating projects and invoices."
          action={
            <LinkButton href="/clients/new" size="sm">
              <Plus className="h-4 w-4" /> New client
            </LinkButton>
          }
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Company</TH>
              <TH>Contact</TH>
              <TH>Projects</TH>
            </TR>
          </THead>
          <TBody>
            {clients.map((client) => (
              <TR key={client.id}>
                <TD>
                  <Link
                    href={`/clients/${client.id}`}
                    className="font-medium text-foreground hover:text-brand"
                  >
                    {client.name}
                  </Link>
                </TD>
                <TD className="text-muted">{client.companyName || "—"}</TD>
                <TD className="text-muted">
                  <div>{client.email || "—"}</div>
                  <div className="text-xs">{client.phone || ""}</div>
                </TD>
                <TD>
                  <span className="inline-flex items-center gap-1.5 text-muted">
                    <Building2 className="h-3.5 w-3.5" />
                    {client._count.projects}
                  </span>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
