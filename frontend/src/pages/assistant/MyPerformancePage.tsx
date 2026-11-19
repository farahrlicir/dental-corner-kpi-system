
import { useMemo, useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  Download,
  TrendingUp,
  Award,
  MessageSquare,
} from "lucide-react";

import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { generateMonthlyReport } from "../../utils/generateMonthlyReport";

type KPIResult = {
  name: string;
  score: number;
  weight: number;
};

type MonthlyReport = {
  id: string;
  assistant: string;
  month: string;
  evaluationCount: number;
  averageScore: number;
  status: "FINALIZED" | "DRAFT";
  kpiScores: KPIResult[];
  observations: string[];
};

// Temporary mock data.
// The backend will later return only the logged-in assistant's reports.
const mockReports: MonthlyReport[] = [
  {
    id: "RPT-001",
    assistant: "Sarah Ahmed",
    month: "2026-11",
    evaluationCount: 5,
    averageScore: 92.4,
    status: "FINALIZED",
    kpiScores: [
      { name: "Room Turnover Time", score: 95, weight: 10 },
      { name: "On-Time Seating Rate", score: 90, weight: 8 },
      { name: "Chart Prep Completion", score: 100, weight: 10 },
      { name: "Lab Case Tracking", score: 90, weight: 8 },
      { name: "X-Ray & Image Quality", score: 95, weight: 10 },
      { name: "Post-Op Call Success", score: 90, weight: 9 },
      { name: "Ready-to-Work Punctuality", score: 100, weight: 7 },
      { name: "Uniform & Hygiene Standards", score: 95, weight: 8 },
      { name: "Overtime Management", score: 90, weight: 4 },
      { name: "Emergency & Late Flexibility", score: 85, weight: 6 },
      { name: "In-Chair Waiting Time", score: 90, weight: 8 },
      { name: "Patient Comfort & Tone", score: 95, weight: 12 },
    ],
    observations: [
      "Consistently demonstrates excellent preparation and organization.",
      "Maintains a professional and welcoming attitude with patients.",
    ],
  },
  {
    id: "RPT-002",
    assistant: "Sarah Ahmed",
    month: "2026-10",
    evaluationCount: 6,
    averageScore: 88.2,
    status: "FINALIZED",
    kpiScores: [
      { name: "Room Turnover Time", score: 90, weight: 10 },
      { name: "On-Time Seating Rate", score: 85, weight: 8 },
      { name: "Chart Prep Completion", score: 95, weight: 10 },
      { name: "Lab Case Tracking", score: 85, weight: 8 },
      { name: "X-Ray & Image Quality", score: 90, weight: 10 },
      { name: "Post-Op Call Success", score: 85, weight: 9 },
      { name: "Ready-to-Work Punctuality", score: 90, weight: 7 },
      { name: "Uniform & Hygiene Standards", score: 95, weight: 8 },
      { name: "Overtime Management", score: 85, weight: 4 },
      { name: "Emergency & Late Flexibility", score: 80, weight: 6 },
      { name: "In-Chair Waiting Time", score: 85, weight: 8 },
      { name: "Patient Comfort & Tone", score: 90, weight: 12 },
    ],
    observations: [
      "Good teamwork and patient communication.",
      "Could improve responsiveness during emergency scheduling.",
    ],
  },
];

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
  const [selectedMonth, setSelectedMonth] = useState(mockReports[0].month);

  const reports = useMemo(
    () => mockReports.filter((report) => report.status === "FINALIZED"),
    []
  );

  const selectedReport =
    reports.find((report) => report.month === selectedMonth) ?? reports[0];

  const previousReport = reports.find(
    (report) => report.month < selectedReport.month
  );

  const scoreDifference = previousReport
    ? selectedReport.averageScore - previousReport.averageScore
    : null;

  const downloadReport = () => {
    generateMonthlyReport(selectedReport);
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
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

      {/* Month selector */}
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Overall Score</p>
              <p className="mt-2 text-3xl font-bold text-slate-800">
                {selectedReport.averageScore.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Award size={24} />
            </div>
          </div>
          <div className="mt-3">
            <Badge variant={getScoreVariant(selectedReport.averageScore)}>
              {selectedReport.averageScore >= 90
                ? "Excellent"
                : selectedReport.averageScore >= 75
                  ? "Good"
                  : "Needs Improvement"}
            </Badge>
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
            Total evaluations this month
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

      {/* KPI breakdown */}
      <Card padding="lg">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800">
            KPI Performance Breakdown
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your performance across all clinic evaluation criteria.
          </p>
        </div>

        <div className="space-y-5">
          {selectedReport.kpiScores.map((kpi) => (
            <div key={kpi.name}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-700">
                  {kpi.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    Weight: {kpi.weight}%
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {kpi.score}%
                  </span>
                </div>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${kpi.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Observations */}
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
