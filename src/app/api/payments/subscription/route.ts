import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth/stack-auth";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await auth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("appId");

    if (!appId) {
      return NextResponse.json(
        { error: "Missing appId parameter" },
        { status: 400 }
      );
    }

    const subscription = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.appId, appId),
        eq(subscriptions.userId, user.id),
        eq(subscriptions.status, "active")
      ),
    });

    if (!subscription) {
      return NextResponse.json({
        hasActiveSubscription: false,
      });
    }

    return NextResponse.json({
      hasActiveSubscription: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        productId: subscription.productId,
      },
    });
  } catch (error) {
    console.error("error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}