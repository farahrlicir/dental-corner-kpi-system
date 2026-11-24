
import { useState } from "react";
import { Link } from "react-router-dom";
import { Stethoscope, Eye, EyeOff } from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { apiRequest } from "../../services/api";

interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    fullName: string;
    email: string;
    status: string;
  };
}

export default function DentistRegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please complete all fields.");
      return;
    }

    if (!/^0\d{9}$/.test(phone.trim())) {
      setError(
        "Enter a valid 10-digit Algerian phone number starting with 0."
      );
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiRequest<RegisterResponse>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password,
          }),
        }
      );

      if (response.success) {
        setSubmitted(true);
      } else {
        setError(response.message || "Registration failed.");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#F5F8FC] px-4 py-8">
        <div className="w-full max-w-md">
          <Card padding="md" className="w-full">
            <div className="py-5 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Stethoscope size={28} />
              </div>

              <h1 className="text-2xl font-bold text-[#172B4D]">
                Registration submitted!
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Your registration request is awaiting administrator
                approval. You will be able to access your account
                once it has been approved.
              </p>

              <Link to="/login/dentist" className="mt-6 block">
                <Button block>Back to Login</Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F5F8FC] px-4 py-8">
      <div className="my-auto w-full max-w-lg">
        <div className="mb-3 text-center">
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-[#245B86] text-white">
            <Stethoscope size={23} />
          </div>

          <h1 className="text-xl font-bold text-[#172B4D]">
            Dentist Registration
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create your account and request access to the clinic system.
          </p>
        </div>

        <Card padding="md">
          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div>
              <label
                htmlFor="fullName"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Full name
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                autoComplete="name"
                maxLength={150}
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                maxLength={255}
                required
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Phone number
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="0550123456"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                autoComplete="tel-national"
                inputMode="numeric"
                maxLength={10}
                pattern="0[0-9]{9}"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  className="pr-10"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Confirm password
              </label>

              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  autoComplete="new-password"
                  className="pr-10"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-2.5 text-sm text-red-600"
              >
                {error}
              </p>
            )}

            <Button type="submit" block disabled={loading}>
              {loading ? "Submitting..." : "Submit Registration"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login/dentist"
              className="font-semibold text-[#245B86] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
