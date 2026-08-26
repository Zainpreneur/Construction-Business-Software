import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Input, Label, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { LinkButton } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { updateUserAction } from "../../actions";

const ROLES = ["ADMIN", "MANAGER", "ACCOUNTANT", "EMPLOYEE"] as const;

export default async function EditTeamMemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await requireRole(["ADMIN"]);
  const { id } = await params;
  const { error } = await searchParams;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  const isSelf = user.id === session.userId;

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={`Edit ${user.name}`} description={user.email} />
      <Card>
        <CardContent>
          <form action={updateUserAction.bind(null, id)} className="space-y-4">
            {error && <Alert>{error}</Alert>}
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" required defaultValue={user.name} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <Select id="role" name="role" defaultValue={user.role} disabled={isSelf}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r[0] + r.slice(1).toLowerCase()}
                    </option>
                  ))}
                </Select>
                {isSelf && <input type="hidden" name="role" value={user.role} />}
              </div>
              <div>
                <Label htmlFor="title">Job title</Label>
                <Input id="title" name="title" defaultValue={user.title ?? ""} />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={user.phone ?? ""} />
            </div>
            <div>
              <Label htmlFor="password">Reset password</Label>
              <Input id="password" name="password" type="password" placeholder="Leave blank to keep current password" />
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                name="active"
                defaultChecked={user.active}
                disabled={isSelf}
                className="h-4 w-4 rounded border-border"
              />
              Active
              {isSelf && <input type="hidden" name="active" value="on" />}
            </label>
            <div className="flex items-center gap-2">
              <SubmitButton>Save changes</SubmitButton>
              <LinkButton href="/team" variant="secondary">
                Cancel
              </LinkButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
