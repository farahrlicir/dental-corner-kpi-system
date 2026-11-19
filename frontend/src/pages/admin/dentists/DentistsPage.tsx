
import { useState } from "react";
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

type DentistStatus = "ACTIVE" | "INACTIVE";

interface Dentist {
  id: string;
  name: string;
  email: string;
  registrationDate: string;
  status: DentistStatus;
}

interface RegistrationRequest {
  id: string;
  name: string;
  email: string;
  registrationDate: string;
}

const initialDentists: Dentist[] = [
  {
    id: "D001",
    name: "Sarah Ahmed",
    email: "sarah@clinic.com",
    registrationDate: "2026-10-12",
    status: "ACTIVE",
  },
  {
    id: "D002",
    name: "Mohamed Karim",
    email: "mohamed@clinic.com",
    registrationDate: "2026-10-15",
    status: "ACTIVE",
  },
  {
    id: "D003",
    name: "Lina Benali",
    email: "lina@clinic.com",
    registrationDate: "2026-10-20",
    status: "INACTIVE",
  },
];

const initialRequests: RegistrationRequest[] = [
  {
    id: "R001",
    name: "Amine Haddad",
    email: "amine@example.com",
    registrationDate: "2026-11-17",
  },
  {
    id: "R002",
    name: "Nadia Mansouri",
    email: "nadia@example.com",
    registrationDate: "2026-11-18",
  },
];

function DentistsPage() {
  const [dentists, setDentists] = useState(initialDentists);
  const [requests, setRequests] = useState(initialRequests);
  const [activeTab, setActiveTab] = useState<"all" | "pending">("all");
  const [search, setSearch] = useState("");

  const activeCount = dentists.filter(
    (dentist) => dentist.status === "ACTIVE"
  ).length;

  const pendingCount = requests.length;

  const filteredDentists = dentists.filter((dentist) =>
    `${dentist.name} ${dentist.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredRequests = requests.filter((request) =>
    `${request.name} ${request.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function approveRequest(request: RegistrationRequest) {
    const newDentist: Dentist = {
      ...request,
      status: "ACTIVE",
    };

    setDentists((previous) => [...previous, newDentist]);
    setRequests((previous) =>
      previous.filter((item) => item.id !== request.id)
    );
  }

  function rejectRequest(requestId: string) {
    setRequests((previous) =>
      previous.filter((item) => item.id !== requestId)
    );
  }

  function toggleDentistStatus(dentistId: string) {
    setDentists((previous) =>
      previous.map((dentist) =>
        dentist.id === dentistId
          ? {
              ...dentist,
              status:
                dentist.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
            }
          : dentist
      )
    );
  }

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-text-main">
          Dentist Management
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Review registration requests and manage dentist accounts.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Total Dentists</p>
              <h2 className="mt-2 text-2xl font-bold text-text-main">
                {dentists.length}
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
                {pendingCount}
              </h2>
            </div>
            <Clock className="text-warning" size={24} />
          </div>
        </Card>
      </div>

      {/* Tabs and search */}
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
              Pending Requests ({pendingCount})
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

        {/* All dentists */}
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
                      {dentist.registrationDate}
                    </td>

                    <td className="py-4">
                      <Badge
                        variant={
                          dentist.status === "ACTIVE"
                            ? "success"
                            : "neutral"
                        }
                      >
                        {dentist.status}
                      </Badge>
                    </td>

                    <td className="py-4 text-right">
                      <Button
                        size="sm"
                        variant={
                          dentist.status === "ACTIVE"
                            ? "outline"
                            : "secondary"
                        }
                        onClick={() =>
                          toggleDentistStatus(dentist.id)
                        }
                      >
                        <Power size={14} />
                        {dentist.status === "ACTIVE"
                          ? "Deactivate"
                          : "Activate"}
                      </Button>
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

        {/* Pending requests */}
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
                    Registered: {request.registrationDate}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => approveRequest(request)}
                  >
                    <Check size={15} />
                    Approve
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => rejectRequest(request.id)}
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
      </Card>
    </div>
  );
}

export default DentistsPage;
