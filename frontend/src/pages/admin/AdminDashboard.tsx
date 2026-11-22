
import {
  Activity,
  Users,
  Stethoscope,
  ClipboardCheck,
  TrendingUp,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";

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

// Temporary mock data.
// Replace with API data when the backend is ready.

const stats = [
  {
    title: "Total Assistants",
    value: "12",
    description: "Registered assistants",
    icon: Users,
    trend: "+2 this month",
    positive: true,
  },
  {
    title: "Total Dentists",
    value: "4",
    description: "Registered dentists",
    icon: Stethoscope,
    trend: "All active",
    positive: true,
  },
  {
    title: "Evaluations",
    value: "86",
    description: "This month",
    icon: ClipboardCheck,
    trend: "+12.5% vs last month",
    positive: true,
  },
  {
    title: "Average Score",
    value: "87.5%",
    description: "Clinic-wide performance",
    icon: TrendingUp,
    trend: "+3.2% vs last month",
    positive: true,
  },
];

const performanceData = [
  { month: "Jun", score: 78 },
  { month: "Jul", score: 82 },
  { month: "Aug", score: 80 },
  { month: "Sep", score: 85 },
  { month: "Oct", score: 83 },
  { month: "Nov", score: 87.5 },
];

const topAssistants = [
  { name: "Sarah Ahmed", evaluations: 9, score: 96 },
  { name: "Lina Karim", evaluations: 8, score: 93 },
  { name: "Meriem Ali", evaluations: 7, score: 89 },
  { name: "Nadia Benali", evaluations: 8, score: 86 },
];

const recentActivity = [
  {
    title: "New evaluation submitted",
    description: "An assistant evaluation was completed.",
    time: "10 minutes ago",
  },
  {
    title: "Monthly report generated",
    description: "October performance report is ready.",
    time: "2 hours ago",
  },
  {
    title: "New assistant registered",
    description: "A new assistant account was created.",
    time: "Yesterday",
  },
];

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  positive,
}: (typeof stats)[number]) {
  return (
    <Card padding="md" className="h-full">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-muted">{title}</p>
          <h2 className="mt-2 text-2xl font-bold text-text-main">
            {value}
          </h2>
          <p className="mt-1 text-xs text-text-muted">{description}</p>
        </div>

        <div className="rounded-xl bg-primary-light p-3">
          <Icon size={21} className="text-primary" />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-1 text-xs">
        {positive ? (
          <ArrowUpRight size={15} className="text-success" />
        ) : (
          <ArrowDownRight size={15} className="text-danger" />
        )}
        <span className={positive ? "text-success" : "text-danger"}>
          {trend}
        </span>
      </div>
    </Card>
  );
}

function AdminDashboard() {
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

        <Badge variant="info">November 2026</Badge>
      </div>

      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
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
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
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

              <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF1" />
              <XAxis dataKey="month" stroke="#64748B" />
              <YAxis domain={[0, 100]} stroke="#64748B" />

              <Tooltip
                formatter={(value) => [`${value}%`, "Average score"]}
              />

              <Area
                type="monotone"
                dataKey="score"
                stroke="#245B86"
                strokeWidth={3}
                fill="url(#performanceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
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
                Based on monthly average scores.
              </p>
            </div>
            <Activity size={20} className="text-primary" />
          </div>

          <div className="space-y-5">
            {topAssistants.map((assistant, index) => (
              <div key={assistant.name}>
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
                    {assistant.score}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${assistant.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent activity */}
        <Card padding="lg">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-text-main">
                Recent Activity
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Latest clinic activities.
              </p>
            </div>
            <Clock size={20} className="text-primary" />
          </div>

          <div className="space-y-5">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex gap-3">
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light">
                  {index === 0 ? (
                    <ClipboardCheck size={17} className="text-primary" />
                  ) : index === 1 ? (
                    <Activity size={17} className="text-primary" />
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
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

     

    </div>
  );
}

export default AdminDashboard;
