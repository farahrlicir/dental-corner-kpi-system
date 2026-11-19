
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    // Temporary until the password-reset API is implemented.
    console.log("Password reset requested for:", email);
    setSubmitted(true);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F8FC] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#245B86] text-white">
            <ShieldCheck size={28} />
          </div>

          <h1 className="text-2xl font-bold text-[#172B4D]">
            Forgot Password?
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Don't worry. We'll help you recover your account.
          </p>
        </div>

        <Card padding="lg">
          {submitted ? (
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Mail size={26} />
              </div>

              <h2 className="text-lg font-semibold text-[#172B4D]">
                Check your email
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                If an account exists with that email address, you'll receive
                instructions to reset your password.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email address
                </label>

                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <Button type="submit" block>
                Send Reset Instructions
              </Button>
            </form>
          )}

          <Link
            to="/"
            className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-[#245B86] hover:underline"
          >
            <ArrowLeft size={16} />
            Back to welcome page
          </Link>
        </Card>
      </div>
    </main>
  );
}
