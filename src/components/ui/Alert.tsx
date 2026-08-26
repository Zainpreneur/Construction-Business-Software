import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const tones = {
  danger: "bg-danger-soft text-danger border-danger/20",
  success: "bg-success-soft text-success border-success/20",
  info: "bg-info-soft text-info border-info/20",
  warning: "bg-warning-soft text-warning border-warning/20",
};

export function Alert({
  tone = "danger",
  children,
  className,
}: {
  tone?: keyof typeof tones;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border px-3.5 py-2.5 text-sm",
        tones[tone],
        className
      )}
    >
      {children}
    </div>
  );
}
