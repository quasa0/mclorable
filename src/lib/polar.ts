import { Polar } from "@polar-sh/sdk";

const polarAccessToken = process.env.POLAR_ACCESS_TOKEN || "polar_oat_qGemq8ufNwek0nmox5KLYzEbvgSnoYcPhTDiB3Coht9";
export const POLAR_ORGANIZATION_ID = "be03f5dd-37e6-4d69-8aed-a0ab23a9cadc";

export const polar = new Polar({
  accessToken: polarAccessToken,
});

export async function createPolarProduct({
  name,
  description,
  organizationId,
  price,
  recurringInterval = "month",
}: {
  name: string;
  description: string;
  organizationId: string;
  price: number;
  recurringInterval?: "day" | "week" | "month" | "year";
}) {
  const product = await polar.products.create({
    name,
    description,
    organizationId,
    prices: [
      {
        type: "recurring",
        recurringInterval,
        amountType: "fixed",
        priceAmount: price,
        priceCurrency: "USD",
      },
    ],
  });

  return product;
}

export async function createCheckoutSession({
  productPriceId,
  customerId,
  successUrl,
  appId,
  userId,
}: {
  productPriceId: string;
  customerId?: string;
  successUrl: string;
  appId: string;
  userId: string;
}) {
  const checkout = await polar.checkouts.create({
    productPriceId,
    customerId,
    successUrl,
    metadata: {
      appId,
      userId,
      type: "app_subscription",
    },
  });

  return checkout;
}

export async function getSubscription(subscriptionId: string) {
  const subscription = await polar.subscriptions.get({ id: subscriptionId });
  return subscription;
}

export async function cancelSubscription(subscriptionId: string) {
  const subscription = await polar.subscriptions.update({
    id: subscriptionId,
    subscriptionUpdate: {
      cancelAtPeriodEnd: true,
    },
  });
  return subscription;
}

export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const crypto = await import("crypto");
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest("hex");
  return expectedSignature === signature;
}