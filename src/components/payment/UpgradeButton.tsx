"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, CheckCircle2, AlertCircle } from "lucide-react";

interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  image?: string;
  prefill: {
    name: string;
    email: string;
  };
  theme: { color: string };
  handler: (response: RazorpayPaymentResponse) => void;
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface UpgradeButtonProps {
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
}

export function UpgradeButton({
  className,
  label = "Upgrade to Pro — ₹19/mo",
  size = "md",
  variant = "primary",
}: UpgradeButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Load Razorpay script once
  React.useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleUpgrade = async () => {
    if (!session?.user) {
      router.push("/login?mode=signup");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create subscription on server
      const res = await fetch("/api/payment/create-subscription", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to initiate payment.");
        setLoading(false);
        return;
      }

      // 2. Open Razorpay checkout
      const options: RazorpayOptions = {
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "InterviewIQ AI",
        description: "Unlimited Pro — Monthly Subscription",
        prefill: {
          name: data.name || "",
          email: data.email || "",
        },
        theme: { color: "#6366f1" },
        handler: async (response: RazorpayPaymentResponse) => {
          // 3. Verify on server (optional extra step; webhook is the source of truth)
          console.log("Payment successful:", response);
          setSuccess(true);
          setLoading(false);
          // Refresh session to pick up new plan
          setTimeout(() => router.refresh(), 1500);
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("[UPGRADE_ERROR]", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
        <CheckCircle2 className="h-5 w-5" />
        You're now a Pro member! 🎉
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        size={size}
        variant={variant}
        className={className}
        onClick={handleUpgrade}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Zap className="h-4 w-4 mr-2 fill-yellow-300 text-yellow-300" />
        )}
        {loading ? "Opening checkout…" : label}
      </Button>
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </div>
      )}
    </div>
  );
}
