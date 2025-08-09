import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-07-30.basil",
});

export async function createStripeProduct({
  name,
  description,
  metadata,
}: {
  name: string;
  description?: string;
  metadata?: Record<string, string>;
}) {
  const product = await stripe.products.create({
    name,
    description,
    metadata,
  });

  return product;
}

export async function createStripePrice({
  productId,
  unitAmount,
  currency = "usd",
  recurring,
}: {
  productId: string;
  unitAmount: number;
  currency?: string;
  recurring?: {
    interval: "day" | "week" | "month" | "year";
  };
}) {
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: unitAmount,
    currency,
    recurring,
  });

  return price;
}

export async function createCheckoutSession({
  priceId,
  customerId,
  successUrl,
  cancelUrl,
  metadata,
  mode = "subscription",
}: {
  priceId: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  mode?: "payment" | "subscription";
}) {
  const session = await stripe.checkout.sessions.create({
    mode,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer: customerId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });

  return session;
}

export async function getSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription;
}

export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
  return subscription;
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
) {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}