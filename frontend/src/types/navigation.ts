
import type { LucideIcon } from "lucide-react";
import type { Role } from "./auth";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  allowedRoles: Role[];
}
