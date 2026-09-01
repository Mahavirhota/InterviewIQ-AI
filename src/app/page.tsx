import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Cpu, Star, ArrowRight, CheckCircle2, MessageSquareCode } from "lucide-react";

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-navbar">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg glow-indigo">
              IQ
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-400 to-violet-200 bg-clip-text text-transparent">
              InterviewIQ AI
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="sm" className="rounded-xl">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
                <Link href="/login">
                  <Button size="sm" className="rounded-xl">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-1.5 text-xs font-semibold text-indigo-400 mb-6">
            <Star className="h-3.5 w-3.5 fill-indigo-400" />
            <span>Next-Generation AI Interview Preparation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.15] mb-8">
            Master your next tech interview with{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent">
              real-time AI feedback
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop memorizing answers. Practice interactive technical, system design, and behavioral simulations tailored to your dream job, and receive instantaneous granular grading.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={isLoggedIn ? "/dashboard" : "/login"} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-xl glow-indigo">
                {isLoggedIn ? "Access Dashboard" : "Start Practicing Free"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-xl">
                Explore Features
              </Button>
            </a>
          </div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20 border-t border-border/60 pt-12">
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-foreground">15k+</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1.5">Interviews Conducted</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-foreground">94.8%</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1.5">Hiring Success Rate</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-foreground">&lt; 2s</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1.5">Average AI Latency</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-foreground">20+</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1.5">Engineering Roles</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 md:py-28 border-t border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Engineered like a real panel interview
            </h2>
            <p className="text-muted-foreground">
              Powerful features designed to build confidence, target weaknesses, and help you speak with absolute authority.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="flex flex-col p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-md hover:border-indigo-500/20 transition-all hover:translate-y-[-4px]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-6">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">AI Question Generator</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Generates hyper-specific questions based on your target role, difficulty, and optional custom text (like a job description).
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-md hover:border-indigo-500/20 transition-all hover:translate-y-[-4px]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-6">
                <MessageSquareCode className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Interactive Practice Arena</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Practice under pressure with active session timers, multi-line answer inputs, and clean WCAG-compliant keyboard shortcuts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-md hover:border-indigo-500/20 transition-all hover:translate-y-[-4px]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-6">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Live AI Scorecard</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Receive detailed grading against evaluation rubrics. Understand exactly what concepts you missed and get suggestions for improvement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-28 border-t border-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground">
              Invest in your career. Get access to unlimited AI mock interviews and comprehensive scorecards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="flex flex-col p-8 rounded-2xl border border-border bg-card/30 backdrop-blur-md justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">Free Practice</h3>
                <p className="text-sm text-muted-foreground mt-2">Perfect for getting started.</p>
                <p className="text-4xl font-extrabold text-foreground mt-6">$0</p>
                <p className="text-xs text-muted-foreground mt-1">Free forever</p>
                
                <ul className="space-y-3.5 mt-8" aria-label="Free Plan Features">
                  <li className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 mr-3 flex-shrink-0" />
                    3 Custom AI Interview sessions
                  </li>
                  <li className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 mr-3 flex-shrink-0" />
                    Standard question generator
                  </li>
                  <li className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 mr-3 flex-shrink-0" />
                    Basic feedback summary
                  </li>
                </ul>
              </div>
              <Link href={isLoggedIn ? "/dashboard" : "/login"} className="mt-8">
                <Button variant="outline" className="w-full rounded-xl">
                  {isLoggedIn ? "Access Dashboard" : "Sign Up Free"}
                </Button>
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="flex flex-col p-8 rounded-2xl border-2 border-indigo-500 bg-card/60 relative shadow-xl shadow-indigo-500/5 justify-between">
              <div className="absolute top-0 right-8 -translate-y-1/2 rounded-full bg-indigo-500 px-3.5 py-1 text-xs font-semibold text-white">
                Most Popular
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Unlimited Pro</h3>
                <p className="text-sm text-muted-foreground mt-2">For serious candidates aiming high.</p>
                <p className="text-4xl font-extrabold text-foreground mt-6">$19</p>
                <p className="text-xs text-muted-foreground mt-1">Per month, cancel anytime</p>
                
                <ul className="space-y-3.5 mt-8" aria-label="Pro Plan Features">
                  <li className="flex items-center text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 mr-3 flex-shrink-0" />
                    Unlimited AI mock sessions
                  </li>
                  <li className="flex items-center text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 mr-3 flex-shrink-0" />
                    Custom Job Description uploads
                  </li>
                  <li className="flex items-center text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 mr-3 flex-shrink-0" />
                    Deep-dive Skill Radar Analytics
                  </li>
                  <li className="flex items-center text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 mr-3 flex-shrink-0" />
                    Granular skill-by-skill scoring
                  </li>
                </ul>
              </div>
              <Link href={isLoggedIn ? "/dashboard" : "/login"} className="mt-8">
                <Button className="w-full rounded-xl glow-indigo">
                  {isLoggedIn ? "Go to Dashboard" : "Get Unlimited Pro"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border py-12 bg-card/25">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
          <div className="flex items-center space-x-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              IQ
            </div>
            <span className="font-bold text-foreground">InterviewIQ AI</span>
          </div>
          <p>© 2026 InterviewIQ AI. Built for developers, designers, and builders.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

