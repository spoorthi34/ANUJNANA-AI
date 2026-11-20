import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";

export type LearnerProfile = Tables<"profiles">;

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: LearnerProfile | null;
  loading: boolean;
  displayName: string;
  updateProfile: (patch: TablesUpdate<"profiles">) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function nameFromUser(user: User | null) {
  const meta = user?.user_metadata ?? {};
  return (meta.display_name || meta.full_name || meta.name || user?.email?.split("@")[0] || "Learner") as string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const user = session?.user ?? null;

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) setProfile(null);
    });
    supabase.auth.getSession().then(({ data: { session: current } }) => {
      setSession(current);
      if (!current) setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      let next = data;
      if (!next) {
        const { data: created } = await supabase
          .from("profiles")
          .upsert({ id: user.id, display_name: nameFromUser(user) })
          .select("*")
          .maybeSingle();
        next = created;
      }
      if (!cancelled) {
        setProfile(next ?? null);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateProfile = useCallback(async (patch: TablesUpdate<"profiles">) => {
    if (!user) return;
    setProfile((current) => (current ? { ...current, ...patch } : current));
    const { data, error } = await supabase.from("profiles").update(patch).eq("id", user.id).select("*").maybeSingle();
    if (error) throw error;
    if (data) setProfile(data);
  }, [user]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        displayName: user ? profile?.display_name || nameFromUser(user) : "Guest",
        updateProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
