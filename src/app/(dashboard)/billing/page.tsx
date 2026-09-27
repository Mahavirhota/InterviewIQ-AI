"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { CheckCircle2, Crown, Zap } from "lucide-react";
import { UpgradeButton } from "@/components/payment/UpgradeButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const FREE_FEATURES = [
  "3 AI mock interview sessions",
  "Standard question generator",
  "Basic feedback summary",
];

const PRO_FEATURES = [
  "Unlimited AI mock sessions",
  "Custom Job Description uploads",
  "Deep-dive Skill Radar Analytics",
  "Granular skill-by-skill scoring",
  "Priority AI response speed",
  "Interview history & exports",
];

export default function BillingPage() {
  const { data: session } = useSession();
  const isPro = session?.user?.plan === "pro";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Crown className="h-7 w-7 text-indigo-400" />
          Upgrade to Pro
        </h1>
        <p className="text-muted-foreground mt-2">
          Unlock unlimited interviews, advanced analytics, and priority AI.
        </p>
      </div>

      {isPro && (
        <div className="mb-8 flex items-center gap-3 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          You are on the <span className="font-bold">Pro plan</span>. All features are unlocked.
        </div>
      )}

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Free */}
        <div className="flex flex-col p-8 rounded-2xl border border-border bg-card/30 backdrop-blur-md justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Free Practice</h3>
            <p className="text-sm text-muted-foreground mt-1">Perfect for getting started.</p>
            <p className="text-4xl font-extrabold text-foreground mt-5">
              ₹0
            </p>
            <p className="text-xs text-muted-foreground mt-1">Free forever</p>
            <ul className="space-y-3 mt-7" aria-label="Free plan features">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 mr-3 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8">
            {!isPro ? (
              <div className="w-full h-11 rounded-xl flex items-center justify-center border border-border text-sm font-medium text-muted-foreground bg-muted/40">
                Current Plan
              </div>
            ) : (
              <Link href="/dashboard">
                <Button variant="outline" className="w-full rounded-xl">
                  Go to Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Pro */}
        <div className="flex flex-col p-8 rounded-2xl border-2 border-indigo-500 bg-card/60 relative shadow-xl shadow-indigo-500/10 justify-between">
          <div className="absolute top-0 right-8 -translate-y-1/2 rounded-full bg-indigo-500 px-3.5 py-1 text-xs font-semibold text-white">
            Most Popular
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Unlimited Pro</h3>
            <p className="text-sm text-muted-foreground mt-1">For serious candidates aiming high.</p>
            <p className="text-4xl font-extrabold text-foreground mt-5">
              ₹19
            </p>
            <p className="text-xs text-muted-foreground mt-1">Per month · cancel anytime</p>
            <ul className="space-y-3 mt-7" aria-label="Pro plan features">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 mr-3 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            {isPro ? (
              <div className="w-full h-11 rounded-xl flex items-center justify-center bg-indigo-500/20 border border-indigo-500/40 text-sm font-semibold text-indigo-300">
                <CheckCircle2 className="h-4 w-4 mr-2" /> Active Subscription
              </div>
            ) : (
              <UpgradeButton
                label="Upgrade to Pro — ₹19/mo"
                size="md"
                className="w-full rounded-xl glow-indigo"
              />
            )}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-14 space-y-6">
        <h2 className="text-xl font-bold tracking-tight">Frequently Asked Questions</h2>
        {[
          {
            q: "What payment methods are accepted?",
            a: "All major cards (Visa, Mastercard, RuPay), UPI (GPay, PhonePe, Paytm), net banking, and popular wallets are supported via Razorpay.",
          },
          {
            q: "Can I cancel anytime?",
            a: "Yes. Cancel your subscription anytime from Razorpay's customer portal and you'll retain Pro access until the end of the billing cycle.",
          },
          {
            q: "Is my payment data secure?",
            a: "All payments are processed by Razorpay — a PCI-DSS Level 1 certified gateway. We never store your card details.",
          },
          {
            q: "Will I be charged in INR?",
            a: "Yes. All charges are in Indian Rupees (INR).",
          },
        ].map(({ q, a }) => (
          <div key={q} className="border-b border-border/50 pb-5">
            <h3 className="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-indigo-400" />
              {q}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
