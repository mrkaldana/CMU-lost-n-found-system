import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, Package, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function AdminNavbar() {
  const location = useLocation();
  const { adminLogout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2 font-bold text-lg text-foreground">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span>FindIt</span>
          <span className="text-xs font-normal text-muted-foreground ml-1">Admin Panel</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Button variant={location.pathname === "/admin" ? "secondary" : "ghost"} size="sm" asChild>
            <Link to="/admin">
              <LayoutDashboard className="h-4 w-4 mr-1.5" /> Dashboard
            </Link>
          </Button>
          <Button variant={location.pathname === "/admin/items" ? "secondary" : "ghost"} size="sm" asChild>
            <Link to="/admin/items">
              <Package className="h-4 w-4 mr-1.5" /> Items
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={adminLogout} asChild>
            <Link to="/admin/login">
              <LogOut className="h-4 w-4 mr-1.5" /> Logout
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
