import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Atom, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface AuthorizationDetails {
  client?: { name?: string; uri?: string } | null;
  redirect_url?: string;
  redirect_to?: string;
  scope?: string;
}

interface OAuthApi {
  getAuthorizationDetails(id: string): Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization(id: string): Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
  denyAuthorization(id: string): Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
}

const oauthApi = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export default function OAuthConsent() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("This connection link is missing its request details. Start the connection again from your assistant.");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!active) return;
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        navigate("/login?next=" + encodeURIComponent(next), { replace: true });
        return;
      }
      try {
        const { data, error: detailsError } = await oauthApi().getAuthorizationDetails(authorizationId);
        if (!active) return;
        if (detailsError || !data) {
          setError("This connection request has expired or is no longer valid. Start the connection again from your assistant.");
          return;
        }
        const immediate = data.redirect_url ?? data.redirect_to;
        if (immediate && !data.client) {
          window.location.href = immediate;
          return;
        }
        setDetails(data);
      } catch {
        if (active) setError("We couldn't load this connection request. Please try again.");
      }
    })();
    return () => {
      active = false;
    };
  }, [authorizationId, navigate]);

  const decide = async (approve: boolean) => {
    setBusy(true);
    try {
      const { data, error: decideError } = approve
        ? await oauthApi().approveAuthorization(authorizationId)
        : await oauthApi().denyAuthorization(authorizationId);
      const target = data?.redirect_url ?? data?.redirect_to;
      if (decideError || !target) {
        setBusy(false);
        setError("We couldn't finish this connection request. Start it again from your assistant.");
        return;
      }
      window.location.href = target;
    } catch {
      setBusy(false);
      setError("We couldn't finish this connection request. Please try again.");
    }
  };

  const clientName = details?.client?.name ?? "An assistant";

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-6">
      <main className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-elevated)] sm:p-9">
        <div className="flex justify-center mb-5">
          <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center">
            {details ? <ShieldCheck className="h-8 w-8 text-secondary-foreground" /> : <Atom className="h-8 w-8 text-secondary-foreground" />}
          </div>
        </div>
        {error ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Connection not available</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="secondary" className="mt-6 w-full rounded-xl" onClick={() => navigate("/dashboard")}>Go to dashboard</Button>
          </div>
        ) : !details ? (
          <p className="text-center text-sm text-muted-foreground" role="status">Loading connection request…</p>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Connect {clientName} to your account</h1>
            <p className="text-sm text-muted-foreground mb-6">
              {clientName} will be able to read lesson topics, lesson pages and practice quizzes as you.
            </p>
            <div className="flex flex-col gap-3">
              <Button variant="hero" className="w-full rounded-xl" disabled={busy} onClick={() => decide(true)}>Approve</Button>
              <Button variant="outline" className="w-full rounded-xl" disabled={busy} onClick={() => decide(false)}>Deny</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
