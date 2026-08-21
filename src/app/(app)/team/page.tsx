import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { titleCase } from "@/lib/format";

export default async function TeamPage() {
  await requireRole(["ADMIN"]);

  const users = await prisma.user.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="Team"
        description={`${users.length} team member${users.length === 1 ? "" : "s"}`}
        actions={
          <LinkButton href="/team/new">
            <Plus className="h-4 w-4" /> Add team member
          </LinkButton>
        }
      />

      <Table>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH>Email</TH>
            <TH>Role</TH>
            <TH>Title</TH>
            <TH>Status</TH>
          </TR>
        </THead>
        <TBody>
          {users.map((user) => (
            <TR key={user.id}>
              <TD>
                <Link
                  href={`/team/${user.id}/edit`}
                  className="font-medium text-foreground hover:text-brand"
                >
                  {user.name}
                </Link>
              </TD>
              <TD className="text-muted">{user.email}</TD>
              <TD>
                <Badge tone="brand">{titleCase(user.role)}</Badge>
              </TD>
              <TD className="text-muted">{user.title || "—"}</TD>
              <TD>
                <Badge tone={user.active ? "success" : "neutral"}>
                  {user.active ? "Active" : "Inactive"}
                </Badge>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
