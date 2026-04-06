import { Link, useLocation } from "react-router-dom";
import { Search, Package, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
          <Package className="h-5 w-5 text-primary" />
          <span>FindIt</span>
          <span className="text-xs font-normal text-muted-foreground ml-1 hidden sm:inline">School Lost & Found</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Button variant={location.pathname === "/" ? "secondary" : "ghost"} size="sm" asChild>
            <Link to="/">
              <Search className="h-4 w-4 mr-1.5" /> Browse
            </Link>
          </Button>
          <Button variant={location.pathname === "/report" ? "secondary" : "ghost"} size="sm" asChild>
            <Link to="/report">
              <Package className="h-4 w-4 mr-1.5" /> Report
            </Link>
          </Button>
          <Button variant={isAdmin ? "default" : "outline"} size="sm" asChild>
            <Link to="/admin">
              <ShieldCheck className="h-4 w-4 mr-1.5" /> Admin
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
