"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HardHat } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import type { Role } from "@/generated/prisma/enums";

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-16 items-center gap-2 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-brand-foreground">
          <HardHat className="h-4.5 w-4.5" />
        </div>
        <span className="text-base font-semibold text-white">BuildRight</span>
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role)).map(
          (item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-sidebar-muted hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          }
        )}
      </nav>
      <div className="px-5 py-4 text-xs text-sidebar-muted">
        BuildRight &copy; {new Date().getFullYear()}
      </div>
    </aside>
  );
}
