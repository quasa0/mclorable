import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/polar";
import { getUser } from "@/auth/stack-auth";
import { db } from "@/db";
import { apps } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser().catch(() => null);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productPriceId, appId } = body;

    if (!productPriceId || !appId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // verify app belongs to user
    const app = await db.query.apps.findFirst({
      where: eq(apps.id, appId),
    });

    if (!app || app.userId !== user.userId) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    const origin = request.headers.get("origin") || "http://localhost:3000";
    const successUrl = `${origin}/app/${appId}/payment-success`;

    const checkout = await createCheckoutSession({
      productPriceId,
      customerId: user.userId,
      successUrl,
      appId,
      userId: user.userId,
    });

    return NextResponse.json({
      checkoutUrl: checkout.url,
      clientSecret: checkout.clientSecret,
    });
  } catch (error) {
    console.error("error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}