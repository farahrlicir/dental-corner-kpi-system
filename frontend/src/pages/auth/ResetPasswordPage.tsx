
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { apiRequest } from "../../services/api";

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password.length > 128) {
      setError("Password must not exceed 128 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiRequest<ResetPasswordResponse>(
        "/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify({ token, password }),
        }
      );

      if (response.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not reset your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F5F8FC] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#245B86] text-white">
            <ShieldCheck size={28} />
          </div>

          <h1 className="text-2xl font-bold text-[#172B4D]">
            Reset Password
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Choose a new password for your account.
          </p>
        </div>

        <Card padding="lg">
          {success ? (
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <LockKeyhole size={26} />
              </div>

              <h2 className="text-lg font-semibold text-[#172B4D]">
                Password Updated!
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Your password has been reset successfully. You can now log in
                using your new password.
              </p>

              <Button
                block
                className="mt-6"
                onClick={() => navigate("/")}
              >
                Back to Login
              </Button>
            </div>
          ) : !token ? (
            <div className="py-4 text-center">
              <p className="text-sm text-red-600">
                This reset link is invalid or missing its token.
              </p>

              <Link
                to="/forgot-password"
                className="mt-5 inline-block text-sm font-medium text-[#245B86] hover:underline"
              >
                Request a new reset link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Input
                  label="New password"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-slate-500 hover:text-slate-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm new password"
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-[38px] text-slate-500 hover:text-slate-700"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
                >
                  {error}
                </p>
              )}

              <Button type="submit" block disabled={loading}>
                {loading ? "Updating..." : "Reset Password"}
              </Button>
            </form>
          )}

          {!success && (
            <Link
              to="/"
              className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-[#245B86] hover:underline"
            >
              <ArrowLeft size={16} />
              Back to welcome page
            </Link>
          )}
        </Card>
      </div>
    </main>
  );
}
