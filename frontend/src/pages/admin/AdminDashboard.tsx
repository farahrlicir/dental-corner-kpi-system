import { useEffect, useState } from "react";

import {
  Activity,
  Users,
  Stethoscope,
  ClipboardCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Loader2,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { apiRequest } from "../../services/api";

interface DashboardStat {
  title: string;
  value: string;
  description: string;
  trend: string;
  positive: boolean;
  type: "assistants" | "dentists" | "evaluations" | "score";
}

interface DashboardData {
  currentMonth: string;
  stats: DashboardStat[];
  performanceData: {
    month: string;
    score: number | null;
  }[];
  topAssistants: {
    name: string;
    evaluations: number;
    score: number;
  }[];
  recentActivity: {
    title: string;
    description: string;
    createdAt: string;
  }[];
}

interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

const statIcons: Record<DashboardStat["type"], LucideIcon> = {
  assistants: Users,
  dentists: Stethoscope,
  evaluations: ClipboardCheck,
  score: TrendingUp,
};

function StatCard({ stat }: { stat: DashboardStat }) {
  const Icon = statIcons[stat.type];

  return (
    <Card padding="md" className="h-full">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-muted">
            {stat.title}
          </p>

          <h2 className="mt-2 text-2xl font-bold text-text-main">
            {stat.value}
          </h2>

          <p className="mt-1 text-xs text-text-muted">
            {stat.description}
          </p>
        </div>

        <div className="rounded-xl bg-primary-light p-3">
          <Icon size={21} className="text-primary" />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-1 text-xs">
        {stat.positive ? (
          <ArrowUpRight size={15} className="text-success" />
        ) : (
          <ArrowDownRight size={15} className="text-danger" />
        )}

        <span className={stat.positive ? "text-success" : "text-danger"}>
          {stat.trend}
        </span>
      </div>
    </Card>
  );
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const seconds = Math.floor((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
  });

  if (Math.abs(seconds) < 60) {
    return formatter.format(seconds, "second");
  }

  const minutes = Math.floor(seconds / 60);
  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, "minute");
  }

  const hours = Math.floor(minutes / 60);
  if (Math.abs(hours) < 24) {
    return formatter.format(hours, "hour");
  }

  const days = Math.floor(hours / 24);
  return formatter.format(days, "day");
}

function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const response = await apiRequest<DashboardResponse>(
          "/admin/dashboard"
        );

        if (active) {
          setDashboard(response.data);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load dashboard."
          );
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  if (!dashboard && !error) {
    return (
      <div className="flex min-h-[300px] items-center justify-center gap-3 text-text-muted">
        <Loader2 size={22} className="animate-spin" />
        <span className="text-sm">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card padding="lg">
        <p className="text-sm font-medium text-danger">
          Unable to load dashboard
        </p>
        <p className="mt-1 text-sm text-text-muted">{error}</p>
      </Card>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-main">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Overview of your clinic's performance and activities.
          </p>
        </div>

        <Badge variant="info">{dashboard.currentMonth}</Badge>
      </div>

      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboard.stats.map((stat) => (
          <StatCard key={stat.type} stat={stat} />
        ))}
      </section>

      {/* Performance chart */}
      <Card padding="lg">
        <div className="mb-6">
          <h2 className="font-semibold text-text-main">
            Clinic Performance
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Average assistant evaluation scores over time.
          </p>
        </div>

        <div className="h-72 w-full">
          {dashboard.performanceData.some(
            (item) => item.score !== null
          ) ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.performanceData}>
                <defs>
                  <linearGradient
                    id="performanceGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#245B86"
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor="#245B86"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5EAF1"
                />

                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis domain={[0, 100]} stroke="#64748B" />

                <Tooltip
                  formatter={(value) =>
                    value === null || value === undefined
                      ? ["No data", "Average score"]
                      : [`${Number(value).toFixed(1)}%`, "Average score"]
                  }
                />

                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#245B86"
                  strokeWidth={3}
                  fill="url(#performanceGradient)"
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-text-muted">
              No finalized monthly performance data available yet.
            </div>
          )}
        </div>
      </Card>

      {/* Lower dashboard sections */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Top assistants */}
        <Card padding="lg">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-text-main">
                Top Performing Assistants
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Based on the latest finalized monthly reports.
              </p>
            </div>

            <Activity size={20} className="text-primary" />
          </div>

          {dashboard.topAssistants.length > 0 ? (
            <div className="space-y-5">
              {dashboard.topAssistants.map((assistant, index) => (
                <div key={`${assistant.name}-${index}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
                        {index + 1}
                      </span>

                      <div>
                        <p className="text-sm font-medium text-text-main">
                          {assistant.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          {assistant.evaluations} evaluations
                        </p>
                      </div>
                    </div>

                    <span className="text-sm font-semibold text-text-main">
                      {assistant.score.toFixed(1)}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: `${Math.min(100, Math.max(0, assistant.score))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-text-muted">
              No finalized assistant reports available yet.
            </p>
          )}
        </Card>

        {/* Recent activity */}
        <Card padding="lg">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-text-main">
                Recent Activity
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Latest recorded clinic activities.
              </p>
            </div>

            <Clock size={20} className="text-primary" />
          </div>

          {dashboard.recentActivity.length > 0 ? (
            <div className="space-y-5">
              {dashboard.recentActivity.map((activity, index) => (
                <div
                  key={`${activity.createdAt}-${index}`}
                  className="flex gap-3"
                >
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light">
                    {index === 0 ? (
                      <ClipboardCheck size={17} className="text-primary" />
                    ) : (
                      <Users size={17} className="text-primary" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-main">
                      {activity.title}
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                      {activity.description}
                    </p>

                    <p className="mt-2 text-xs text-text-light">
                      {formatRelativeTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-text-muted">
              No recent activity recorded yet.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;