import { createTool } from "@mastra/core/tools";
import Stripe from "stripe";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export const integratePaywallTool = createTool({
  id: "integrate_paywall",
  description:
    "Create a Stripe product and payment link. REQUIRED: productName (e.g. 'Premium Membership'), price in cents (e.g. 500 for $5.00)",
  inputSchema: z.object({
    productName: z
      .string()
      .describe(
        "REQUIRED: Name of the product/subscription (e.g., 'Premium Membership', 'Pro Plan')"
      ),
    description: z.string().optional().describe("Product description"),
    price: z
      .number()
      .describe(
        "REQUIRED: Price in cents (e.g., 500 for $5.00, 999 for $9.99)"
      ),
    currency: z.string().default("usd").describe("Currency code"),
    recurring: z
      .boolean()
      .default(true)
      .describe("Is this a subscription? Default true"),
    interval: z
      .enum(["month", "year"])
      .default("month")
      .describe("Billing interval if recurring (default: month)"),
  }),
  execute: async ({ context }) => {
    const { productName, description, price, currency, recurring, interval } =
      context;

    // validate required fields
    if (!productName || productName.trim() === "") {
      return {
        success: false,
        error: "Product name is required",
      };
    }

    if (!price || price <= 0) {
      return {
        success: false,
        error: "Price must be greater than 0",
      };
    }

    try {
      // create stripe product
      const product = await stripe.products.create({
        name: productName.trim(),
        description: description || undefined,
      });

      // create price for the product
      const stripePrice = await stripe.prices.create({
        product: product.id,
        unit_amount: price,
        currency: currency,
        ...(recurring && interval
          ? {
              recurring: {
                interval: interval,
              },
            }
          : {}),
      });

      // create payment link
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price: stripePrice.id,
            quantity: 1,
          },
        ],
        after_completion: {
          type: "hosted_confirmation",
          hosted_confirmation: {
            custom_message: "Thank you for your purchase! You can now close this window and return to the app.",
          },
        },
      });

      return {
        success: true,
        paymentLink: paymentLink.url,
        priceId: stripePrice.id,
        productId: product.id,
        message: `Payment link created successfully! The AI can now add a button with href="${paymentLink.url}" to integrate payments into the app.`,
      };
    } catch (error) {
      console.error("Error creating payment link:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create payment link";
      return {
        success: false,
        error: errorMessage,
        hint: "Make sure to provide: productName (e.g. 'Premium Membership'), price in cents (e.g. 500 for $5.00)",
      };
    }
  },
});
