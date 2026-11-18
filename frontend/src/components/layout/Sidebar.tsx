
import { NavLink } from "react-router-dom";
import {
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  X,
} from "lucide-react";

import { navigationItems } from "../../config/navigation";
import type { AuthUser } from "../../types/auth";

interface SidebarProps {
  user: AuthUser;
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function Sidebar({
  user,
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const visibleItems = navigationItems.filter((item) =>
    item.allowedRoles.some((role) => user.roles.includes(role))
  );

  return (
    <>
      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          flex flex-col border-r border-border bg-surface
          transition-all duration-300
          ${collapsed ? "w-20" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="flex h-20 items-center justify-between border-b border-border px-5">
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-primary">
                DentalCare
              </h1>
              <p className="text-xs text-text-muted">
                Clinic Management
              </p>
            </div>
          )}

          <button
            onClick={onToggle}
            className="hidden rounded-lg p-2 text-text-muted hover:bg-surface-muted lg:block"
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <PanelLeftOpen size={20} />
            ) : (
              <PanelLeftClose size={20} />
            )}
          </button>

          <button
            onClick={onMobileClose}
            className="rounded-lg p-2 text-text-muted hover:bg-surface-muted lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `
                    flex items-center gap-3 rounded-lg px-3 py-3
                    text-sm font-medium transition-colors
                    ${
                      isActive
                        ? "bg-primary-light text-primary"
                        : "text-text-muted hover:bg-surface-muted hover:text-text-main"
                    }
                    ${collapsed ? "justify-center" : ""}
                  `
                }
              >
                <Icon size={20} strokeWidth={1.8} />

                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-3">
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-text-muted hover:bg-surface-muted"
            title="Logout"
          >
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={onMobileClose}
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
        />
      )}
    </>
  );
}

export default Sidebar;
