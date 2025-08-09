import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/auth/stack-auth";
import { db } from "@/db/schema";
import { apps, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createPolarProduct, POLAR_ORGANIZATION_ID } from "@/lib/polar";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser().catch(() => null);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { appId, name, description, price, recurringInterval } = body;

    if (!appId || !name || !price) {
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

    // create product in polar
    const polarProduct = await createPolarProduct({
      name,
      description: description || `Product for ${app.name}`,
      organizationId: POLAR_ORGANIZATION_ID,
      price: price * 100, // convert to cents
      recurringInterval: recurringInterval || "month",
    });

    // store product in database
    const [product] = await db
      .insert(products)
      .values({
        appId,
        polarProductId: polarProduct.id,
        polarPriceId: polarProduct.prices[0].id,
        name,
        description,
        price: price * 100, // store in cents
        currency: "USD",
        recurringInterval: recurringInterval || "month",
      })
      .returning();

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price / 100, // return in dollars
        recurringInterval: product.recurringInterval,
        polarPriceId: product.polarPriceId,
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

    // verify app belongs to user
    const app = await db.query.apps.findFirst({
      where: eq(apps.id, appId),
    });

    if (!app || app.userId !== user.userId) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // get products for app
    const appProducts = await db.query.products.findMany({
      where: eq(products.appId, appId),
    });

    return NextResponse.json({
      products: appProducts.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price / 100, // return in dollars
        recurringInterval: p.recurringInterval,
        polarPriceId: p.polarPriceId,
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