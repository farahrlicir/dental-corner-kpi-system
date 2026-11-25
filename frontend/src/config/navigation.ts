
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  ClipboardList,
  ChartNoAxesCombined,
  History,
} from "lucide-react";

import type { NavItem } from "../types/navigation";

export const navigationItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["ADMIN", "DENTIST"],
  },
  {
    label: "Dentists",
    path: "/dentists",
    icon: Stethoscope,
    allowedRoles: ["ADMIN"],
  },
  {
    label: "Assistants",
    path: "/assistants",
    icon: Users,
    allowedRoles: ["ADMIN", "DENTIST"],
  },
  {
    label: "KPI Management",
    path: "/kpis",
    icon: ChartNoAxesCombined,
    allowedRoles: ["ADMIN"],
  },
  {
    label: "Evaluations",
    path: "/evaluations",
    icon: ClipboardList,
    allowedRoles: ["DENTIST"],
  },
  {
    label: "Evaluation History",
    path: "/evaluation-history",
    icon: History,
    allowedRoles: ["ADMIN"],
  },
  {
    label: "My Performance",
    path: "/my-performance",
    icon: ChartNoAxesCombined,
    allowedRoles: ["ASSISTANT"],
  },
  {
    label: "Reports",
    path: "/reports",
    icon: ChartNoAxesCombined,
    allowedRoles: ["ADMIN"],
  },
];
