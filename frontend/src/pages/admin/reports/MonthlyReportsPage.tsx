
import { useMemo, useState } from "react";
import {
  FileText,
  Download,
  Eye,
  Search,
  X,
  TrendingUp,
  ClipboardList,
} from "lucide-react";

import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import { generateMonthlyReport } from "../../../utils/generateMonthlyReport";

const criteria = [
  { id: "1", name: "Room Turnover Time", weight: 10 },
  { id: "2", name: "On-Time Seating Rate", weight: 8 },
  { id: "3", name: "Chart Prep Completion", weight: 10 },
  { id: "4", name: "Lab Case Tracking", weight: 8 },
  { id: "5", name: "X-Ray & Image Quality", weight: 10 },
  { id: "6", name: "Post-Op Call Success", weight: 9 },
  { id: "7", name: "Ready-to-Work Punctuality", weight: 7 },
  { id: "8", name: "Uniform & Hygiene Standards", weight: 8 },
  { id: "9", name: "Overtime Management", weight: 4 },
  { id: "10", name: "Emergency & Late Flexibility", weight: 6 },
  { id: "11", name: "In-Chair Waiting Time", weight: 8 },
  { id: "12", name: "Patient Comfort & Tone", weight: 12 },
];

const reports = [
  {
    id: "RPT-001",
    assistantId: "1",
    assistant: "Sarah Ahmed",
    month: "2026-11",
    evaluationCount: 5,
    averageScore: 92.4,
    status: "FINALIZED",
    kpiScores: [95, 90, 95, 85, 95, 90, 95, 100, 85, 95, 90, 95],
    observations: [
      "Handled an emergency appointment efficiently.",
      "Excellent teamwork and patient communication.",
      "Maintained high hygiene standards.",
    ],
  },
  {
    id: "RPT-002",
    assistantId: "2",
    assistant: "Amine Benali",
    month: "2026-11",
    evaluationCount: 4,
    averageScore: 84.6,
    status: "DRAFT",
    kpiScores: [80, 85, 85, 80, 95, 85, 80, 95, 80, 85, 75, 95],
    observations: [
      "Room preparation could be more consistent.",
      "Good patient interaction overall.",
    ],
  },
  {
    id: "RPT-003",
    assistantId: "3",
    assistant: "Lina Mansouri",
    month: "2026-10",
    evaluationCount: 6,
    averageScore: 78.5,
    status: "FINALIZED",
    kpiScores: [75, 80, 80, 75, 85, 80, 75, 95, 80, 75, 80, 85],
    observations: [
      "Should improve room preparation time.",
      "Good hygiene and patient comfort.",
    ],
  },
];

type MonthlyReport = (typeof reports)[number];

export default function MonthlyReportsPage() {
  const [search, setSearch] = useState("");
  const [assistantFilter, setAssistantFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [selectedReport, setSelectedReport] =
    useState<MonthlyReport | null>(null);

  const assistants = [
    { id: "1", name: "Sarah Ahmed" },
    { id: "2", name: "Amine Benali" },
    { id: "3", name: "Lina Mansouri" },
  ];

  const months = [...new Set(reports.map((report) => report.month))];

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesAssistant =
        assistantFilter === "all" ||
        report.assistantId === assistantFilter;

      const matchesMonth =
        monthFilter === "all" || report.month === monthFilter;

      const matchesSearch = report.assistant
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesAssistant && matchesMonth && matchesSearch;
    });
  }, [search, assistantFilter, monthFilter]);

  const averageScore = filteredReports.length
    ? filteredReports.reduce(
        (sum, report) => sum + report.averageScore,
        0
      ) / filteredReports.length
    : 0;

  const formatMonth = (month: string) =>
    new Date(`${month}-01T00:00:00`).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });

  const statusVariant = (status: string) =>
    status === "FINALIZED" ? "success" : "warning";

  const downloadReport = (report: MonthlyReport) => {
  if (report.status !== "FINALIZED") return;

  generateMonthlyReport(report);
};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Monthly Reports
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review and manage monthly assistant performance reports.
        </p>
      </div>

      {/* Summary cards */}
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
                {reports.filter((r) => r.status === "FINALIZED").length}
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

      {/* Reports table */}
      <Card padding="lg">
        <h2 className="mb-4 font-semibold text-slate-800">
          Assistant Reports
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="pb-3 font-medium">Report ID</th>
                <th className="pb-3 font-medium">Assistant</th>
                <th className="pb-3 font-medium">Month</th>
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
                    {report.id}
                  </td>
                  <td className="py-4 text-slate-700">
                    {report.assistant}
                  </td>
                  <td className="py-4 text-slate-500">
                    {formatMonth(report.month)}
                  </td>
                  <td className="py-4 text-slate-600">
                    {report.evaluationCount}
                  </td>
                  <td className="py-4 font-semibold text-slate-800">
                    {report.averageScore.toFixed(1)}%
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

              {filteredReports.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-slate-500"
                  >
                    No monthly reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Report details */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Monthly Performance Report
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedReport.assistant} · {formatMonth(selectedReport.month)}
                </p>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Close report"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Final Score</p>
                <p className="mt-1 text-2xl font-bold text-blue-700">
                  {selectedReport.averageScore.toFixed(1)}%
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Evaluations</p>
                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {selectedReport.evaluationCount}
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

            <div className="space-y-4">
              {criteria.map((criterion, index) => (
                <div key={criterion.id}>
                  <div className="mb-1 flex justify-between gap-3 text-sm">
                    <span className="text-slate-700">
                      {criterion.name}
                      <span className="ml-1 text-xs text-slate-400">
                        ({criterion.weight}%)
                      </span>
                    </span>
                    <span className="font-medium text-slate-800">
                      {selectedReport.kpiScores[index]}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{
                        width: `${selectedReport.kpiScores[index]}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg border border-slate-200 p-4">
              <h3 className="mb-3 font-semibold text-slate-800">
                Consolidated Observations
              </h3>

              {selectedReport.observations.length > 0 ? (
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
