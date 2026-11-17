import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, MailCheck } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Divider, SocialButtons, safeNext } from "@/components/auth/SocialButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string | undefined } => ({
    redirect: typeof s["redirect"] === "string" ? s["redirect"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Create your account — PhysVisual" },
      { name: "description", content: "Create a free PhysVisual account and start running physics experiments in your browser." },
      { property: "og:title", content: "Create your account — PhysVisual" },
      { property: "og:description", content: "Start running physics experiments in your browser for free." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

const ROLES = [
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
  { value: "self-learner", label: "Self-learner" },
] as const;

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 14) s++;
  return s;
}

function RegisterPage() {
  const search = Route.useSearch();
  const next = safeNext(search.redirect);
  const { user } = useAuth();
  const navigate = useNavigate();
  // Already signed in: skip the form.
  useEffect(() => {
    if (user) navigate({ to: next, replace: true });
  }, [user, next, navigate]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]["value"]>("student");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const score = strength(password);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Use at least 8 characters for your password.");
    if (!agree) return setError("Please accept the terms to continue.");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${next}`,
        data: { display_name: name.trim(), learner_type: role },
      },
    });
    setLoading(false);
    if (error) return setError(error.message);
    setSentTo(email.trim());
  }

  if (sentTo) {
    return (
      <AuthLayout title="Check your inbox" subtitle="One last step before your lab opens.">
        <div className="glass rounded-2xl p-6 text-center">
          <MailCheck className="mx-auto size-12 text-primary" />
          <p className="mt-4 text-sm">
            We sent a confirmation link to <span className="font-medium text-primary">{sentTo}</span>. Click it to
            activate your account.
          </p>
          <Button asChild variant="glass" className="mt-6 w-full">
            <Link to="/login">Back to log in</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle={
        <>
          Already have one?{" "}
          <Link to="/login" search={{ redirect: search.redirect }} className="text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <SocialButtons next={next} />
      <Divider />
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aigerim Sadykova" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="flex gap-1" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i < score ? (score < 3 ? "bg-amber" : "bg-success") : "bg-muted")} />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>I am a</Label>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map((r) => (
              <button
                type="button"
                key={r.value}
                onClick={() => setRole(r.value)}
                className={cn(
                  "rounded-lg border px-2 py-2 text-sm transition-all",
                  role === r.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
          <Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} className="mt-0.5" />
          I agree to the PhysVisual terms and privacy policy.
        </label>
        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />} Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
