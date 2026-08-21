"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import type { ButtonHTMLAttributes } from "react";

export function SubmitButton({
  children,
  pendingLabel,
  variant,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingLabel?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending} {...props}>
      {pending ? (pendingLabel ?? "Saving…") : children}
    </Button>
  );
}
