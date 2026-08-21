import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { EstimateForm } from "../EstimateForm";
import { createEstimateAction } from "../actions";

export default async function NewEstimatePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; projectId?: string }>;
}) {
  const { error, projectId } = await searchParams;
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="New estimate" />
      <Card>
        <CardContent>
          <EstimateForm
            action={createEstimateAction}
            error={error}
            cancelHref="/estimates"
            defaultProjectId={projectId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
