import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary:
    "bg-brand text-brand-foreground hover:bg-brand/90 focus-visible:outline-brand",
  secondary:
    "bg-white text-foreground border border-border hover:bg-black/[.03] focus-visible:outline-brand",
  ghost: "text-foreground hover:bg-black/[.05] focus-visible:outline-brand",
  danger: "bg-danger text-white hover:bg-danger/90 focus-visible:outline-danger",
};

const sizes = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-base gap-2",
};

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

const base =
  "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  href,
  ...props
}: React.ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
