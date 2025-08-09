import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/schema";
import { products, subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyWebhookSignature } from "@/lib/polar";

const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("polar-signature") || "";
    const body = await request.text();

    // verify webhook signature
    if (POLAR_WEBHOOK_SECRET) {
      const isValid = await verifyWebhookSignature(
        body,
        signature,
        POLAR_WEBHOOK_SECRET
      );
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const event = JSON.parse(body);
    console.log("received polar webhook:", event.type);

    switch (event.type) {
      case "subscription.created":
      case "subscription.active": {
        const data = event.data;
        const { appId, userId } = data.metadata || {};

        if (!appId || !userId) {
          console.error("missing metadata in subscription event");
          return NextResponse.json({ received: true });
        }

        // find product by polar product id
        const product = await db.query.products.findFirst({
          where: eq(products.polarProductId, data.productId),
        });

        if (!product) {
          console.error("product not found:", data.productId);
          return NextResponse.json({ received: true });
        }

        // upsert subscription
        const existingSubscription = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.polarSubscriptionId, data.id),
        });

        if (existingSubscription) {
          // update existing subscription
          await db
            .update(subscriptions)
            .set({
              status: "active",
              currentPeriodStart: new Date(data.currentPeriodStart),
              currentPeriodEnd: new Date(data.currentPeriodEnd),
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.id, existingSubscription.id));
        } else {
          // create new subscription
          await db.insert(subscriptions).values({
            appId,
            userId,
            productId: product.id,
            polarSubscriptionId: data.id,
            polarCustomerId: data.customerId,
            status: "active",
            currentPeriodStart: new Date(data.currentPeriodStart),
            currentPeriodEnd: new Date(data.currentPeriodEnd),
            metadata: data.metadata,
          });
        }
        break;
      }

      case "subscription.updated": {
        const data = event.data;
        await db
          .update(subscriptions)
          .set({
            status: data.status,
            currentPeriodStart: data.currentPeriodStart
              ? new Date(data.currentPeriodStart)
              : null,
            currentPeriodEnd: data.currentPeriodEnd
              ? new Date(data.currentPeriodEnd)
              : null,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.polarSubscriptionId, data.id));
        break;
      }

      case "subscription.canceled": {
        const data = event.data;
        await db
          .update(subscriptions)
          .set({
            status: "canceled",
            canceledAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.polarSubscriptionId, data.id));
        break;
      }

      case "subscription.revoked": {
        const data = event.data;
        await db
          .update(subscriptions)
          .set({
            status: "revoked",
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.polarSubscriptionId, data.id));
        break;
      }

      default:
        console.log("unhandled webhook event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}