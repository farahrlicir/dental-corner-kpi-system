
import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  ClipboardList,
  Search,
  X,
  Check,
  Pencil,
  RefreshCw,
} from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { apiRequest } from "../../services/api";

interface Criterion {
  id: string;
  criterionName: string;
  weight: number | string;
  displayOrder: number;
}

interface EvaluationItem {
  id: string;
  rating: number;
  score: number | string;
  configurationItem: {
    id: string;
    criterionName: string;
    weight: number | string;
    displayOrder: number;
  };
}

interface Evaluation {
  id: string;
  assistantId: string;
  overallScore: number | string;
  observation: string | null;
  submittedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  assistant: {
    user: {
      fullName: string;
    };
  };
  dentist: {
    user: {
      fullName: string;
    };
  } | null;
  configuration: {
    version: number;
    criteria?: Criterion[];
  };
  items: EvaluationItem[];
}

interface EvaluationResponse {
  success: boolean;
  data: Evaluation[];
}

interface RatingInput {
  configurationItemId: string;
  rating: number;
}

type Tab = "pending" | "history";

export default function EvaluationHistoryPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [pendingEvaluations, setPendingEvaluations] = useState<Evaluation[]>([]);

  const [activeTab, setActiveTab] = useState<Tab>("pending");

  const [search, setSearch] = useState("");
  const [assistantFilter, setAssistantFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");

  const [selectedEvaluation, setSelectedEvaluation] =
    useState<Evaluation | null>(null);

  const [editing, setEditing] = useState(false);
  const [editRatings, setEditRatings] = useState<Record<string, number>>({});
  const [editObservation, setEditObservation] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      setError("");

      const [historyResponse, pendingResponse] = await Promise.all([
        apiRequest<EvaluationResponse>("/evaluations/history"),
        apiRequest<EvaluationResponse>("/evaluations/admin/pending"),
      ]);

      setEvaluations(historyResponse.data);
      setPendingEvaluations(pendingResponse.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to retrieve evaluations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const assistants = useMemo(() => {
    const uniqueAssistants = new Map<string, string>();

    evaluations.forEach((evaluation) => {
      uniqueAssistants.set(
        evaluation.assistantId,
        evaluation.assistant.user.fullName
      );
    });

    return Array.from(uniqueAssistants, ([id, name]) => ({
      id,
      name,
    }));
  }, [evaluations]);

  const months = useMemo(
    () =>
      [
        ...new Set(
          evaluations.map((item) => item.submittedAt.slice(0, 7))
        ),
      ].sort((a, b) => b.localeCompare(a)),
    [evaluations]
  );

  const filteredEvaluations = useMemo(() => {
    const source =
      activeTab === "pending" ? pendingEvaluations : evaluations;

    return source.filter((evaluation) => {
      const matchesAssistant =
        assistantFilter === "all" ||
        evaluation.assistantId === assistantFilter;

      const matchesMonth =
        monthFilter === "all" ||
        evaluation.submittedAt.startsWith(monthFilter);

      const matchesSearch =
        evaluation.assistant.user.fullName
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (evaluation.dentist?.user.fullName ?? "")
          .toLowerCase()
          .includes(search.toLowerCase());

      return matchesAssistant && matchesMonth && matchesSearch;
    });
  }, [
    activeTab,
    evaluations,
    pendingEvaluations,
    assistantFilter,
    monthFilter,
    search,
  ]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatMonth = (month: string) =>
    new Date(`${month}-01T00:00:00`).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });

  const getScore = (evaluation: Evaluation) =>
    Number(evaluation.overallScore);

  const averageScore = filteredEvaluations.length
    ? filteredEvaluations.reduce(
        (sum, item) => sum + getScore(item),
        0
      ) / filteredEvaluations.length
    : null;

  const openEvaluation = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setEditing(false);
    setActionError("");
    setEditObservation(evaluation.observation ?? "");

    const ratings: Record<string, number> = {};

    evaluation.items.forEach((item) => {
      ratings[item.configurationItem.id] = item.rating;
    });

    setEditRatings(ratings);
  };

  const startEditing = () => {
    if (!selectedEvaluation) return;

    const ratings: Record<string, number> = {};

    selectedEvaluation.items.forEach((item) => {
      ratings[item.configurationItem.id] = item.rating;
    });

    setEditRatings(ratings);
    setEditObservation(selectedEvaluation.observation ?? "");
    setActionError("");
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedEvaluation) return;

    const ratings: RatingInput[] = Object.entries(editRatings)
      .filter(([, rating]) => rating > 0)
      .map(([configurationItemId, rating]) => ({
        configurationItemId,
        rating,
      }));

    if (ratings.length === 0) {
      setActionError("Select at least one KPI criterion.");
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      await apiRequest(
        `/evaluations/${selectedEvaluation.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            ratings,
            observation: editObservation.trim() || null,
          }),
        }
      );

      setEditing(false);
      setSuccessMessage("Evaluation updated successfully.");
      await fetchEvaluations();

      setSelectedEvaluation(null);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to update evaluation."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (evaluationId: string) => {
    if (!window.confirm("Approve this evaluation?")) return;

    try {
      setActionLoading(true);
      setActionError("");

      await apiRequest(`/evaluations/${evaluationId}/approve`, {
        method: "POST",
      });

      setSelectedEvaluation(null);
      setSuccessMessage("Evaluation approved successfully.");
      await fetchEvaluations();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to approve evaluation."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (evaluationId: string) => {
    if (!window.confirm("Reject this evaluation?")) return;

    try {
      setActionLoading(true);
      setActionError("");

      await apiRequest(`/evaluations/${evaluationId}/reject`, {
        method: "POST",
      });

      setSelectedEvaluation(null);
      setSuccessMessage("Evaluation rejected successfully.");
      await fetchEvaluations();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to reject evaluation."
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Loading evaluations...
      </div>
    );
  }

  if (error) {
    return (
      <Card padding="lg">
        <p className="text-sm text-red-600">{error}</p>
        <Button className="mt-4" onClick={fetchEvaluations}>
          <RefreshCw size={15} />
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Evaluation Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review, edit and manage submitted assistant evaluations.
          </p>
        </div>

        <Button variant="outline" onClick={fetchEvaluations}>
          <RefreshCw size={15} />
          Refresh
        </Button>
      </div>

      {successMessage && (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
          <button onClick={() => setSuccessMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
              <ClipboardList size={21} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending Reviews</p>
              <p className="text-2xl font-bold text-slate-800">
                {pendingEvaluations.length}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <p className="text-sm text-slate-500">Total Evaluations</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">
            {evaluations.length}
          </p>
        </Card>

        <Card padding="md">
          <p className="text-sm text-slate-500">Filtered Results</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">
            {filteredEvaluations.length}
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("pending")}
          className={`border-b-2 px-4 py-3 text-sm font-medium ${
            activeTab === "pending"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500"
          }`}
        >
          Pending Reviews ({pendingEvaluations.length})
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`border-b-2 px-4 py-3 text-sm font-medium ${
            activeTab === "history"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500"
          }`}
        >
          Evaluation History
        </button>
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assistant or dentist..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={assistantFilter}
            onChange={(e) => setAssistantFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Assistants</option>
            {assistants.map((assistant) => (
              <option key={assistant.id} value={assistant.id}>
                {assistant.name}
              </option>
            ))}
          </select>

          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Months</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {formatMonth(month)}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Evaluation table */}
      <Card padding="lg">
        <h2 className="mb-4 font-semibold text-slate-800">
          {activeTab === "pending"
            ? "Evaluations Awaiting Approval"
            : "All Submitted Evaluations"}
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="pb-3 font-medium">Assistant</th>
                <th className="pb-3 font-medium">Dentist</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Score</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 text-right font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredEvaluations.map((evaluation) => (
                <tr
                  key={evaluation.id}
                  className="border-b border-slate-50 last:border-0"
                >
                  <td className="py-4 text-slate-700">
                    {evaluation.assistant.user.fullName}
                  </td>

                  <td className="py-4 text-slate-700">
                    {evaluation.dentist?.user.fullName ?? "Unknown"}
                  </td>

                  <td className="py-4 text-slate-500">
                    {formatDate(evaluation.submittedAt)}
                  </td>

                  <td className="py-4">
                    <Badge
                      variant={
                        getScore(evaluation) >= 90
                          ? "success"
                          : getScore(evaluation) >= 80
                            ? "info"
                            : "warning"
                      }
                    >
                      {getScore(evaluation).toFixed(1)}%
                    </Badge>
                  </td>

                  <td className="py-4">
                    <Badge
                      variant={
                        evaluation.status === "APPROVED"
                          ? "success"
                          : evaluation.status === "REJECTED"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {evaluation.status}
                    </Badge>
                  </td>

                  <td className="py-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEvaluation(evaluation)}
                    >
                      <Eye size={15} />
                      Review
                    </Button>
                  </td>
                </tr>
              ))}

              {filteredEvaluations.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-slate-500"
                  >
                    {activeTab === "pending"
                      ? "No evaluations awaiting approval."
                      : "No evaluations found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Evaluation details and editing modal */}
      {selectedEvaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Evaluation Review
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  KPI Configuration v{selectedEvaluation.configuration.version}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedEvaluation(null);
                  setEditing(false);
                  setActionError("");
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Assistant</p>
                <p className="mt-1 font-medium text-slate-700">
                  {selectedEvaluation.assistant.user.fullName}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Evaluated by</p>
                <p className="mt-1 font-medium text-slate-700">
                  {selectedEvaluation.dentist?.user.fullName ?? "Unknown"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Submission date</p>
                <p className="mt-1 font-medium text-slate-700">
                  {formatDate(selectedEvaluation.submittedAt)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Overall score</p>
                <p className="mt-1 text-xl font-bold text-blue-700">
                  {getScore(selectedEvaluation).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">
                KPI Ratings
              </h3>

              {selectedEvaluation.status === "PENDING" && !editing && (
                <Button size="sm" variant="outline" onClick={startEditing}>
                  <Pencil size={15} />
                  Edit
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {editing
                ? (selectedEvaluation.configuration.criteria ?? []).map(
                    (criterion) => {
                      const rating = editRatings[criterion.id] ?? 0;

                      return (
                        <div
                          key={criterion.id}
                          className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {criterion.criterionName}
                            </p>
                            <p className="text-xs text-slate-400">
                              Weight: {Number(criterion.weight).toFixed(1)}%
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <label
                              htmlFor={`rating-${criterion.id}`}
                              className="text-xs text-slate-500"
                            >
                              Rating
                            </label>

                            <select
                              id={`rating-${criterion.id}`}
                              value={rating}
                              onChange={(e) => {
                                const value = Number(e.target.value);

                                setEditRatings((previous) => {
                                  const updated = { ...previous };

                                  if (value === 0) {
                                    delete updated[criterion.id];
                                  } else {
                                    updated[criterion.id] = value;
                                  }

                                  return updated;
                                });
                              }}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            >
                              <option value={0}>Not evaluated</option>
                              {[1, 2, 3, 4, 5].map((value) => (
                                <option key={value} value={value}>
                                  {value}/5
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    }
                  )
                : [...selectedEvaluation.items]
                    .sort(
                      (a, b) =>
                        a.configurationItem.displayOrder -
                        b.configurationItem.displayOrder
                    )
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3"
                      >
                        <div>
                          <p className="text-sm text-slate-700">
                            {item.configurationItem.criterionName}
                          </p>
                          <p className="text-xs text-slate-400">
                            Weight:{" "}
                            {Number(item.configurationItem.weight).toFixed(1)}%
                          </p>
                        </div>

                        <Badge variant="info">{item.rating}/5</Badge>
                      </div>
                    ))}
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 p-4">
              <h3 className="mb-2 font-semibold text-slate-800">
                Dentist's Observation
              </h3>

              {editing ? (
                <textarea
                  value={editObservation}
                  onChange={(e) => setEditObservation(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  placeholder="Add or edit observation..."
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                />
              ) : (
                <p className="whitespace-pre-wrap text-sm text-slate-600">
                  {selectedEvaluation.observation ||
                    "No observation was provided."}
                </p>
              )}
            </div>

            {actionError && (
              <p className="mt-4 text-sm text-red-600">{actionError}</p>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              {editing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setEditing(false)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={handleSaveEdit}
                    disabled={actionLoading}
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedEvaluation(null)}
                  >
                    Close
                  </Button>

                  {selectedEvaluation.status === "PENDING" && (
                    <>
                      <Button
                        color="danger"
                        variant="outline"
                        disabled={actionLoading}
                        onClick={() =>
                          handleReject(selectedEvaluation.id)
                        }
                      >
                        Reject
                      </Button>

                      <Button
                        disabled={actionLoading}
                        onClick={() =>
                          handleApprove(selectedEvaluation.id)
                        }
                      >
                        <Check size={15} />
                        Approve
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
