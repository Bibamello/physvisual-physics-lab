import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { updateLocal, useLocalState } from "./local-store";
import type { SimId } from "./simulations";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfilePatch = Partial<Pick<Profile, "display_name" | "learner_type" | "school" | "plan" | "favorites">>;

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  updateProfile: (patch: ProfilePatch) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) setProfile(null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (!data.session) setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      let row = data;
      if (!row) {
        const meta = user?.user_metadata ?? {};
        const { data: created } = await supabase
          .from("profiles")
          .insert({ id: userId, display_name: meta.display_name ?? meta.full_name ?? user?.email?.split("@")[0] ?? "" })
          .select("*")
          .single();
        row = created;
      }
      if (!cancelled) {
        setProfile(row ?? null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const updateProfile = useCallback(
    async (patch: ProfilePatch) => {
      if (!userId) return;
      setProfile((p) => (p ? { ...p, ...patch } : p));
      const { data, error } = await supabase.from("profiles").update(patch).eq("id", userId).select("*").single();
      if (error) throw error;
      setProfile(data);
    },
    [userId],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, profile, loading, updateProfile, signOut }),
    [user, profile, loading, updateProfile, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function displayNameOf(profile: Profile | null, user: User | null) {
  return profile?.display_name || user?.email?.split("@")[0] || "Researcher";
}

export function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "PV";
}

/** Favorites live on the profile when signed in, in the browser otherwise. */
export function useFavorites() {
  const { profile, updateProfile } = useAuth();
  const local = useLocalState();
  const favorites = (profile?.favorites as SimId[] | undefined) ?? local.guestFavorites;
  const toggle = useCallback(
    async (id: SimId) => {
      const next = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
      if (profile) await updateProfile({ favorites: next });
      else updateLocal((s) => ({ ...s, guestFavorites: next }));
      return next.includes(id);
    },
    [favorites, profile, updateProfile],
  );
  return { favorites, toggle, isFavorite: (id: SimId) => favorites.includes(id) };
}

/** Subscription plan (demo checkout): profile when signed in, browser otherwise. */
export function usePlan() {
  const { profile, updateProfile } = useAuth();
  const local = useLocalState();
  const plan = (profile?.plan as "free" | "premium" | undefined) ?? local.guestPlan;
  const setPlan = useCallback(
    async (next: "free" | "premium") => {
      if (profile) await updateProfile({ plan: next });
      else updateLocal((s) => ({ ...s, guestPlan: next }));
    },
    [profile, updateProfile],
  );
  return { plan, isPremium: plan === "premium", setPlan };
}
