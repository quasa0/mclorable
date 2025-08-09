import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/auth/stack-auth";
import { db } from "@/db/schema";
import { apps, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createStripeProduct, createStripePrice } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser().catch((error) => {
      console.error("auth error:", error);
      return null;
    });
    if (!user) {
      console.error("no authenticated user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { appId, name, description, price, recurringInterval } = body;

    console.log("creating product:", { appId, name, price, userId: user.userId });

    if (!appId || !name || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // just verify app exists
    const [app] = await db
      .select()
      .from(apps)
      .where(eq(apps.id, appId))
      .limit(1);

    console.log("found app:", app);

    if (!app) {
      console.error("app not found:", { appId });
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // create product in stripe
    const stripeProduct = await createStripeProduct({
      name,
      description: description || `Product for ${app.name}`,
      metadata: {
        appId,
        userId: user.userId,
      },
    });

    // create price in stripe
    const stripePrice = await createStripePrice({
      productId: stripeProduct.id,
      unitAmount: price * 100, // convert to cents
      currency: "usd",
      recurring: recurringInterval ? { interval: recurringInterval } : undefined,
    });

    // store product in database
    const [product] = await db
      .insert(products)
      .values({
        appId,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
        name,
        description,
        price: price * 100, // store in cents
        currency: "usd",
        recurringInterval: recurringInterval || null,
      })
      .returning();

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price / 100, // return in dollars
        recurringInterval: product.recurringInterval,
        stripePriceId: product.stripePriceId,
      },
    });
  } catch (error) {
    console.error("error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

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

    // just verify app exists
    const [app] = await db
      .select()
      .from(apps)
      .where(eq(apps.id, appId))
      .limit(1);

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // get products for app
    const appProducts = await db
      .select()
      .from(products)
      .where(eq(products.appId, appId));

    return NextResponse.json({
      products: appProducts.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price / 100, // return in dollars
        recurringInterval: p.recurringInterval,
        stripePriceId: p.stripePriceId,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.error("error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}