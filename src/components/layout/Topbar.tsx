"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import type { Role } from "@/generated/prisma/enums";
import { logoutAction } from "@/lib/actions/session-actions";

export function Topbar({
  name,
  role,
}: {
  name: string;
  role: Role;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
        <button
          type="button"
          className="rounded-md p-2 text-foreground hover:bg-black/[.05] md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden md:block" />
        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <p className="text-sm font-medium text-foreground">{name}</p>
            <p className="text-xs capitalize text-muted">
              {role.toLowerCase()}
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-black/[.03]"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-sidebar p-3 text-sidebar-foreground">
            <div className="mb-2 flex items-center justify-between px-2 py-2">
              <span className="text-base font-semibold text-white">
                BuildRight
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="rounded-md p-1.5 text-sidebar-muted hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {NAV_ITEMS.filter(
              (item) => !item.roles || item.roles.includes(role)
            ).map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                    active
                      ? "bg-white/10 text-white"
                      : "text-sidebar-muted hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
