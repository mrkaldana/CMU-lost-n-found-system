import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, Package, LayoutDashboard, LogOut, Menu, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function AdminNavbar() {
  const location = useLocation();
  const { adminLogout, isLogoutLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2 font-bold text-lg text-foreground">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span>FindIt</span>
          <span className="ml-1 text-xs font-normal text-muted-foreground">Admin Panel</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
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
          <Button variant="ghost" size="sm" onClick={adminLogout} disabled={isLogoutLoading}>
            {isLogoutLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Logging out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-1.5" /> Logout
              </>
            )}
          </Button>
        </nav>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open admin menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <SheetHeader>
              <SheetTitle>Admin Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-2">
              <SheetClose asChild>
                <Button variant={location.pathname === "/admin" ? "secondary" : "ghost"} className="justify-start" asChild>
                  <Link to="/admin">
                    <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant={location.pathname === "/admin/items" ? "secondary" : "ghost"} className="justify-start" asChild>
                  <Link to="/admin/items">
                    <Package className="h-4 w-4 mr-2" /> Items
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="ghost" className="justify-start" onClick={adminLogout} disabled={isLogoutLoading}>
                  {isLogoutLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </>
                  )}
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
