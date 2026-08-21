"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function DeleteButton({
  action,
  confirmMessage = "Are you sure? This cannot be undone.",
  label = "Delete",
  className,
  size = "sm",
}: {
  action: () => Promise<void>;
  confirmMessage?: string;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="danger"
      size={size}
      disabled={isPending}
      className={cn(className)}
      onClick={() => {
        if (window.confirm(confirmMessage)) {
          startTransition(() => {
            action();
          });
        }
      }}
    >
      {isPending ? "Deleting…" : label}
    </Button>
  );
}
