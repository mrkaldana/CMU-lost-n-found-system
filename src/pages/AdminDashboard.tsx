import { useEffect, useMemo, useState } from "react";
import { useItems } from "@/context/ItemsContext";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageHoverPreview } from "@/components/ImageHoverPreview";
import { CoordinateMapHover } from "@/components/CoordinateMapHover";
import { Package, Search, CheckCircle, HandHeart, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LostItem, STATUS_CONFIG } from "@/types";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { resolveImageUrl } from "@/lib/media";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend);

type DashboardStatsResponse = {
  generatedAt: string;
  summary: {
    total: number;
    pending: number;
    missing: number;
    found: number;
    surrendered: number;
    rejected: number;
    resolved: number;
    resolutionRate: number;
  };
  statusBreakdown: Array<{ status: string; count: number }>;
  categoryBreakdown: Array<{ category: string; count: number }>;
  reportsPerDay: Array<{ date: string; reports: number; resolved: number }>;
};

function getCssVar(variable: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return value ? `hsl(${value})` : fallback;
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-card-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentItem({ item }: { item: LostItem }) {
  const config = STATUS_CONFIG[item.status];
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        {item.imageUrl ? (
          <ImageHoverPreview
            src={resolveImageUrl(item.imageUrl)}
            alt={item.itemName}
            triggerClassName="h-10 w-10 rounded-md border object-cover shrink-0 cursor-zoom-in"
          />
        ) : (
          <div className="h-10 w-10 rounded-md border bg-muted shrink-0" />
        )}
        <div className="min-w-0">
          <p className="font-medium text-sm text-card-foreground truncate">{item.itemName}</p>
          <p className="text-xs text-muted-foreground">{item.refId} · {item.dateReported}</p>
          {item.locationCoordinates && (
            <CoordinateMapHover
              lat={item.locationCoordinates.lat}
              lng={item.locationCoordinates.lng}
              className="text-[11px] text-muted-foreground font-mono underline underline-offset-2 decoration-dotted"
            />
          )}
        </div>
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.className}`}>{config.label}</span>
    </div>
  );
}

const AdminDashboard = () => {
  const { items, stats } = useItems();
  const { token } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStatsResponse | null>(null);
  const recent = items.slice(0, 5);

  useEffect(() => {
    if (!token) return;
    let active = true;

    const loadDashboardStats = async () => {
      try {
        const data = await apiRequest<DashboardStatsResponse>("/api/admin/dashboard-stats", { token });
        if (active) setDashboardStats(data);
      } catch {
        if (active) setDashboardStats(null);
      }
    };

    void loadDashboardStats();
    const intervalId = window.setInterval(() => {
      void loadDashboardStats();
    }, 15000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [token]);

  const summary = dashboardStats?.summary ?? {
    total: stats.total,
    pending: stats.pending,
    missing: stats.missing,
    found: stats.found,
    surrendered: stats.surrendered,
    rejected: 0,
    resolved: stats.found + stats.surrendered,
    resolutionRate: stats.total > 0 ? Math.round(((stats.found + stats.surrendered) / stats.total) * 100) : 0,
  };

  const reportsTrendData = useMemo(() => {
    if (dashboardStats?.reportsPerDay?.length) {
      return dashboardStats.reportsPerDay.map((entry) => ({
        ...entry,
        day: new Date(entry.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      }));
    }
    return [];
  }, [dashboardStats]);

  const statusChartData = useMemo(() => {
    if (dashboardStats?.statusBreakdown?.length) {
      return dashboardStats.statusBreakdown.filter((entry) => entry.count > 0);
    }
    return [
      { status: "pending", count: summary.pending },
      { status: "missing", count: summary.missing },
      { status: "found", count: summary.found },
      { status: "surrendered", count: summary.surrendered },
    ].filter((entry) => entry.count > 0);
  }, [dashboardStats, summary.pending, summary.missing, summary.found, summary.surrendered]);

  const categoryChartData = useMemo(() => {
    if (dashboardStats?.categoryBreakdown?.length) {
      return dashboardStats.categoryBreakdown.map((entry) => ({
        ...entry,
        shortLabel: entry.category.slice(0, 12),
      }));
    }
    return [];
  }, [dashboardStats]);

  const chartColors = useMemo(
    () => ({
      primary: getCssVar("--primary", "#2563eb"),
      found: getCssVar("--status-found", "#16a34a"),
      pending: getCssVar("--status-pending", "#f59e0b"),
      missing: getCssVar("--status-missing", "#8b5cf6"),
      surrendered: getCssVar("--status-surrendered", "#0ea5e9"),
      rejected: getCssVar("--destructive", "#dc2626"),
      border: getCssVar("--border", "#e5e7eb"),
      muted: getCssVar("--muted-foreground", "#6b7280"),
    }),
    []
  );

  const lineChartData = useMemo(
    () => ({
      labels: reportsTrendData.map((entry) => entry.day),
      datasets: [
        {
          label: "Reported",
          data: reportsTrendData.map((entry) => entry.reports),
          borderColor: chartColors.primary,
          backgroundColor: chartColors.primary,
          tension: 0.3,
          pointRadius: 3,
        },
        {
          label: "Resolved",
          data: reportsTrendData.map((entry) => entry.resolved),
          borderColor: chartColors.found,
          backgroundColor: chartColors.found,
          tension: 0.3,
          pointRadius: 3,
        },
      ],
    }),
    [reportsTrendData, chartColors]
  );

  const lineChartOptions = useMemo<ChartOptions<"line">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: chartColors.muted },
        },
        y: {
          beginAtZero: true,
          ticks: { precision: 0, color: chartColors.muted },
          grid: { color: chartColors.border },
        },
      },
    }),
    [chartColors]
  );

  const doughnutChartData = useMemo(() => {
    const colorsByStatus: Record<string, string> = {
      pending: chartColors.pending,
      missing: chartColors.missing,
      found: chartColors.found,
      surrendered: chartColors.surrendered,
      rejected: chartColors.rejected,
    };

    return {
      labels: statusChartData.map((entry) => entry.status),
      datasets: [
        {
          data: statusChartData.map((entry) => entry.count),
          backgroundColor: statusChartData.map((entry) => colorsByStatus[entry.status] ?? chartColors.primary),
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    };
  }, [statusChartData, chartColors]);

  const doughnutChartOptions = useMemo<ChartOptions<"doughnut">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "60%",
      plugins: {
        legend: { position: "bottom" },
      },
    }),
    []
  );

  const barChartData = useMemo(
    () => ({
      labels: categoryChartData.map((entry) => entry.shortLabel),
      datasets: [
        {
          label: "Reports",
          data: categoryChartData.map((entry) => entry.count),
          backgroundColor: chartColors.primary,
          borderRadius: 6,
        },
      ],
    }),
    [categoryChartData, chartColors]
  );

  const barChartOptions = useMemo<ChartOptions<"bar">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: chartColors.muted },
        },
        y: {
          beginAtZero: true,
          ticks: { precision: 0, color: chartColors.muted },
          grid: { color: chartColors.border },
        },
      },
    }),
    [chartColors]
  );

  return (
    <div className="container space-y-6 py-4 sm:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Track and manage all lost & found reports</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/admin/items">Manage Items</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Pending" value={summary.pending} icon={Clock} color="bg-status-pending/10 text-status-pending" />
        <StatCard title="Total Reports" value={summary.total} icon={Package} color="bg-primary/10 text-primary" />
        <StatCard title="Missing" value={summary.missing} icon={Search} color="bg-status-missing/10 text-status-missing" />
        <StatCard title="Found" value={summary.found} icon={CheckCircle} color="bg-status-found/10 text-status-found" />
        <StatCard title="Surrendered" value={summary.surrendered} icon={HandHeart} color="bg-status-surrendered/10 text-status-surrendered" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Resolution Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-3">
              <div className="text-5xl font-bold text-primary">{summary.resolutionRate}%</div>
              <p className="text-sm text-muted-foreground">
                {summary.resolved} of {summary.total} items resolved
              </p>
              <div className="w-full bg-muted rounded-full h-3">
                <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${summary.resolutionRate}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No reports yet.</p>
            ) : (
              recent.map((item) => <RecentItem key={item.id} item={item} />)
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Reports Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {reportsTrendData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No trend data yet.</p>
            ) : (
              <div className="h-[220px] w-full sm:h-[280px]">
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {statusChartData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No status data yet.</p>
            ) : (
              <div className="h-[230px] w-full sm:h-[280px]">
                <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reports by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryChartData.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No category data yet.</p>
          ) : (
            <div className="h-[220px] w-full sm:h-[280px]">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
