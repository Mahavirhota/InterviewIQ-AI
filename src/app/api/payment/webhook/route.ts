import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Razorpay Webhook Handler
 *
 * Events handled:
 *  - subscription.activated  → upgrade user to Pro
 *  - subscription.charged    → record payment
 *  - subscription.cancelled  → downgrade user to Free
 *  - subscription.completed  → downgrade user to Free
 *  - subscription.halted     → downgrade user to Free
 */
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSignature) {
    console.error("[WEBHOOK] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event: string; payload: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sub = (event.payload as { subscription?: { entity?: Record<string, unknown> } })?.subscription?.entity;
  if (!sub) {
    return NextResponse.json({ received: true });
  }

  const razorpaySubscriptionId = sub.id as string;
  const userId = (sub.notes as Record<string, string>)?.userId;

  try {
    switch (event.event) {
      case "subscription.activated":
      case "subscription.charged": {
        const currentEnd = sub.current_end as number | null;
        const currentStart = sub.current_start as number | null;

        await db.user.update({
          where: { id: userId },
          data: {
            plan: "pro",
            razorpaySubscriptionId,
            subscriptionStatus: sub.status as string,
            subscriptionCurrentEnd: currentEnd
              ? new Date(currentEnd * 1000)
              : undefined,
          },
        });

        // Upsert subscription record
        await db.subscription.upsert({
          where: { razorpaySubscriptionId },
          create: {
            userId,
            razorpaySubscriptionId,
            plan: "pro",
            status: sub.status as string,
            amount: (sub.plan_id ? 1900 : 1900), // ₹19 in paise = 1900
            currency: "INR",
            currentPeriodStart: currentStart ? new Date(currentStart * 1000) : undefined,
            currentPeriodEnd: currentEnd ? new Date(currentEnd * 1000) : undefined,
          },
          update: {
            status: sub.status as string,
            currentPeriodStart: currentStart ? new Date(currentStart * 1000) : undefined,
            currentPeriodEnd: currentEnd ? new Date(currentEnd * 1000) : undefined,
          },
        });
        break;
      }

      case "subscription.cancelled":
      case "subscription.completed":
      case "subscription.halted": {
        await db.user.update({
          where: { id: userId },
          data: {
            plan: "free",
            subscriptionStatus: sub.status as string,
          },
        });

        await db.subscription.updateMany({
          where: { razorpaySubscriptionId },
          data: { status: sub.status as string },
        });
        break;
      }

      default:
        // Ignore unhandled events
        break;
    }
  } catch (err) {
    console.error("[WEBHOOK_DB_ERROR]", event.event, err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
