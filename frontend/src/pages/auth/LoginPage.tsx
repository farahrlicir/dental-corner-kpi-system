
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, Stethoscope } from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { apiRequest } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

type Role = "dentist" | "admin" | "assistant";
type ApiRole = "DENTIST" | "ADMIN" | "ASSISTANT";

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    fullName: string;
    email: string;
    roles: ApiRole[];
  };
}

const roleConfig: Record<Role, { title: string; subtitle: string }> = {
  dentist: {
    title: "Dentist Login",
    subtitle: "Access your dental workspace.",
  },
  admin: {
    title: "Administrator Login",
    subtitle: "Manage your clinic operations.",
  },
  assistant: {
    title: "Assistant Login",
    subtitle: "Access your performance dashboard.",
  },
};

const roleMapping: Record<Role, ApiRole> = {
  dentist: "DENTIST",
  admin: "ADMIN",
  assistant: "ASSISTANT",
};

export default function LoginPage() {
  const { role: roleParam } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const role = roleParam as Role;
  const config = roleConfig[role];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!config) {
    return (
      <div className="flex h-dvh items-center justify-center overflow-hidden">
        <p className="text-slate-500">Invalid login page.</p>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const expectedRole = roleMapping[role];

      if (!response.data.roles.includes(expectedRole)) {
        await apiRequest("/auth/logout", { method: "POST" });
        setError("This account does not have access to this workspace.");
        return;
      }

      const authenticatedUser = await refreshUser();

      if (!authenticatedUser) {
        setError("Could not retrieve your account. Please sign in again.");
        return;
      }

      if (!authenticatedUser.roles.includes(expectedRole)) {
        await apiRequest("/auth/logout", { method: "POST" });
        await refreshUser();
        setError("This account does not have access to this workspace.");
        return;
      }

      navigate(
        expectedRole === "ASSISTANT" ? "/my-performance" : "/dashboard",
        { replace: true }
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex h-dvh items-center justify-center overflow-hidden bg-[#F5F8FC] px-4 py-3 sm:py-4">
      <div className="w-full max-w-md">
        <div className={`text-center ${role === "dentist" ? "mb-3 sm:mb-4" : "mb-4 sm:mb-5"}`}>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#245B86] text-white sm:h-14 sm:w-14">
            <Stethoscope size={26} />
          </div>

          <h1 className="text-2xl font-bold text-[#172B4D]">
            {config.title}
          </h1>

          <p className="mt-1.5 text-sm text-slate-500">
            {config.subtitle}
          </p>
        </div>

        <Card padding="md">
          <form
            onSubmit={handleSubmit}
            className={role === "dentist" ? "space-y-3" : "space-y-4"}
          >
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="pl-10"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pl-10 pr-10"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p
                className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
                role="alert"
              >
                {error}
              </p>
            )}

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-[#245B86] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" block disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {role === "dentist" && (
            <p className="mt-4 text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/register/dentist"
                className="font-semibold text-[#245B86] hover:underline"
              >
                Register here
              </Link>
            </p>
          )}
        </Card>

        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-sm text-slate-500 hover:text-[#245B86]"
          >
            Back to role selection
          </Link>
        </div>
      </div>
    </main>
  );
}
