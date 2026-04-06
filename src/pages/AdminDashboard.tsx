import { useItems } from "@/context/ItemsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Search, CheckCircle, HandHeart, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LostItem, STATUS_CONFIG } from "@/types";

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
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <div className="min-w-0">
        <p className="font-medium text-sm text-card-foreground truncate">{item.itemName}</p>
        <p className="text-xs text-muted-foreground">{item.refId} · {item.dateReported}</p>
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.className}`}>{config.label}</span>
    </div>
  );
}

const AdminDashboard = () => {
  const { items, stats } = useItems();
  const recent = items.slice(0, 5);
  const resolvedRate = stats.total > 0 ? Math.round(((stats.found + stats.surrendered) / stats.total) * 100) : 0;

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Track and manage all lost & found reports</p>
        </div>
        <Button asChild>
          <Link to="/admin/items">Manage Items</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Pending" value={stats.pending} icon={Clock} color="bg-status-pending/10 text-status-pending" />
        <StatCard title="Total Reports" value={stats.total} icon={Package} color="bg-primary/10 text-primary" />
        <StatCard title="Missing" value={stats.missing} icon={Search} color="bg-status-missing/10 text-status-missing" />
        <StatCard title="Found" value={stats.found} icon={CheckCircle} color="bg-status-found/10 text-status-found" />
        <StatCard title="Surrendered" value={stats.surrendered} icon={HandHeart} color="bg-status-surrendered/10 text-status-surrendered" />
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
              <div className="text-5xl font-bold text-primary">{resolvedRate}%</div>
              <p className="text-sm text-muted-foreground">
                {stats.found + stats.surrendered} of {stats.total} items resolved
              </p>
              <div className="w-full bg-muted rounded-full h-3">
                <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${resolvedRate}%` }} />
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
    </div>
  );
};

export default AdminDashboard;
