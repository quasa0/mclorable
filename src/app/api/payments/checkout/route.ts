import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";
import { getUser } from "@/auth/stack-auth";
import { db, appUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser().catch(() => null);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { priceId, appId } = body;

    if (!priceId || !appId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // verify app belongs to user
    const [appUser] = await db
      .select()
      .from(appUsers)
      .where(eq(appUsers.appId, appId) && eq(appUsers.userId, user.userId))
      .limit(1);

    if (!appUser) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    const origin = request.headers.get("origin") || "http://localhost:3000";
    const successUrl = `${origin}/app/${appId}/payment-success`;
    const cancelUrl = `${origin}/app/${appId}`;

    const checkout = await createCheckoutSession({
      priceId,
      successUrl,
      cancelUrl,
      metadata: {
        appId,
        userId: user.userId,
      },
    });

    return NextResponse.json({
      checkoutUrl: checkout.url,
    });
  } catch (error) {
    console.error("error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}