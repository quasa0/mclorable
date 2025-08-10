import { z } from "zod";
import { createTool } from "@mastra/core/tools";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export const integratePaywallTool = createTool({
  id: "integrate_paywall",
  name: "Create Payment Link",
  description: "Create a Stripe product and payment link that the AI can integrate into the app",
  inputSchema: z.object({
    productName: z.string().describe("Name of the product/subscription"),
    description: z.string().optional().describe("Product description"),
    price: z.number().describe("Price in cents (e.g., 999 for $9.99)"),
    currency: z.string().default("usd").describe("Currency code"),
    recurring: z.boolean().default(false).describe("Is this a subscription?"),
    interval: z.enum(["month", "year"]).optional().describe("Billing interval if recurring"),
  }),
  execute: async (input) => {
    const { productName, description, price, currency, recurring, interval } = input;

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
        ...(recurring && interval ? {
          recurring: {
            interval: interval,
          },
        } : {}),
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
          type: "redirect",
          redirect: {
            url: `{CHECKOUT_SESSION_URL}`, // this will be replaced by stripe with the actual URL
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
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create payment link",
      };
    }
  },
});