import { Link, useLocation } from "react-router-dom";
import { Search, Package, LogIn, LogOut, Menu, Loader2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const location = useLocation();
  const { user, logout, isLogoutLoading } = useAuth();

  // Don't show navbar on admin pages or auth pages
  const isAdminPage = location.pathname.startsWith("/admin");
  const isAuthPage = ["/login", "/register", "/forgot-password"].includes(location.pathname);
  if (isAdminPage || isAuthPage) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
          <img src="/findit.png" alt="FindIt logo" className="h-6 w-auto object-contain" />
          <span>FindIt</span>
          <span className="text-xs font-normal text-muted-foreground ml-1 hidden sm:inline">School Lost & Found</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Button variant={location.pathname === "/" ? "secondary" : "ghost"} size="sm" asChild>
            <Link to="/">
              <Search className="h-4 w-4 mr-1.5" /> Browse
            </Link>
          </Button>
          {user && (
            <Button variant={location.pathname === "/report" ? "secondary" : "ghost"} size="sm" asChild>
              <Link to="/report">
                <Package className="h-4 w-4 mr-1.5" /> Report
              </Link>
            </Button>
          )}
          {user && (
            <Button variant={location.pathname === "/profile" ? "secondary" : "ghost"} size="sm" asChild>
              <Link to="/profile">
                <UserRound className="h-4 w-4 mr-1.5" /> Profile
              </Link>
            </Button>
          )}
          {user ? (
            <Button variant="ghost" size="sm" onClick={logout} disabled={isLogoutLoading}>
              {isLogoutLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Logging out...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-1.5" /> {user.name.split(" ")[0]}
                </>
              )}
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">
                <LogIn className="h-4 w-4 mr-1.5" /> Sign In
              </Link>
            </Button>
          )}
        </nav>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-2">
              <SheetClose asChild>
                <Button variant={location.pathname === "/" ? "secondary" : "ghost"} className="justify-start" asChild>
                  <Link to="/">
                    <Search className="h-4 w-4 mr-2" /> Browse
                  </Link>
                </Button>
              </SheetClose>
              {user && (
                <SheetClose asChild>
                  <Button variant={location.pathname === "/report" ? "secondary" : "ghost"} className="justify-start" asChild>
                    <Link to="/report">
                      <Package className="h-4 w-4 mr-2" /> Report
                    </Link>
                  </Button>
                </SheetClose>
              )}
              {user && (
                <SheetClose asChild>
                  <Button variant={location.pathname === "/profile" ? "secondary" : "ghost"} className="justify-start" asChild>
                    <Link to="/profile">
                      <UserRound className="h-4 w-4 mr-2" /> Profile
                    </Link>
                  </Button>
                </SheetClose>
              )}
              {user ? (
                <SheetClose asChild>
                  <Button variant="ghost" className="justify-start" onClick={logout} disabled={isLogoutLoading}>
                    {isLogoutLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Logging out...
                      </>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4 mr-2" /> {user.name.split(" ")[0]}
                      </>
                    )}
                  </Button>
                </SheetClose>
              ) : (
                <SheetClose asChild>
                  <Button variant="outline" className="justify-start" asChild>
                    <Link to="/login">
                      <LogIn className="h-4 w-4 mr-2" /> Sign In
                    </Link>
                  </Button>
                </SheetClose>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
