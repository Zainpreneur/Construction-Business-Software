import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireUser();

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session.role} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar name={session.name} role={session.role} />
        <main className="flex-1 bg-background px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
