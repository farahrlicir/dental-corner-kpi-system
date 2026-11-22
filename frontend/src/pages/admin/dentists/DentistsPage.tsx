
import { useEffect, useState } from "react";
import {
  Search,
  UserRound,
  Check,
  X,
  UserCheck,
  Clock,
  Power,
} from "lucide-react";

import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import { apiRequest } from "../../../services/api";

type DentistStatus =
  | "PENDING"
  | "ACTIVE"
  | "INACTIVE"
  | "REJECTED"
  | "DELETED";

interface Dentist {
  id: string;
  name: string;
  email: string;
  registrationDate: string;
  status: DentistStatus;
}

type DentistAction =
  | "APPROVE"
  | "REJECT"
  | "ACTIVATE"
  | "DEACTIVATE";

interface DentistsResponse {
  success: boolean;
  data: Dentist[];
}

interface DentistUpdateResponse {
  success: boolean;
  message: string;
}

function DentistsPage() {
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "pending">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function fetchDentists() {
    try {
      setError("");

      const response = await apiRequest<DentistsResponse>(
        "/dentists"
      );

      setDentists(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load dentists."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDentists();
  }, []);

  const pendingRequests = dentists.filter(
    (dentist) => dentist.status === "PENDING"
  );

  const displayedDentists = dentists.filter(
    (dentist) => dentist.status !== "PENDING"
  );

  const activeCount = dentists.filter(
    (dentist) => dentist.status === "ACTIVE"
  ).length;

  const filteredDentists = displayedDentists.filter((dentist) =>
    `${dentist.name} ${dentist.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredRequests = pendingRequests.filter((request) =>
    `${request.name} ${request.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function updateStatus(
    dentistId: string,
    action: DentistAction
  ) {
    try {
      setBusyId(dentistId);
      setError("");

      await apiRequest<DentistUpdateResponse>(
        `/dentists/${dentistId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ action }),
        }
      );

      await fetchDentists();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update dentist account."
      );
    } finally {
      setBusyId(null);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString();
  }

  function getStatusVariant(status: DentistStatus) {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "PENDING":
        return "warning";
      default:
        return "neutral";
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-main">
          Dentist Management
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Review registration requests and manage dentist accounts.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Total Dentists</p>
              <h2 className="mt-2 text-2xl font-bold text-text-main">
                {displayedDentists.length}
              </h2>
            </div>
            <UserRound className="text-primary" size={24} />
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Active Accounts</p>
              <h2 className="mt-2 text-2xl font-bold text-text-main">
                {activeCount}
              </h2>
            </div>
            <UserCheck className="text-success" size={24} />
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Pending Requests</p>
              <h2 className="mt-2 text-2xl font-bold text-text-main">
                {pendingRequests.length}
              </h2>
            </div>
            <Clock className="text-warning" size={24} />
          </div>
        </Card>
      </div>

      <Card padding="lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={activeTab === "all" ? "primary" : "outline"}
              onClick={() => {
                setActiveTab("all");
                setSearch("");
              }}
            >
              All Dentists
            </Button>

            <Button
              size="sm"
              variant={activeTab === "pending" ? "primary" : "outline"}
              onClick={() => {
                setActiveTab("pending");
                setSearch("");
              }}
            >
              Pending Requests ({pendingRequests.length})
            </Button>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder="Search dentists..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-control border border-border bg-surface py-2 pl-10 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-text-muted">
            Loading dentists...
          </p>
        ) : (
          <>
            {activeTab === "all" && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                  <thead>
                    <tr className="border-b border-border text-xs text-text-muted">
                      <th className="pb-3 font-medium">Dentist</th>
                      <th className="pb-3 font-medium">Registration Date</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 text-right font-medium">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredDentists.map((dentist) => (
                      <tr
                        key={dentist.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="py-4">
                          <p className="text-sm font-medium text-text-main">
                            {dentist.name}
                          </p>
                          <p className="mt-1 text-xs text-text-muted">
                            {dentist.email}
                          </p>
                        </td>

                        <td className="py-4 text-sm text-text-muted">
                          {formatDate(dentist.registrationDate)}
                        </td>

                        <td className="py-4">
                          <Badge variant={getStatusVariant(dentist.status)}>
                            {dentist.status}
                          </Badge>
                        </td>

                        <td className="py-4 text-right">
                          {dentist.status === "ACTIVE" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busyId === dentist.id}
                              onClick={() =>
                                updateStatus(dentist.id, "DEACTIVATE")
                              }
                            >
                              <Power size={14} />
                              Deactivate
                            </Button>
                          )}

                          {dentist.status === "INACTIVE" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={busyId === dentist.id}
                              onClick={() =>
                                updateStatus(dentist.id, "ACTIVATE")
                              }
                            >
                              <Power size={14} />
                              Activate
                            </Button>
                          )}

                          {busyId === dentist.id && (
                            <span className="ml-2 text-xs text-text-muted">
                              Updating...
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredDentists.length === 0 && (
                  <p className="py-8 text-center text-sm text-text-muted">
                    No dentists found.
                  </p>
                )}
              </div>
            )}

            {activeTab === "pending" && (
              <div className="mt-6 space-y-3">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-text-main">
                        {request.name}
                      </p>
                      <p className="mt-1 text-sm text-text-muted">
                        {request.email}
                      </p>
                      <p className="mt-1 text-xs text-text-light">
                        Registered: {formatDate(request.registrationDate)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={busyId === request.id}
                        onClick={() =>
                          updateStatus(request.id, "APPROVE")
                        }
                      >
                        <Check size={15} />
                        Approve
                      </Button>

                      <Button
                        size="sm"
                        variant="danger"
                        disabled={busyId === request.id}
                        onClick={() =>
                          updateStatus(request.id, "REJECT")
                        }
                      >
                        <X size={15} />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredRequests.length === 0 && (
                  <p className="py-8 text-center text-sm text-text-muted">
                    No pending registration requests.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default DentistsPage;
