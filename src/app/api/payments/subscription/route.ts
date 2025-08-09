import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/auth/stack-auth";
import { db, subscriptions } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getUser().catch(() => null);
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

    const subscription = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.appId, appId),
          eq(subscriptions.userId, user.userId),
          eq(subscriptions.status, "active")
        )
      );

    if (!subscription || subscription.length === 0) {
      return NextResponse.json({
        hasActiveSubscription: false,
      });
    }

    return NextResponse.json({
      hasActiveSubscription: true,
      subscription: {
        id: subscription[0].id,
        status: subscription[0].status,
        currentPeriodEnd: subscription[0].currentPeriodEnd,
        productId: subscription[0].productId,
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