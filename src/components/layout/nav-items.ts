import type { Role } from "@/generated/prisma/enums";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Receipt,
  Wallet,
  Clock,
  Wrench,
  UserCog,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: Role[]; // undefined = all roles
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: Building2 },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/estimates", label: "Estimates", icon: FileText },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/expenses", label: "Expenses", icon: Wallet },
  { href: "/time", label: "Time Tracking", icon: Clock },
  { href: "/equipment", label: "Equipment", icon: Wrench },
  { href: "/team", label: "Team", icon: UserCog, roles: ["ADMIN"] },
];
