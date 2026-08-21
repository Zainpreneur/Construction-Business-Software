import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { ProjectForm } from "../../ProjectForm";
import { updateProjectAction } from "../../actions";

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={`Edit ${project.name}`} />
      <Card>
        <CardContent>
          <ProjectForm
            action={updateProjectAction.bind(null, id)}
            project={project}
            error={error}
            cancelHref={`/projects/${id}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
