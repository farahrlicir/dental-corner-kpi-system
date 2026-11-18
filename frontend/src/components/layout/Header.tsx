
import { Bell, Menu, ChevronDown } from "lucide-react";
import type { AuthUser } from "../../types/auth";

interface HeaderProps {
  user: AuthUser;
  onMenuClick: () => void;
}

function Header({ user, onMenuClick }: HeaderProps) {
  const initials = user.fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const roleLabel = user.roles
    .map((role) => role.charAt(0) + role.slice(1).toLowerCase())
    .join(" / ");

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-border bg-surface px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-text-muted hover:bg-surface-muted lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 className="text-lg font-semibold text-text-main">
            Welcome back
          </h2>
          <p className="hidden text-sm text-text-muted sm:block">
            Here's your clinic overview.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-text-muted hover:bg-surface-muted"
        >
          <Bell size={21} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
        </button>

        <div className="flex items-center gap-2 border-l border-border pl-3 sm:pl-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
            {initials}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-text-main">
              {user.fullName}
            </p>
            <p className="text-xs text-text-muted">
              {roleLabel}
            </p>
          </div>

          <ChevronDown
            size={16}
            className="hidden text-text-muted sm:block"
          />
        </div>
      </div>
    </header>
  );
}

export default Header;
