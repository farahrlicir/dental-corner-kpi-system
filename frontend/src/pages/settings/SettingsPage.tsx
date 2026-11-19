
import { useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  LockKeyhole,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

function SettingsPage() {
  const navigate = useNavigate();

  const [clinicName, setClinicName] = useState("Dental Clinic");
  const [email, setEmail] = useState("contact@clinic.com");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-main">Settings</h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage your clinic information and system preferences.
        </p>
      </div>

      {/* Clinic Information */}
      <Card padding="lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            <Building2 size={22} />
          </div>
          <div>
            <h2 className="font-semibold text-text-main">
              Clinic Information
            </h2>
            <p className="text-sm text-text-muted">
              Update your clinic's basic information.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-text-main">
              Clinic Name
            </label>
            <input
              value={clinicName}
              onChange={(e) => {
                setClinicName(e.target.value);
                setSaved(false);
              }}
              required
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-main">
              Clinic Email
            </label>
            <div className="relative">
              <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSaved(false);
                }}
                required
                className="w-full rounded-lg border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-main">
              Phone Number
            </label>
            <div className="relative">
              <Phone size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setSaved(false);
                }}
                placeholder="Enter clinic phone number"
                className="w-full rounded-lg border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-main">
              Clinic Address
            </label>
            <div className="relative">
              <MapPin size={17} className="absolute left-3 top-3 text-text-muted" />
              <textarea
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setSaved(false);
                }}
                rows={3}
                placeholder="Enter clinic address"
                className="w-full resize-none rounded-lg border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          {saved && (
            <p className="text-sm font-medium text-success">
              Clinic information updated successfully (temporary local update).
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Card>

      {/* Security */}
      <Card padding="lg">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="font-semibold text-text-main">
                Account Security
              </h2>
              <p className="text-sm text-text-muted">
                Manage your account password.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate("/change-password")}
          >
            <LockKeyhole size={16} />
            Change Password
          </Button>
        </div>
      </Card>

      {/* System Information */}
      <Card padding="lg">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            <Info size={22} />
          </div>
          <div>
            <h2 className="font-semibold text-text-main">
              System Information
            </h2>
            <p className="text-sm text-text-muted">
              Application details.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between border-b border-border pb-3">
            <span className="text-text-muted">Application</span>
            <span className="font-medium text-text-main">
              Dental Clinic KPI System
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Version</span>
            <span className="font-medium text-text-main">1.0.0</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default SettingsPage;
