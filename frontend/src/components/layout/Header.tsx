
import { useState, useRef, useEffect } from "react";
import { Bell, Menu, ChevronDown, UserRound, LockKeyhole, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { AuthUser } from "../../types/auth";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
  user: AuthUser;
  onMenuClick: () => void;
}

function Header({ user, onMenuClick }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const initials = user.fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const roleLabel = user.roles
    .map((role) => role.charAt(0) + role.slice(1).toLowerCase())
    .join(" / ");

  useEffect(() => {

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNavigation = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

 const handleLogout = async () => {
  setMenuOpen(false);

  try {
    await logout();
  } finally {
    navigate("/", { replace: true });
  }
};

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

        <div className="relative border-l border-border pl-3 sm:pl-5" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((previous) => !previous)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-surface-muted"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
              {initials}
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-text-main">
                {user.fullName}
              </p>
              <p className="text-xs text-text-muted">{roleLabel}</p>
            </div>

            <ChevronDown
              size={16}
              className={`hidden text-text-muted transition-transform sm:block ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-3 w-60 overflow-hidden rounded-xl border border-border bg-surface py-2 shadow-lg"
            >
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-text-main">
                  {user.fullName}
                </p>
                <p className="mt-1 truncate text-xs text-text-muted">
                  {user.email}
                </p>
              </div>

              <button
                role="menuitem"
                onClick={() => handleNavigation("/profile")}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-text-main hover:bg-surface-muted"
              >
                <UserRound size={17} />
                My Profile
              </button>

              <button
                role="menuitem"
                onClick={() => handleNavigation("/change-password")}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-text-main hover:bg-surface-muted"
              >
                <LockKeyhole size={17} />
                Change Password
              </button>

              <div className="my-1 border-t border-border" />

              <button
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-danger hover:bg-red-50"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
