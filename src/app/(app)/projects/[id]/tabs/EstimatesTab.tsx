import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { computeTotals } from "@/lib/money";
import type { ProjectDetail } from "../queries";

export function EstimatesTab({ project }: { project: ProjectDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimates</CardTitle>
        <LinkButton href={`/estimates/new?projectId=${project.id}`} size="sm">
          <Plus className="h-4 w-4" /> New estimate
        </LinkButton>
      </CardHeader>
      <CardContent className="p-0">
        {project.estimates.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No estimates yet" />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {project.estimates.map((estimate) => {
              const { total } = computeTotals(estimate.items, estimate.taxRate);
              return (
                <li key={estimate.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <Link
                      href={`/estimates/${estimate.id}`}
                      className="text-sm font-medium text-foreground hover:text-brand"
                    >
                      {estimate.number}
                    </Link>
                    <p className="text-xs text-muted">Issued {formatDate(estimate.issueDate)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground">{formatCurrency(total)}</span>
                    <StatusBadge status={estimate.status} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
