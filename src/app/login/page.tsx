"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GitBranch,
  Globe,
  ShieldCheck,
  AlertCircle,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";

type Mode = "login" | "signup";

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorParam = searchParams.get("error");
  const defaultMode = (searchParams.get("mode") as Mode) || "login";

  const [mode, setMode] = React.useState<Mode>(defaultMode);
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState<string | null>(null); // provider key
  const [formError, setFormError] = React.useState<string | null>(null);
  const [formSuccess, setFormSuccess] = React.useState<string | null>(null);

  // Credentials form state
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const getOAuthError = (error: string | null) => {
    if (!error) return null;
    switch (error) {
      case "OAuthSignin":
      case "OAuthCallbackError":
        return "Could not connect to the OAuth provider. Please check your credentials.";
      case "OAuthAccountNotLinked":
        return "An account with this email already exists using another sign-in method.";
      case "AccessDenied":
        return "Access was denied by the OAuth provider.";
      case "Configuration":
        return "There is a server configuration issue. Please contact support.";
      case "CredentialsSignin":
        return "Invalid email or password. Please try again.";
      default:
        return `Authentication error: ${error}`;
    }
  };

  const oauthError = getOAuthError(errorParam);
  const displayError = formError || oauthError;

  const handleOAuth = async (provider: "google" | "github") => {
    setLoading(provider);
    setFormError(null);
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch {
      setFormError("OAuth sign-in failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("credentials");
    setFormError(null);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setFormError("Invalid email or password.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setFormError("Sign-in failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("register");
    setFormError(null);
    setFormSuccess(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Registration failed.");
        return;
      }
      // Auto-sign-in after registration
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signInResult?.error) {
        setFormSuccess("Account created! Please sign in.");
        setMode("login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setFormError("Registration failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const isLoading = loading !== null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <Link
        href="/"
        className="flex items-center space-x-3 mb-8 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg glow-indigo transition-transform group-hover:scale-105">
          IQ
        </div>
        <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-400 to-violet-200 bg-clip-text text-transparent">
          InterviewIQ AI
        </span>
      </Link>

      <Card className="w-full max-w-md border border-border bg-card/60 backdrop-blur-md shadow-2xl">
        {/* Tab toggle */}
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => { setMode("login"); setFormError(null); setFormSuccess(null); }}
            className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
              mode === "login"
                ? "text-foreground border-b-2 border-primary -mb-px"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode("signup"); setFormError(null); setFormSuccess(null); }}
            className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
              mode === "signup"
                ? "text-foreground border-b-2 border-primary -mb-px"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create Account
          </button>
        </div>

        <CardHeader className="text-center pb-4 pt-6">
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            {mode === "login" ? "Welcome Back" : "Start Your Journey"}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            {mode === "login"
              ? "Sign in to access your mock interview arena."
              : "Create an account and start practicing today."}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0 pb-4 space-y-3">
          {/* Error / Success banners */}
          {displayError && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm leading-relaxed">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{displayError}</span>
            </div>
          )}
          {formSuccess && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm leading-relaxed">
              <ShieldCheck className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{formSuccess}</span>
            </div>
          )}

          {/* OAuth Buttons */}
          <Button
            variant="outline"
            className="w-full h-11 justify-center rounded-xl font-medium border border-border hover:bg-muted text-foreground transition-all"
            onClick={() => handleOAuth("google")}
            disabled={isLoading}
            aria-label="Continue with Google"
          >
            {loading === "google" ? (
              <Loader2 className="h-5 w-5 mr-3 animate-spin" />
            ) : (
              <Globe className="h-5 w-5 mr-3 text-red-400" />
            )}
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="w-full h-11 justify-center rounded-xl font-medium border border-border hover:bg-muted text-foreground transition-all"
            onClick={() => handleOAuth("github")}
            disabled={isLoading}
            aria-label="Continue with GitHub"
          >
            {loading === "github" ? (
              <Loader2 className="h-5 w-5 mr-3 animate-spin" />
            ) : (
              <GitBranch className="h-5 w-5 mr-3 text-foreground" />
            )}
            Continue with GitHub
          </Button>

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground tracking-wider">
                or
              </span>
            </div>
          </div>

          {/* Credentials Form */}
          <form
            onSubmit={mode === "login" ? handleCredentialsLogin : handleRegister}
            className="space-y-3"
          >
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  className="pl-10 h-11 rounded-xl bg-muted/50 border-border focus:border-primary"
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete={mode === "login" ? "email" : "new-email"}
                className="pl-10 h-11 rounded-xl bg-muted/50 border-border focus:border-primary"
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={mode === "signup" ? "Password (min. 8 chars)" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="pl-10 pr-10 h-11 rounded-xl bg-muted/50 border-border focus:border-primary"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {mode === "signup" && (
              <p className="text-xs text-muted-foreground px-1">
                Must contain ≥8 characters, one uppercase letter, and one number.
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-semibold glow-indigo"
              disabled={isLoading}
            >
              {(loading === "credentials" || loading === "register") ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="h-5 w-5 mr-2" />
              )}
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center pt-2 pb-6 border-t border-border/30 gap-3">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Secure, encrypted sessions.</span>
          </div>
        </CardFooter>
      </Card>

      <p className="text-xs text-muted-foreground mt-6 text-center max-w-xs leading-relaxed">
        By continuing, you agree to our{" "}
        <a href="#" className="underline underline-offset-2 hover:text-foreground">
          Terms
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-2 hover:text-foreground">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
          Loading...
        </div>
      }
    >
      <AuthForm />
    </React.Suspense>
  );
}
