import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";

const NAV = [
  { to: "/simulations", label: "Simulations" },
  { to: "/lab/$simId", params: { simId: "projectile" }, label: "Laboratory" },
  { to: "/pricing", label: "Pricing" },
] as const;

export function SiteHeader() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              params={"params" in item ? item.params : undefined}
              className="rounded-lg px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button asChild variant="hero" size="sm">
              <Link to="/dashboard">Open dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild variant="hero" size="sm">
                <Link to="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="glass w-72">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="mt-8 flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  params={"params" in item ? item.params : undefined}
                  className="rounded-lg px-3 py-2.5 text-foreground hover:bg-accent"
                >
                  {item.label}
                </Link>
              ))}
              <div className="my-3 h-px bg-border" />
              {user ? (
                <Button asChild variant="hero">
                  <Link to="/dashboard">Open dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="glass">
                    <Link to="/login">Log in</Link>
                  </Button>
                  <Button asChild variant="hero" className="mt-2">
                    <Link to="/register">Get started</Link>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
