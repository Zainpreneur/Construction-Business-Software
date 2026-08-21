import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Mail, Phone, MapPin, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { formatCurrency } from "@/lib/format";
import { deleteClientAction } from "../actions";

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      projects: { orderBy: { createdAt: "desc" } },
      estimates: { orderBy: { createdAt: "desc" }, take: 5 },
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: true, payments: true },
      },
    },
  });

  if (!client) notFound();

  return (
    <div>
      <PageHeader
        title={client.name}
        description={client.companyName ?? undefined}
        actions={
          <>
            <LinkButton href={`/clients/${client.id}/edit`} variant="secondary" size="sm">
              <Pencil className="h-4 w-4" /> Edit
            </LinkButton>
            <DeleteButton
              action={deleteClientAction.bind(null, client.id)}
              confirmMessage={`Delete ${client.name}? This can't be undone.`}
            />
          </>
        }
      />

      {error && (
        <Alert className="mb-4" tone="danger">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <Mail className="h-4 w-4 text-muted" />
              {client.email || "—"}
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Phone className="h-4 w-4 text-muted" />
              {client.phone || "—"}
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <MapPin className="h-4 w-4 text-muted" />
              {client.address || "—"}
            </div>
            {client.notes && (
              <div className="mt-3 border-t border-border pt-3 whitespace-pre-wrap text-muted">
                {client.notes}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Projects ({client.projects.length})</CardTitle>
              <LinkButton href={`/projects/new?clientId=${client.id}`} size="sm" variant="secondary">
                <Plus className="h-4 w-4" /> New project
              </LinkButton>
            </CardHeader>
            <CardContent className="p-0">
              {client.projects.length === 0 ? (
                <div className="p-5">
                  <EmptyState title="No projects yet" />
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {client.projects.map((project) => (
                    <li key={project.id} className="flex items-center justify-between px-5 py-3">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-sm font-medium text-foreground hover:text-brand"
                      >
                        {project.name}
                      </Link>
                      <StatusBadge status={project.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent invoices</CardTitle>
              <Link href="/invoices" className="text-xs font-medium text-brand hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {client.invoices.length === 0 ? (
                <div className="p-5">
                  <EmptyState title="No invoices yet" />
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {client.invoices.map((invoice) => {
                    const total = invoice.items.reduce(
                      (s, i) => s + Number(i.quantity) * Number(i.unitPrice),
                      0
                    );
                    return (
                      <li key={invoice.id} className="flex items-center justify-between px-5 py-3">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-sm font-medium text-foreground hover:text-brand"
                        >
                          {invoice.number}
                        </Link>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted">{formatCurrency(total)}</span>
                          <StatusBadge status={invoice.status} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
