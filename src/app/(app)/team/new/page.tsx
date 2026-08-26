import { requireRole } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Input, Label, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { LinkButton } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { createUserAction } from "../actions";

const ROLES = ["ADMIN", "MANAGER", "ACCOUNTANT", "EMPLOYEE"] as const;

export default async function NewTeamMemberPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Add team member" />
      <Card>
        <CardContent>
          <form action={createUserAction} className="space-y-4">
            {error && <Alert>{error}</Alert>}
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" required placeholder="Jordan Blake" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="jordan@buildright.test" />
            </div>
            <div>
              <Label htmlFor="password">Temporary password</Label>
              <Input id="password" name="password" type="password" required minLength={8} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <Select id="role" name="role" defaultValue="EMPLOYEE">
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r[0] + r.slice(1).toLowerCase()}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Job title</Label>
                <Input id="title" name="title" placeholder="Site Foreman" />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" placeholder="Optional" />
            </div>
            <div className="flex items-center gap-2">
              <SubmitButton>Create account</SubmitButton>
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
