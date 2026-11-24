
import { useNavigate } from "react-router-dom";
import {
  Stethoscope,
  Settings,
  UserRound,
  ArrowRight,
  Building2,
} from "lucide-react";

const roles = [
  {
    title: "Dentist",
    description: "Manage assistant evaluations.",
    icon: Stethoscope,
    path: "/login/dentist",
    number: "01",
  },
  {
    title: "Administrator",
    description: "Manage staff and clinic performance.",
    icon: Settings,
    path: "/login/admin",
    number: "02",
  },
  {
    title: "Assistant",
    description: "View performance reports.",
    icon: UserRound,
    path: "/login/assistant",
    number: "03",
  },
];

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <main className="h-dvh overflow-hidden bg-blue-50 p-2 sm:p-4 lg:p-6">
      <div className="mx-auto grid h-full w-full max-w-7xl overflow-hidden rounded-xl bg-surface shadow-card sm:rounded-2xl lg:grid-cols-[0.85fr_1.15fr]">

        {/* Left brand panel */}
        <section className="relative flex min-h-0 flex-col justify-between overflow-hidden bg-primary-dark px-5 py-4 text-white sm:px-8 sm:py-6 lg:px-10 lg:py-8 xl:px-14">

          {/* Subtle decoration */}
          <div className="pointer-events-none absolute -right-32 top-24 h-96 w-96 rounded-full border border-white/[0.07]" />
          <div className="pointer-events-none absolute -right-20 top-36 h-72 w-72 rounded-full border border-white/[0.07]" />

          {/* Brand */}
          <div className="relative z-10 flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white ring-1 ring-white/15 sm:h-11 sm:w-11">
              <Building2 size={21} strokeWidth={1.7} />
            </div>

            <div>
              <p className="text-xs font-bold tracking-[0.14em] text-white sm:text-sm">
                DENTAL CORNER
              </p>
              <p className="mt-0.5 text-[8px] font-medium tracking-[0.18em] text-white/70 sm:text-[10px]">
                CLINIC KPI SYSTEM
              </p>
            </div>
          </div>

          {/* Main statement */}
          <div className="relative z-10 my-auto py-4 sm:py-6 lg:py-8">
            <h1 className="max-w-lg text-2xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-[56px]">
              Better care.
              <br />
              Better performance.
            </h1>
          </div>

          {/* Footer */}
          <div className="relative z-10 hidden items-center justify-between border-t border-white/15 pt-4 sm:flex lg:pt-5">
            <span className="text-[9px] font-semibold tracking-[0.15em] text-white/70 sm:text-[10px]">
              CLINICAL WORKSPACE
            </span>
            <Building2 size={16} className="text-white/70" />
          </div>
        </section>

        {/* Right role selection */}
        <section className="flex min-h-0 min-w-0 flex-col justify-center px-4 py-4 sm:px-8 sm:py-6 lg:px-9 xl:px-14">

          <div className="mb-4 sm:mb-6 lg:mb-7">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted sm:text-[11px]">
              Welcome
            </p>

            <h2 className="text-xl font-bold tracking-tight text-text-main sm:text-2xl lg:text-3xl xl:text-4xl">
              Access your workspace
            </h2>

            <p className="mt-1.5 text-xs font-medium leading-5 text-text-muted sm:text-sm sm:leading-6">
              Select your account type to continue.
            </p>
          </div>

          {/* Role cards */}
          <div className="space-y-2 sm:space-y-3">
            {roles.map((role) => {
              const Icon = role.icon;

              return (
                <button
                  key={role.title}
                  type="button"
                  onClick={() => navigate(role.path)}
                  className="group flex w-full min-w-0 items-center gap-2.5 rounded-xl border border-border bg-surface p-3 text-left transition-all duration-200 hover:border-primary/40 hover:bg-surface-muted hover:shadow-card focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:gap-4 sm:p-4 lg:p-4 xl:p-5"
                >
                  <span className="hidden shrink-0 text-xs font-bold tabular-nums text-text-light sm:block">
                    {role.number}
                  </span>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white sm:h-11 sm:w-11 lg:h-12 lg:w-12">
                    <Icon size={21} strokeWidth={1.8} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-text-main sm:text-sm lg:text-base">
                      {role.title}
                    </h3>

                    <p className="mt-0.5 text-[10px] font-medium leading-4 text-text-muted sm:text-xs sm:leading-5 lg:text-sm">
                      {role.description}
                    </p>
                  </div>

                  <ArrowRight
                    size={17}
                    className="shrink-0 text-text-light transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary sm:size-[19px]"
                  />
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 sm:mt-6 sm:pt-4 lg:mt-7 lg:pt-5">
            <p className="text-[9px] font-extrabold text-text-main sm:text-[10px]">
              © {new Date().getFullYear()} Dental Corner Clinic KPI System
            </p>

            <span className="text-[9px] font-semibold text-text-muted sm:text-[10px]">
              Workspace access
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
