import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Atom, Mail, Lock, User, ArrowRight, Eye, EyeOff, Check, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import AuthProviderButtons from "@/components/AuthProviderButtons";
import { postLoginPath } from "@/lib/oauth-return-path";


const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawNext = searchParams.get("next");
  const next = postLoginPath(rawNext);
  const loginLink = rawNext ? `/login?next=${encodeURIComponent(next)}` : "/login";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const password = watch("password") ?? "";
  const confirmPassword = watch("confirmPassword") ?? "";

  const passwordStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const strengthLabel = passwordStrength <= 1 ? "Weak" : passwordStrength <= 2 ? "Medium" : passwordStrength <= 3 ? "Strong" : "Very Strong";
  const strengthColor = passwordStrength <= 1 ? "bg-destructive" : passwordStrength <= 2 ? "bg-warning" : "bg-success";
  const strengthTextColor = passwordStrength <= 1 ? "text-destructive" : passwordStrength <= 2 ? "text-warning" : "text-success";
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate(next, { replace: true });
  }, [user, navigate, next]);

  const onSubmit = async ({ name, email, password }: SignupForm) => {
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: rawNext ? new URL(next, window.location.origin).href : window.location.origin + "/login", data: { display_name: name.trim() } },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) navigate(next);
    else setSentTo(email);
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

          {sentTo ? (
            <div className="text-center">
              <Mail className="mx-auto mb-4 h-10 w-10 text-primary" />
              <h1 className="mb-2 text-2xl font-bold text-foreground">Check your email</h1>
              <p className="text-sm text-muted-foreground">We sent a confirmation link to <strong className="text-foreground">{sentTo}</strong>. Open it, then log in.</p>
              <Button asChild variant="hero" className="mt-6 w-full rounded-xl"><Link to={loginLink}>Go to log in</Link></Button>
            </div>
          ) : (<>
          <h1 className="text-3xl font-bold text-foreground text-center mb-1">Join the Journey</h1>
          <p className="text-muted-foreground text-center mb-8 text-sm">Start exploring quantum mechanics today</p>

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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="name" className="text-foreground text-sm font-medium">Full Name</Label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="name" placeholder="Your name" className="pl-10 rounded-xl" {...register("name")} />
              </div>
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
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
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 rounded-xl"
                  {...register("password")}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Password strength</span>
                    <span className={`text-xs font-medium ${strengthTextColor}`}>{strengthLabel}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${strengthColor} transition-all duration-300 rounded-full`} style={{ width: `${(passwordStrength / 4) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="confirm" className="text-foreground text-sm font-medium">Confirm Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  className={`pl-10 pr-10 rounded-xl ${passwordsMatch ? "border-success bg-success/5" : ""}`}
                  {...register("confirmPassword")}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
              {passwordsMatch && !errors.confirmPassword && (
                <p className="text-xs text-success mt-1 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Passwords match
                </p>
              )}
            </div>
            <Button type="submit" variant="hero" className="w-full rounded-xl mt-2" size="lg" disabled={submitting}>
              {submitting ? "Creating account…" : "Create Account"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to={loginLink} className="text-primary font-medium hover:underline">Log in</Link>
          </p>
          </>)}
        </motion.div>
      </div>
    </div>
  );
}
