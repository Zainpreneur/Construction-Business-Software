import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { ProjectForm } from "../ProjectForm";
import { createProjectAction } from "../actions";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; clientId?: string }>;
}) {
  const { error, clientId } = await searchParams;
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="New project" />
      <Card>
        <CardContent>
          <ProjectForm
            action={createProjectAction}
            error={error}
            cancelHref="/projects"
            defaultClientId={clientId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
