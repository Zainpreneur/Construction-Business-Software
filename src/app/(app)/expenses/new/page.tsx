import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Input, Label, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { LinkButton } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { titleCase } from "@/lib/format";
import { createExpenseAction } from "../actions";

const CATEGORIES = [
  "MATERIALS",
  "LABOR",
  "EQUIPMENT",
  "SUBCONTRACTOR",
  "PERMITS",
  "TRAVEL",
  "UTILITIES",
  "OTHER",
] as const;

export default async function NewExpensePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const projects = await prisma.project.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="New expense" />
      <Card>
        <CardContent>
          <form action={createExpenseAction} className="space-y-4">
            {error && <Alert>{error}</Alert>}
            <div>
              <Label htmlFor="projectId">Project</Label>
              <Select id="projectId" name="projectId" required defaultValue="">
                <option value="" disabled>
                  Select a project
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select id="category" name="category" defaultValue="MATERIALS">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {titleCase(c)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vendor">Vendor</Label>
                <Input id="vendor" name="vendor" placeholder="Optional" />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="Optional" />
            </div>
            <div className="flex items-center gap-2">
              <SubmitButton>Add expense</SubmitButton>
              <LinkButton href="/expenses" variant="secondary">
                Cancel
              </LinkButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
