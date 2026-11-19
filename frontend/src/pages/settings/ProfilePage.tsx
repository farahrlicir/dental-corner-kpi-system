
import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { UserRound, Mail, ShieldCheck, Save } from "lucide-react";
import type { AuthUser } from "../../types/auth";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

function ProfilePage() {
  const { user } = useOutletContext<{ user: AuthUser }>();

  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);

  const roleLabel = user.roles
    .map((role) => role.charAt(0) + role.slice(1).toLowerCase())
    .join(" / ");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);

    // Temporary: connect to the backend later.
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-main">My Profile</h1>
        <p className="mt-1 text-sm text-text-muted">
          View and manage your personal account information.
        </p>
      </div>

      <Card padding="lg">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRound size={30} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-main">
              {fullName}
            </h2>
            <p className="text-sm text-text-muted">{roleLabel}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-text-main">
              Full Name
            </label>
            <div className="relative">
              <UserRound
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setSaved(false);
                }}
                required
                className="w-full rounded-control border border-border bg-surface py-3 pl-10 pr-4 text-sm text-text-main outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-main">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSaved(false);
                }}
                required
                className="w-full rounded-control border border-border bg-surface py-3 pl-10 pr-4 text-sm text-text-main outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-main">
              Account Role
            </label>
            <div className="flex items-center gap-3 rounded-control border border-border bg-background px-4 py-3 text-sm text-text-muted">
              <ShieldCheck size={18} />
              {roleLabel}
              <span className="ml-auto text-xs">Managed by administrator</span>
            </div>
          </div>

          {saved && (
            <p className="text-sm text-green-600">
              Profile changes saved locally. Backend integration is still pending.
            </p>
          )}

          <div className="flex justify-end border-t border-border pt-5">
            <Button type="submit">
              <Save size={16} className="mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default ProfilePage;
