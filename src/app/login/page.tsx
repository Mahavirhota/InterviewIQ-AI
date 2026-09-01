"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitBranch, Globe, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [isLoadingGoogle, setIsLoadingGoogle] = React.useState(false);
  const [isLoadingGithub, setIsLoadingGithub] = React.useState(false);

  const handleLogin = async (provider: "google" | "github") => {
    if (provider === "google") setIsLoadingGoogle(true);
    if (provider === "github") setIsLoadingGithub(true);

    try {
      await signIn(provider, { redirectTo: "/dashboard" });
    } catch (err) {
      console.error("Authentication Error:", err);
    } finally {
      setIsLoadingGoogle(false);
      setIsLoadingGithub(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <Link href="/" className="flex items-center space-x-3 mb-8 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg glow-indigo transition-transform group-hover:scale-105">
          IQ
        </div>
        <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-400 to-violet-200 bg-clip-text text-transparent">
          InterviewIQ AI
        </span>
      </Link>

      <Card className="w-full max-w-md border border-border bg-card/60 backdrop-blur-md shadow-2xl">
        <CardHeader className="text-center pb-8 border-b border-border/50">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Welcome Back</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-2">
            Sign in to access your mock interview arena and analytics.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-8 space-y-4">
          {/* Google Button */}
          <Button
            variant="outline"
            className="w-full h-11 justify-center rounded-xl font-medium border border-border hover:bg-muted text-foreground transition-all"
            onClick={() => handleLogin("google")}
            disabled={isLoadingGoogle || isLoadingGithub}
            aria-label="Sign in with Google"
          >
            {isLoadingGoogle ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent mr-3" />
            ) : (
              <Globe className="h-5 w-5 mr-3 text-red-400" />
            )}
            Sign in with Google
          </Button>

          {/* GitHub Button */}
          <Button
            variant="outline"
            className="w-full h-11 justify-center rounded-xl font-medium border border-border hover:bg-muted text-foreground transition-all"
            onClick={() => handleLogin("github")}
            disabled={isLoadingGoogle || isLoadingGithub}
            aria-label="Sign in with GitHub"
          >
            {isLoadingGithub ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent mr-3" />
            ) : (
              <GitBranch className="h-5 w-5 mr-3 text-foreground" />
            )}
            Sign in with GitHub
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col items-center pt-4 pb-6 border-t border-border/30">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Secure, encrypted OAuth sessions.</span>
          </div>
        </CardFooter>
      </Card>
      
      <p className="text-xs text-muted-foreground mt-8 text-center max-w-xs leading-relaxed">
        By signing in, you agree to our terms and allow access to your basic public profile information.
      </p>
    </div>
  );
}
