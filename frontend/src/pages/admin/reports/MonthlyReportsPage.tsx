
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileText,
  Download,
  Eye,
  Search,
  X,
  TrendingUp,
  ClipboardList,
  RefreshCw,
} from "lucide-react";

import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import { apiRequest } from "../../../services/api";
import { generateMonthlyReport } from "../../../utils/generateMonthlyReport";

interface KpiScore {
  id: string;
  criterionName: string;
  averageWeight: number | string;
  averageScore: number | string;
}

interface MonthlyReport {
  id: string;
  assistantId: string;
  year: number;
  month: number;
  overallScore: number | string | null;
  evaluationCount: number;
  dentistCount: number;
  averageKpiCoverage: number | string | null;
  generationType: "AUTOMATIC" | "MANUAL";
  status: "DRAFT" | "FINALIZED";
  assistant: {
    user: {
      fullName: string;
    };
  };
  kpiScores: KpiScore[];
  observations: string[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface GenerationResult {
  generated: number;
  updated: number;
  skipped: number;
}

export default function MonthlyReportsPage() {
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [search, setSearch] = useState("");
  const [assistantFilter, setAssistantFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [selectedReport, setSelectedReport] =
    useState<MonthlyReport | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const formatMonth = (month: string) =>
    new Date(`${month}-01T00:00:00`).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });

  const getReportMonth = (report: MonthlyReport) =>
    `${report.year}-${String(report.month).padStart(2, "0")}`;

  const getScore = (score: number | string | null) =>
    score === null ? null : Number(score);

  const statusVariant = (status: string) =>
    status === "FINALIZED" ? "success" : "warning";

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest<ApiResponse<MonthlyReport[]>>(
        "/monthly-reports"
      );

      setReports(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to retrieve monthly reports."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const assistants = useMemo(() => {
    const uniqueAssistants = new Map<string, string>();

    reports.forEach((report) => {
      uniqueAssistants.set(
        report.assistantId,
        report.assistant.user.fullName
      );
    });

    return Array.from(uniqueAssistants, ([id, name]) => ({
      id,
      name,
    }));
  }, [reports]);

  const months = useMemo(
    () =>
      Array.from(
        new Set(reports.map((report) => getReportMonth(report)))
      ).sort((a, b) => b.localeCompare(a)),
    [reports]
  );

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesAssistant =
        assistantFilter === "all" ||
        report.assistantId === assistantFilter;

      const matchesMonth =
        monthFilter === "all" ||
        getReportMonth(report) === monthFilter;

      const matchesSearch = report.assistant.user.fullName
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesAssistant && matchesMonth && matchesSearch;
    });
  }, [reports, search, assistantFilter, monthFilter]);

  const finalizedCount = reports.filter(
    (report) => report.status === "FINALIZED"
  ).length;

  const scoredReports = filteredReports.filter(
    (report) => getScore(report.overallScore) !== null
  );

  const averageScore = scoredReports.length
    ? scoredReports.reduce(
        (sum, report) => sum + Number(report.overallScore),
        0
      ) / scoredReports.length
    : 0;

  const recoverPreviousMonthReports = async () => {
    if (
      !window.confirm(
        "Recover the previous month's automatic reports? Missing reports will be created, existing draft reports will be refreshed, and finalized reports will remain unchanged."
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const response = await apiRequest<
        ApiResponse<GenerationResult>
      >("/monthly-reports/generate-missing", {
        method: "POST",
      });

      setSuccess(
        `Recovery complete: ${response.data.generated} created, ${response.data.updated} updated, ${response.data.skipped} finalized reports skipped.`
      );

      await fetchReports();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to recover monthly reports."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const finalizeReport = async (report: MonthlyReport) => {
    if (
      !window.confirm(
        `Finalize the monthly report for ${report.assistant.user.fullName}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await apiRequest<ApiResponse<MonthlyReport>>(
        "/monthly-reports/finalize",
        {
          method: "POST",
          body: JSON.stringify({ reportId: report.id }),
        }
      );

      setSuccess("Monthly report finalized successfully.");
      setSelectedReport(null);
      await fetchReports();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to finalize monthly report."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const downloadReport = (report: MonthlyReport) => {
    if (report.status !== "FINALIZED") return;

    generateMonthlyReport({
      id: report.id,
      assistant: report.assistant.user.fullName,
      month: getReportMonth(report),
      evaluationCount: report.evaluationCount,
      averageScore: getScore(report.overallScore),
      kpiScores: report.kpiScores.map((score) => ({
        criterionName: score.criterionName,
        averageWeight: Number(score.averageWeight),
        averageScore: Number(score.averageScore),
      })),
      observations: report.observations ?? [],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Monthly Reports
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review and manage monthly assistant performance reports.
          </p>
        </div>

        <Button
          onClick={recoverPreviousMonthReports}
          disabled={actionLoading}
        >
          <RefreshCw
            size={16}
            className={actionLoading ? "animate-spin" : ""}
          />
          Recover Previous Month Reports
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <FileText size={21} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Reports</p>
              <p className="text-2xl font-bold text-slate-800">
                {reports.length}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
              <ClipboardList size={21} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Finalized Reports</p>
              <p className="text-2xl font-bold text-slate-800">
                {finalizedCount}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
              <TrendingUp size={21} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Average Score</p>
              <p className="text-2xl font-bold text-slate-800">
                {averageScore.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

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

      <Card padding="lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">
            Assistant Reports
          </h2>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchReports}
            disabled={loading}
          >
            <RefreshCw size={15} />
            Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="pb-3 font-medium">Report ID</th>
                <th className="pb-3 font-medium">Assistant</th>
                <th className="pb-3 font-medium">Month</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Evaluations</th>
                <th className="pb-3 font-medium">Average Score</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredReports.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-slate-50 last:border-0"
                >
                  <td className="py-4 font-medium text-slate-700">
                    {report.id.slice(0, 8)}
                  </td>
                  <td className="py-4 text-slate-700">
                    {report.assistant.user.fullName}
                  </td>
                  <td className="py-4 text-slate-500">
                    {formatMonth(getReportMonth(report))}
                  </td>
                  <td className="py-4">
                    <Badge
                      variant={
                        report.generationType === "AUTOMATIC"
                          ? "success"
                          : "warning"
                      }
                    >
                      {report.generationType}
                    </Badge>
                  </td>
                  <td className="py-4 text-slate-600">
                    {report.evaluationCount}
                  </td>
                  <td className="py-4 font-semibold text-slate-800">
                    {getScore(report.overallScore) === null
                      ? "N/A"
                      : `${Number(report.overallScore).toFixed(1)}%`}
                  </td>
                  <td className="py-4">
                    <Badge variant={statusVariant(report.status)}>
                      {report.status}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye size={15} />
                        View
                      </Button>

                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={report.status !== "FINALIZED"}
                        onClick={() => downloadReport(report)}
                      >
                        <Download size={15} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && filteredReports.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-10 text-center text-slate-500"
                  >
                    No monthly reports found.
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-10 text-center text-slate-500"
                  >
                    Loading monthly reports...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Monthly Performance Report
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedReport.assistant.user.fullName} ·{" "}
                  {formatMonth(getReportMonth(selectedReport))}
                </p>
                <div className="mt-2">
                  <Badge
                    variant={
                      selectedReport.generationType === "AUTOMATIC"
                        ? "success"
                        : "warning"
                    }
                  >
                    {selectedReport.generationType}
                  </Badge>
                </div>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Close report"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Monthly Score</p>
                <p className="mt-1 text-2xl font-bold text-blue-700">
                  {getScore(selectedReport.overallScore) === null
                    ? "N/A"
                    : `${Number(selectedReport.overallScore).toFixed(1)}%`}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Evaluations</p>
                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {selectedReport.evaluationCount}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Evaluating Dentists</p>
                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {selectedReport.dentistCount}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Average KPI Coverage</p>
                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {selectedReport.averageKpiCoverage === null
                    ? "N/A"
                    : `${Number(selectedReport.averageKpiCoverage).toFixed(1)}%`}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Report Status</p>
                <div className="mt-2">
                  <Badge variant={statusVariant(selectedReport.status)}>
                    {selectedReport.status}
                  </Badge>
                </div>
              </div>
            </div>

            <h3 className="mb-3 font-semibold text-slate-800">
              KPI Performance Breakdown
            </h3>

            {selectedReport.kpiScores.length > 0 ? (
              <div className="space-y-4">
                {selectedReport.kpiScores.map((criterion) => (
                  <div key={criterion.id}>
                    <div className="mb-1 flex justify-between gap-3 text-sm">
                      <span className="text-slate-700">
                        {criterion.criterionName}
                        <span className="ml-1 text-xs text-slate-400">
                          ({Number(criterion.averageWeight).toFixed(1)}%)
                        </span>
                      </span>
                      <span className="font-medium text-slate-800">
                        {Number(criterion.averageScore).toFixed(1)}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, Number(criterion.averageScore))
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No KPI scores are available for this report.
              </p>
            )}

            <div className="mt-6 rounded-lg border border-slate-200 p-4">
              <h3 className="mb-3 font-semibold text-slate-800">
                Consolidated Observations
              </h3>

              {selectedReport.observations?.length > 0 ? (
                <ul className="space-y-2">
                  {selectedReport.observations.map((observation, index) => (
                    <li
                      key={index}
                      className="flex gap-2 text-sm text-slate-600"
                    >
                      <span className="text-blue-600">•</span>
                      {observation}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">
                  No observations were recorded this month.
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              {selectedReport.status === "DRAFT" && (
                <Button
                  disabled={actionLoading}
                  onClick={() => finalizeReport(selectedReport)}
                >
                  Finalize Report
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setSelectedReport(null)}
              >
                Close
              </Button>

              <Button
                disabled={selectedReport.status !== "FINALIZED"}
                onClick={() => downloadReport(selectedReport)}
              >
                <Download size={16} />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
