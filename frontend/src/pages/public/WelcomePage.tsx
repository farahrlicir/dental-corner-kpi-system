
import { useNavigate } from "react-router-dom";
import {
  Stethoscope,
  ShieldCheck,
  Users,
  ArrowRight,
} from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const roles = [
  {
    title: "Dentist",
    description: "Access your workspace and manage assistant evaluations.",
    icon: Stethoscope,
    path: "/login/dentist",
  },
  {
    title: "Administrator",
    description: "Manage clinic operations, staff, and performance reports.",
    icon: ShieldCheck,
    path: "/login/admin",
  },
  {
    title: "Assistant",
    description: "View your performance and monthly evaluation reports.",
    icon: Users,
    path: "/login/assistant",
  },
];

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#F5F8FC] px-5 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Brand */}
        <header className="mb-16 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#245B86] text-white shadow-lg shadow-blue-900/15">
            <Stethoscope size={32} />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#172B4D] sm:text-4xl">
            Dental Clinic Performance System
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            A smarter way to manage clinic performance, staff evaluations,
            and professional development.
          </p>
        </header>

        {/* Role selection */}
        <section>
          <div className="mb-8 text-center">
            <h2 className="text-xl font-semibold text-[#172B4D]">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Select your role to continue.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {roles.map((role) => {
              const Icon = role.icon;

              return (
                <Card
                  key={role.title}
                  padding="lg"
                >
                  <button
                    type="button"
                    onClick={() => navigate(role.path)}
                    className="group flex h-full w-full flex-col items-center text-center"
                  >
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-[#245B86] transition duration-300 group-hover:scale-110 group-hover:bg-[#245B86] group-hover:text-white">
                      <Icon size={36} strokeWidth={1.7} />
                    </div>

                    <h3 className="text-lg font-semibold text-[#172B4D]">
                      {role.title}
                    </h3>

                    <p className="mt-3 min-h-12 text-sm leading-6 text-slate-500">
                      {role.description}
                    </p>

                    <div className="mt-7 flex items-center gap-2 font-medium text-[#245B86]">
                      Continue
                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </button>
                </Card>
              );
            })}
          </div>
        </section>

        <footer className="mt-20 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Dental Clinic Performance System.
          All rights reserved.
        </footer>
      </div>
    </main>
  );
}
