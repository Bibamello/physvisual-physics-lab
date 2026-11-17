import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { SIMULATIONS } from "@/lib/simulations";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-surface/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Interactive physics simulations for classrooms, labs and curious minds. Built by teachers
            and engineers in Almaty and Berlin.
          </p>
        </div>
        <FooterCol title="Simulations">
          {SIMULATIONS.map((s) => (
            <Link key={s.id} to="/lab/$simId" params={{ simId: s.id }} className="hover:text-foreground">
              {s.category}
            </Link>
          ))}
        </FooterCol>
        <FooterCol title="Product">
          <Link to="/simulations" className="hover:text-foreground">Catalog</Link>
          <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
        </FooterCol>
        <FooterCol title="Account">
          <Link to="/login" className="hover:text-foreground">Log in</Link>
          <Link to="/register" className="hover:text-foreground">Create account</Link>
        </FooterCol>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>© 2026 PhysVisual Labs. All rights reserved.</span>
          <span className="font-mono">g = 9.81 m/s² · c = 299 792 458 m/s</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <div className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
