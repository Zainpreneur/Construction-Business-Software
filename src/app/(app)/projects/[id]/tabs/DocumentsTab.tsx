import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, Label, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Badge } from "@/components/ui/Badge";
import { formatDate, titleCase } from "@/lib/format";
import type { ProjectDetail } from "../queries";
import { deleteDocumentAction, uploadDocumentAction } from "../../documents-actions";

const CATEGORIES = [
  "CONTRACT",
  "PERMIT",
  "BLUEPRINT",
  "PHOTO",
  "INSURANCE",
  "INVOICE",
  "OTHER",
] as const;

function formatBytes(size: number | null) {
  if (!size) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsTab({ project }: { project: ProjectDetail }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload document</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={uploadDocumentAction.bind(null, project.id)}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div className="lg:col-span-2">
              <Label htmlFor="file">File</Label>
              <Input id="file" name="file" type="file" required />
            </div>
            <div>
              <Label htmlFor="name">Display name</Label>
              <Input id="name" name="name" placeholder="Defaults to file name" />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select id="category" name="category" defaultValue="OTHER">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {titleCase(c)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-end">
              <SubmitButton pendingLabel="Uploading…">Upload</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      {project.documents.length === 0 ? (
        <EmptyState title="No documents uploaded" />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {project.documents.map((doc) => (
            <li key={doc.id} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <a
                  href={`/documents/${doc.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-start gap-2 text-sm font-medium text-foreground hover:text-brand"
                >
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                  <span className="truncate">{doc.name}</span>
                </a>
                <Badge tone="neutral">{titleCase(doc.category)}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted">
                {formatBytes(doc.fileSize)} · {formatDate(doc.createdAt)}
                {doc.uploadedBy ? ` · ${doc.uploadedBy.name}` : ""}
              </p>
              <div className="mt-3">
                <DeleteButton
                  action={deleteDocumentAction.bind(null, project.id, doc.id)}
                  confirmMessage={`Delete "${doc.name}"?`}
                  size="sm"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
