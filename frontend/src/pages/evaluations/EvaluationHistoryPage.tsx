
import { useEffect, useMemo, useState } from "react";
import { Eye, ClipboardList, Search, X } from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { apiRequest } from "../../services/api";

interface EvaluationItem {
  id: string;
  rating: number;
  score: number | string;
  configurationItem: {
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
  assistant: {
    user: {
      fullName: string;
    };
  };
  configuration: {
    version: number;
  };
  items: EvaluationItem[];
}

interface EvaluationHistoryResponse {
  success: boolean;
  data: Evaluation[];
}

export default function EvaluationHistoryPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [search, setSearch] = useState("");
  const [assistantFilter, setAssistantFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [selectedEvaluation, setSelectedEvaluation] =
    useState<Evaluation | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await apiRequest<EvaluationHistoryResponse>(
            "/evaluations/history"
          );

        setEvaluations(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to retrieve evaluation history."
        );
      } finally {
        setLoading(false);
      }
    };

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

  const months = useMemo(() => {
    return [
      ...new Set(
        evaluations.map((item) =>
          item.submittedAt.slice(0, 7)
        )
      ),
    ].sort((a, b) => b.localeCompare(a));
  }, [evaluations]);

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((evaluation) => {
      const matchesAssistant =
        assistantFilter === "all" ||
        evaluation.assistantId === assistantFilter;

      const matchesMonth =
        monthFilter === "all" ||
        evaluation.submittedAt.startsWith(monthFilter);

      const matchesSearch = evaluation.assistant.user.fullName
        .toLowerCase()
        .includes(search.toLowerCase());

      return (
        matchesAssistant &&
        matchesMonth &&
        matchesSearch
      );
    });
  }, [evaluations, search, assistantFilter, monthFilter]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatMonth = (month: string) =>
    new Date(`${month}-01T00:00:00`).toLocaleDateString(
      "en-GB",
      {
        month: "long",
        year: "numeric",
      }
    );

  const getScore = (evaluation: Evaluation) =>
    Number(evaluation.overallScore);

  const averageScore = filteredEvaluations.length
    ? filteredEvaluations.reduce(
        (sum, item) => sum + getScore(item),
        0
      ) / filteredEvaluations.length
    : null;

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Loading evaluation history...
      </div>
    );
  }

  if (error) {
    return (
      <Card padding="lg">
        <p className="text-sm text-red-600">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Evaluation History
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review submitted assistant evaluations across the clinic.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <ClipboardList size={21} />
            </div>
            <div>
              <p className="text-sm text-slate-500">
                Total Evaluations
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {evaluations.length}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <p className="text-sm text-slate-500">
            Filtered Results
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-800">
            {filteredEvaluations.length}
          </p>
        </Card>

        <Card padding="md">
          <p className="text-sm text-slate-500">
            Average Score
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-800">
            {averageScore !== null
              ? `${averageScore.toFixed(1)}%`
              : "—"}
          </p>
        </Card>
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
              placeholder="Search assistant..."
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
          Submitted Evaluations
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="pb-3 font-medium">Evaluation ID</th>
                <th className="pb-3 font-medium">Assistant</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Final Score</th>
                <th className="pb-3 text-right font-medium">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredEvaluations.map((evaluation) => {
                const score = getScore(evaluation);

                return (
                  <tr
                    key={evaluation.id}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="py-4 font-medium text-slate-700">
                      {evaluation.id.slice(0, 8)}
                    </td>

                    <td className="py-4 text-slate-700">
                      {evaluation.assistant.user.fullName}
                    </td>

                    <td className="py-4 text-slate-500">
                      {formatDate(evaluation.submittedAt)}
                    </td>

                    <td className="py-4">
                      <Badge
                        variant={
                          score >= 90
                            ? "success"
                            : score >= 80
                              ? "info"
                              : "warning"
                        }
                      >
                        {score.toFixed(1)}%
                      </Badge>
                    </td>

                    <td className="py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setSelectedEvaluation(evaluation)
                        }
                      >
                        <Eye size={15} />
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}

              {filteredEvaluations.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-slate-500"
                  >
                    No evaluations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Evaluation details */}
      {selectedEvaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Evaluation Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedEvaluation.id} ·{" "}
                  {selectedEvaluation.assistant.user.fullName}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  KPI Configuration v
                  {selectedEvaluation.configuration.version}
                </p>
              </div>

              <button
                onClick={() => setSelectedEvaluation(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-4">
              <div>
                <p className="text-xs text-slate-500">
                  Submission date
                </p>
                <p className="mt-1 font-medium text-slate-700">
                  {formatDate(selectedEvaluation.submittedAt)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Final score
                </p>
                <p className="mt-1 text-xl font-bold text-blue-700">
                  {getScore(selectedEvaluation).toFixed(1)}%
                </p>
              </div>
            </div>

            <h3 className="mb-3 font-semibold text-slate-800">
              KPI Ratings
            </h3>

            <div className="space-y-3">
              {[...selectedEvaluation.items]
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
                        {Number(
                          item.configurationItem.weight
                        ).toFixed(1)}
                        %
                      </p>
                    </div>

                    <Badge variant="info">
                      {item.rating}/5
                    </Badge>
                  </div>
                ))}
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 p-4">
              <h3 className="mb-2 font-semibold text-slate-800">
                Dentist's Observation
              </h3>
              <p className="whitespace-pre-wrap text-sm text-slate-600">
                {selectedEvaluation.observation ||
                  "No observation was provided."}
              </p>
            </div>

            <div className="mt-5 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedEvaluation(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
