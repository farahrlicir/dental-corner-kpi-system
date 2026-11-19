
import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import type { AuthUser } from "../types/auth";

// Temporary mock user.
// Replace with authenticated user data later.
const mockUser: AuthUser = {
  id: "user-001",
  fullName: "Dr. x",
  email: "DR@clinic.com",
  roles: ["ADMIN", "DENTIST"],
};

function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        user={mockUser}
        collapsed={collapsed}
        onToggle={() => setCollapsed((previous) => !previous)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className={`
          min-h-screen transition-all duration-300
          ${collapsed ? "lg:ml-20" : "lg:ml-64"}
        `}
      >
        <Header
          user={mockUser}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet context={{ user: mockUser }} />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
