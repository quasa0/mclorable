import { NextRequest, NextResponse } from "next/server";
import { db, products, subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { constructWebhookEvent } from "@/lib/stripe";
import Stripe from "stripe";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("stripe-signature") || "";
    const body = await request.text();

    // verify webhook signature and construct event
    let event: Stripe.Event;
    try {
      event = await constructWebhookEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    console.log("received stripe webhook:", event.type);

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const { appId, userId } = subscription.metadata || {};

        if (!appId || !userId) {
          console.error("missing metadata in subscription event");
          return NextResponse.json({ received: true });
        }

        // find product by stripe product id
        const productId = subscription.items.data[0]?.price.product as string;
        const [product] = await db
          .select()
          .from(products)
          .where(eq(products.stripeProductId, productId))
          .limit(1);

        if (!product) {
          console.error("product not found:", productId);
          return NextResponse.json({ received: true });
        }

        // upsert subscription
        const [existingSubscription] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
          .limit(1);

        if (existingSubscription) {
          // update existing subscription
          await db
            .update(subscriptions)
            .set({
              status: subscription.status,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              stripeCustomerId: subscription.customer as string,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.id, existingSubscription.id));
        } else {
          // create new subscription
          await db.insert(subscriptions).values({
            appId,
            userId,
            productId: product.id,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            metadata: subscription.metadata,
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await db
          .update(subscriptions)
          .set({
            status: "canceled",
            canceledAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await db
            .update(subscriptions)
            .set({
              status: "active",
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string));
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await db
            .update(subscriptions)
            .set({
              status: "past_due",
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string));
        }
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