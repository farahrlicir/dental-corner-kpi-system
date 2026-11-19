
import { useState } from "react";
import { Link } from "react-router-dom";
import { Stethoscope } from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function DentistRegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      setError("Please complete all fields.");
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

    // Temporary: backend registration will be connected later.
    console.log({
      fullName,
      email,
      phone,
      password,
      status: "PENDING",
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F8FC] px-4">
        <Card padding="lg" width="100%">
          <div className="mx-auto max-w-md py-6 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Stethoscope size={30} />
            </div>

            <h1 className="text-2xl font-bold text-[#172B4D]">
              Registration submitted!
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Your registration request is awaiting administrator approval.
              You will be able to access your account once it has been approved.
            </p>

            <Link to="/login/dentist" className="mt-7 block">
              <Button block>Back to Login</Button>
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F8FC] px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#245B86] text-white">
            <Stethoscope size={28} />
          </div>

          <h1 className="text-2xl font-bold text-[#172B4D]">
            Dentist Registration
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create your account and request access to the clinic system.
          </p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full name
              </label>
              <Input
                placeholder="Enter your full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>

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

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Phone number
              </label>
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <Input
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Confirm password
              </label>
              <Input
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <Button type="submit" block>
              Submit Registration
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
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
