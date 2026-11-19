
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, ShieldCheck } from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function ChangePasswordPage() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please complete all fields.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("Your new password must be different from the current password.");
      return;
    }

    // Temporary until the backend password API is connected.
    console.log("Password change requested.");

    setSuccess(true);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#172B4D]">
          Change Password
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Keep your account secure by updating your password.
        </p>
      </div>

      <Card padding="lg">
        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <ShieldCheck size={32} />
            </div>

            <h2 className="text-xl font-semibold text-[#172B4D]">
              Password updated!
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Your password change request was validated locally.
              Backend integration is still pending.
            </p>

            <Button className="mt-6" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
              <LockKeyhole size={20} />
              Use a strong, unique password to protect your account.
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Current password
              </label>
              <Input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                New password
              </label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Confirm new password
              </label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="flex justify-end">
              <Button type="submit">Update Password</Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
