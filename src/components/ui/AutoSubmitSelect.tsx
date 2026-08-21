"use client";

import type { ReactNode } from "react";

export function AutoSubmitSelect({
  action,
  name,
  defaultValue,
  children,
  className,
}: {
  action: (formData: FormData) => Promise<void>;
  name: string;
  defaultValue: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <form action={action}>
      <select
        name={name}
        defaultValue={defaultValue}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={
          className ??
          "rounded-md border border-border bg-white px-2 py-1 text-xs font-medium text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        }
      >
        {children}
      </select>
    </form>
  );
}
