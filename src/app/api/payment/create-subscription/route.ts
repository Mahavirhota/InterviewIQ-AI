import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Create a Razorpay subscription for the Pro plan
    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID!,
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
