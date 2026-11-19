
import { useState, type FormEvent } from "react";
import {
  Search,
  Users,
  UserPlus,
  Pencil,
  Power,
  Trash2,
  X,
} from "lucide-react";

import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";

type AssistantStatus = "ACTIVE" | "INACTIVE" | "DELETED";

interface Assistant {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: AssistantStatus;
  createdAt: string;
}

const initialAssistants: Assistant[] = [
  {
    id: "A001",
    name: "Meriem Ali",
    email: "meriem@clinic.com",
    phone: "0550123456",
    status: "ACTIVE",
    createdAt: "2026-09-10",
  },
  {
    id: "A002",
    name: "Nadia Benali",
    email: "nadia@clinic.com",
    phone: "0660123456",
    status: "ACTIVE",
    createdAt: "2026-09-15",
  },
  {
    id: "A003",
    name: "Lina Karim",
    email: "lina@clinic.com",
    phone: "0770123456",
    status: "INACTIVE",
    createdAt: "2026-10-01",
  },
];

function AssistantsPage() {
  const [assistants, setAssistants] = useState(initialAssistants);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingAssistant, setEditingAssistant] =
    useState<Assistant | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<Assistant | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const activeCount = assistants.filter(
    (assistant) => assistant.status === "ACTIVE"
  ).length;

  const inactiveCount = assistants.filter(
    (assistant) => assistant.status === "INACTIVE"
  ).length;

  const deletedCount = assistants.filter(
    (assistant) => assistant.status === "DELETED"
  ).length;

  const filteredAssistants = assistants.filter((assistant) =>
    `${assistant.name} ${assistant.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function openAddForm() {
    setEditingAssistant(null);
    setFormData({ name: "", email: "", phone: "" });
    setFormOpen(true);
  }

  function openEditForm(assistant: Assistant) {
    setEditingAssistant(assistant);
    setFormData({
      name: assistant.name,
      email: assistant.email,
      phone: assistant.phone,
    });
    setFormOpen(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();

    const duplicateEmail = assistants.some(
      (assistant) =>
        assistant.email.toLowerCase() === email &&
        assistant.id !== editingAssistant?.id &&
        assistant.status !== "DELETED"
    );

    if (duplicateEmail) {
      alert("An assistant with this email already exists.");
      return;
    }

    if (editingAssistant) {
      setAssistants((previous) =>
        previous.map((assistant) =>
          assistant.id === editingAssistant.id
            ? { ...assistant, name, email, phone }
            : assistant
        )
      );
    } else {
      const newAssistant: Assistant = {
        id: `A${Date.now()}`,
        name,
        email,
        phone,
        status: "ACTIVE",
        createdAt: new Date().toISOString().slice(0, 10),
      };

      setAssistants((previous) => [...previous, newAssistant]);
    }

    setFormOpen(false);
  }

  function toggleStatus(assistantId: string) {
    setAssistants((previous) =>
      previous.map((assistant) =>
        assistant.id === assistantId
          ? {
              ...assistant,
              status:
                assistant.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
            }
          : assistant
      )
    );
  }

  function confirmDelete() {
    if (!deleteTarget) return;

    setAssistants((previous) =>
      previous.map((assistant) =>
        assistant.id === deleteTarget.id
          ? { ...assistant, status: "DELETED" }
          : assistant
      )
    );

    setDeleteTarget(null);
  }

  function getStatusVariant(status: AssistantStatus) {
    if (status === "ACTIVE") return "success";
    if (status === "INACTIVE") return "neutral";
    return "danger";
  }

  return (
    <div className="space-y-6">

      {/* Heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-main">
            Assistant Management
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Create and manage your clinic assistant accounts.
          </p>
        </div>

        <Button onClick={openAddForm}>
          <UserPlus size={17} />
          Add Assistant
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card padding="md">
          <p className="text-sm text-text-muted">Active Assistants</p>
          <h2 className="mt-2 text-2xl font-bold text-text-main">
            {activeCount}
          </h2>
        </Card>

        <Card padding="md">
          <p className="text-sm text-text-muted">Inactive Assistants</p>
          <h2 className="mt-2 text-2xl font-bold text-text-main">
            {inactiveCount}
          </h2>
        </Card>

        <Card padding="md">
          <p className="text-sm text-text-muted">Archived Accounts</p>
          <h2 className="mt-2 text-2xl font-bold text-text-main">
            {deletedCount}
          </h2>
        </Card>
      </div>

      {/* Assistant directory */}
      <Card padding="lg">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-text-main">
              Assistant Directory
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              All assistant accounts, including archived records.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder="Search assistants..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-control border border-border bg-surface py-2 pl-10 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead>
              <tr className="border-b border-border text-xs text-text-muted">
                <th className="pb-3 font-medium">Assistant</th>
                <th className="pb-3 font-medium">Phone</th>
                <th className="pb-3 font-medium">Joined</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAssistants.map((assistant) => {
                const archived = assistant.status === "DELETED";

                return (
                  <tr
                    key={assistant.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-4">
                      <p className="text-sm font-medium text-text-main">
                        {assistant.name}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        {assistant.email}
                      </p>
                    </td>

                    <td className="py-4 text-sm text-text-muted">
                      {assistant.phone || "—"}
                    </td>

                    <td className="py-4 text-sm text-text-muted">
                      {assistant.createdAt}
                    </td>

                    <td className="py-4">
                      <Badge variant={getStatusVariant(assistant.status)}>
                        {assistant.status}
                      </Badge>
                    </td>

                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        {!archived && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditForm(assistant)}
                            >
                              <Pencil size={14} />
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleStatus(assistant.id)}
                            >
                              <Power size={14} />
                            </Button>

                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => setDeleteTarget(assistant)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredAssistants.length === 0 && (
            <p className="py-8 text-center text-sm text-text-muted">
              No assistants found.
            </p>
          )}
        </div>
      </Card>

      {/* Add / Edit modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card padding="lg" className="w-full max-w-lg">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-main">
                  {editingAssistant ? "Edit Assistant" : "Add Assistant"}
                </h2>
                <p className="mt-1 text-sm text-text-muted">
                  Enter the assistant's account information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-lg p-2 text-text-muted hover:bg-surface-muted"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-main">
                  Full Name
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({ ...formData, name: event.target.value })
                  }
                  placeholder="Enter full name"
                  className="w-full rounded-control border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-text-main">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData({ ...formData, email: event.target.value })
                  }
                  placeholder="assistant@clinic.com"
                  className="w-full rounded-control border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-text-main">
                  Phone Number
                </label>
                <input
                  value={formData.phone}
                  onChange={(event) =>
                    setFormData({ ...formData, phone: event.target.value })
                  }
                  placeholder="Enter phone number"
                  className="w-full rounded-control border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </Button>

                <Button type="submit">
                  {editingAssistant ? "Save Changes" : "Create Assistant"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card padding="lg" className="w-full max-w-md">
            <h2 className="text-lg font-semibold text-text-main">
              Archive Assistant Account?
            </h2>

            <p className="mt-3 text-sm text-text-muted">
              Are you sure you want to archive{" "}
              <strong>{deleteTarget.name}</strong>?
              Their account will no longer be active, but historical
              evaluations and reports will be preserved.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>

              <Button variant="danger" onClick={confirmDelete}>
                Archive Account
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default AssistantsPage;
