
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  Download,
  TrendingUp,
  Award,
  MessageSquare,
  Users,
  Target,
} from "lucide-react";

import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { apiRequest } from "../../services/api";
import { generateMonthlyReport } from "../../utils/generateMonthlyReport";

type ApiKpiScore = {
  id: string;
  criterionName: string;
  averageWeight: number | string;
  averageScore: number | string;
};

type ApiMonthlyReport = {
  id: string;
  year: number;
  month: number;
  overallScore: number | string | null;
  evaluationCount: number;
  dentistCount: number;
  averageKpiCoverage: number | string | null;
  status: "FINALIZED";
  generationType: "AUTOMATIC";
  kpiScores: ApiKpiScore[];
  observations?: string[];
};

type MonthlyReport = {
  id: string;
  assistant: string;
  month: string;
  evaluationCount: number;
  dentistCount: number;
  averageKpiCoverage: number | null;
  averageScore: number | null;
  status: "FINALIZED";
  kpiScores: {
    name: string;
    score: number;
    weight: number;
  }[];
  observations: string[];
};

const formatMonth = (month: string) =>
  new Date(`${month}-01T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

const getScoreVariant = (score: number) => {
  if (score >= 90) return "success";
  if (score >= 75) return "info";
  if (score >= 60) return "warning";
  return "danger";
};

export default function MyPerformancePage() {
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchReports = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiRequest<{
          success: boolean;
          data: ApiMonthlyReport[];
        }>("/assistant-reports/my-reports");

        if (!active) return;

        const mappedReports: MonthlyReport[] = response.data.map((report) => ({
          id: report.id,
          assistant: "My Performance",
          month: `${report.year}-${String(report.month).padStart(2, "0")}`,
          evaluationCount: report.evaluationCount,
          dentistCount: report.dentistCount,
          averageKpiCoverage:
            report.averageKpiCoverage === null
              ? null
              : Number(report.averageKpiCoverage),
          averageScore:
            report.overallScore === null
              ? null
              : Number(report.overallScore),
          status: report.status,
          kpiScores: report.kpiScores.map((kpi) => ({
            name: kpi.criterionName,
            score: Number(kpi.averageScore),
            weight: Number(kpi.averageWeight),
          })),
          observations: report.observations ?? [],
        }));

        setReports(mappedReports);

        if (mappedReports.length > 0) {
          setSelectedMonth(mappedReports[0].month);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load your performance reports."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchReports();

    return () => {
      active = false;
    };
  }, []);

  const selectedReport = useMemo(
    () => reports.find((report) => report.month === selectedMonth) ?? null,
    [reports, selectedMonth]
  );

  const previousReport = useMemo(() => {
    if (!selectedReport) return null;

    return reports.find(
      (report) => report.month < selectedReport.month
    ) ?? null;
  }, [reports, selectedReport]);

  const scoreDifference =
    selectedReport?.averageScore !== null &&
    selectedReport?.averageScore !== undefined &&
    previousReport?.averageScore !== null &&
    previousReport?.averageScore !== undefined
      ? selectedReport.averageScore - previousReport.averageScore
      : null;

  const downloadReport = () => {
    if (!selectedReport) return;

    generateMonthlyReport({
      id: selectedReport.id,
      assistant: selectedReport.assistant,
      month: selectedReport.month,
      evaluationCount: selectedReport.evaluationCount,
      averageScore: selectedReport.averageScore,
      kpiScores: selectedReport.kpiScores.map((kpi) => ({
        criterionName: kpi.name,
        averageWeight: kpi.weight,
        averageScore: kpi.score,
      })),
      observations: selectedReport.observations,
    });
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Loading your performance reports...
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

  if (reports.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            My Performance
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review your monthly performance and evaluation results.
          </p>
        </div>

        <Card padding="lg">
          <div className="py-8 text-center">
            <ClipboardList
              size={36}
              className="mx-auto mb-3 text-slate-300"
            />
            <h2 className="font-semibold text-slate-700">
              No finalized reports yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Your monthly performance reports will appear here once they
              have been finalized by the administrator.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (!selectedReport) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            My Performance
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review your monthly performance and evaluation results.
          </p>
        </div>

        <Button onClick={downloadReport}>
          <Download size={16} className="mr-2" />
          Download PDF
        </Button>
      </div>

      <Card padding="md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-slate-700">
            <CalendarDays size={18} />
            <span className="font-medium">Select report month</span>
          </div>

          <select
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
          >
            {reports.map((report) => (
              <option key={report.id} value={report.month}>
                {formatMonth(report.month)}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Overall Score</p>
              <p className="mt-2 text-3xl font-bold text-slate-800">
                {selectedReport.averageScore === null
                  ? "N/A"
                  : `${selectedReport.averageScore.toFixed(1)}%`}
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Award size={24} />
            </div>
          </div>
          <div className="mt-3">
            {selectedReport.averageScore !== null ? (
              <Badge variant={getScoreVariant(selectedReport.averageScore)}>
                {selectedReport.averageScore >= 90
                  ? "Excellent"
                  : selectedReport.averageScore >= 75
                    ? "Good"
                    : selectedReport.averageScore >= 60
                      ? "Satisfactory"
                      : "Needs Improvement"}
              </Badge>
            ) : (
              <Badge variant="warning">No score available</Badge>
            )}
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Evaluations Received</p>
              <p className="mt-2 text-3xl font-bold text-slate-800">
                {selectedReport.evaluationCount}
              </p>
            </div>
            <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
              <ClipboardList size={24} />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Approved evaluations this month
          </p>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Evaluating Dentists</p>
              <p className="mt-2 text-3xl font-bold text-slate-800">
                {selectedReport.dentistCount}
              </p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <Users size={24} />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Number of dentists contributing to this report
          </p>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Average KPI Coverage</p>
              <p className="mt-2 text-3xl font-bold text-slate-800">
                {selectedReport.averageKpiCoverage === null
                  ? "N/A"
                  : `${selectedReport.averageKpiCoverage.toFixed(1)}%`}
              </p>
            </div>
            <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
              <Target size={24} />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Average proportion of KPI criteria evaluated
          </p>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Score Change</p>
              <p className="mt-2 text-3xl font-bold text-slate-800">
                {scoreDifference === null
                  ? "—"
                  : `${scoreDifference > 0 ? "+" : ""}${scoreDifference.toFixed(1)}%`}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Compared with the previous available report
          </p>
        </Card>
      </div>

      <Card padding="lg">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800">
            KPI Performance Breakdown
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your performance across the clinic evaluation criteria.
          </p>
        </div>

        {selectedReport.kpiScores.length > 0 ? (
          <div className="space-y-5">
            {selectedReport.kpiScores.map((kpi) => (
              <div key={kpi.name}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    {kpi.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      Weight: {kpi.weight.toFixed(1)}%
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {kpi.score.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(0, kpi.score))}%`,
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
      </Card>

      <Card padding="lg">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquare size={20} className="text-blue-600" />
          <div>
            <h2 className="font-semibold text-slate-800">
              Performance Observations
            </h2>
            <p className="text-sm text-slate-500">
              Consolidated feedback from your evaluations.
            </p>
          </div>
        </div>

        {selectedReport.observations.length > 0 ? (
          <ul className="space-y-3">
            {selectedReport.observations.map((observation, index) => (
              <li
                key={index}
                className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700"
              >
                {observation}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">
            No observations were provided for this month.
          </p>
        )}
      </Card>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <CalendarDays size={14} />
        Report period: {formatMonth(selectedReport.month)}
      </div>
    </div>
  );
}
