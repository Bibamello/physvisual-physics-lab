import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { CreditCard, FlaskConical, LayoutDashboard, LayoutGrid, LogIn, LogOut, Menu, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { displayNameOf, initialsOf, useAuth, usePlan } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/simulations", label: "Simulations", icon: LayoutGrid },
  { to: "/lab/$simId", params: { simId: "projectile" }, label: "Laboratory", icon: FlaskConical },
  { to: "/pricing", label: "Pricing", icon: CreditCard },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => (
        <Link
          key={item.label}
          to={item.to}
          params={"params" in item ? item.params : undefined}
          onClick={onNavigate}
          activeOptions={{ exact: false, includeSearch: false }}
          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/75 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground"
          activeProps={{ className: "bg-sidebar-accent text-sidebar-foreground shadow-[inset_2px_0_0_var(--primary)]" }}
        >
          <item.icon className="size-4 text-muted-foreground transition-colors group-hover:text-primary group-data-[status=active]:text-primary" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function UpgradeCard() {
  const { isPremium } = usePlan();
  if (isPremium) {
    return (
      <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 text-sm">
        <div className="flex items-center gap-2 font-medium text-primary">
          <Sparkles className="size-4" /> Premium active
        </div>
        <p className="mt-1 text-xs text-muted-foreground">All simulations and exports unlocked.</p>
      </div>
    );
  }
  return (
    <div className="relative overflow-hidden rounded-2xl bg-brand p-px">
      <div className="rounded-[calc(1rem-1px)] bg-surface p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="size-4 text-primary" /> Go Premium
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Unlock the Inclined Plane lab and CSV export.</p>
        <Button asChild variant="hero" size="sm" className="mt-3 w-full">
          <Link to="/pricing">See plans</Link>
        </Button>
      </div>
    </div>
  );
}

function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const { isPremium } = usePlan();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!user) {
    return (
      <Button asChild variant="glass" size="sm">
        <Link to="/login">
          <LogIn /> Log in
        </Link>
      </Button>
    );
  }
  const name = displayNameOf(profile, user);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full border border-glass-border bg-glass py-1 pl-1 pr-3 text-sm transition-colors hover:border-primary/40">
        <span className="flex size-7 items-center justify-center rounded-full bg-brand text-xs font-semibold text-primary-foreground">
          {initialsOf(name)}
        </span>
        <span className="hidden max-w-32 truncate sm:inline">{name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="truncate">{name}</div>
          <div className="truncate text-xs font-normal text-muted-foreground">{user.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate({ to: "/dashboard" })}>
          <LayoutDashboard /> Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate({ to: "/pricing" })}>
          <CreditCard /> {isPremium ? "Manage plan" : "Upgrade plan"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={async () => {
            await queryClient.cancelQueries();
            queryClient.clear();
            await signOut();
            toast("Signed out");
            navigate({ to: "/login", replace: true });
          }}
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children, title, actions }: { children: ReactNode; title?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
        <Logo to="/dashboard" className="px-2" />
        <div className="mt-8 flex-1">
          <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Workspace</p>
          <NavLinks />
        </div>
        <UpgradeCard />
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/60 bg-background/75 px-4 backdrop-blur-xl sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col bg-sidebar">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Logo to="/dashboard" />
              <div className="mt-6 flex-1">
                <NavLinks />
              </div>
              <UpgradeCard />
            </SheetContent>
          </Sheet>
          <div className={cn("min-w-0 flex-1 truncate font-display text-base font-semibold sm:text-lg")}>{title}</div>
          <div className="flex items-center gap-2">
            {actions}
            <UserMenu />
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
