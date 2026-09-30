import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay credentials are not configured.");
  }

  return new Razorpay({ key_id, key_secret });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const planId = process.env.RAZORPAY_PLAN_ID;
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || !planId) {
    console.error("[RAZORPAY_SUBSCRIPTION_CREATE] Missing Razorpay credentials or plan ID");
    return NextResponse.json(
      { error: "Payment service is currently unavailable." },
      { status: 500 }
    );
  }

  try {
    const razorpay = getRazorpay();
    // Create a Razorpay subscription for the Pro plan
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // 12 months
      quantity: 1,
      notes: {
        userId: session.user.id,
        email: session.user.email ?? "",
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      name: session.user.name,
      email: session.user.email,
    });
  } catch (err) {
    console.error("[RAZORPAY_SUBSCRIPTION_CREATE]", err);
    return NextResponse.json(
      { error: "Failed to create subscription." },
      { status: 500 }
    );
  }
}
