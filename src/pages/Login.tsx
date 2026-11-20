import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Atom, Mail, Lock, ArrowRight, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import AuthProviderButtons from "@/components/AuthProviderButtons";
import { postLoginPath, takePendingNext } from "@/lib/oauth-return-path";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawNext = searchParams.get("next");
  const next = postLoginPath(rawNext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const pending = takePendingNext();
    navigate(rawNext ? next : postLoginPath(pending), { replace: true });
  }, [user, navigate, rawNext, next]);

  const onSubmit = async ({ email, password }: LoginForm) => {
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message.includes("Email not confirmed") ? "Please confirm your email first — check your inbox." : "Wrong email or password.");
      return;
    }
    navigate(next);
  };
  const handleGuest = () => navigate("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-elevated)] sm:p-9"
        >
          <div className="flex justify-center mb-5">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center">
              <Atom className="h-8 w-8 text-secondary-foreground" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground text-center mb-1">Welcome Back</h1>
          <p className="text-muted-foreground text-center mb-8 text-sm">Continue your quantum mechanics journey</p>

          <div className="space-y-3 mb-6">
            <AuthProviderButtons next={next} onSignedIn={() => navigate(next)} />
            <Button type="button" variant="secondary" className="w-full rounded-xl h-11" onClick={handleGuest}>
              <UserRound className="h-4 w-4 mr-2" /> Continue as Guest
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <Label htmlFor="email" className="text-foreground text-sm font-medium">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" className="pl-10 rounded-xl" {...register("email")} />
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password" className="text-foreground text-sm font-medium">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" className="pl-10 rounded-xl" {...register("password")} />
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" variant="hero" className="w-full rounded-xl" size="lg" disabled={submitting}>
              {submitting ? "Logging in…" : "Log In"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to={rawNext ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
