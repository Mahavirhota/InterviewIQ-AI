import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      subscriptionStatus: true,
      subscriptionCurrentEnd: true,
      razorpaySubscriptionId: true,
    },
  });

  return NextResponse.json({
    plan: user?.plan ?? "free",
    subscriptionStatus: user?.subscriptionStatus ?? null,
    subscriptionCurrentEnd: user?.subscriptionCurrentEnd ?? null,
    razorpaySubscriptionId: user?.razorpaySubscriptionId ?? null,
  });
}
