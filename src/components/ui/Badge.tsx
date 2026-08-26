import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export type BadgeTone =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-black/[.06] text-foreground",
  brand: "bg-brand-soft text-brand",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}

const statusTones: Record<string, BadgeTone> = {
  // Project
  LEAD: "neutral",
  ESTIMATING: "info",
  PLANNING: "info",
  ACTIVE: "success",
  ON_HOLD: "warning",
  COMPLETED: "brand",
  CANCELLED: "danger",
  // Task
  TODO: "neutral",
  IN_PROGRESS: "info",
  BLOCKED: "danger",
  DONE: "success",
  // Estimate / Invoice
  DRAFT: "neutral",
  SENT: "info",
  ACCEPTED: "success",
  REJECTED: "danger",
  EXPIRED: "warning",
  PARTIAL: "warning",
  PAID: "success",
  OVERDUE: "danger",
  VOID: "neutral",
  // Priority
  LOW: "neutral",
  MEDIUM: "info",
  HIGH: "warning",
  URGENT: "danger",
  // Equipment
  AVAILABLE: "success",
  IN_USE: "info",
  MAINTENANCE: "warning",
  RETIRED: "neutral",
  // Change order
  PENDING: "warning",
  APPROVED: "success",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={statusTones[status] ?? "neutral"}>
      {status
        .toLowerCase()
        .split("_")
        .map((w) => w[0]?.toUpperCase() + w.slice(1))
        .join(" ")}
    </Badge>
  );
}
